import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from '../common/dto/auth/user-login';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  async renderLogin(@Res() res: Response) {
    res.render('auth/login', {
      layout: 'layouts/shop',
      title: 'Login - Bunnies Bakery',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() userLoginDto: UserLoginDto,
  ) {
    const accessToken = await this.authService.login(
      userLoginDto.email,
      userLoginDto.password,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'login success',
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');

    return {
      statusCode: HttpStatus.OK,
      message: 'logged out',
      redirect: '/',
    };
  }
}
