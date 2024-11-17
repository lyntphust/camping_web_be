import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsNumberString, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @ApiProperty()
  readonly surname: string;

  @IsEmail()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @ApiProperty()
  readonly password: string;

  @IsNumberString()
  @ApiProperty()
  readonly phoneNumber: string;

  @IsString()
  @ApiProperty()
  readonly roleName: string;
}
