import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  product_id: string;

  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;
}
