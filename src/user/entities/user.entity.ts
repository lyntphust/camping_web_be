import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Order } from '../../order/entities/order.entity';
import { Role } from '../../role/entities/role.entity';
import { ProductCart } from 'src/product/enities/product-cart.entity';
import { Blog } from './blog.entity';
import { FavoriteProduct } from 'src/product/enities/favorite-product.entity';
import { ChatbotHistory } from 'src/chatbot/entities/chatbot-history.entity';

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


  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];

  @OneToMany(() => FavoriteProduct, (favorite) => favorite.user)
favoriteProducts: FavoriteProduct[];

  @OneToMany(() => ChatbotHistory, (chatHistory) => chatHistory.user)
  chatbotHistories: ChatbotHistory[];
}
