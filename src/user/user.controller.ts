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
  Put,
  Req,
  Res,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthPayload, GetUser } from 'src/decorator/getUser.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddProductToCartDto } from './dto/add-product.dto';
import { Public } from 'src/decorator/public.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/updatePasswordDto';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}


@Put('/update')
async updateUser(
  @GetUser() user: AuthPayload,
  @Body() updateUserDto: UpdateUserDto,
) {
  try {
    return await this.userService.updateUser(user.id, updateUserDto);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

@Put('/update-password')
async updatePassword(
  @GetUser() user: AuthPayload,
  @Body() updatePasswordDto: UpdatePasswordDto,
) {
  try {
    return await this.userService.updatePassword(user.id, updatePasswordDto);
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

  @Public()
  @Get('/all')
  async getAllUser() {
    try {
      return await this.userService.getAllUser();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get('/:userId')
async getUserById(@Param('userId') userId: number) {
  try {
    return await this.userService.getUserById(userId);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
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

  @Public()
  @Delete('/:userId')
  async removeUser(
    @GetUser() user: AuthPayload,
    @Param('userId') userId: number,
  ) {
    return await this.userService.deleteUser(userId);
  }

}
