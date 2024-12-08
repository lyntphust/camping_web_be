import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrdersProductsToUseProductVariant1733647008094
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE orders_products DROP COLUMN IF EXISTS "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE orders_products ADD COLUMN "productVariantId" INT NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE orders_products ADD CONSTRAINT FK_productVariant
      FOREIGN KEY ("productVariantId") REFERENCES product_variant(id) ON DELETE CASCADE
    `);
    await queryRunner.query(
      `ALTER TABLE orders_products ADD COLUMN id SERIAL PRIMARY KEY`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE orders_products DROP COLUMN "productVariantId"`,
    );
    await queryRunner.query(
      `ALTER TABLE orders_products ADD COLUMN "productId" INT NOT NULL`,
    );
    await queryRunner.query(`
      ALTER TABLE orders_products ADD CONSTRAINT FK_product
      FOREIGN KEY ("productId") REFERENCES product(id) ON DELETE CASCADE
    `);
    await queryRunner.query(`ALTER TABLE orders_products DROP COLUMN id`);
  }
}
