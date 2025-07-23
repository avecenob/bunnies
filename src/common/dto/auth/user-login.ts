import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsString()
  @IsEmail({}, { message: 'Email harus mengandung karakter "@" dan domain' })
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString()
  @MinLength(6, { message: 'Password harus memiliki minimal 6 karakter' })
  password: string;
}
