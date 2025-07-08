import {
  HttpStatus,
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
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }

    if (user && (await bcrypt.compare(passwd, user.data.password))) {
      const result = {
        id: user.data.id,
        email: user.data.email,
        role: user.data.role,
      };
      return result;
    }
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      status: HttpStatus.OK,
      message: 'login success',
      access_token: accessToken,
    };
  }
}
