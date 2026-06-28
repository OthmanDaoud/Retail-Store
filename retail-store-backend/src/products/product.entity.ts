import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('products')
@Index(['price'])
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ fulltext: true })
  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: DecimalTransformer })
  price!: number;

  @Column('int', { default: 0 })
  stockQuantity!: number;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column()
  categoryId!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  createdBy?: number;

  @UpdateDateColumn()
  modifiedAt!: Date;

  @Column({ nullable: true })
  modifiedBy?: number;
}
