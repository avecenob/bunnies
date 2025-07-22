import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MidtransService {
  private serverKey = process.env.MIDTRANS_SERVER_KEY;
  private snapUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  private authHeader =
    'Basic ' + Buffer.from(this.serverKey + ':').toString('base64');

  constructor() {}

  async createTransaction(order: {
    orderId: string;
    grossAmount: number;
    customerName: string;
    customerEmail: string;
  }) {
    const payload = {
      transaction_details: {
        order_id: order.orderId,
        gross_amount: order.grossAmount,
      },
      customer_details: {
        fist_name: order.customerName,
        email: order.customerEmail,
      },
    };

    const response = await fetch(this.snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async getTransactionStatus(orderId: string) {
    const response = await fetch(
      `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
      {
        headers: { Authorization: this.authHeader },
      },
    );

    return await response.json();
  }
}
