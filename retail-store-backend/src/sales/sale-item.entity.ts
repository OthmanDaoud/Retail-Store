import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';
import { Sale } from './sale.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale!: Sale;

  @Column()
  saleId!: number;

  @ManyToOne(() => Product, { eager: true, nullable: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column()
  productId!: number;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: DecimalTransformer })
  unitPrice!: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: DecimalTransformer })
  lineTotal!: number;
}
