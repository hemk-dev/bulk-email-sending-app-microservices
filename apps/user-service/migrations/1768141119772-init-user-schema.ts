import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUserSchema1768141119772 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "user";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS "user" CASCADE;`);
    }

}
