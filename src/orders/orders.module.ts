import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderItemsController, OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { OrderItem } from './order-items.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/products.entity';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    TypeOrmModule.forFeature([Order, OrderItem, User, Product]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController, OrderItemsController],
  exports: [OrdersModule],
})
export class OrdersModule {}
