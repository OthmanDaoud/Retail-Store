import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1751300000000 implements MigrationInterface {
  name = 'InitialSchema1751300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`passwordHash\` varchar(255) NOT NULL,
        \`role\` enum('manager','employee') NOT NULL DEFAULT 'employee',
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`createdBy\` int NULL,
        \`modifiedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modifiedBy\` int NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_categories_name\` (\`name\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`price\` decimal(10,2) NOT NULL,
        \`stockQuantity\` int NOT NULL DEFAULT 0,
        \`categoryId\` int NOT NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`createdBy\` int NULL,
        \`modifiedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modifiedBy\` int NULL,
        PRIMARY KEY (\`id\`),
        FULLTEXT INDEX \`IDX_products_name_fulltext\` (\`name\`),
        INDEX \`IDX_products_price\` (\`price\`),
        CONSTRAINT \`FK_products_categoryId\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sales\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`total\` decimal(12,2) NOT NULL,
        \`cashierId\` int NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_sales_cashierId\` FOREIGN KEY (\`cashierId\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sale_items\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`saleId\` int NOT NULL,
        \`productId\` int NOT NULL,
        \`quantity\` int NOT NULL,
        \`unitPrice\` decimal(10,2) NOT NULL,
        \`lineTotal\` decimal(12,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_sale_items_saleId\` FOREIGN KEY (\`saleId\`) REFERENCES \`sales\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_sale_items_productId\` FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`sale_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sales\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`products\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`categories\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
