import { MigrationInterface, QueryRunner } from 'typeorm';

export class addProductCart1721636332591 implements MigrationInterface {
  name = 'addProductCart1721636332591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_cart" ("id" SERIAL NOT NULL, "productId" character varying NOT NULL, "userId" uuid NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_a9eb3c6b183961debec3a968f91" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_cart"`);
  }
}
