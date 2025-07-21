import { Injectable } from '@nestjs/common';
import { OrdersService } from 'src/orders/orders.service';
import { UsersService } from 'src/users/users.service';
// import Midtrans from 'midtrans-client';

@Injectable()
export class PaymentsService {
  // private snap = new Midtrans.snap({
  //   isProduction: false,
  //   serverKey: 'SB-Mid-server-bReOJkzNRdjtb4W7GoMZmAGb',
  //   clientKey: 'SB-Mid-client-GDolMZNgGeeGe4BY',
  // });
  // constructor(
  //   private ordersService: OrdersService,
  //   private usersService: UsersService,
}

/**
 * TODO
 *
 * Integrate with Midtrans
 *
 */
