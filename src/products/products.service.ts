import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import {
  And,
  In,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Category } from './category.entity';
import { CreateProductDto } from 'src/common/dto/products/create-product.dto';
import { CreateCategoryDto } from 'src/common/dto/products/create-category.dto';
import { nanoid } from 'nanoid';
import { UpdateCategoryDto } from 'src/common/dto/products/update-category.dto';
import { UpdateProductDto } from 'src/common/dto/products/update-product-dto';
import { OrderItem } from 'src/orders/order-item.entity';
import { CartItem } from 'src/carts/cart-item.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async validProduct(key: string) {
    const product = await this.productsRepository.findOne({
      where: { id: key },
      relations: {
        category: true,
        orderItems: true,
        cartItems: true,
      },
    });

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

    return product;
  }

  async findAllProducts(query?: any) {
    const where: any = {};
    if (query?.name) {
      where.name = Like(`%${query.name}%`);
    }

    if (query?.category) {
      where.category = {
        name: In(
          Array.isArray(query.category) ? query.category : [query.category],
        ),
      };
    }

    if (query?.availability === 'inStock') {
      where.stock = MoreThanOrEqual(1);
    }

    if (query?.minPrice && query?.maxPrice) {
      where.price = And(
        MoreThanOrEqual(query.minPrice),
        LessThanOrEqual(query.maxPrice),
      );
    } else if (query?.minPrice) {
      where.price = MoreThanOrEqual(query.minPrice);
    } else if (query?.maxPrice) {
      where.price = LessThanOrEqual(query.maxPrice);
    }

    const products = await this.productsRepository.find({
      where,
      relations: {
        category: true,
      },
    });
    return products;
  }

  async findFeaturedProducts() {
    const products = await this.productsRepository.find({
      order: {
        sold: 'DESC',
      },
      take: 6,
    });

    return products;
  }

  async findProductById(id: string) {
    const product = await this.validProduct(id);

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const productToUpdate = await this.validProduct(id);

    if (!productToUpdate) {
      throw new NotFoundException('product not found');
    }

    const { name, categoryId, description, price, stock, image } =
      updateProductDto;
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });

    try {
      const updatedProduct = await this.productsRepository.update(
        productToUpdate.id,
        {
          ...(name && { name }),
          ...(category && { category }),
          ...(description && { description }),
          ...(typeof price !== 'undefined' && { price }),
          ...(typeof stock !== 'undefined' && { stock }),
          ...(image && { image }),
        },
      );
      console.log(updatedProduct);
      return {
        status: HttpStatus.OK,
        message: `product with id: ${productToUpdate.id} updated`,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteProduct(id: string) {
    const productToDelete = await this.validProduct(id);

    if (!productToDelete) {
      throw new NotFoundException('product not found');
    }

    try {
      // Soft-delete all order items and cart items first
      await this.orderItemRepository.softDelete({ product: { id: id } });
      await this.cartItemRepository.softDelete({ product: { id: id } });
      return await this.productsRepository.remove(productToDelete);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return true;
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.create(createCategoryDto);

    try {
      await this.categoryRepository.save(category);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return category;
  }

  async findAllCategories() {
    const categories = await this.categoryRepository.find();

    return categories;
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
