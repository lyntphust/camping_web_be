import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionsData1643393316878 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO Permission (name, description) VALUES 
      ('CREATE_ORDER_SELF', 'create an order'),
      ('GET_ORDER_SELF', 'get your order'),
      ('REMOVE_ORDER_ALL', 'remove an order for any user'),
      ('UPDATE_ORDER_ALL', 'update an order for any user'),
      ('GET_ORDER_ALL', 'get any order of any user'),
      ('CRUD_PRODUCT_ALL', 'crud functionality for products')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM Permission WHERE name IN (
      'CREATE_ORDER_SELF', 
      'GET_ORDER_SELF', 
      'REMOVE_ORDER_ALL', 
      'UPDATE_ORDER_ALL', 
      'GET_ORDER_ALL', 
      'CRUD_PRODUCT_ALL'
    )`);
  }
}
