import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SelectQueryBuilder } from 'typeorm';
import { Category } from '../categories/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

type QueryBuilderMock = {
  leftJoinAndSelect: jest.Mock<(...args: unknown[]) => QueryBuilderMock>;
  where: jest.Mock<(...args: unknown[]) => QueryBuilderMock>;
  andWhere: jest.Mock<(...args: unknown[]) => QueryBuilderMock>;
  orderBy: jest.Mock<(...args: unknown[]) => QueryBuilderMock>;
  skip: jest.Mock<(...args: unknown[]) => QueryBuilderMock>;
  take: jest.Mock<(...args: unknown[]) => QueryBuilderMock>;
  getOne: jest.Mock<() => Promise<Product | null>>;
  getManyAndCount: jest.Mock<() => Promise<[Product[], number]>>;
};

const mockCategory: Category = {
  id: 1,
  name: 'Beverages',
  isActive: true,
  createdAt: new Date(),
  modifiedAt: new Date(),
  products: [],
};

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  price: 10.5,
  stockQuantity: 20,
  categoryId: 1,
  category: mockCategory,
  isActive: true,
  createdAt: new Date(),
  modifiedAt: new Date(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  let queryBuilder: QueryBuilderMock;

  const productsRepository = {
    createQueryBuilder: jest.fn<() => SelectQueryBuilder<Product>>(),
    create: jest.fn<(input: Partial<Product>) => Product>(),
    save: jest.fn<(product: Product) => Promise<Product>>(),
  };

  const categoriesService = {
    findOne: jest.fn<(id: number) => Promise<Category>>(),
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn(() => queryBuilder),
      where: jest.fn(() => queryBuilder),
      andWhere: jest.fn(() => queryBuilder),
      orderBy: jest.fn(() => queryBuilder),
      skip: jest.fn(() => queryBuilder),
      take: jest.fn(() => queryBuilder),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
    };
    productsRepository.createQueryBuilder.mockReturnValue(
      queryBuilder as unknown as SelectQueryBuilder<Product>,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productsRepository },
        { provide: CategoriesService, useValue: categoriesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('returns paginated products with safe sorting', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[mockProduct], 1]);
    const query: QueryProductsDto = {
      page: 2,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'ASC',
    };

    const result = await service.findAll(query);

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('product.name', 'ASC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      items: [mockProduct],
      total: 1,
      page: 2,
      limit: 10,
      totalPages: 1,
    });
  });

  it('applies search, price, and category filters', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    const query: QueryProductsDto = {
      search: 'milk',
      minPrice: 5,
      maxPrice: 20,
      categoryId: 1,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    await service.findAll(query);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'MATCH(product.name) AGAINST (:search IN BOOLEAN MODE)',
      { search: 'milk*' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'product.price >= :minPrice',
      { minPrice: 5 },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'product.price <= :maxPrice',
      { maxPrice: 20 },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'product.categoryId = :categoryId',
      { categoryId: 1 },
    );
  });

  it('creates a product only after confirming the category exists', async () => {
    categoriesService.findOne.mockResolvedValue(mockCategory);
    productsRepository.create.mockReturnValue(mockProduct);
    productsRepository.save.mockResolvedValue(mockProduct);

    const result = await service.create(
      { name: 'Test Product', price: 10.5, stockQuantity: 20, categoryId: 1 },
      42,
    );

    expect(categoriesService.findOne).toHaveBeenCalledWith(1);
    expect(productsRepository.create).toHaveBeenCalledWith({
      name: 'Test Product',
      price: 10.5,
      stockQuantity: 20,
      categoryId: 1,
      createdBy: 42,
      modifiedBy: 42,
    });
    expect(productsRepository.save).toHaveBeenCalledWith(mockProduct);
    expect(result).toEqual(mockProduct);
  });

  it('soft-deletes a product instead of removing the row', async () => {
    const product = { ...mockProduct };
    queryBuilder.getOne.mockResolvedValue(product);
    productsRepository.save.mockResolvedValue({ ...product, isActive: false });

    await service.remove(1, 42);

    expect(product.isActive).toBe(false);
    expect(product.modifiedBy).toBe(42);
    expect(productsRepository.save).toHaveBeenCalledWith(product);
  });
});
