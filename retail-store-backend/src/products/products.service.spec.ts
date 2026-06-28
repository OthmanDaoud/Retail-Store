import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/category.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

const mockCategory: Category = {
  id: 1,
  name: 'Beverages',
  isActive: true,
  createdAt: new Date(),
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

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  } as unknown as SelectQueryBuilder<Product>;

  const mockRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated products', async () => {
      (mockQueryBuilder.getManyAndCount as jest.Mock).mockResolvedValue([
        [mockProduct],
        1,
      ]);
      const query: QueryProductsDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const result = await service.findAll(query);

      expect(result.items).toEqual([mockProduct]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('applies search filter when provided', async () => {
      (mockQueryBuilder.getManyAndCount as jest.Mock).mockResolvedValue([
        [],
        0,
      ]);
      const query: QueryProductsDto = {
        search: 'test',
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        expect.objectContaining({ search: 'test*' }),
      );
    });
  });

  describe('findOne', () => {
    it('returns product when found', async () => {
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
    });

    it('throws NotFoundException when product does not exist', async () => {
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves a product', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockRepo.create.mockReturnValue(mockProduct);
      mockRepo.save.mockResolvedValue(mockProduct);

      const result = await service.create(
        { name: 'Test Product', price: 10.5, stockQuantity: 20, categoryId: 1 },
        42,
      );

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
      expect(mockRepo.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('soft-deletes by setting isActive to false', async () => {
      const product = { ...mockProduct };
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(product);
      mockRepo.save.mockResolvedValue({ ...product, isActive: false });

      await service.remove(1, 42);

      expect(product.isActive).toBe(false);
      expect(product.modifiedBy).toBe(42);
      expect(mockRepo.save).toHaveBeenCalledWith(product);
    });
  });
});
