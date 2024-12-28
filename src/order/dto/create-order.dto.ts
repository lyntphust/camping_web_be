import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
export class ProductDto {
  @ApiProperty({
    description: 'ID of the product variant',
    example: 1,
  })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({
    description: 'Quantity of the product variant',
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main Street, Springfield',
  })
  @IsString()
  readonly address: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  readonly price: number;

  @ApiProperty({
    description: 'List of product variants with their quantities',
    type: [ProductDto], // Specify this is an array of ProductDto
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  readonly products: ProductDto[];
}
