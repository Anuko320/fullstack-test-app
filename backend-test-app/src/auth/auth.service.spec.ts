jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true), // всегда возвращает true
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminUser } from './entities/admin-user.entity';
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

  it('refreshTokens — должен вернуть новые токены при валидном refreshToken', async () => {
    const adminRepo = module.get(getRepositoryToken(AdminUser));
    const jwtService = module.get(JwtService);
    const configService = module.get(ConfigService);
  
    // verify успешно расшифровал токен и вернул payload
    jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 1, username: 'admin' } as any);
  
    // findOne нашёл юзера по id из payload
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue({ id: 1, username: 'admin' } as any);
  
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_EXPIRES_IN') return '1h';
      return null;
    });
  
    jest.spyOn(jwtService, 'sign')
      .mockReturnValueOnce('new-access-token')
      .mockReturnValueOnce('new-refresh-token');
  
    const result = await service.refreshTokens('valid-refresh-token');
  
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
  });
  
  it('refreshTokens — должен выбросить ошибку если токен невалидный', async () => {
    const jwtService = module.get(JwtService);
  
    // verify выбрасывает ошибку — токен невалидный или истёк
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('invalid token');
    });
  
    await expect(
      service.refreshTokens('invalid-token')
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refreshTokens — должен выбросить ошибку если юзер не найден', async () => {
    const adminRepo = module.get(getRepositoryToken(AdminUser));
    const jwtService = module.get(JwtService);
  
    // токен валидный
    jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 1, username: 'admin' } as any);
  
    // но юзер в БД не найден
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue(null);
  
    await expect(
      service.refreshTokens('valid-token')
    ).rejects.toThrow(UnauthorizedException);
  });

  it('seedAdminUser — не должен создавать админа если он уже существует', async () => {
    const adminRepo = module.get(getRepositoryToken(AdminUser));
  
    // админ уже есть в БД
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue({ id: 1, username: 'admin' } as any);
    const createSpy = jest.spyOn(adminRepo, 'create');
  
    await service.onModuleInit();
  
    // create не должен был вызваться
    expect(createSpy).not.toHaveBeenCalled();
  });
  
  it('seedAdminUser — должен создать админа если его нет', async () => {
    const adminRepo = module.get(getRepositoryToken(AdminUser));
  
    // админа нет в БД
    jest.spyOn(adminRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(adminRepo, 'create').mockReturnValue({ username: 'admin', password: 'hashed' } as any);
    jest.spyOn(adminRepo, 'save').mockResolvedValue({ id: 1, username: 'admin' } as any);
  
    await service.onModuleInit();
  
    // create и save должны были вызваться
    expect(adminRepo.create).toHaveBeenCalled();
    expect(adminRepo.save).toHaveBeenCalled();
  });
});