import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/add-blog.dto';
import { S3CoreService } from 'src/s3/src';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly s3Service: S3CoreService,
  ) {}

  async getAdminViewBlogs(status?: string, userId?: number, location?: string) {
    const query = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.user', 'user');

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

  async createBlog(userId: number, createBlogDto: CreateBlogDto) {
    const newBlog = this.blogRepository.create({
      ...createBlogDto,
      user: { id: userId }, // Liên kết user với blog
      status: BlogStatus.PENDING, // Mặc định trạng thái là 'pending'
    });

    return await this.blogRepository.save(newBlog);
  }

  async deleteBlog(userId: number, blogId: number) {
    const blog = await this.blogRepository.findOne({
      where: { id: blogId, user: { id: userId } },
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
