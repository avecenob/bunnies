import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Cart } from 'src/carts/cart.entity';
import { User } from 'src/users/user.entity';

export class CreatePendingOrderDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  user: User;

  @IsNotEmpty()
  cart: Cart;

  @IsNotEmpty()
  @IsNumber()
  total: number;
}
