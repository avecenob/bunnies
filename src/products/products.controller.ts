import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from 'src/common/dto/products/create-product.dto';
import { CreateCategoryDto } from 'src/common/dto/products/create-category.dto';
import { UpdateProductDto } from 'src/common/dto/products/update-product-dto';
import { UpdateCategoryDto } from 'src/common/dto/products/update-category.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post('create')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAllProducts();
  }

  @Get(':id')
  findProductById(@Param() params: any) {
    return this.productsService.findProductById(params.id);
  }

  @Put(':id')
  updateProduct(
    @Param() params: any,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(params.id, updateProductDto);
  }

  @Delete(':id')
  deleteProduct(@Param() params: any) {
    return this.productsService.deleteProduct(params.id);
  }
}

@Controller('categories')
export class CategoriesController {
  constructor(private productsService: ProductsService) {}

  @Post('create')
  createProduct(@Body() createCategoryDto: CreateCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  @Get()
  findAllCategories() {
    return this.productsService.findAllCategores();
  }

  @Get(':id')
  findCategoryById(@Param() params: any) {
    return this.productsService.findCategoryById(params.id);
  }

  @Put(':id')
  updateCategory(
    @Param() params: any,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.productsService.updateCategory(params.id, updateCategoryDto);
  }

  @Delete(':id')
  deleteProduct(@Param() params: any) {
    return this.productsService.deleteCategory(params.id);
  }
}
