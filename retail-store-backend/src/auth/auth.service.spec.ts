import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const bcryptCompare = bcrypt.compare as jest.MockedFunction<
  (data: string | Buffer, encrypted: string) => Promise<boolean>
>;

type JwtSignAsync = (payload: {
  sub: number;
  email: string;
  role: Role;
}) => Promise<string>;

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmailWithPassword: jest.fn<UsersService['findByEmailWithPassword']>(),
  };

  const jwtService = {
    signAsync: jest.fn<JwtSignAsync>(),
  };

  const user = {
    id: 1,
    name: 'Store Manager',
    email: 'manager@retail.com',
    passwordHash: 'hashed-password',
    role: Role.Manager,
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('returns a token and public user data for valid credentials', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(user);
    bcryptCompare.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('signed-token');

    const result = await service.login({
      email: 'manager@retail.com',
      password: 'password123',
    });

    expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(
      'manager@retail.com',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  it('rejects login when the user is missing', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@retail.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects login when the password is wrong', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(user);
    bcryptCompare.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'manager@retail.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
