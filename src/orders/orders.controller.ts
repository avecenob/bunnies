import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderCompletionDto } from 'src/common/dto/orders/update-order-completion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { CartsService } from 'src/carts/carts.service';
import { JwtService } from '@nestjs/jwt';
import { MidtransService } from 'src/payments/midtrans.service';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { nanoid } from 'nanoid';
import { CreateTransactionDto } from 'src/common/dto/midtrans/create-transaction.dto';
import * as dotenv from 'dotenv';
import { ProductsService } from 'src/products/products.service';
import { PaymentsService } from 'src/payments/payments.service';
dotenv.config();

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private cartsService: CartsService,
    private jwtService: JwtService,
  ) {}

  private async extractPayload(token: string) {
    let payload;
    if (token) {
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (error) {
        payload = undefined;
      }
    }

    return payload;
  }

  @Get()
  findAll() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  findOrderById(@Param() params: any) {
    return this.ordersService.findOrderById(params.id);
  }

  @Get('user/:key')
  @Render('customer/orders')
  async renderUserOrders(@Req() req: Request, @Res() res: Response) {
    const { accessToken, cartCount } = req.cookies;
    const user = await this.extractPayload(accessToken);
    if (!user) {
      return res.redirect('/login');
    }
    const orders = await this.ordersService.findOrdersByUser(user.sub);
    return {
      layout: 'layouts/shop',
      title: 'Pesanan Saya',
      user: user,
      orders: orders,
      cartCount: cartCount,
    };
  }

  @Get('user/data-only/:key')
  findOrderByUserId(@Param() params: any) {
    return this.ordersService.findOrdersByUser(params.key);
  }

  @Put('complete/:id')
  async updateOrder(
    @Param() params: any,
    @Body() updateOrderCompletionDto: UpdateOrderCompletionDto,
  ) {
    const updatedOrder = await this.ordersService.updateOrderCompletion(
      params.id,
      updateOrderCompletionDto,
    );

    return {
      status: HttpStatus.OK,
      message: `order with id: ${params.id} updated`,
      data: updatedOrder,
    };
  }

  @Delete(':id')
  deleteOrder(@Param() params: any) {
    return this.ordersService.deleteOrder(params.id);
  }
}

@Controller('checkout')
export class CheckoutController {
  constructor(
    private ordersService: OrdersService,
    private cartsService: CartsService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private jwtService: JwtService,
    private midtransService: MidtransService,
    private paymentsService: PaymentsService,
  ) {}

  private async extractPayload(token: string) {
    let payload;
    if (token) {
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (error) {
        payload = undefined;
      }
    }

    return payload;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Render('order/checkout')
  async renderCheckout(@Req() req: Request) {
    const { accessToken, cartCount = undefined } = req.cookies;
    const payload = await this.extractPayload(accessToken);
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }
    const cart = await this.cartsService.validCart(user.email);
    return {
      layout: 'layouts/shop',
      title: 'Checkout',
      statusCode: HttpStatus.OK,
      user: user,
      cart: cart,
      cartCount: cartCount,
      MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async handleCheckout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const { accessToken } = req.cookies;
    const payload = await this.extractPayload(accessToken);
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }
    const cart = await this.cartsService.validCart(user.id);

    const orderId = 'ORDER-' + nanoid(10);
    const grossAmount = cart.total;

    const transaction = await this.midtransService.createTransaction({
      orderId,
      ...createTransactionDto,
    });
    console.log('Transaction: :', transaction);
    await this.ordersService.createPendingOrder({
      id: orderId,
      user,
      cart,
      total: grossAmount,
    });

    try {
      cart.items.forEach(async (item) => {
        const product = await this.productsService.findProductById(
          item.product.id,
        );
        const newQuantity = product.stock - item.quantity;
        await this.productsService.updateProduct(product.id, {
          stock: newQuantity,
          sold: Number(product.sold) + Number(item.quantity),
        });
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    try {
      cart.items.forEach(
        async (item) => await this.cartsService.deleteCartItem(item.id),
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    res.clearCookie('cartCount');

    return {
      snapToken: transaction.token,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    };
  }

  @Post('payment-notification')
  async handleNotification(
    @Req() req: Request,
    @Body() paymentNotification: any,
  ) {
    // const statusResponse = await this.midtransService.getTransactionStatus(
    //   req.body.order_id,
    // );

    if (paymentNotification.transaction_status === 'settlement') {
      await this.ordersService.markOrderAsPaid(req.body.order_id);

      const paymentData = {
        transactionId: paymentNotification.transaction_id,
        transactionTime: paymentNotification.transaction_time,
        transactionStatus: paymentNotification.transaction_status,
        paymentType: paymentNotification.payment_type,
        order: await this.ordersService.findOrderById(
          paymentNotification.order_id,
        ),
        amount: paymentNotification.gross_amount,
        bank: paymentNotification.bank,
        approvalCode: paymentNotification.approval_code,
      };
      await this.paymentsService.createPayment(paymentData);
    }

    if (paymentNotification.transaction_status === 'expire') {
      await this.ordersService.markOrderAsFailed(req.body.order_id);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }

  @Get('after-payment')
  @Render('order/after-payment')
  async renderSuccess(@Req() req: Request) {
    const { accessToken, cartCount } = req.cookies;
    const payload = await this.extractPayload(accessToken);
    const user = await this.usersService.findOne(payload.email);
    const latestOrder = await this.ordersService.findLatestOrderByUser(
      payload.email,
    );

    return {
      layout: 'layouts/shop',
      title: 'Pesanan Terbayar',
      order: latestOrder,
      user: user,
      cartCount: cartCount,
    };
  }
}
