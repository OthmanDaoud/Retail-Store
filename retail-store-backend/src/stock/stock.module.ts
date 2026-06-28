import { Module } from '@nestjs/common';
import { StockGateway } from './stock.gateway';

@Module({
  providers: [StockGateway],
  exports: [StockGateway],
})
export class StockModule {}
