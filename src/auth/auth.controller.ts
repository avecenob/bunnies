import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from '../common/dto/user-login';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto.email, userLoginDto.password);
  }
}
