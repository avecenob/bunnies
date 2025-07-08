import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsString()
  status: 'paid' | 'unpaid';
}
