import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddBlogProduct1735717710012 implements MigrationInterface {
  name = 'AddBlogProduct1735717710012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blog_product',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'blogId',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'productId',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('blog_product');
  }
}
