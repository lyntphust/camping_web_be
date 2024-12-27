import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { BlogService } from './blog.service';
import { AuthPayload } from 'src/decorator/getUser.decorator';
import { GetUser } from 'src/decorator/getUser.decorator';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateBlogDto } from './dto/add-blog.dto';
import { Public } from 'src/decorator/public.decorator';

@Controller('blog')
@ApiBearerAuth()
@ApiTags('Blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('/admin')
  @Public()
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by blog status (optional)' })
@ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filter by user ID (optional)' })
@ApiQuery({ name: 'location', required: false, type: String, description: 'Filter by blog location (optional)' })
  async adminViewBlogs(
    @Query('status') status: string, // Filter by status
    @Query('userId') userId: number, // Optional filter by userId
    @Query('location') location: string, // Optional filter by location
  ) {
    try {
      return await this.blogService.getAdminViewBlogs(status, userId, location);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/admin/update-status/:blogId/:status')
  async adminUpdateBlogStatus(
    @Param('blogId') blogId: number,
    @Param('status') status: string,
  ) {
    try {
      return await this.blogService.updateBlogStatus(blogId, status);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Post()
  async createBlog(
    @GetUser() user: AuthPayload,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    try {
      return await this.blogService.createBlog(user.id, createBlogDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/:blogId')
  async deleteBlog(
    @GetUser() user: AuthPayload,
    @Param('blogId') blogId: number,
  ) {
    try {
      return await this.blogService.deleteBlog(user.id, blogId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
