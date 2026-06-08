import { IsEmail, IsNotEmpty } from 'class-validator';

export class SupportDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  message: string;
}