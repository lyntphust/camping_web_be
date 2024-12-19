import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class FavoriteProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favoriteProducts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Product, (product) => product.favoriteProducts, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
