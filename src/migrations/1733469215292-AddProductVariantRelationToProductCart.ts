import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductVariantRelationToProductCart1733469215292
  implements MigrationInterface
{
  name = 'AddProductVariantRelationToProductCart1733469215292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Đổi tên cột từ `productVariantId` sang `variantId`
    await queryRunner.query(
      `ALTER TABLE "product_cart" RENAME COLUMN "productId" TO "product_variant_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Đổi lại tên cột từ `variantId` về `productVariantId` (nếu cần rollback)
    await queryRunner.query(
      `ALTER TABLE "product_cart" RENAME COLUMN "variantId" TO "productVariantId"`,
    );
  }
}
