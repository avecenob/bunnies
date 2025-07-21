import { Order } from 'src/orders/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'delivery' | 'self pickup';

  @Column()
  address: string;

  @Column({ default: 'PROCESSED' })
  status: string;

  @OneToOne(() => Order, (order) => order.delivery)
  @JoinColumn()
  order: Relation<Order>;
}
