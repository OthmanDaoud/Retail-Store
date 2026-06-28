import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: DecimalTransformer })
  total!: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'cashierId' })
  cashier?: User;

  @Column({ nullable: true })
  cashierId?: number;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true, eager: true })
  items!: SaleItem[];

  @CreateDateColumn()
  createdAt!: Date;
}
