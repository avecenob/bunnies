import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { CreateProductDto } from 'src/common/dto/products/create-product.dto';
import { OrdersService } from 'src/orders/orders.service';
import { PaymentsService } from 'src/payments/payments.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private productsService: ProductsService,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
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

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');

    return {
      statusCode: HttpStatus.OK,
      message: 'Logout berhasil',
      redirect: '/admin/login',
    };
  }

  @Get('/dashboard')
  async index(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    return res.render('admin/dashboard', {
      layout: 'layouts/admin',
      title: 'Dashboard',
      user: user,
    });
  }

  @Get('products')
  @Render('admin/products')
  async productsList(@Req() req: Request, @Query() query: any) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const products = await this.productsService.findAllProducts(query);

    return {
      layout: 'layouts/admin',
      title: 'Produk',
      data: products,
      user: user,
      filters: { name: query.name },
    };
  }

  @Get('products/create')
  async renderCreateProduct(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const categories = await this.productsService.findAllCategories();

    return res.render('admin/products/create', {
      layout: 'layouts/admin',
      title: 'Tambahkan Produk',
      data: categories,
      user: user,
    });
  }

  @Post('products/create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images/products',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    }),
  )
  async createProduct(
    @Res() res: Response,
    @Body() body: any,
    // @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const createProductDto: CreateProductDto = {
      name: body.name,
      price: parseInt(body.price),
      categoryId: parseInt(body.categoryId),
      description: body.description,
      stock: parseInt(body.stock),
      image: image.filename,
    };

    const product = await this.productsService.createProduct(createProductDto);

    return res.status(201).json({
      statusCode: HttpStatus.OK,
      message: 'product created',
      redirect: '/admin/products',
      data: product,
    });
  }

  @Get('products/edit/:id')
  async editProduct(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params: any,
  ) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const product = await this.productsService.findProductById(params.id);
    const categories = await this.productsService.findAllCategories();

    return res.render('admin/products/edit', {
      layout: 'layouts/admin',
      title: 'Edit Produk',
      data: {
        categories: categories,
        product: product,
      },
      user: user,
    });
  }

  @Get('orders')
  @Render('admin/orders/index')
  async renderAdminOrders(@Req() req: Request, @Query() query: any) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const orders = await this.ordersService.findAllOrders(query);

    return {
      layout: 'layouts/admin',
      title: 'Pesanan',
      data: orders,
      user: user,
      filters: {
        id: query.id,
      },
    };
  }

  @Get('orders/:id')
  @Render('admin/orders/details')
  async renderAdminOrderDetails(@Req() req: Request, @Param() params: any) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const order = await this.ordersService.findOrderById(params.id);

    return {
      layout: 'layouts/admin',
      title: 'Pesanan',
      order: order,
      user: user,
    };
  }

  @Get('payments')
  @Render('admin/payments')
  async renderAdminPayments(@Req() req: Request, @Query() query: any) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const payments = await this.paymentsService.findAllPayments(query);
    return {
      layout: 'layouts/admin',
      title: 'Pembayaran',
      user: user,
      payments: payments,
      filters: {
        id: query.id,
      },
    };
  }

  @Get('orders/:id')
  @Render('admin/payments/details')
  async renderAdminPaymentDetails(@Req() req: Request, @Param() params: any) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const payment = await this.paymentsService.findPaymentByOrderId(params.id);

    return {
      layout: 'layouts/admin',
      title: 'Pesanan',
      payment: payment,
      user: user,
    };
  }
}
