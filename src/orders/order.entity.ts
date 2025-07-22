import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Delivery } from 'src/deliveries/delivery.entity';
import { Payment } from 'src/payments/payments.entity';

@Entity()
export class Order {
  @PrimaryColumn()
  id: string;

  @Column({ default: 'PENDING' })
  status: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn()
  user: Relation<User>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: Relation<OrderItem[]>;

  @Column()
  total: number;

  @OneToOne(() => Delivery, (delivery) => delivery.order, { cascade: true })
  @JoinColumn()
  delivery: Relation<Delivery>;

  @Column({ default: false })
  completion: boolean;

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Relation<Payment>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
