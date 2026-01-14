import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignsTableCreation1768397574389 implements MigrationInterface {
    name = 'CampaignsTableCreation1768397574389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "campaign"."campaigns_status_enum" AS ENUM('DRAFT', 'READY', 'SENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "campaign"."campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying NOT NULL, "subject" character varying NOT NULL, "bodyHtml" text NOT NULL, "bodyText" text NOT NULL, "senderEmail" character varying NOT NULL, "status" "campaign"."campaigns_status_enum" NOT NULL DEFAULT 'DRAFT', "totalRecipients" integer NOT NULL DEFAULT '0', "sentCount" integer NOT NULL DEFAULT '0', "failedCount" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_831e3fcd4fc45b4e4c3f57a9ee" ON "campaign"."campaigns" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b6c738ef1561082d235dfc20b4" ON "campaign"."campaigns" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b6b94352da69af03dbaf87c63" ON "campaign"."campaigns" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "campaign"."IDX_8b6b94352da69af03dbaf87c63"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_b6c738ef1561082d235dfc20b4"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_831e3fcd4fc45b4e4c3f57a9ee"`);
        await queryRunner.query(`DROP TABLE "campaign"."campaigns"`);
        await queryRunner.query(`DROP TYPE "campaign"."campaigns_status_enum"`);
    }

}
