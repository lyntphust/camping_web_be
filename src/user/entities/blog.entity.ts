import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
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

  // @Column('text')
  // title: string;
}
