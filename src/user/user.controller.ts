import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthPayload, GetUser } from 'src/decorator/getUser.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddProductToCartDto } from './dto/add-product.dto';
import { Public } from 'src/decorator/public.decorator';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}


// Lấy thông tin của 1 user dựa vào userId
@Public()
@Get('/:userId')
async getUserById(@Param('userId') userId: number) {
  try {
    return await this.userService.getUserById(userId);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

// Yêu thích 1 sản phẩm
@Post('/favorite/:productId')
async favoriteProduct(
  @GetUser() user: AuthPayload,
  @Param('productId') productId: number,
) {
  try {
    return await this.userService.addFavoriteProduct(user.id, productId);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

// Xem danh sách sản phẩm yêu thích
@Get('/favorite')
async getFavoriteProducts(@GetUser() user: AuthPayload) {
  try {
    return await this.userService.getFavoriteProducts(user.id);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

// Xóa sản phẩm khỏi danh sách yêu thích
@Delete('/favorite/:productId')
async removeFavoriteProduct(
  @GetUser() user: AuthPayload,
  @Param('productId') productId: number,
) {
  try {
    return await this.userService.removeFavoriteProduct(user.id, productId);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}


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

  @Delete('/cart/:productId')
  async removeProductCart(
    @GetUser() user: AuthPayload,
    @Param('productId') productId: number,
  ) {
    return await this.userService.removeProductFromCart(productId, user.id);
  }

  
}
