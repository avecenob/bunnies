import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CategoriesController,
  ProductsController,
} from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CartItem } from 'src/carts/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, CartItem])],
  providers: [ProductsService],
  controllers: [ProductsController, CategoriesController],
  exports: [ProductsService],
})
export class ProductsModule {}
