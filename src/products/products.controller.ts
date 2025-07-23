import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Render,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from 'src/common/dto/products/create-product.dto';
import { CreateCategoryDto } from 'src/common/dto/products/create-category.dto';
import { UpdateProductDto } from 'src/common/dto/products/update-product-dto';
import { UpdateCategoryDto } from 'src/common/dto/products/update-category.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { JwtService } from '@nestjs/jwt';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private categoriesService: ProductsService,
    private jwtService: JwtService,
  ) {}

  private async extractPayload(token: string) {
    let payload;
    if (token) {
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (error) {
        payload = undefined;
      }
    }

    return payload;
  }

  @Post('create')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.createProduct(createProductDto);

    return {
      status: HttpStatus.CREATED,
      message: 'product created',
      data: product,
    };
  }

  @Get('catalogue')
  @Render('products/catalogue')
  async renderCatalogue(@Req() req: Request, @Query() query: any) {
    const { accessToken, cartCount } = req.cookies;
    const user = await this.extractPayload(accessToken);
    const products = await this.productsService.findAllProducts(query);
    const categories = await this.productsService.findAllCategories();
    return {
      layout: 'layouts/shop',
      title: 'Katalog - Bunnies Bakery',
      status: HttpStatus.OK,
      message: 'success',
      products: products,
      user: user,
      cartCount: cartCount,
      filters: {
        categories: categories.map((category) => category.name),
        selectedCategories: query.category,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        availability: query.availability,
        name: query.name,
      },
    };
  }

  @Get()
  async findAll(@Query() query?: any) {
    const products = await this.productsService.findAllProducts(query);
    console.log('Query: ', query);

    return {
      statusCode: HttpStatus.OK,
      products: products,
    };
  }

  @Get('catalogue/:id')
  @Render('products/details')
  async renderDetails(@Param() params: any, @Req() req: Request) {
    const { accessToken, cartCount } = req.cookies;
    const user = await this.extractPayload(accessToken);
    const product = await this.productsService.findProductById(params.id);
    // const categories = await this.categoriesService.findAllCategories();

    return {
      layout: 'layouts/shop',
      title: product.name + ' - Bunnies Bakery',
      status: HttpStatus.OK,
      product: product,
      user: user,
      cartCount: cartCount,
    };
  }

  @Get(':id')
  async findProductById(@Param() params: any) {
    const product = await this.productsService.findProductById(params.id);

    return {
      statusCode: HttpStatus.OK,
      product: product,
    };
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images/products',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    }),
  )
  async updateProduct(
    @Param() params: any,
    @Body() body: any,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const updateProductDto: UpdateProductDto = {
      name: body.name,
      price: parseInt(body.price),
      categoryId: parseInt(body.categoryId),
      description: body.description,
      stock: parseInt(body.stock),
      image: image?.filename || body.image,
    };
    console.log('updateProductDto', updateProductDto);

    return await this.productsService.updateProduct(
      params.id,
      updateProductDto,
    );

    // return {
    //   status: HttpStatus.OK,
    // message: `product with id: ${params.id} updated`,
    // };
  }

  @Delete(':id')
  async deleteProduct(@Param() params: any) {
    const product = await this.productsService.validProduct(params.id);
    console.log(product);
    const imagePath = join(
      process.cwd(),
      'public/images/products',
      product.image,
    );
    console.log(imagePath);

    try {
      await unlink(imagePath);
    } catch (error) {
      console.log('Gagal hapus gambar', error);
    }

    this.productsService.deleteProduct(params.id);

    return {
      status: HttpStatus.OK,
      message: `product with id: ${params.id} deleted`,
    };
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
    const category = this.productsService.findAllCategories();

    return {
      status: HttpStatus.CREATED,
      message: 'category created',
      data: category,
    };
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
