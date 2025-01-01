import { Product } from 'src/product/entities/product.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_product')
export class BlogProduct {
  @PrimaryColumn({ name: 'blogId' })
  blogId: number;

  @PrimaryColumn({ name: 'productId' })
  productId: number;

  @ManyToOne(() => Blog, (blog) => blog.products, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'blogId', referencedColumnName: 'id' }])
  blog: Blog[];

  @ManyToOne(() => Product, (product) => product.blogs, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'id' }])
  product: Product[];
}
