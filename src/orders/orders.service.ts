import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './order-items.entity';
import { CreateOrderDto } from 'src/common/dto/orders/create-order.dto';
import { User } from 'src/users/user.entity';
import { nanoid } from 'nanoid';
import { UpdateOrderDto } from 'src/common/dto/orders/update-order.dto';
import { CreateOrderItemDto } from 'src/common/dto/orders/create-order-item.dto';
import { Product } from 'src/products/products.entity';
import { UpdateOrderItemDto } from 'src/common/dto/orders/update-order-item.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const { user_id, ...rest } = createOrderDto;
    const user = await this.usersRepository.findOneBy({ id: user_id });

    if (!user) {
      throw new NotFoundException('user not found. invalid user_id');
    }

    const id = nanoid(10);
    const order = await this.ordersRepository.create({ id, ...rest, user });

    try {
      await this.ordersRepository.save(order);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.CREATED,
      message: 'order created',
      data: order,
    };
  }

  async findAllOrders() {
    const orders = await this.ordersRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: orders,
    };
  }

  async findOrderById(id: string) {
    const order = await this.ordersRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order found',
      data: order,
    };
  }

  async findOrdersByUserId(user_id: string) {
    const user = await this.usersRepository.findOneBy({ id: user_id });

    if (!user) {
      throw new NotFoundException('user not found. invalid user_id');
    }

    const ordersByUser = await this.ordersRepository.find({
      where: {
        user: { id: user_id },
      },
      relations: ['order_items'],
    });

    if (!ordersByUser) {
      throw new NotFoundException('order not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order found',
      data: ordersByUser,
    };
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const orderToUpdate = await this.ordersRepository.findOneBy({ id });

    if (!orderToUpdate) {
      throw new NotFoundException('order not found');
    }

    const { status } = updateOrderDto;

    try {
      await this.ordersRepository.update(orderToUpdate.id, {
        ...(status && { status }),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `order with id: ${orderToUpdate.id} updated`,
      data: orderToUpdate,
    };
  }

  /**
   *
   * not user if this is needed
   *
   */
  async deleteOrder(id: string) {
    const orderToDelete = await this.ordersRepository.findOneBy({ id });

    if (!orderToDelete) {
      throw new NotFoundException('order not found');
    }

    try {
      await this.ordersRepository.delete(orderToDelete.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `order with id: ${orderToDelete.id} deleted`,
    };
  }

  async createOrderItem(createOrderItemDto: CreateOrderItemDto) {
    const { product_id, order_id, ...rest } = createOrderItemDto;

    const product = await this.productsRepository.findOneBy({ id: product_id });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    const order = await this.ordersRepository.findOneBy({ id: order_id });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    const orderItem = await this.orderItemsRepository.create({
      product,
      order,
      ...rest,
    });

    try {
      await this.orderItemsRepository.save(orderItem);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.CREATED,
      message: 'order item created',
      data: orderItem,
    };
  }

  async findAllOrderItems() {
    const orderItems = await this.orderItemsRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: orderItems,
    };
  }

  async findOrderItemsById(id: number) {
    const orderItem = await this.orderItemsRepository.findOneBy({ id });
    if (!orderItem) {
      throw new NotFoundException('order item not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order item found',
      data: orderItem,
    };
  }

  async findOrderItemsByOrderId(order_id: string) {
    const order = await this.ordersRepository.findOneBy({ id: order_id });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    const orderItems = await this.orderItemsRepository.findBy({
      order: { id: order_id },
    });
    if (!orderItems) {
      throw new NotFoundException('order item not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order items found',
      data: orderItems,
    };
  }

  async findOrderItemsByProductId(product_id: string) {
    const product = await this.productsRepository.findOneBy({ id: product_id });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    const orderItems = await this.orderItemsRepository.findBy({
      product: { id: product_id },
    });
    if (!orderItems) {
      throw new NotFoundException('order item not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order items found',
      data: orderItems,
    };
  }

  // async updateOrderItem(
  //   order_id: string,
  //   product_id: string,
  //   updateOrderItem: UpdateOrderItemDto,
  // ) {
  //   const product = await this.productsRepository.findOneBy({ id: product_id });
  //   if (!product) {
  //     throw new NotFoundException('product not found');
  //   }

  //   const order = await this.ordersRepository.findOneBy({ id: order_id });
  //   if (!order) {
  //     throw new NotFoundException('order not found');
  //   }

  //   const orderItemToUpdate = await this.orderItemsRepository.findOneBy({
  //     product: product,
  //     order: order,
  //   });
  //   if (!orderItemToUpdate) {
  //     throw new NotFoundException('order item not found');
  //   }

  //   const { qty } = updateOrderItem;

  //   try {
  //     await this.orderItemsRepository.update(orderItemToUpdate.id, {
  //       ...(qty && { qty }),
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException();
  //   }

  //   return {
  //     status: HttpStatus.OK,
  //     message: `order item with id: ${orderItemToUpdate.id} for order: ${order.id} updated`,
  //     data: orderItemToUpdate,
  //   };
  // }

  async updateOrderItem(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    const orderItemToUpdate = await this.orderItemsRepository.findOneBy({ id });
    if (!orderItemToUpdate) {
      throw new NotFoundException('order item not found');
    }

    const { qty } = updateOrderItemDto;

    try {
      await this.orderItemsRepository.update(orderItemToUpdate.id, {
        ...(qty && { qty }),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `order item with id: ${orderItemToUpdate.id} updated`,
      data: orderItemToUpdate,
    };
  }

  async deleteOrderItem(id: number) {
    const orderItemToDelete = await this.orderItemsRepository.findOneBy({ id });
    if (!orderItemToDelete) {
      throw new NotFoundException('order item not found');
    }

    try {
      await this.orderItemsRepository.delete(orderItemToDelete);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `order item with id: ${orderItemToDelete} deleted`,
    };
  }
}
