import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailLogsTableChanges1768423782690 implements MigrationInterface {
    name = 'EmailLogsTableChanges1768423782690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ADD "providerMessageId" character varying`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ADD "errorMessage" text`);
        await queryRunner.query(`ALTER TYPE "campaign"."email_logs_status_enum" RENAME TO "email_logs_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "campaign"."email_logs_status_enum" AS ENUM('PENDING', 'SENDING', 'SENT', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ALTER COLUMN "status" TYPE "campaign"."email_logs_status_enum" USING "status"::"text"::"campaign"."email_logs_status_enum"`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "campaign"."email_logs_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ADD CONSTRAINT "UQ_0ffefde0f1eb7cbb8790436f3aa" UNIQUE ("campaignId", "recipientEmail")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" DROP CONSTRAINT "UQ_0ffefde0f1eb7cbb8790436f3aa"`);
        await queryRunner.query(`CREATE TYPE "campaign"."email_logs_status_enum_old" AS ENUM('PENDING', 'SENT', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ALTER COLUMN "status" TYPE "campaign"."email_logs_status_enum_old" USING "status"::"text"::"campaign"."email_logs_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "campaign"."email_logs_status_enum"`);
        await queryRunner.query(`ALTER TYPE "campaign"."email_logs_status_enum_old" RENAME TO "email_logs_status_enum"`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" DROP COLUMN "errorMessage"`);
        await queryRunner.query(`ALTER TABLE "campaign"."email_logs" DROP COLUMN "providerMessageId"`);
    }

}
