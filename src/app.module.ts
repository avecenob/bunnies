import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { Product } from './products/products.entity';
import { Category } from './products/category.entity';
import { AppDataSource } from './data-source';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    OrdersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
