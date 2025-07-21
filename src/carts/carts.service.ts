import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CreateCartDto } from './create-cart.dto';
import { nanoid } from 'nanoid';
import { CartItem } from './cart-item.entity';
import { CreateCartItemDto } from './create-cart-item.dto';
import { UpdateCartItemDto } from './update-cart-item.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartsItemRepository: Repository<CartItem>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async validCart(key: string) {
    const cart = await this.cartsRepository.findOne({
      where: [{ id: key }, { user: { email: key } }, { user: { id: key } }],
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('cart not found');
    }

    return cart;
  }

  async existCartItem(productId: string) {
    const cartItem = await this.cartsItemRepository.findOne({
      where: { product: { id: productId } },
      relations: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem) return false;

    return cartItem;
  }

  async validCartItem(key: number) {
    const cartItem = await this.cartsItemRepository.findOne({
      where: { id: key },
      relations: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('cart item not found');
    }

    return cartItem;
  }

  private async recalculateCartTotal(cartId: string) {
    const items = await this.cartsItemRepository.find({
      where: { cart: { id: cartId } },
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    await this.cartsRepository.update(cartId, { total });
  }

  /**
   *
   * This should be called only once per user creation
   * with [customer] role
   *
   * TODO
   * - inject to Users Service
   * - call function in createUser()
   *
   */
  async createCart(createCartDto: CreateCartDto) {
    const { userId } = createCartDto;

    const user = await this.usersService.validUser(userId);

    const id = nanoid(10);
    const cart = this.cartsRepository.create({
      id,
      user: user,
    });

    try {
      await this.cartsRepository.save(cart);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.CREATED,
      message: `cart for user: ${user.id} created`,
      data: cart,
    };
  }

  async findAllCarts() {
    const carts = await this.cartsRepository.find({
      relations: ['user'],
    });

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: carts,
    };
  }

  async findCartById(id: string) {
    const cart = await this.validCart(id);

    return cart;
  }

  async findCartByUser(key: string) {
    await this.usersService.validUser(key);

    const cart = await this.validCart(key);

    return cart;
  }

  async deleteCart(id: string) {
    const cartToDelete = await this.validCart(id);

    try {
      await this.cartsRepository.delete(cartToDelete.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `cart with id: ${cartToDelete.id} is deleted`,
    };
  }

  async createCartItem(createCartItemDto: CreateCartItemDto) {
    const { cartId, productId, quantity } = createCartItemDto;

    const cart = await this.validCart(cartId);
    const product = await this.productsService.validProduct(productId);
    const subtotal = quantity * product.price;
    const existedCartItem = await this.existCartItem(productId);
    if (existedCartItem) {
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: quantity,
        subtotal: subtotal,
      };
      try {
        await this.updateCartItem(existedCartItem.id, updateCartItemDto);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    } else {
      try {
        await this.cartsItemRepository.save({
          cart,
          product,
          quantity,
          subtotal,
        });
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }

    await this.recalculateCartTotal(cartId);

    return cart;
  }

  async findAllCartItems() {
    const cartItems = await this.cartsItemRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: cartItems,
    };
  }

  async findCartItemById(id: number) {
    const cartItem = await this.validCartItem(id);

    return {
      status: HttpStatus.OK,
      message: 'cart item found',
      data: cartItem,
    };
  }

  async findCartItemsByCartId(cartId: string) {
    const cartItems = await this.cartsItemRepository.find({
      where: { cart: await this.validCart(cartId) },
    });

    return cartItems;
  }

  async updateCartItem(id: number, updateCartItemDto: UpdateCartItemDto) {
    const cartItemToUpdate = await this.validCartItem(id);

    const { quantity, subtotal } = updateCartItemDto;

    try {
      await this.cartsItemRepository.update(cartItemToUpdate.id, {
        ...(quantity && { quantity }),
        ...(subtotal && { subtotal }),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
    const updatedCartitem = await this.validCartItem(id);
    console.log(updatedCartitem);
    return updatedCartitem;
  }

  async deleteCartItem(id: number) {
    const cartItemToDelete = await this.validCartItem(id);
    console.log(cartItemToDelete);
    const cartId = cartItemToDelete.cart.id;

    try {
      await this.cartsItemRepository.delete(cartItemToDelete.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    await this.recalculateCartTotal(cartId);

    return {
      status: HttpStatus.OK,
      message: `cart item with id: ${cartItemToDelete.id} is deleted`,
    };
  }
}
