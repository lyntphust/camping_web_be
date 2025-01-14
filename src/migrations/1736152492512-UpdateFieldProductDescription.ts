import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFieldProductDescription1736152492512
  implements MigrationInterface
{
  name = 'UpdateFieldProductDescription1736152492512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN description TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN description TYPE character varying(255)`,
    );
  }
}
