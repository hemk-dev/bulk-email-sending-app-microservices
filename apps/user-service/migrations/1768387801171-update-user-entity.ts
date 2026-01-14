import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1768387801171 implements MigrationInterface {
    name = 'UpdateUserEntity1768387801171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid-ossp extension for UUID generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`ALTER TABLE "user"."users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "user"."users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user"."users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user"."users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user"."users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a3ffb1c0c8416b9fc6f907b743" ON "user"."users" ("id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "user"."IDX_a3ffb1c0c8416b9fc6f907b743"`);
        await queryRunner.query(`ALTER TABLE "user"."users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "user"."users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "user"."users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user"."users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user"."users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
    }

}
