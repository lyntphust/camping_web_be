import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ChatbotHistoryRole {
  MODEL = 'model',
  USER = 'user',
}

@Entity()
export class ChatbotHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

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
