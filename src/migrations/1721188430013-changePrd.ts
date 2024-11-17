import {MigrationInterface, QueryRunner} from "typeorm";

export class changePrd1721188430013 implements MigrationInterface {
    name = 'changePrd1721188430013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "vendorCode"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "color" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "discount" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "color"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "vendorCode" character varying(50) NOT NULL`);
    }

}
