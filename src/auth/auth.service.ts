import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(email: string, passwd: string) {
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new NotFoundException('Email tidak terdaftar');
    }

    const validUser = user && (await bcrypt.compare(passwd, user.password));

    if (!validUser) {
      throw new UnauthorizedException('Password salah');
    }

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return result;
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

    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return accessToken;
  }
}
