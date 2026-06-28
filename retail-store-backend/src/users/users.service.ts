import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /** Includes the (normally hidden) passwordHash for credential checks. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();
  }

  count(): Promise<number> {
    return this.usersRepository.count({ where: { isActive: true } });
  }

  create(user: Partial<User>): Promise<User> {
    return this.usersRepository.save(this.usersRepository.create(user));
  }
}
