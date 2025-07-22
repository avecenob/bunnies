import { forwardRef, Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { CartItem } from './cart-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CartController } from './carts.controller';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Cart, CartItem]),
  ],
  controllers: [CartController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
