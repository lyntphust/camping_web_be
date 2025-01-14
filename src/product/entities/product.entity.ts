import { Comment } from 'src/comment/comment.entity';
import { Blog } from 'src/user/entities/blog.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FavoriteProduct } from './favorite-product.entity';
import { ProductVariant } from './product-variant.entity';
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column()
  discount: number;

  @Column()
  price: number;

  @Column()
  photo: string;

  @Column({ length: 255 })
  description: string;

  @Column({ length: 50 })
  category: string;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[]; // Liên kết với bảng ProductVariant

  @OneToMany(() => FavoriteProduct, (favorite) => favorite.product)
  favoriteProducts: FavoriteProduct[];
  @OneToMany(() => Comment, (comment) => comment.product)
  comments: Comment[];
}
