import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddTitleToBlog1735370368284 implements MigrationInterface {
    name = 'AddTitleToBlog1735370368284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
          'blog', // Table name
          new TableColumn({
            name: 'title',
            type: 'text',
            isNullable: false, // Ensure title cannot be null
          }),
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('blog', 'title');
      }

}
