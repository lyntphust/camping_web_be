import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  image?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  location?: string;

  @IsOptional()
  @ApiProperty({ type: [Number] })
  productIds?: number[];
}
