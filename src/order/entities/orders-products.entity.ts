import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from 'src/product/enities/product.entity';
import { Order } from './order.entity';

@Entity()
export class OrdersProducts {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  orderId: number;

  @ManyToOne((type) => Order, (order) => order.OrdersProducts)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @PrimaryColumn()
  productId: number;

  @ManyToOne((type) => Product, (product) => product.OrdersProducts)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  quantity: number;
}
