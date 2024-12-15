import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
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
}
