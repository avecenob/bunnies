import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from 'src/common/dto/orders/create-order.dto';
import { UpdateOrderStatusDto } from 'src/common/dto/orders/update-order-status.dto';
import { CreateOrderItemDto } from 'src/common/dto/orders/create-order-item.dto';
import { UpdateOrderItemDto } from 'src/common/dto/orders/update-order-item.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  findOrderById(@Param() params: any) {
    return this.ordersService.findOrderById(params.id);
  }

  @Get('user/:userId')
  findOrderByUserId(@Param() params: any) {
    return this.ordersService.findOrdersByUserId(params.userId);
  }

  @Post('create')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Put('status/:id')
  updateOrder(
    @Param() params: any,
    @Body() updateOrderDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(params.id, updateOrderDto);
  }

  @Delete(':id')
  deleteOrder(@Param() params: any) {
    return this.ordersService.deleteOrder(params.id);
  }
}

@Controller('order-items')
export class OrderItemsController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAllOrderItems();
  }

  @Get(':id')
  findOrderItemById(@Param() params: any) {
    return this.ordersService.findOrderItemsById(params.id);
  }

  @Get('order/:orderId')
  findOrderItemByOrderId(@Param() params: any) {
    return this.ordersService.findOrderItemsByOrderId(params.orderId);
  }

  @Get('product/:productId')
  findOrderItemByProductId(@Param() params: any) {
    return this.ordersService.findOrderItemsByOrderId(params.productId);
  }

  @Post('create')
  createOrderItem(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.ordersService.createOrderItem(createOrderItemDto);
  }

  @Put(':id')
  updateOrderItem(
    @Param() params: any,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateOrderItem(params.id, updateOrderItemDto);
  }

  @Delete(':id')
  deleteOrderItem(@Param() params: any) {
    return this.ordersService.deleteOrderItem(params.id);
  }
}
