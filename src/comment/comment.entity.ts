import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: false })
  rating: number;

  @Column({ type: 'text', nullable: false })
  comment: string;

  @ManyToOne(() => Product, (product) => product.comments, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
