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
import { Category } from './category.entity';
import { OrderItem } from 'src/orders/order-item.entity';
import { CartItem } from 'src/carts/cart-item.entity';

@Entity()
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  image: string;

  @Column()
  stock: number;

  @Column({ default: 0 })
  sold: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn()
  category: Relation<Category>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product, {
    cascade: true,
    orphanedRowAction: 'soft-delete',
  })
  orderItems: Relation<OrderItem[]>;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product, {
    cascade: true,
    orphanedRowAction: 'soft-delete',
  })
  cartItems: Relation<CartItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
