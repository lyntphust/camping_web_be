import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFieldPrice1736151882067 implements MigrationInterface {
  name = 'UpdateFieldPrice1736151882067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN price TYPE numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN price TYPE numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN price TYPE numeric(8,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN price TYPE numeric(8,2)`,
    );
  }
}
