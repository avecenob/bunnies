import { DataSource } from 'typeorm';
import { config } from './config';
import { User } from './users/user.entity';
import { Product } from './products/products.entity';
import { Category } from './products/category.entity';
import { Order } from './orders/orders.entity';
import { OrderItem } from './orders/order-items.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  ...config.db,
  synchronize: true,
  // logging: true,
  entities: [User, Product, Category, Order, OrderItem],
});
