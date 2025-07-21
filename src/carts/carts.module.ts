import { forwardRef, Module } from '@nestjs/common';
import { CartsController, CartViewController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { CartItem } from './cart-item.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Cart, CartItem]),
  ],
  controllers: [CartsController, CartViewController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
