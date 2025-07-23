import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Gambar produk tidak boleh kosong' })
  @IsString()
  image: string;

  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Kategori produk tidak boleh kosong' })
  @IsNumber()
  categoryId: number;

  @IsNotEmpty({ message: 'Deskripsi produk tidak boleh kosong' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Harga produk tidak boleh kosong' })
  @IsNumber()
  @Min(1, { message: 'Harga produk harus lebih dari 0' })
  price: number;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Stok produk harus berupa angka' })
  @Min(0, { message: 'Stok produk tidak boleh kurang dari 0' })
  stock: number;
}
