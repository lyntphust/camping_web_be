import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3CoreService } from 'src/s3/src';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateBlogDto } from './dto/add-blog.dto';
import { BlogProduct } from './entities/blog-product.entity';
import { Blog, BlogStatus } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(BlogProduct)
    private readonly blogProductRepository: Repository<BlogProduct>,
    private readonly s3Service: S3CoreService,
  ) {}

  async getAdminViewBlogs(status?: string, userId?: number, location?: string) {
    const query = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.user', 'user')
      .leftJoinAndSelect('blog.products', 'products');

    // Apply filters if provided
    if (status) {
      query.andWhere('blog.status = :status', { status });
    }

    if (userId) {
      query.andWhere('blog.userId = :userId', { userId });
    }

    if (location) {
      query.andWhere('blog.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    const blogs = await query.getMany();

    if (blogs.length === 0) {
      throw new NotFoundException('No blogs found with the given filters.');
    }

    for (let i = 0; i < blogs.length; i++) {
      if (blogs[i].image) {
        const link = await this.s3Service.getLinkFromS3(blogs[i].image);
        blogs[i]['image'] = link;
      }
    }

    return blogs.map((blog) => ({
      ...blog,
      user: {
        id: blog.user.id,
        name: blog.user.name,
        email: blog.user.email,
      },
    }));
  }

  async updateBlogStatus(blogId: number, status: string) {
    if (!Object.values(BlogStatus).includes(status as BlogStatus)) {
      throw new Error('Invalid blog status.');
    }

    const blog = await this.blogRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found.`);
    }

    blog.status = status as BlogStatus;
    await this.blogRepository.save(blog);

    return { message: `Blog status updated to ${status}.` };
  }

  async createBlog(
    userId: number,
    createBlogDto: CreateBlogDto,
    file: Express.Multer.File,
  ) {
    const newBlog = this.blogRepository.create({
      ...createBlogDto,
      user: { id: userId }, // Liên kết user với blog
      status: BlogStatus.PENDING, // Mặc định trạng thái là 'pending'
    });

    if (file[0]) {
      // Upload file to S3
      const prefix = 'blog-image';
      const key = `${prefix}/${uuidv4()}/${file[0].originalname}`;
      await this.s3Service.uploadFileWithStream(file[0].buffer, key);
      newBlog.image = key;
    }

    const savedBlog = await this.blogRepository.save(newBlog);

    const productIds = createBlogDto.productIds;
    for (const product of productIds) {
      await this.blogProductRepository.save({
        blogId: savedBlog.id,
        productId: product,
      });
    }
  }

  async deleteBlog(blogId: number) {
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException(
        `Blog with ID ${blogId} not found or you don't have permission to delete it.`,
      );
    }

    await this.blogRepository.remove(blog);

    return { message: `Blog with ID ${blogId} has been deleted.` };
  }
}
