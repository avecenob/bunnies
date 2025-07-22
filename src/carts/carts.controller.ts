import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CreateCartItemDto } from './create-cart-item.dto';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('cart')
export class CartController {
  constructor(
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
  @Render('cart/index')
  @UseGuards(JwtAuthGuard)
  @Roles('customer')
  async renderCart(@Req() req: Request) {
    /**
     * JWT payload should be possible to retrieve
     * using req.user
     *
     * However, TypeScript doesn't recognize this
     * even after declaring types
     *
     * I'm manually retrieving the payload to get rid
     * of the error/warning
     */
    const { accessToken, cartCount } = req.cookies;
    const user = await this.extractPayload(accessToken);

    const cart = await this.cartsService.validCart(user.email);
    return {
      layout: 'layouts/shop',
      title: 'Keranjang - Bunnies Bakery',
      statusCode: HttpStatus.OK,
      cart: cart,
      user: user,
      cartCount: cartCount,
    };
  }

  @Post('add')
  async addItem(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Body() newItem: any,
  ) {
    const { accessToken } = req.cookies;
    const user = await this.extractPayload(accessToken);

    const cart = await this.cartsService.validCart(user.email);

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    const createCartItemDto: CreateCartItemDto = {
      ...newItem,
      cartId: cart.id,
    };

    const cartItem = await this.cartsService.createCartItem(createCartItemDto);

    const newCartCount = await this.cartsService.countCartItems(cart.id);

    res.cookie('cartCount', newCartCount, {
      httpOnly: true,
    });

    return {
      statusCode: HttpStatus.CREATED,
      cartItem: cartItem,
    };
  }

  @Delete('delete-item/:id')
  async deleteItem(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Param() params: any,
  ) {
    const { cartCount } = req.cookies;
    const newCartCount = parseInt(cartCount) - 1;
    if (newCartCount === 0) {
      res.clearCookie('cartCount');
    } else {
      res.cookie('cartCount', newCartCount, {
        httpOnly: true,
      });
    }
    return {
      ...(await this.cartsService.deleteCartItem(params.id)),
    };
  }
}
