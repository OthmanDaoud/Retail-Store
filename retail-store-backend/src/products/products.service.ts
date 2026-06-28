import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(query: QueryProductsDto) {
    const { search, minPrice, maxPrice, categoryId, page, limit, sortBy, sortOrder } =
      query;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('category.isActive = :categoryIsActive', {
        categoryIsActive: true,
      });

    if (search) {
      qb.andWhere(
        'MATCH(product.name) AGAINST (:search IN BOOLEAN MODE)',
        { search: `${search}*` },
      );
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (categoryId !== undefined) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    qb.orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .andWhere('category.isActive = :categoryIsActive', {
        categoryIsActive: true,
      })
      .getOne();
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto, userId: number): Promise<Product> {
    await this.categoriesService.findOne(dto.categoryId);
    const product = this.productsRepository.create({
      ...dto,
      createdBy: userId,
      modifiedBy: userId,
    });
    return this.productsRepository.save(product);
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.categoryId !== undefined) {
      await this.categoriesService.findOne(dto.categoryId);
    }
    Object.assign(product, dto, { modifiedBy: userId });
    return this.productsRepository.save(product);
  }

  async remove(id: number, userId: number): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    product.modifiedBy = userId;
    await this.productsRepository.save(product);
  }
}
