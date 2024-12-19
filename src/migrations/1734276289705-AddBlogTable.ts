import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class AddBlogTable1734276289705 implements MigrationInterface {
    name = 'AddBlogTable1734276289705'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: 'blog',
            columns: [
              {
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'text',
                type: 'text',
                isNullable: false,
              },
              {
                name: 'image',
                type: 'text',
                isNullable: true,
              },
              {
                name: 'bookmark',
                type: 'boolean',
                default: false,
              },
              {
                name: 'userId',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'location',
                type: 'varchar',
                length: '255',
                isNullable: true,
              },
              {
                name: 'status',
                type: 'enum',
                enum: ['pending', 'approve', 'reject'],
                default: `'pending'`,
              },
              {
                name: 'createdAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
              },
              {
                name: 'updatedAt',
                type: 'timestamp',
                default: 'CURRENT_TIMESTAMP',
                onUpdate: 'CURRENT_TIMESTAMP',
              },
            ],
          }),
          true,
        );
    
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {

        // Xóa bảng blog
        await queryRunner.dropTable('blog');
      }
}
