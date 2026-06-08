import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto, TokenResponse } from './dto/auth.dto';

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT access token and refresh token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Returns new token pair' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
    return this.authService.refreshTokens(dto.refreshToken);
  }
}