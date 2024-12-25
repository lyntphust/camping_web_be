import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateCommentTable1735141234364 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
          new Table({
            name: 'comment',
            columns: [
              {
                name: 'id',
                type: 'bigint',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
              },
              {
                name: 'rating',
                type: 'int',
                isNullable: false,
              },
              {
                name: 'comment',
                type: 'text',
                isNullable: false,
              },
              {
                name: 'productId',
                type: 'bigint',
                isNullable: false,
              },
              {
                name: 'userId',
                type: 'bigint',
                isNullable: false,
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
        await queryRunner.dropTable('comment');
      }

}
