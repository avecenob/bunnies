import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ProductsModule, UsersModule, OrdersModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
