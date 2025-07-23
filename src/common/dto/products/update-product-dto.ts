import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Stok produk harus berupa angka' })
  @Min(1, { message: 'Harga produk harus lebih dari 0' })
  price?: number;

  @IsNumber({}, { message: 'Stok produk harus berupa angka' })
  @Min(0, { message: 'Stok produk tidak boleh kurang dari 0' })
  stock?: number;

  @IsOptional()
  @IsNumber()
  sold?: number;
}
