import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { CartsService } from './carts/carts.service';
import { ProductsService } from './products/products.service';
dotenv.config();

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
    private cartsService: CartsService,
    private productsService: ProductsService,
  ) {}

  @Get('/')
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  @Render('home')
  async root(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const { accessToken } = req.cookies;
    let { cartCount } = req.cookies;
    let user;

    if (accessToken) {
      try {
        user = await this.jwtService.verifyAsync(accessToken);
        if (user.role === 'customer') {
          const cart = await this.cartsService.validCart(user.email);
          if (cart.items.length > 0) {
            cartCount = cart.items.length;
            res.cookie('cartCount', cartCount, {
              httpOnly: true,
            });
          }
        }
      } catch (error) {
        console.log(error);
        user = undefined;
      }
    }

    const featuredProducts = await this.productsService.findFeaturedProducts();

    return {
      layout: 'layouts/shop',
      title: 'Home',
      user: user,
      cartCount: cartCount,
      featured: featuredProducts,
    };
  }

  @Get('/admin')
  async renderAdminLogin(@Res() res: Response, @Req() req: Request) {
    const { accessToken } = req.cookies;
    if (accessToken) {
      return res.redirect('/admin/dashboard');
    }
    return res.render('admin/login', {
      layout: 'layouts/admin',
      title: 'Login',
    });
  }
}
