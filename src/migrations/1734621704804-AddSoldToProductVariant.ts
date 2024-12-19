import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddSoldToProductVariant1734621704804 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
          'product_variant',
          new TableColumn({
            name: 'sold',
            type: 'int',
            isNullable: false,
            default: 0, // Giá trị mặc định là 0
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product_variant', 'sold');
      }

}
