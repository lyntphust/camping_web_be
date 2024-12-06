import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthPayload, GetUser } from 'src/decorator/getUser.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddProductToCartDto } from './dto/add-product.dto';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/cart')
  async getProductCart(@GetUser() user: AuthPayload) {
    return await this.userService.getProductList(user.id);
    console.log(user);
  }

  @Post('/add-cart')
  async addProductCart(
    @GetUser() user: AuthPayload,
    @Body() addProductDto: AddProductToCartDto,
  ) {
    const { productId, quantity } = addProductDto;
    return await this.userService.addProductToCart(
      productId,
      user.id,
      quantity,
    );
    console.log(user);
  }
}
