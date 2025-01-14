import { ProductVariant } from 'src/product/entities/product-variant.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';
import { User } from './user.entity';

@Entity('favorite_blog')
export class FavoriteBlog {
  @PrimaryColumn({ name: 'userId' })
  userId: number;

  @PrimaryColumn({ name: 'blogId' })
  blogId: number;

  @ManyToOne(() => User, (user) => user.blogs, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'blogId', referencedColumnName: 'id' }])
  blog: Blog;
}
