import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddChatbotModule1734810705916 implements MigrationInterface {
  name = 'AddChatbotModule1734810705916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chatbot_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['system', 'user', 'assistant'],
            default: "'system'",
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chatbot_history');
  }
}
