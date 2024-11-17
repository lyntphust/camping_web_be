import { IsString, IsOptional, IsEnum } from 'class-validator';

import { Status } from '../enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly adress?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly date?: string;

  @IsOptional()
  @IsEnum(Status)
  @ApiProperty()
  readonly status?: string;
}
