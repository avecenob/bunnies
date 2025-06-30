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
import { UpdateOrderDto } from 'src/common/dto/orders/update-order.dto';
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

  @Get('user/:user_id')
  findOrderByUserId(@Param() params: any) {
    return this.ordersService.findOrdersByUserId(params.user_id);
  }

  @Post('create')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Put(':id')
  updateOrder(@Param() params: any, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(params.id, updateOrderDto);
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

  @Get('order/:order_id')
  findOrderItemByOrderId(@Param() params: any) {
    return this.ordersService.findOrderItemsByOrderId(params.order_id);
  }

  @Get('product/:product_id')
  findOrderItemByProductId(@Param() params: any) {
    return this.ordersService.findOrderItemsByOrderId(params.product_id);
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
