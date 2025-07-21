import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  @Get('/')
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  @Render('home')
  async root(@Req() req: Request) {
    const token = req.cookies?.accessToken;
    let user;

    if (token) {
      try {
        user = await this.jwtService.verifyAsync(token);
      } catch (error) {
        user = undefined;
      }
    }
    return { layout: 'layouts/shop', title: 'Home', user: user };
  }
}
