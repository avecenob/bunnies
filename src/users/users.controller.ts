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
  Res,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../common/dto/users/create-user.dto';
import { UpdateUserDto } from '../common/dto/users/update-user.dto';
import { CartsService } from 'src/carts/carts.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt.guard';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
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

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Render('customer/profile')
  async renderProfile(@Req() req: Request, @Param() params: any) {
    const { cartCount } = req.cookies;
    const user = await this.userService.findOne(params.id);
    return {
      layout: 'layouts/shop',
      title: 'Profil',
      user: user,
      cartCount: cartCount,
    };
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin', 'customer')
  async findOneById(@Param() params: any) {
    return await this.userService.findOne(params.id);
  }

  @Put(':id')
  async update(@Param() params: any, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateById(params.id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param() params: any) {
    const cartToDelete = await this.cartsService.validCart(params.id);
    if (cartToDelete) {
      await this.cartsService.deleteCart(cartToDelete.id);
    }

    await this.userService.deleteById(params.id);

    return {
      statusCode: HttpStatus.OK,
      message: `user with id:${params.id} deleted`,
    };
  }
}

@Controller('register')
export class RegisterController {
  constructor(
    private userService: UsersService,
    private cartsService: CartsService,
  ) {}

  @Get()
  async renderRegister(@Res() res: Response) {
    res.render('auth/register', {
      layout: 'layouts/shop',
      title: 'Register - Bunnies Bakery',
    });
  }

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    console.log(user);

    if (user.role === 'customer') {
      const createCartDto = { userId: user.id };

      await this.cartsService.createCart(createCartDto);
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'user created',
      data: user,
    };
  }
}
