import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payments.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async createPayment(paymentData: Partial<Payment>) {
    const payment = this.paymentsRepository.create(paymentData);
    try {
      return await this.paymentsRepository.save(payment);
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create payment');
    }
  }

  async findAllPayments() {
    return await this.paymentsRepository.find({
      relations: ['order'],
    });
  }

  async findPaymentByOrderId(orderId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { order: { id: orderId } },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return payment;
  }
}
