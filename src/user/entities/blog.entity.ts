import { ProductVariant } from 'src/product/entities/product-variant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity'; // Đường dẫn tới User entity (cần cập nhật tùy theo cấu trúc dự án)

export enum BlogStatus {
  PENDING = 'pending',
  APPROVE = 'approve',
  REJECT = 'reject',
}

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  title: string;

  @Column('text')
  text: string;

  @Column('text', { nullable: true })
  image: string;

  @Column({ default: false })
  bookmark: boolean;

  @ManyToOne(() => User, (user) => user.blogs, { nullable: false })
  user: User;

  @Column('varchar', { length: 255, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.PENDING,
  })
  status: BlogStatus;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToMany(
    () => ProductVariant,
    (product: ProductVariant) => product.blogs,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinTable({
    name: 'blog_product',
    joinColumn: {
      name: 'blogId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
  })
  products: ProductVariant[];

  @ManyToMany(() => User, (user) => user.blogs, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  users: User[];

  // @Column('text')
  // title: string;
}
