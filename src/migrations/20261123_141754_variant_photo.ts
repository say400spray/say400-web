import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" ADD COLUMN "photo_id" integer;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_variants_photo_idx" ON "products_variants" USING btree ("photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" DROP CONSTRAINT "products_variants_photo_id_media_id_fk";
  
  DROP INDEX "products_variants_photo_idx";
  ALTER TABLE "products_variants" DROP COLUMN "photo_id";`)
}
