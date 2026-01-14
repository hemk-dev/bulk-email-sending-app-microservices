import { MigrationInterface, QueryRunner } from "typeorm";

export class RecipientsTableCreation1768398993770 implements MigrationInterface {
    name = 'RecipientsTableCreation1768398993770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recipient"."recipients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "campaignId" uuid NOT NULL, "email" character varying NOT NULL, "name" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fcc453b914b4cba856a344af880" UNIQUE ("campaignId", "email"), CONSTRAINT "PK_de8fc5a9c364568f294798fe1e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_de8fc5a9c364568f294798fe1e" ON "recipient"."recipients" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5bbab1e50e1783c9768c0d1f8e" ON "recipient"."recipients" ("campaignId") `);
        await queryRunner.query(`CREATE INDEX "IDX_82c22e60c6731311abcd532221" ON "recipient"."recipients" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "recipient"."IDX_82c22e60c6731311abcd532221"`);
        await queryRunner.query(`DROP INDEX "recipient"."IDX_5bbab1e50e1783c9768c0d1f8e"`);
        await queryRunner.query(`DROP INDEX "recipient"."IDX_de8fc5a9c364568f294798fe1e"`);
        await queryRunner.query(`DROP TABLE "recipient"."recipients"`);
    }

}
