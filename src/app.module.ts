import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { AppDataSource } from './data-source';
import { CartsModule } from './carts/carts.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { MidtransModule } from './midtrans/midtrans.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    OrdersModule,
    ProductsModule,
    CartsModule,
    PaymentsModule,
    AdminModule,
    MidtransModule,
    PaymentsModule,
    DeliveriesModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
