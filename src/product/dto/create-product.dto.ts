import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ProductVariantDto {
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Color of the product variant',
    example: 'Red',
  })
  color: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Size of the product variant',
    example: 'M',
  })
  size: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Quantity available for the product variant',
    example: 10,
  })
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the product',
    example: 'T-Shirt',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Discount percentage for the product',
    example: 10,
  })
  @IsNumberString()
  discount: number;

  @ApiProperty({
    description: 'Price of the product',
    example: 29.99,
  })
  @IsNumberString()
  price: number;

  @IsString()
  @ApiProperty({
    description: 'Description of the product',
    example: 'A high-quality cotton T-shirt',
  })
  readonly description: string;

  @IsString()
  @ApiProperty({
    description: 'Category of the product',
    example: 'Apparel',
  })
  readonly category: string;

  // Array of ProductVariantDto
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @ApiProperty({
    description: 'Variants of the product',
    type: [ProductVariantDto],
    isArray: true,
  })
  variants: ProductVariantDto[];
}
