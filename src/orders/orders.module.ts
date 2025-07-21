import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CheckoutController,
  OrderItemsController,
  OrdersController,
} from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';
import { CartsModule } from 'src/carts/carts.module';
import { MidtransModule } from 'src/midtrans/midtrans.module';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    AuthModule,
    CartsModule,
    MidtransModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController, OrderItemsController, CheckoutController],
  exports: [OrdersService],
})
export class OrdersModule {}
