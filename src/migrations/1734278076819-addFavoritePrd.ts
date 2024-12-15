import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class addFavoritePrd1734278076819 implements MigrationInterface {
    name = 'addFavoritePrd1734278076819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng FavoriteProduct
        await queryRunner.createTable(
          new Table({
            name: 'favorite_product',
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
                isNullable: false,
              },
              {
                name: 'productId',
                type: 'int',
                isNullable: false,
              },
            ],
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
       
    
        await queryRunner.dropTable('favorite_product');
      }
}
