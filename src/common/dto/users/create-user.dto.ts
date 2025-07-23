import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsString()
  @IsEmail({}, { message: 'Email harus mengandung karakter "@" dan domain' })
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password harus memiliki minimal 6 karakter' })
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^(\+62|0)\d{9,12}$/, { message: 'Nomor telepon tidak valid' })
  phone?: string;

  @IsNotEmpty()
  role: string = 'customer'; // admin or customer
}
