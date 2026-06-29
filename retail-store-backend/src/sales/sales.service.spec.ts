import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DataSource, EntityManager } from 'typeorm';
import { Product } from '../products/product.entity';
import { StockGateway } from '../stock/stock.gateway';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleItem } from './sale-item.entity';
import { Sale } from './sale.entity';
import { SalesService } from './sales.service';

type ManagerMock = {
  findOne: jest.Mock<(...args: unknown[]) => Promise<Product | null>>;
  save: jest.Mock<(entity: unknown) => Promise<unknown>>;
  create: jest.Mock<
    (_entity: unknown, data: Record<string, unknown>) => Record<string, unknown>
  >;
};

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 10.0,
  stockQuantity: 5,
  isActive: true,
} as Product;

describe('SalesService', () => {
  let service: SalesService;

  const manager: ManagerMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const dataSource = {
    transaction: jest.fn<
      (cb: (manager: EntityManager) => Promise<Sale>) => Promise<Sale>
    >((cb) => cb(manager as unknown as EntityManager)),
  };

  const salesRepository = {
    findAndCount: jest.fn<() => Promise<[Sale[], number]>>(),
    findOne: jest.fn<(...args: unknown[]) => Promise<Sale | null>>(),
  };

  const stockGateway = {
    notifyStockUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(Sale), useValue: salesRepository },
        { provide: StockGateway, useValue: stockGateway },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    jest.clearAllMocks();
  });

  it('creates a sale, calculates total, and decreases stock', async () => {
    const dto: CreateSaleDto = { items: [{ productId: 1, quantity: 2 }] };
    const product = { ...mockProduct, stockQuantity: 5 };
    const savedSale = {
      id: 10,
      total: 20,
      cashierId: 7,
      items: [],
      createdAt: new Date(),
    } as Sale;
    const savedItems = [
      {
        id: 100,
        saleId: 10,
        productId: 1,
        quantity: 2,
        unitPrice: 10,
        lineTotal: 20,
      },
    ] as SaleItem[];

    manager.findOne.mockResolvedValue(product);
    manager.create.mockImplementation((_entity, data) => ({ ...data }));
    manager.save.mockImplementation((entity: unknown) => {
      if (Array.isArray(entity)) return Promise.resolve(savedItems);
      if (typeof entity === 'object' && entity !== null && 'total' in entity) {
        return Promise.resolve(savedSale);
      }
      return Promise.resolve(entity);
    });

    const result = await service.create(dto, 7);

    expect(product.stockQuantity).toBe(3);
    expect(manager.create).toHaveBeenCalledWith(SaleItem, {
      productId: 1,
      quantity: 2,
      unitPrice: 10,
      lineTotal: 20,
    });
    expect(manager.create).toHaveBeenCalledWith(Sale, {
      total: 20,
      cashierId: 7,
    });
    expect(result.items).toEqual(savedItems);
    expect(stockGateway.notifyStockUpdate).toHaveBeenCalledWith(1, 3);
  });

  it('rejects a sale when the product does not exist', async () => {
    const dto: CreateSaleDto = { items: [{ productId: 999, quantity: 1 }] };
    manager.findOne.mockResolvedValue(null);

    await expect(service.create(dto, 7)).rejects.toThrow(NotFoundException);
    expect(stockGateway.notifyStockUpdate).not.toHaveBeenCalled();
  });

  it('rejects a sale when stock is insufficient', async () => {
    const dto: CreateSaleDto = { items: [{ productId: 1, quantity: 6 }] };
    manager.findOne.mockResolvedValue({ ...mockProduct, stockQuantity: 5 });

    await expect(service.create(dto, 7)).rejects.toThrow(BadRequestException);
    expect(stockGateway.notifyStockUpdate).not.toHaveBeenCalled();
  });

  it('returns an existing sale by id', async () => {
    const sale = { id: 1, total: 10, items: [], createdAt: new Date() } as Sale;
    salesRepository.findOne.mockResolvedValue(sale);

    await expect(service.findOne(1)).resolves.toEqual(sale);
  });

  it('throws when a sale is not found', async () => {
    salesRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
