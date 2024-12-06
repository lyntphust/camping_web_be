import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductDto {
  @ApiProperty()
  id: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  @ApiProperty()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @ApiProperty()
  readonly adress: string;

  @IsString()
  @ApiProperty()
  readonly date: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  readonly products: ProductDto[];
}
