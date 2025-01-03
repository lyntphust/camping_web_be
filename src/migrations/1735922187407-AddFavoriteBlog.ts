import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddFavoriteBlog1735922187407 implements MigrationInterface {
  name = 'AddFavoriteBlog1735922187407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'favorite_blog',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'blogId',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('favorite_blog');
  }
}
