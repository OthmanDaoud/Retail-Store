import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { StockModule } from '../stock/stock.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product]), StockModule],
  controllers: [SalesController, ReportsController],
  providers: [SalesService, ReportsService],
})
export class SalesModule {}
