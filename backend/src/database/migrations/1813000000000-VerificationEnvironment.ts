import { MigrationInterface, QueryRunner } from 'typeorm';

/** Record whether a verification outcome came from bytID's sandbox or live key. */
export class VerificationEnvironment1813000000000 implements MigrationInterface {
  name = 'VerificationEnvironment1813000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "verification_checks"
        ADD COLUMN IF NOT EXISTS "environment" varchar(10)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "verification_checks"
        DROP COLUMN IF EXISTS "environment"
    `);
  }
}
