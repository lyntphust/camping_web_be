import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addPhoneNumber1734688065650 implements MigrationInterface {
    name = 'addPhoneNumber1734688065650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove the 'date' column
        await queryRunner.dropColumn('order', 'date');
    
        // Add the 'phone' column
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'phone',
            type: 'varchar',
            length: '25',
            isNullable: false,
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        // Add the 'date' column back
        await queryRunner.addColumn(
          'order',
          new TableColumn({
            name: 'date',
            type: 'timestamp',
            isNullable: true,
          }),
        );
    
        // Remove the 'phone' column
        await queryRunner.dropColumn('order', 'phone');
      }

}
