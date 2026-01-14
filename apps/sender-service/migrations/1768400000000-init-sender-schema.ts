import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSenderSchema1768400000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "sender";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS "sender" CASCADE;`);
    }

}
