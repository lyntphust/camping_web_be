import { HttpException } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @Public()
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.login(loginUserDto);

    return result;
  }

  @Public()
  @Post('/registration')
  async registration(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.registration(createUserDto);

    if (!result) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }
}
