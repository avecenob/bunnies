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
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './create-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CreateCartItemDto } from './create-cart-item.dto';

@Controller('carts')
export class CartsController {
  constructor(private cartsService: CartsService) {}

  @Post('create')
  createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.createCart(createCartDto);
  }

  @Get()
  findAll() {
    return this.cartsService.findAllCarts();
  }

  @Get(':id')
  findById(@Param() params: any) {
    return this.cartsService.findCartById(params.id);
  }

  @Get('user/:userId')
  findByUserId(@Param() params: any) {
    return this.cartsService.findCartByUser(params.userId);
  }

  @Delete(':id')
  deleteCart(@Param() params: any) {
    return this.cartsService.deleteCart(params.id);
  }
}

@Controller('cart')
export class CartViewController {
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
    const token = req.cookies?.accessToken;
    const user = await this.extractPayload(token);

    const cart = await this.cartsService.findCartByUser(user.email);
    return {
      layout: 'layouts/shop',
      title: 'Keranjang - Bunnies Bakery',
      statusCode: HttpStatus.OK,
      cart: cart,
      user: user,
    };
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @Roles('customer')
  async addItem(@Req() req: Request, @Body() body: any) {
    const token = req.cookies?.accessToken;
    const user = await this.extractPayload(token);

    const cart = await this.cartsService.findCartByUser(user.email);

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    const createCartItemDto: CreateCartItemDto = {
      ...body,
      cartId: cart.id,
    };

    const cartItem = await this.cartsService.createCartItem(createCartItemDto);

    return {
      statusCode: HttpStatus.CREATED,
      cartItem: cartItem,
    };
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('customer')
  async deleteItem(@Req() req: Request, @Param() params: any) {
    return {
      ...(await this.cartsService.deleteCartItem(params.id)),
    };
  }
}
