import { MigrationInterface, QueryRunner } from "typeorm";

export class SenderTableCreation1768401519442 implements MigrationInterface {
    name = 'SenderTableCreation1768401519442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sender"."senders_provider_enum" AS ENUM('smtp')`);
        await queryRunner.query(`CREATE TABLE "sender"."senders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying NOT NULL, "fromEmail" character varying NOT NULL, "provider" "sender"."senders_provider_enum" NOT NULL DEFAULT 'smtp', "smtpHost" character varying NOT NULL, "smtpPort" integer NOT NULL, "smtpUser" character varying NOT NULL, "smtpPassword" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_398b8614004a406acf982651b46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_398b8614004a406acf982651b4" ON "sender"."senders" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c2b91ecf27f3c1b215e5a956b8" ON "sender"."senders" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3692ff2dd02289b168d9806473" ON "sender"."senders" ("isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sender"."IDX_3692ff2dd02289b168d9806473"`);
        await queryRunner.query(`DROP INDEX "sender"."IDX_c2b91ecf27f3c1b215e5a956b8"`);
        await queryRunner.query(`DROP INDEX "sender"."IDX_398b8614004a406acf982651b4"`);
        await queryRunner.query(`DROP TABLE "sender"."senders"`);
        await queryRunner.query(`DROP TYPE "sender"."senders_provider_enum"`);
    }

}
