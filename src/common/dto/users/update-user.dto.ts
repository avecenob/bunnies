import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^(\+62|0)\d{9,12}$/, { message: 'Nomor telepon tidak valid' })
  phone?: string;

  @IsOptional()
  resetToken?: string | null;

  @IsOptional()
  resetTokenExpires?: Date | null;
}
