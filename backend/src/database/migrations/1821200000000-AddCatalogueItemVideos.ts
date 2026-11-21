import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Optional product/service video URLs, uploaded through the existing uploads
 * endpoint and saved with the catalogue item.
 */
export class AddCatalogueItemVideos1821200000000 implements MigrationInterface {
  name = 'AddCatalogueItemVideos1821200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "catalogue_items" ADD COLUMN IF NOT EXISTS "videos" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "catalogue_items" DROP COLUMN IF EXISTS "videos"`,
    );
  }
}
