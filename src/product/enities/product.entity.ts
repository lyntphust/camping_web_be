import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { OrdersProducts } from 'src/order/entities/orders-products.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToMany(
    () => OrdersProducts,
    (OrdersProducts: OrdersProducts) => OrdersProducts.product,
  )
  OrdersProducts: OrdersProducts[];
}
