import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class GeoDto {
  @ApiProperty({ example: '-38.2386' })
  @IsString()
  lat: string;

  @ApiProperty({ example: '57.2232' })
  @IsString()
  lng: string;
}

export class AddressDto {
  @ApiPropertyOptional({ example: 'Kattie Turnpike' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'Suite 198' })
  @IsOptional()
  @IsString()
  suite?: string;

  @ApiProperty({ example: 'Lebsackbury' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: '31428-2261' })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoDto)
  geo?: GeoDto;
}

export class CompanyDto {
  @ApiPropertyOptional({ example: 'Hoeger LLC' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Centralized empowering task-force' })
  @IsOptional()
  @IsString()
  catchPhrase?: string;

  @ApiPropertyOptional({ example: 'target end-to-end models' })
  @IsOptional()
  @IsString()
  bs?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Clementina DuBuque' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Moriah.Stanton' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiProperty({ example: 'clementina@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'Lebsackbury' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: '024-648-3804' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'ambrose.net' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyDto)
  company?: CompanyDto;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Search users by name (case-insensitive)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'name',
    default: 'id',
    enum: ['id', 'name', 'email', 'city', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: 'id' | 'name' | 'email' | 'city' | 'createdAt' = 'id';

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'ASC',
    default: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'ASC';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
