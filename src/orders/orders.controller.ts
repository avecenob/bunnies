import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from 'src/common/dto/orders/update-order-status.dto';
import { CreateOrderItemDto } from 'src/common/dto/orders/create-order-item.dto';
import { UpdateOrderItemDto } from 'src/common/dto/orders/update-order-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { CartsService } from 'src/carts/carts.service';
import { JwtService } from '@nestjs/jwt';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { nanoid } from 'nanoid';
import { CreateTransactionDto } from 'src/common/dto/midtrans/create-transaction.dto';
import * as dotenv from 'dotenv';
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

  @Get('user/:userId')
  findOrderByUserId(@Param() params: any) {
    return this.ordersService.findOrdersByUserId(params.userId);
  }

  @Put('status/:id')
  updateOrder(
    @Param() params: any,
    @Body() updateOrderDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(params.id, updateOrderDto);
  }

  @Delete(':id')
  deleteOrder(@Param() params: any) {
    return this.ordersService.deleteOrder(params.id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order-items')
export class OrderItemsController {
  constructor(
    private ordersService: OrdersService,
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
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  findAll() {
    return this.ordersService.findAllOrderItems();
  }

  @Get(':id')
  findOrderItemById(@Param() params: any) {
    return this.ordersService.findOrderItemsById(params.id);
  }

  @Get('order/:orderId')
  findOrderItemByOrderId(@Param() params: any) {
    return this.ordersService.findOrderItemsByOrderId(params.orderId);
  }

  @Get('product/:productId')
  findOrderItemByProductId(@Param() params: any) {
    return this.ordersService.findOrderItemsByOrderId(params.productId);
  }

  @Post('create')
  createOrderItem(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.ordersService.createOrderItem(createOrderItemDto);
  }

  @Put(':id')
  updateOrderItem(
    @Param() params: any,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateOrderItem(params.id, updateOrderItemDto);
  }

  @Delete(':id')
  deleteOrderItem(@Param() params: any) {
    return this.ordersService.deleteOrderItem(params.id);
  }
}

@Controller('checkout')
export class CheckoutController {
  constructor(
    private ordersService: OrdersService,
    private cartsService: CartsService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private midtransService: MidtransService,
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
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const cart = await this.cartsService.findCartByUser(user.email);
    return {
      layout: 'layouts/shop',
      title: 'Checkout',
      statusCode: HttpStatus.OK,
      user: user,
      cart: cart,
      MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async handleCheckout(
    @Req() req: Request,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const cart = await this.cartsService.findCartByUser(user.id);

    const orderId = 'ORDER-' + nanoid(10);
    const grossAmount = cart.total;

    const transaction = await this.midtransService.createTransaction({
      orderId,
      ...createTransactionDto,
    });

    await this.ordersService.createPendingOrder({
      id: orderId,
      user,
      cart,
      total: grossAmount,
    });

    const cartItems = await this.cartsService.findCartItemsByCartId(cart.id);
    for (const cartItem of cartItems) {
      await this.cartsService.deleteCartItem(cartItem.id);
    }
    return {
      snapToken: transaction.token,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    };
  }

  @Post('payment-notification')
  async handleNotification(@Req() req: Request) {
    const statusResponse = await this.midtransService.getTransactionStatus(
      req.body.order_id,
    );

    if (statusResponse.transaction_status === 'settlement') {
      await this.ordersService.markOrderAsPaid(req.body.order_id);
    }

    if (statusResponse.transaction_status === 'expire') {
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
    const payload = req.cookies?.accessToken;
    const user = await this.usersService.findOne(payload.email);
    const latestOrder = await this.ordersService.findLatestOrderByUser(
      payload.email,
    );

    return {
      layout: 'layouts/shop',
      title: 'Pesanan Terbayar',
      order: latestOrder,
      user: user,
    };
  }
}
