import {
  Body,
  Controller,
  // Delete,
  Get,
  HttpStatus,
  Param,
  Post,
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
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';

@Controller('admin')
export class AdminController {
  constructor(
    private productsService: ProductsService,
    private usersService: UsersService,
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

  @Get('/')
  async login(@Res() res: Response) {
    return res.render('admin/login', {
      layout: 'layouts/admin',
      title: 'Login',
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('products')
  async productsList(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const products = await this.productsService.findAllProducts();

    return res.render('admin/products/index', {
      layout: 'layouts/admin',
      title: 'Produk',
      data: products,
      user: user,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  // @Delete('products/:id')
  // @Redirect('products')
  // async adminDeleteProduct(@Param() params: any) {
  //   this.productsService.deleteProduct(params.id);

  //   return {
  //     status: HttpStatus.OK,
  //     message: `product with id: ${params.id} deleted`,
  //   };
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('orders')
  async renderAdminOrders(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    const orders = await this.ordersService.findAllOrders();

    return res.render('admin/orders/index', {
      layout: 'layouts/admin',
      title: 'Pesanan',
      data: orders,
      user: user,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('payments')
  async renderAdminPayments(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.accessToken;
    const payload = await this.extractPayload(token);
    const user = await this.usersService.findOne(payload.email);
    return res.render('admin/payments', {
      layout: 'layouts/admin',
      title: 'Pembayaran',
      user: user,
    });
  }
}
