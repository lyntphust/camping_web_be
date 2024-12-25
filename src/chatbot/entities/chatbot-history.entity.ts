import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum ChatbotHistoryRole {
  MODEL = 'model',
  USER = 'user',
}

@Entity()
export class ChatbotHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chatbotHistories, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: ChatbotHistoryRole,
    default: ChatbotHistoryRole.MODEL,
  })
  role: ChatbotHistoryRole;

  @Column()
  content: string;

  @Column()
  createdAt: Date;
}
