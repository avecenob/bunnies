import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
// import { config } from './config';
// import { User } from './users/user.entity.js';
// import { Product } from './products/products.entity.js';
// import { Category } from './products/category.entity.js';
// import { Order } from './orders/orders.entity.js';
// import { OrderItem } from './orders/order-items.entity.js';
// import { Cart } from './carts/carts.entity.js';
// import { CartItem } from './carts/cart-items.entity.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  // migrations: ['./src/migrations/*.ts'],
  // entities: [User, Product, Category, Order, OrderItem, Cart, CartItem],
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
});
