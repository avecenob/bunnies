import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderItemsController, OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController, OrderItemsController],
  exports: [OrdersService],
})
export class OrdersModule {}
