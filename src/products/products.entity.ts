import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.id)
  @JoinColumn({ name: 'category_id' })
  category: Category;

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
}
