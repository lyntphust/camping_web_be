import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCommentDto } from './add-comment.dto';

@ApiTags('comments')
@Controller('comments')
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to a product' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Product or user not found' })
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    const { userId, productId, rating, comment } = createCommentDto;
    return this.commentService.createComment(userId, productId, rating, comment);
  }

  @Get('/product/:productId')
  @ApiOperation({ summary: 'Get all comments for a product' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getCommentsByProduct(@Param('productId') productId: number) {
    return this.commentService.getCommentsByProduct(productId);
  }
}
