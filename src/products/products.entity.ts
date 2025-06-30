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
import { Category } from './category.entity';
import { OrderItem } from 'src/orders/order-items.entity';

@Entity('products')
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @RelationId((product: Product) => product.category)
  category_id: string;

  @OneToMany(() => OrderItem, (order_item) => order_item.product)
  order_items: OrderItem[];
}
