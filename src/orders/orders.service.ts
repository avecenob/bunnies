import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Like, Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { UpdateOrderCompletionDto } from 'src/common/dto/orders/update-order-completion.dto';
import { UpdateOrderItemDto } from 'src/common/dto/orders/update-order-item.dto';
import { ProductsService } from 'src/products/products.service';
import { CreatePendingOrderDto } from 'src/common/dto/orders/create-pending-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
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

  async createPendingOrder(createPendingOrderDto: CreatePendingOrderDto) {
    const { cart, ...rest } = createPendingOrderDto;
    const order = await this.ordersRepository.create({
      ...rest,
      items: cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    });

    return this.ordersRepository.save(order);
  }

  async markOrderAsPaid(orderId: string) {
    await this.ordersRepository.update(orderId, { status: 'PAID' });
  }

  async markOrderAsFailed(orderId: string) {
    await this.ordersRepository.update(orderId, { status: 'FAILED' });
  }

  async findLatestOrderByUser(key: string) {
    return await this.ordersRepository.findOne({
      where: { user: [{ id: key }, { email: key }] },
      order: { createdAt: 'DESC' },
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  async findAllOrders(query?: any) {
    const where: any = {};
    if (query?.id) {
      where.id = Like(`%${query.id}%`);
    }

    const orders = await this.ordersRepository.find({
      where,
      relations: {
        user: true,
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    return orders;
  }

  async findOrderById(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: id },
      relations: {
        user: true,
        items: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return order;
  }

  async findOrdersByUser(key: string) {
    const ordersByUser = await this.ordersRepository.find({
      where: {
        user: [{ id: key }, { email: key }],
      },
      relations: {
        user: true,
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });

    if (!ordersByUser) {
      throw new NotFoundException('order not found');
    }

    return ordersByUser;
  }

  async updateOrderCompletion(
    id: string,
    updateOrderCompletionDto: UpdateOrderCompletionDto,
  ) {
    const orderToUpdate = await this.ordersRepository.findOneBy({ id });

    if (!orderToUpdate) {
      throw new NotFoundException('order not found');
    }
    console.log('orderToUpdate', orderToUpdate);

    const { completion } = updateOrderCompletionDto;

    try {
      const updatedOrder = await this.ordersRepository.update(
        orderToUpdate.id,
        {
          ...(completion && { completion }),
        },
      );
      console.log('updatedOrder', updatedOrder);
      return updatedOrder;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
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
