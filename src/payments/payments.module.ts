import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { UsersModule } from 'src/users/users.module';
import { MidtransService } from './midtrans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payments.entity';
import { Order } from 'src/orders/order.entity';

@Module({
  imports: [
    forwardRef(() => OrdersModule),
    UsersModule,
    TypeOrmModule.forFeature([Payment, Order]),
  ],
  providers: [PaymentsService, MidtransService],
  controllers: [PaymentsController],
  exports: [MidtransService, PaymentsService],
})
export class PaymentsModule {}
