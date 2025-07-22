import { Order } from 'src/orders/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryColumn()
  transactionId: string;

  @Column()
  transactionStatus: string;

  @Column()
  transactionTime: string;

  @Column()
  paymentType: string;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Relation<Order>;

  @Column()
  amount: number;

  @Column({ default: null })
  bank: string;

  @Column({ default: null })
  approvalCode: string;
}
