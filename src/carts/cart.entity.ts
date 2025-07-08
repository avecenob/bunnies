import { User } from 'src/users/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user: Relation<User>;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: Relation<CartItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
