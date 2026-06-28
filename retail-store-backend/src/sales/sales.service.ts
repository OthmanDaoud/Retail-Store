import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { StockGateway } from '../stock/stock.gateway';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { SaleItem } from './sale-item.entity';
import { Sale } from './sale.entity';

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly stockGateway: StockGateway,
  ) {}

  async create(dto: CreateSaleDto, cashierId?: number): Promise<Sale> {
    const stockUpdates: { productId: number; newStock: number }[] = [];

    const sale = await this.dataSource.transaction(async (manager) => {
      const items: SaleItem[] = [];
      let total = 0;

      for (const { productId, quantity } of dto.items) {
        const product = await this.getAvailableProduct(
          manager,
          productId,
          quantity,
        );

        product.stockQuantity -= quantity;
        await manager.save(product);

        stockUpdates.push({
          productId: product.id,
          newStock: product.stockQuantity,
        });

        const lineTotal = product.price * quantity;
        total += lineTotal;

        items.push(
          manager.create(SaleItem, {
            productId: product.id,
            quantity,
            unitPrice: product.price,
            lineTotal,
          }),
        );
      }

      const sale = await manager.save(
        manager.create(Sale, { total, cashierId }),
      );

      sale.items = await manager.save(
        items.map((item) => {
          item.saleId = sale.id;
          return item;
        }),
      );

      return sale;
    });

    stockUpdates.forEach(({ productId, newStock }) =>
      this.stockGateway.notifyStockUpdate(productId, newStock),
    );

    return sale;
  }

  async findAll(query: QuerySalesDto) {
    const { page, limit } = query;

    const [items, total] = await this.salesRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
    });

    if (!sale) {
      throw new NotFoundException(`Sale ${id} not found`);
    }

    return sale;
  }

  private async getAvailableProduct(
    manager: DataSource['manager'],
    productId: number,
    quantity: number,
  ): Promise<Product> {
    const product = await manager.findOne(Product, {
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${product.name}" (available: ${product.stockQuantity})`,
      );
    }

    return product;
  }
}