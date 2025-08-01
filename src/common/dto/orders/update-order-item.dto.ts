import { IsNumber, IsOptional } from 'class-validator';

export class UpdateOrderItemDto {
  @IsOptional()
  @IsNumber()
  quantity: number;
}
