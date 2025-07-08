import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './create-cart.dto';

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
    return this.cartsService.findCartByUserId(params.userId);
  }

  @Delete(':id')
  deleteCart(@Param() params: any) {
    return this.cartsService.deleteCart(params.id);
  }
}
