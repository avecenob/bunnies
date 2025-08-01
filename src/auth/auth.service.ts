import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private async generateJwt(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return token;
  }

  private async generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private async validateUser(email: string, passwd: string) {
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new NotFoundException('Email tidak terdaftar');
    }
    console.log('password hash to compare: ', user.password);

    const validUser = user && (await bcrypt.compare(passwd, user.password));

    if (!validUser) {
      throw new UnauthorizedException('Password salah');
    }

    return user;
  }

  async isAdmin(email: string) {
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (user.role !== 'admin') {
      return false;
    }

    return true;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const accessToken = this.generateJwt(user);

    return accessToken;
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const token = await this.generateRandomToken();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetToken = token;
    user.resetTokenExpires = expires;
    try {
      await this.userService.updateById(user.id, user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    try {
      await this.emailService.sendResetPassword(email, token);

      return {
        statusCode: HttpStatus.OK,
        message: 'Email reset password terkirim.',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async resetPassword(token: string, newPass: string) {
    const user = await this.userService.findOne(token);
    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      throw new BadRequestException('Token tidak valid atau kadaluarsa');
    }

    user.password = await bcrypt.hash(newPass, 10);
    console.log('password hash after reset: ', user.password);
    user.resetToken = null;
    user.resetTokenExpires = null;
    try {
      await this.userService.updateById(user.id, user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Reset password berhasil. Silakan login',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
