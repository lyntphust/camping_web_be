import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @ApiProperty()
  color: string;

  @ApiProperty()
  @IsNumberString()
  discount: number;

  @ApiProperty()
  @IsNumberString()
  price: number;

  @IsString()
  @ApiProperty()
  readonly description: string;

  @IsString()
  @ApiProperty()
  readonly size: string;

  @IsString()
  readonly category: string;
}
