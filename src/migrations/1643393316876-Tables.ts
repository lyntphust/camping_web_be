import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tables1643393316876 implements MigrationInterface {
  name = 'Tables1643393316876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permission" (
        "id" SERIAL PRIMARY KEY, 
        "name" character varying(25) NOT NULL, 
        "description" character varying(100) NOT NULL
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" (
        "id" SERIAL PRIMARY KEY, 
        "name" character varying(25) NOT NULL
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY, 
        "name" character varying(25) NOT NULL, 
        "surname" character varying(25) NOT NULL, 
        "email" character varying(50) NOT NULL, 
        "password" character varying(60) NOT NULL, 
        "phoneNumber" character varying(16) NOT NULL, 
        "refreshToken" character varying, 
        "roleId" int
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" (
        "id" SERIAL PRIMARY KEY, 
        "name" character varying(50) NOT NULL, 
        "vendorCode" character varying(50) NOT NULL, 
        "weight" character varying(10) NOT NULL, 
        "price" numeric(8,2) NOT NULL, 
        "photo" character varying NOT NULL, 
        "description" character varying(255) NOT NULL, 
        "size" character varying NOT NULL, 
        "category" character varying(50) NOT NULL
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders_products" (
        "orderId" int NOT NULL, 
        "productId" int NOT NULL, 
        "quantity" integer NOT NULL, 
        CONSTRAINT "PK_c58c7b27012def143c3fab1b6f4" PRIMARY KEY ("orderId", "productId")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" (
        "id" SERIAL PRIMARY KEY, 
        "address" character varying(50) NOT NULL, 
        "price" numeric(8,2) NOT NULL, 
        "date" character varying(25) NOT NULL, 
        "status" character varying(50) NOT NULL, 
        "stripeId" character varying, 
        "userId" int NOT NULL
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions_permission" (
        "roleId" int NOT NULL, 
        "permissionId" int NOT NULL, 
        CONSTRAINT "PK_b817d7eca3b85f22130861259dd" PRIMARY KEY ("roleId", "permissionId")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
    await queryRunner.query(`DROP INDEX "IDX_b36cb2e04bc353ca4ede00d87b"`);
    await queryRunner.query(`DROP TABLE "role_permissions_permission"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "orders_products"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "permission"`);
  }
}
