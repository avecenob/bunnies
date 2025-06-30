import { Product } from 'src/products/products.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './orders.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  qty: number;

  @CreateDateColumn()
  created_at: Timestamp;

  @UpdateDateColumn()
  updated_at: Timestamp;

  @ManyToOne(() => Product, (product) => product.order_items)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @RelationId((orderItem: OrderItem) => orderItem.product)
  product_id: string;

  @ManyToOne(() => Order, (order) => order.order_items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @RelationId((orderItem: OrderItem) => orderItem.order)
  order_id: string;
}
