import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { SaleItem } from './sales/sale-item.entity';
import { Sale } from './sales/sale.entity';
import { User } from './users/user.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Category, Product, Sale, SaleItem],
  migrations: ['src/migrations/*.ts'],
});
