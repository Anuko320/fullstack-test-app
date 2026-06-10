import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
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

  it('update — должен взять city из address.city если city не передан', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const existingUser = { id: 1, name: 'Test', email: 'test@example.com', city: null };
    const updatedUser = { id: 1, name: 'Test', email: 'test@example.com', city: 'Almaty' };
  
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(existingUser as any);
    jest.spyOn(userRepo, 'save').mockResolvedValue(updatedUser as any);
  
    const result = await service.update(1, {
      address: { city: 'Almaty' }, // передаём city через address
      // city не передаём напрямую
    } as any);
  
    expect(result.city).toBe('Almaty');
  });

  it('findAll — должен вернуть список пользователей с метаданными', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const mockUsers = [
      { id: 1, name: 'Test User', email: 'test@example.com' },
      { id: 2, name: 'Another User', email: 'another@example.com' },
    ];
  
    // createQueryBuilder возвращает цепочку методов — каждый возвращает сам себя
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockUsers, 2]),
    };
  
    jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
  
    const result = await service.findAll({ page: 1, limit: 10, order: 'ASC', sortBy: 'id' });
  
    expect(result.data).toEqual(mockUsers);
    expect(result.meta.total).toBe(2);
    expect(result.meta.page).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });
  
  it('findAll — должен фильтровать по search', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test User', email: 'test@example.com' }], 1]),
    };
  
    jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
  
    const result = await service.findAll({ search: 'Test', page: 1, limit: 10, order: 'ASC', sortBy: 'id' });
  
    // проверяем что where был вызван с поиском
    expect(mockQueryBuilder.where).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
  });

  it('create — должен взять city напрямую из dto.city', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const dto = { name: 'New User', email: 'city@example.com', city: 'Astana' };
    const mockUser = { id: 1, ...dto };
  
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(userRepo, 'create').mockReturnValue(mockUser as any);
    jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser as any);
  
    const result = await service.create(dto);
  
    expect(result.city).toBe('Astana');
  });

  it('findAll — должен работать с пустым query', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
  
    jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
  
    const result = await service.findAll({});
  
    // where не должен вызываться — search не передан
    expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });

  it('create — должен установить city как undefined если ни dto.city ни address.city не переданы', async () => {
    const userRepo = module.get(getRepositoryToken(User));
  
    const dto = { name: 'No City User', email: 'nocity@example.com' };
    const mockUser = { id: 1, ...dto, city: undefined };
  
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(userRepo, 'create').mockReturnValue(mockUser as any);
    jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser as any);
  
    const result = await service.create(dto);
  
    expect(result.city).toBeUndefined();
  });
});