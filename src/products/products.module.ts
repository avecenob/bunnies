import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CategoriesController,
  ProductsController,
} from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Category } from './category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  providers: [ProductsService],
  controllers: [ProductsController, CategoriesController],
  exports: [ProductsService],
})
export class ProductsModule {}
