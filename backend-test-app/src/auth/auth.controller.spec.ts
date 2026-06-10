import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  it('login — должен вызвать authService.login и вернуть токены', async () => {
    const mockTokens = {
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      expiresIn: '1h',
    };
  
    // говорим моку сервиса что вернуть
    jest.spyOn(authService, 'login').mockResolvedValue(mockTokens);
  
    const result = await controller.login({ username: 'admin', password: 'admin' });
  
    // сервис был вызван с правильными данными
    expect(authService.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin' });
    // контроллер вернул то что сервис отдал
    expect(result).toEqual(mockTokens);
  });
  
  it('refresh — должен вызвать authService.refreshTokens и вернуть новые токены', async () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: '1h',
    };
  
    jest.spyOn(authService, 'refreshTokens').mockResolvedValue(mockTokens);
  
    const result = await controller.refresh({ refreshToken: 'valid-refresh-token' });
  
    // проверяем что сервис вызван с правильным токеном
    expect(authService.refreshTokens).toHaveBeenCalledWith('valid-refresh-token');
    expect(result).toEqual(mockTokens);
  });
});