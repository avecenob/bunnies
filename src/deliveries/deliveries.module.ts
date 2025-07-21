import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './delivery.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { Order } from 'src/orders/order.entity';

@Module({
  imports: [OrdersModule, TypeOrmModule.forFeature([Delivery, Order])],
  providers: [DeliveriesService],
  controllers: [DeliveriesController],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
