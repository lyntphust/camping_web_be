import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class RemoveColorWeightSizeFromProduct1734613770011 implements MigrationInterface {
    name = 'RemoveColorWeightSizeFromProduct1734613770011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'color');
        await queryRunner.dropColumn('product', 'weight');
        await queryRunner.dropColumn('product', 'size');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('product', new TableColumn({
            name: 'color',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.addColumn('product', new TableColumn({
            name: 'weight',
            type: 'float',
            isNullable: true,
        }));
        await queryRunner.addColumn('product', new TableColumn({
            name: 'size',
            type: 'varchar',
            isNullable: true,
        }));
    }

}
