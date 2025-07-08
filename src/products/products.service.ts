import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateProductDto } from 'src/common/dto/products/create-product.dto';
import { CreateCategoryDto } from 'src/common/dto/products/create-category.dto';
import { nanoid } from 'nanoid';
import { UpdateCategoryDto } from 'src/common/dto/products/update-category.dto';
import { UpdateProductDto } from 'src/common/dto/products/update-product-dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async validProduct(key: string) {
    const product = await this.productsRepository.findOneBy({ id: key });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    return product;
  }

  async validCategory(id: number) {
    const product = await this.categoryRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('category not found');
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto) {
    const { categoryId, ...rest } = createProductDto;
    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
    });

    if (!category) {
      throw new NotFoundException('category not found');
    }

    const id = nanoid(10);
    const product = this.productsRepository.create({ id, ...rest, category });

    try {
      await this.productsRepository.save(product);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.CREATED,
      message: 'product created',
      data: product,
    };
  }

  async findAllProducts() {
    const products = await this.productsRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: products,
    };
  }

  async findProductById(id: string) {
    const product = await this.validProduct(id);

    return {
      status: HttpStatus.OK,
      message: 'products found',
      data: product,
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const productToUpdate = await this.validProduct(id);

    if (!productToUpdate) {
      throw new NotFoundException('product not found');
    }

    const { name, categoryId, description, price, stock } = updateProductDto;

    try {
      await this.productsRepository.update(productToUpdate.id, {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(description && { description }),
        ...(price && { price }),
        ...(stock && { stock }),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `product with id: ${productToUpdate.id} updated`,
    };
  }

  async deleteProduct(id: string) {
    const productToDelete = await this.validProduct(id);

    if (!productToDelete) {
      throw new NotFoundException('product not found');
    }

    try {
      await this.productsRepository.delete(productToDelete.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `product with id: ${productToDelete.id} deleted`,
    };
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.create(createCategoryDto);

    try {
      await this.categoryRepository.save(category);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.CREATED,
      message: 'category created',
      data: category,
    };
  }

  async findAllCategories() {
    const categories = await this.categoryRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: categories,
    };
  }

  async findCategoryById(id: number) {
    const category = await this.validCategory(id);

    if (!category) {
      throw new NotFoundException();
    }

    return {
      status: HttpStatus.OK,
      message: 'category found',
      data: category,
    };
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { name, description } = updateCategoryDto;
    const categoryToUpdate = await this.validCategory(id);

    try {
      await this.categoryRepository.update(categoryToUpdate.id, {
        ...(name && { name }),
        ...(description && { description }),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `category with id: ${categoryToUpdate.id} updated`,
    };
  }

  async deleteCategory(id: number) {
    const categoryToDelete = await this.validCategory(id);

    try {
      await this.categoryRepository.delete(categoryToDelete.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `category with id: ${categoryToDelete.id} updated`,
    };
  }
}
