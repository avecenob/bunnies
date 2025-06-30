import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-items.entity';

@Entity()
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((order: Order) => order.user)
  user_id: string;

  @OneToMany(() => OrderItem, (order_item) => order_item.order)
  order_items: OrderItem[];
}
