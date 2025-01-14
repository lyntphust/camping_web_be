import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ChatbotHistory } from 'src/chatbot/entities/chatbot-history.entity';
import { Comment } from 'src/comment/comment.entity';
import { FavoriteProduct } from 'src/product/entities/favorite-product.entity';
import { ProductCart } from 'src/product/entities/product-cart.entity';
import { Order } from '../../order/entities/order.entity';
import { Role } from '../../role/entities/role.entity';
import { Blog } from './blog.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 25 })
  name: string;

  @Column({ length: 25 })
  surname: string;

  @Column({ length: 50 })
  email: string;

  @Column({ length: 60 })
  password: string;

  @Column({ length: 16 })
  phoneNumber: string;

  @Column({ nullable: true })
  refreshToken: string;

  @JoinTable()
  @ManyToOne(() => Role, (role: Role) => role.users)
  role: Role;

  @OneToMany(() => Order, (order: Order) => order.user)
  orders: Order[];

  @OneToMany(
    () => ProductCart,
    (productCarts: ProductCart) => productCarts.user,
  )
  productCarts: ProductCart[];

  @OneToMany(() => FavoriteProduct, (favorite) => favorite.user)
  favoriteProducts: FavoriteProduct[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @ManyToMany(() => Blog, (blog: Blog) => blog.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'favorite_blog',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'blogId',
      referencedColumnName: 'id',
    },
  })
  blogs: Blog[];
}
