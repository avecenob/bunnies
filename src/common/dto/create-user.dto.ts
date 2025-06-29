import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  address: string;

  @IsString()
  phone_number: string;

  @IsNotEmpty()
  role: string = 'customer'; // admin or customer
}
