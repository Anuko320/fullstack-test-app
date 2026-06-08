import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
}
