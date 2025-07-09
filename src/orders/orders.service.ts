import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from 'src/common/dto/orders/create-order.dto';
import { nanoid } from 'nanoid';
import { UpdateOrderStatusDto } from 'src/common/dto/orders/update-order-status.dto';
import { CreateOrderItemDto } from 'src/common/dto/orders/create-order-item.dto';
import { UpdateOrderItemDto } from 'src/common/dto/orders/update-order-item.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  /**
   *
   * extract method to check order
   *
   * @param key(?) order id
   * @returns {Order} data
   */
  // async validOrder()

  async createOrder(createOrderDto: CreateOrderDto) {
    const { userId, ...rest } = createOrderDto;
    const user = await this.usersService.validUser(userId);

    const id = nanoid(10);
    const order = await this.ordersRepository.create({
      id,
      ...rest,
      user: user,
    });

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
    const orders = await this.ordersRepository.find({ relations: ['user'] });

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: orders,
    };
  }

  async findOrderById(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: id },
      relations: ['user', 'orderItems'],
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order found',
      data: order,
    };
  }

  async findOrdersByUserId(userId: string) {
    const ordersByUser = await this.ordersRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['orderItems'],
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

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const orderToUpdate = await this.ordersRepository.findOneBy({ id });

    if (!orderToUpdate) {
      throw new NotFoundException('order not found');
    }

    const { status } = updateOrderStatusDto;

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
    const { productId, orderId, ...rest } = createOrderItemDto;

    const product = await this.productsService.validProduct(productId);

    const order = await this.ordersRepository.findOneBy({ id: orderId });
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
    const orderItems = await this.orderItemsRepository.find({
      relations: ['order', 'product'],
    });

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: orderItems,
    };
  }

  async findOrderItemsById(id: number) {
    const orderItem = await this.orderItemsRepository.findOne({
      where: { id: id },
      relations: ['order', 'product'],
    });
    if (!orderItem) {
      throw new NotFoundException('order item not found');
    }

    return {
      status: HttpStatus.OK,
      message: 'order item found',
      data: orderItem,
    };
  }

  async findOrderItemsByOrderId(orderId: string) {
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException('order not found');
    }

    const orderItems = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
      relations: ['order', 'product'],
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

  async findOrderItemsByProductId(productId: string) {
    const orderItems = await this.orderItemsRepository.find({
      where: { product: { id: productId } },
      relations: ['order', 'product'],
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

  async updateOrderItem(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    const orderItemToUpdate = await this.orderItemsRepository.findOne({
      where: { id: id },
      relations: ['order', 'product'],
    });
    if (!orderItemToUpdate) {
      throw new NotFoundException('order item not found');
    }

    const { quantity } = updateOrderItemDto;

    try {
      await this.orderItemsRepository.update(orderItemToUpdate.id, {
        ...(quantity && { quantity }),
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
      await this.orderItemsRepository.delete(orderItemToDelete.id);
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
