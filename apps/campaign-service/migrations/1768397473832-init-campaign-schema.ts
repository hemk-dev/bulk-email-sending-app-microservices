import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCampaignSchema1768397473832 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "campaign";`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS "campaign" CASCADE;`);
    }

}
