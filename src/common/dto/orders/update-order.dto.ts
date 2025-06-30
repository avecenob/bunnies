import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  status: 'paid' | 'unpaid';
}
