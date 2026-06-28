import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { SaleItem } from './sale-item.entity';
import { Sale } from './sale.entity';

const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async summary() {
    const salesStats = await this.salesRepository
      .createQueryBuilder('sale')
      .select('COUNT(sale.id)', 'salesCount')
      .addSelect('COALESCE(SUM(sale.total), 0)', 'totalRevenue')
      .getRawOne<{ salesCount: string; totalRevenue: string }>();

    const totalProducts = await this.productsRepository.count({
      where: { isActive: true },
    });

    const lowStockProducts = await this.productsRepository.find({
      where: {
        isActive: true,
        stockQuantity: LessThanOrEqual(LOW_STOCK_THRESHOLD),
      },
      order: { stockQuantity: 'ASC' },
      take: 5,
    });

    const topProducts = await this.saleItemsRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.lineTotal)', 'revenue')
      .where('product.isActive = :productIsActive', { productIsActive: true })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('unitsSold', 'DESC')
      .limit(5)
      .getRawMany<{
        productId: string;
        name: string;
        unitsSold: string;
        revenue: string;
      }>();

    return {
      totalRevenue: Number(salesStats?.totalRevenue ?? 0),
      salesCount: Number(salesStats?.salesCount ?? 0),
      totalProducts,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowStockProducts,
      topProducts: topProducts.map((row) => ({
        productId: Number(row.productId),
        name: row.name,
        unitsSold: Number(row.unitsSold),
        revenue: Number(row.revenue),
      })),
    };
  }
}
