import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
  PaginatedResponse,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: GetUsersQueryDto): Promise<PaginatedResponse<User>> {
    const { search, page = 1, limit = 10, sortBy = 'id', order = 'ASC' } = query;
    const skip = (page - 1) * limit;
  
    const qb = this.userRepository.createQueryBuilder('user');
  
    if (search) {
      qb.where('LOWER(user.name) LIKE LOWER(:search)', { search: `%${search}%` });
    }
  
    qb.orderBy(`user.${sortBy}`, order, 'NULLS LAST');
    qb.skip(skip).take(limit);
  
    const [data, total] = await qb.getManyAndCount();
  
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(`User with email "${dto.email}" already exists`);
    }

    const city = dto.city ?? dto.address?.city ?? undefined;

    const user = this.userRepository.create({ ...dto, city });
    return this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(`User with email "${dto.email}" already exists`);
      }
    }

    if (dto.address?.city && !dto.city) {
      dto.city = dto.address.city;
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    this.logger.log(`User ${id} deleted`);
  }
}
