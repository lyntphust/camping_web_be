import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolesData1643393316877 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO Role (name) VALUES ('user')`);
    await queryRunner.query(`INSERT INTO Role (name) VALUES ('admin')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM Role WHERE name='user'`);
    await queryRunner.query(`DELETE FROM Role WHERE name='admin'`);
  }
}
