import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OnPaymentSuccessQuery {
  @IsString()
  @ApiProperty()
  session_id: string;
}
