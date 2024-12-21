import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum ChatbotHistoryRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
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
    default: ChatbotHistoryRole.SYSTEM,
  })
  role: ChatbotHistoryRole;

  @Column()
  content: string;

  @Column()
  createdAt: Date;
}
