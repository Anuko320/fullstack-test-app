import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('должен быть определён', () => { 
    expect(service).toBeDefined();
  });

  it('findOne — должен вернуть пользователя по id', async () => { // юзер был потерян то есть БД нашла юзера - проверяем что сервис вернул его без изменений.
    const userRepo = module.get(getRepositoryToken(User));
  
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
  
    const result = await service.findOne(1);
  
    expect(result).toEqual(mockUser);
  });
  
  it('findOne — должен выбросить NotFoundException если пользователь не найден', async () => { //найти юзера БД вернула null - сервис должен выбросить NotFoundException
    const userRepo = module.get(getRepositoryToken(User));
  
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
  
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('create — должен создать и вернуть пользователя', async () => { //email не занят значит проверяет email, создаёт объект, сохраняет
    const userRepo = module.get(getRepositoryToken(User));
  
    const dto = { name: 'New User', email: 'new@example.com' };
    const mockUser = { id: 1, ...dto };
  
    //email не занят значит проверяет email, создаёт объект, сохраняет
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    //create возвращает объект без id findOne вернул юзера - значит email уже есть - должен быть ConflictException
    jest.spyOn(userRepo, 'create').mockReturnValue(mockUser as any);
    //save сохраняет и возвращает с id
    jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser as any);
  
    const result = await service.create(dto);
  
    expect(result).toEqual(mockUser);
    expect(result.email).toBe('new@example.com');
  });
  
  it('create — должен выбросить ConflictException если email уже занят', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    //email уже есть в БД
    jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: 1, name: 'Existing', email: 'taken@example.com' } as any);
  
    await expect(
      service.create({ name: 'New User', email: 'taken@example.com' })
    ).rejects.toThrow(ConflictException);
  });

  it('remove — должен удалить пользователя', async () => { //resolves.toBeUndefined() — проверяем что метод отработал и ничего не вернул, потому что remove() возвращает void
    const userRepo = module.get(getRepositoryToken(User));
  
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
  
    // findOne возвращает юзера — он существует
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userRepo, 'remove').mockResolvedValue(undefined as any);
  
    // remove ничего не возвращает (void)
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
  
  it('remove — должен выбросить NotFoundException если пользователь не найден', async () => { //Такой же принцип как в findOne — нет юзера значит ошибка.
    const userRepo = module.get(getRepositoryToken(User));
  
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
  
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });

  it('update — должен обновить и вернуть пользователя', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const existingUser = { id: 1, name: 'Old Name', email: 'old@example.com' };
    const updatedUser = { id: 1, name: 'New Name', email: 'old@example.com' };
  
    // первый findOne — ищем юзера по id
    // второй findOne — проверяем не занят ли email (email не меняется, поэтому не вызовется)
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(existingUser as any);
    jest.spyOn(userRepo, 'save').mockResolvedValue(updatedUser as any);
  
    const result = await service.update(1, { name: 'New Name' });
  
    expect(result.name).toBe('New Name');
  });
  
  it('update — должен выбросить NotFoundException если пользователь не найден', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
  
    await expect(
      service.update(999, { name: 'Ghost' })
    ).rejects.toThrow(NotFoundException);
  });
  
  it('update — должен выбросить ConflictException если новый email уже занят', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const existingUser = { id: 1, name: 'Test', email: 'old@example.com' };
    const anotherUser = { id: 2, name: 'Another', email: 'taken@example.com' };
  
    // первый вызов findOne — находим юзера по id
    // второй вызов findOne — проверяем email, он уже занят
    jest.spyOn(userRepo, 'findOne')
      .mockResolvedValueOnce(existingUser as any)
      .mockResolvedValueOnce(anotherUser as any);
  
    await expect(
      service.update(1, { email: 'taken@example.com' })
    ).rejects.toThrow(ConflictException);
  });
});