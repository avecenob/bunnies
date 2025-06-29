import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateProductDto } from 'src/common/dto/create-product.dto';
import { CreateCategoryDto } from 'src/common/dto/create-category.dto';
import { nanoid } from 'nanoid';
import { UpdateCategoryDto } from 'src/common/dto/update-category.dto';
import { UpdateProductDto } from 'src/common/dto/update-product-dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const { category_id, ...rest } = createProductDto;
    const category = await this.categoryRepository.findOneBy({
      id: category_id,
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
    const products = await this.productsRepository.findOneBy({ id });

    if (!products) {
      throw new NotFoundException();
    }

    return {
      status: HttpStatus.OK,
      message: 'products found',
      data: products,
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const productToUpdate = await this.productsRepository.findOneBy({ id });

    if (!productToUpdate) {
      throw new NotFoundException('product not found');
    }

    const { name, category_id, description, price, stock } = updateProductDto;

    try {
      await this.productsRepository.update(productToUpdate.id, {
        ...(name && { name }),
        ...(category_id && { category_id }),
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
    const productToDelete = await this.productsRepository.findOneBy({ id });

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

  async findAllCategores() {
    const categories = await this.categoryRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: categories,
    };
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });

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
    const categoryToUpdate = await this.categoryRepository.findOneBy({ id });

    if (!categoryToUpdate) {
      throw new NotFoundException();
    }

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
    const categoryToDelete = await this.categoryRepository.findOneBy({ id });

    if (!categoryToDelete) {
      throw new NotFoundException('category not found');
    }

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
