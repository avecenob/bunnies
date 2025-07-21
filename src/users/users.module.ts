import { forwardRef, Module } from '@nestjs/common';
import { RegisterController, UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Cart } from 'src/carts/cart.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [
    forwardRef(() => CartsModule),
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, Cart]),
  ],
  providers: [UsersService],
  controllers: [UsersController, RegisterController],
  exports: [UsersService],
})
export class UsersModule {}
