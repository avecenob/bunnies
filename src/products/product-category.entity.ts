import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './products.entity';
import { Category } from './category.entity';

@Entity()
export class ProductCategory {
  @PrimaryColumn()
  @OneToOne(() => Product)
  product: Product;

  @PrimaryColumn()
  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
