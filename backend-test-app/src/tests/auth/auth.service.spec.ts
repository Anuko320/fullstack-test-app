jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true), // всегда возвращает true
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminUser } from '../../auth/entities/admin-user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule; 

  beforeEach(async () => {
    module = await Test.createTestingModule({ 
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('должен быть определён', () => { //тест на существование сервиса
    expect(service).toBeDefined();
  });

  it('должен выбросить ошибку если пользователь не найден', async () => { //тест на логин
    const adminRepo = module.get(getRepositoryToken(AdminUser));
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue(null);

    await expect(
      service.login({ username: 'hacker', password: 'admin' })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('должен выбросить ошибку если пароль неверный', async () => { //тест на пароль
    const adminRepo = module.get(getRepositoryToken(AdminUser));
  
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'hashed_real_password',
    });
  
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockResolvedValue(false);
  
    await expect(
      service.login({ username: 'admin', password: 'wrongpassword' })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('должен вернуть токены при правильных кредах', async () => { //тест на токены expiresIn и mockReturnValueOnce
    const adminRepo = module.get(getRepositoryToken(AdminUser));
    const jwtService = module.get(JwtService);
    const configService = module.get(ConfigService);
  
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue({
      id: 1,
      username: 'admin',
      password: 'any-hash-doesnt-matter', 
    });

    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
  
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_EXPIRES_IN') return '1h';
      return null;
    });
  
    jest.spyOn(jwtService, 'sign')
      .mockReturnValueOnce('fake-access-token')
      .mockReturnValueOnce('fake-refresh-token');
  
    const result = await service.login({ username: 'admin', password: 'admin' });
  
    expect(result.accessToken).toBe('fake-access-token');
    expect(result.refreshToken).toBe('fake-refresh-token');
    expect(result.expiresIn).toBe('1h');
  });
});