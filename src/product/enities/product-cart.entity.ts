import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class ProductCart {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  productId: string;

  @Column()
  userId: string;

  @Column()
  quantity: number;

  @ManyToOne(() => User, (user) => user.productCarts)
  user: User;
}
