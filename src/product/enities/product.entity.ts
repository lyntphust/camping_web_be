import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { OrdersProducts } from 'src/order/entities/orders-products.entity';
import { FavoriteProduct } from './favorite-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  color: string;

  @Column()
  discount: number;

  @Column({ length: 10 })
  weight: string;

  @Column()
  price: number;

  @Column()
  photo: string;

  @Column({ length: 255 })
  description: string;

  @Column()
  size: string;

  @Column({ length: 50 })
  category: string;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[]; // Liên kết với bảng ProductVariant

  @OneToMany(() => FavoriteProduct, (favorite) => favorite.product)
  favoriteProducts: FavoriteProduct[];
  

}
