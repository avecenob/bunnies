import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  status: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn()
  user: Relation<User>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: Relation<OrderItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
