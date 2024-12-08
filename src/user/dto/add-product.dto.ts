import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddProductToCartDto {
  @ApiProperty()
  @IsInt({ message: 'Product ID must be an integer' })
  productId: number;

  @ApiProperty()
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}