import { MigrationInterface, QueryRunner } from "typeorm";

export class InitRecipientSchema1768397666347 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "recipient";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS "recipient" CASCADE;`);
    }

}
