import { OrdersProducts } from 'src/order/entities/orders-products.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  size: string; // Ví dụ: 'M', 'L'

  @Column({ length: 50 })
  color: string; // Ví dụ: 'Red', 'Blue'

  @Column()
  stock: number; // Số lượng tồn kho

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Giá của biến thể

  @Column()
  product_id: number;

  @Column({ default: 0 }) // Thêm cột `sold` với giá trị mặc định là 0
  sold: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product; // Liên kết tới bảng Product

  @OneToMany(
    () => OrdersProducts,
    (ordersProducts) => ordersProducts.productVariant,
  )
  ordersProducts: OrdersProducts[];
}
