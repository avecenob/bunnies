import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  transactionId: string;

  @IsString()
  transactionStatus: string;

  @IsString()
  transactionTime: string;

  @IsString()
  paymentType: string;

  @IsString()
  orderId: string; // Assuming this is the ID of the related order

  @IsNumber()
  amount: number;

  @IsString()
  bank?: string; // Optional field, can be null

  @IsString()
  approvalCode: string;
}
