import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class addProductVariant1733455625471 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng ProductVariant
    await queryRunner.createTable(
      new Table({
        name: 'product_variant',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment', // ID sẽ tự động tăng
          },
          {
            name: 'size',
            type: 'varchar',
            length: '10',
            isNullable: false, // Không được null
          },
          {
            name: 'color',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'stock',
            type: 'int',
            isNullable: false,
            default: 0, // Mặc định là 0
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Tạo khóa ngoại product_id tham chiếu đến bảng Product
    await queryRunner.createForeignKey(
      'product_variant',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE', // Xóa Product thì các ProductVariant liên quan cũng bị xóa
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa khóa ngoại trước
    const table = await queryRunner.getTable('product_variant');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('product_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('product_variant', foreignKey);
    }

    // Xóa bảng ProductVariant
    await queryRunner.dropTable('product_variant');
  }
}
