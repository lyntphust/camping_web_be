import { MigrationInterface, QueryRunner, Table } from 'typeorm';

const TABLE_NAME = 'chatbot_history';

export class AddChatbotHistory1736147164561 implements MigrationInterface {
  name = 'AddChatbotHistory1736147164561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TABLE_NAME,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sessionId',
            type: 'character varying',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['model', 'user'],
            default: `'model'`,
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLE_NAME);
  }
}
