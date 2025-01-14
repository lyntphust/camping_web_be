import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthPayload, GetUser } from 'src/decorator/getUser.decorator';
import { Public } from 'src/decorator/public.decorator';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/add-blog.dto';

@Controller('blog')
@ApiBearerAuth()
@ApiTags('Blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('/admin')
  @Public()
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by blog status (optional)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter by user ID (optional)',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter by blog location (optional)',
  })
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file', 1))
  async createBlog(
    @GetUser() user: AuthPayload,
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    try {
      return await this.blogService.createBlog(user.id, createBlogDto, file);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/:blogId')
  async deleteBlog(
    @Param('blogId') blogId: number,
  ) {
    try {
      return await this.blogService.deleteBlog(blogId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
