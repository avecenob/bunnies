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
  stock: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Relation<Category>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: Relation<OrderItem[]>;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: Relation<CartItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
