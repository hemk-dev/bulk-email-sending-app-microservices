import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQueueCampaign1768422705325 implements MigrationInterface {
    name = 'AddQueueCampaign1768422705325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "campaign"."email_logs_status_enum" AS ENUM('PENDING', 'SENT', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "campaign"."email_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jobId" character varying NOT NULL, "campaignId" uuid NOT NULL, "recipientId" uuid NOT NULL, "recipientEmail" character varying NOT NULL, "status" "campaign"."email_logs_status_enum" NOT NULL DEFAULT 'PENDING', "error" text, "attempts" integer NOT NULL DEFAULT '0', "sentAt" TIMESTAMP, "failedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_999382218924e953a790d340571" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_999382218924e953a790d34057" ON "campaign"."email_logs" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a4b188548727a9c712af2eaee" ON "campaign"."email_logs" ("jobId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c390a1aecaf07a63c986f4f34" ON "campaign"."email_logs" ("campaignId") `);
        await queryRunner.query(`CREATE INDEX "IDX_023d7ba201fd33ac2cccce99c4" ON "campaign"."email_logs" ("recipientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_23826d0c5be7cadcd5eeb88708" ON "campaign"."email_logs" ("status") `);
        await queryRunner.query(`CREATE TABLE "campaign"."campaign_sender_cache" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "senderId" uuid NOT NULL, "userId" uuid NOT NULL, "fromEmail" character varying NOT NULL, "name" character varying NOT NULL, "smtpHost" character varying NOT NULL, "smtpPort" integer NOT NULL, "smtpUser" character varying NOT NULL, "smtpPassword" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "lastSyncedAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_589b82fe8dec02ce1a2d377f4b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_589b82fe8dec02ce1a2d377f4b" ON "campaign"."campaign_sender_cache" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_907413a0231f20c3cc55de50b3" ON "campaign"."campaign_sender_cache" ("senderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d811f8fd0b4f0b6f8fad65825a" ON "campaign"."campaign_sender_cache" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_da8dfd08839022719f14859d34" ON "campaign"."campaign_sender_cache" ("fromEmail") `);
        await queryRunner.query(`CREATE TABLE "campaign"."campaign_recipients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "campaignId" uuid NOT NULL, "email" character varying NOT NULL, "name" character varying, "metadata" jsonb, "lastSyncedAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30d346f6af084aa7b916945a4f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_30d346f6af084aa7b916945a4f" ON "campaign"."campaign_recipients" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e9c3dcf81739170d74e9265e1" ON "campaign"."campaign_recipients" ("campaignId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd1c7a0260c46906e79fc86068" ON "campaign"."campaign_recipients" ("email") `);
        await queryRunner.query(`ALTER TYPE "campaign"."campaigns_status_enum" RENAME TO "campaigns_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "campaign"."campaigns_status_enum" AS ENUM('DRAFT', 'READY', 'QUEUED', 'SENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "campaign"."campaigns" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "campaign"."campaigns" ALTER COLUMN "status" TYPE "campaign"."campaigns_status_enum" USING "status"::"text"::"campaign"."campaigns_status_enum"`);
        await queryRunner.query(`ALTER TABLE "campaign"."campaigns" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "campaign"."campaigns_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "campaign"."campaigns_status_enum_old" AS ENUM('DRAFT', 'READY', 'SENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "campaign"."campaigns" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "campaign"."campaigns" ALTER COLUMN "status" TYPE "campaign"."campaigns_status_enum_old" USING "status"::"text"::"campaign"."campaigns_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "campaign"."campaigns" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "campaign"."campaigns_status_enum"`);
        await queryRunner.query(`ALTER TYPE "campaign"."campaigns_status_enum_old" RENAME TO "campaigns_status_enum"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_cd1c7a0260c46906e79fc86068"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_3e9c3dcf81739170d74e9265e1"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_30d346f6af084aa7b916945a4f"`);
        await queryRunner.query(`DROP TABLE "campaign"."campaign_recipients"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_da8dfd08839022719f14859d34"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_d811f8fd0b4f0b6f8fad65825a"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_907413a0231f20c3cc55de50b3"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_589b82fe8dec02ce1a2d377f4b"`);
        await queryRunner.query(`DROP TABLE "campaign"."campaign_sender_cache"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_23826d0c5be7cadcd5eeb88708"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_023d7ba201fd33ac2cccce99c4"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_1c390a1aecaf07a63c986f4f34"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_7a4b188548727a9c712af2eaee"`);
        await queryRunner.query(`DROP INDEX "campaign"."IDX_999382218924e953a790d34057"`);
        await queryRunner.query(`DROP TABLE "campaign"."email_logs"`);
        await queryRunner.query(`DROP TYPE "campaign"."email_logs_status_enum"`);
    }

}
