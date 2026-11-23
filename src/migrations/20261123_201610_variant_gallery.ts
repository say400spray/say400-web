import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ALTER COLUMN "free_samples_sample_label" SET DEFAULT '3 ml bottle';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shop_settings" ALTER COLUMN "free_samples_sample_label" SET DEFAULT '5 ml bottle';`)
}
