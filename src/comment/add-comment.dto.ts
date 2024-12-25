import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Rating for the product (1-5)',
    example: 5,
  })
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @ApiProperty({
    description: 'The comment text for the product',
    example: 'This is a great product!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  comment: string;

  @ApiProperty({
    description: 'ID of the user making the comment',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @ApiProperty({
    description: 'ID of the product being commented on',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: number;
}
