import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    OrdersModule,
    AuthModule,
    PaymentsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
