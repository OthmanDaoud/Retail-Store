import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Role } from '../common/enums/role.enum';
import { Product } from '../products/product.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedUsers();
    await this.seedCatalog();
  }

  private async seedUsers(): Promise<void> {
    if ((await this.usersService.count()) > 0) {
      return;
    }
    const passwordHash = await bcrypt.hash('password123', 10);
    await this.usersService.create({
      name: 'Store Manager',
      email: 'manager@retail.com',
      passwordHash,
      role: Role.Manager,
    });
    await this.usersService.create({
      name: 'Store Employee',
      email: 'employee@retail.com',
      passwordHash,
      role: Role.Employee,
    });
    this.logger.log('Seeded default users (manager@retail.com / employee@retail.com)');
  }

  private async seedCatalog(): Promise<void> {
    if ((await this.categoriesRepository.count({ where: { isActive: true } })) > 0) {
      return;
    }

    const categoryNames = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Household'];
    const categories = await this.categoriesRepository.save(
      categoryNames.map((name) => this.categoriesRepository.create({ name })),
    );

    const products: Partial<Product>[] = [];
    categories.forEach((category, index) => {
      for (let i = 1; i <= 8; i++) {
        products.push({
          name: `${category.name} Item ${i}`,
          price: Number((5 + index * 2 + i * 1.5).toFixed(2)),
          stockQuantity: 5 + ((i * 7) % 40),
          categoryId: category.id,
        });
      }
    });
    await this.productsRepository.save(products);
    this.logger.log(`Seeded ${categories.length} categories and ${products.length} products`);
  }
}
