import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductVariant } from 'src/product/enities/product-variant.entity';
import { Order } from './order.entity';

@Entity()
export class OrdersProducts {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.OrdersProducts)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @PrimaryColumn()
  productVariantId: number;

  @ManyToOne(() => ProductVariant, (productVariant) => productVariant.id)
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductVariant;

  @Column()
  quantity: number;
}
