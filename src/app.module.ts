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

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    OrdersModule,
    ProductsModule,
    CartsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
