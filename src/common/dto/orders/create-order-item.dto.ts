import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
