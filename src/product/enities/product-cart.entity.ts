import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ProductVariant } from './product-variant.entity';

@Entity()
export class ProductCart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_variant_id' })
  productVariantId: number;

  @Column()
  userId: number;

  @Column()
  quantity: number;

  @ManyToOne(() => User, (user) => user.productCarts)
  user: User;

  @ManyToOne(() => ProductVariant, { eager: false })
  @JoinColumn({ name: 'product_variant_id' }) // Ánh xạ cột với quan hệ
  productVariant: ProductVariant; // Liên kết với ProductVariant
}
