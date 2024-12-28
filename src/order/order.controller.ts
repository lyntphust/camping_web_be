import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { CreateOrderDto } from './dto/create-order.dto';

import { AuthService } from 'src/auth/auth.service';
import { OrderService } from './order.service';
import { GetUser } from 'src/decorator/getUser.decorator';
import { AuthPayload } from 'src/decorator/getUser.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';

@Controller('order')
@ApiBearerAuth()
@ApiTags('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async createOrder(
    @GetUser() user: AuthPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(user.id, createOrderDto);
  }

  /**
   * Get all orders for the authenticated user.
   */
  @Get()
  async getUserOrders(@GetUser() user: AuthPayload) {
    const userId = user.id;
    console.log('aaaaaaaaaaaaaa')
    return await this.orderService.getUserOrders(userId);
  }

  @Get("/all") 
    async getAllOrders() {
      return await this.orderService.getAllOrders();
    }
  

  /**
   * Admin updates the status of an order.
   */
  @Public()
  @Patch(':orderId/:status')
  async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Param('status') status: string,
  ) {
    return await this.orderService.updateOrderStatus(orderId, status);
  }
}
