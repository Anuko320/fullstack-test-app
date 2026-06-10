import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        // JwtAuthGuard требует эти два сервиса
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  it('findAll — должен вызвать usersService.findAll и вернуть список', async () => {
    const mockResponse = {
      data: [{ id: 1, name: 'Test User', email: 'test@example.com' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
  
    jest.spyOn(usersService, 'findAll').mockResolvedValue(mockResponse as any);
  
    const result = await controller.findAll({ page: 1, limit: 10, order: 'ASC', sortBy: 'id' });
  
    expect(usersService.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });
  
  it('findOne — должен вызвать usersService.findOne с правильным id', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
  
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as any);
  
    const result = await controller.findOne(1);
  
    expect(usersService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });
  
  it('create — должен вызвать usersService.create и вернуть нового юзера', async () => {
    const dto = { name: 'New User', email: 'new@example.com' };
    const mockUser = { id: 1, ...dto };
  
    jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);
  
    const result = await controller.create(dto);
  
    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockUser);
  });
  
  it('update — должен вызвать usersService.update с правильными данными', async () => {
    const mockUser = { id: 1, name: 'Updated Name', email: 'test@example.com' };
  
    jest.spyOn(usersService, 'update').mockResolvedValue(mockUser as any);
  
    const result = await controller.update(1, { name: 'Updated Name' });
  
    expect(usersService.update).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    expect(result).toEqual(mockUser);
  });
  
  it('remove — должен вызвать usersService.remove с правильным id', async () => {
    jest.spyOn(usersService, 'remove').mockResolvedValue(undefined);
  
    await controller.remove(1);
  
    expect(usersService.remove).toHaveBeenCalledWith(1);
  });
});