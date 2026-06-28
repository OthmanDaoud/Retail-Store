import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Product } from '../products/product.entity';
import { StockGateway } from '../stock/stock.gateway';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleItem } from './sale-item.entity';
import { Sale } from './sale.entity';
import { SalesService } from './sales.service';

const mockProduct: Partial<Product> = {
  id: 1,
  name: 'Test Product',
  price: 10.0,
  stockQuantity: 5,
  isActive: true,
};

const mockSale = { id: 1, total: 10.0, items: [] } as Sale;

describe('SalesService', () => {
  let service: SalesService;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  } as unknown as EntityManager;

  const mockDataSource = {
    transaction: jest.fn((cb: (manager: EntityManager) => Promise<Sale>) => cb(mockManager)),
  };

  const mockSalesRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockStockGateway = {
    notifyStockUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(Sale), useValue: mockSalesRepo },
        { provide: StockGateway, useValue: mockStockGateway },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateSaleDto = { items: [{ productId: 1, quantity: 2 }] };

    it('decrements stock and saves the sale', async () => {
      const product = { ...mockProduct, stockQuantity: 5 };
      (mockManager.findOne as jest.Mock).mockResolvedValue(product);
      (mockManager.create as jest.Mock).mockImplementation((_entity, data) => data);
      (mockManager.save as jest.Mock).mockImplementation((entity) => Promise.resolve(entity));

      await service.create(dto, 1);

      expect(product.stockQuantity).toBe(3);
      expect(mockStockGateway.notifyStockUpdate).toHaveBeenCalledWith(1, 3);
    });

    it('throws NotFoundException when product does not exist', async () => {
      (mockManager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      const product = { ...mockProduct, stockQuantity: 1 };
      (mockManager.findOne as jest.Mock).mockResolvedValue(product);

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });

    it('does not emit stock update when transaction fails', async () => {
      (mockManager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto, 1)).rejects.toThrow();
      expect(mockStockGateway.notifyStockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns sale when found', async () => {
      mockSalesRepo.findOne.mockResolvedValue(mockSale);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSale);
    });

    it('throws NotFoundException when sale does not exist', async () => {
      mockSalesRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
