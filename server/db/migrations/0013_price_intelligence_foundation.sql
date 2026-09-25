-- S26 Price Intelligence foundation — extend organization_rate_entries for
-- project/location/source metadata. Does not seed market or AI rates.

ALTER TABLE "organization_rate_entries" ADD COLUMN IF NOT EXISTS "project_id" text;
--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD COLUMN IF NOT EXISTS "location" text;
--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD COLUMN IF NOT EXISTS "source_type" text DEFAULT 'organization_price_book' NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD COLUMN IF NOT EXISTS "source_reference" text;
--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'INR' NOT NULL;
--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD COLUMN IF NOT EXISTS "confidence" text;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_rate_entries" ADD CONSTRAINT "organization_rate_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_rate_entries_org_name_unit_idx" ON "organization_rate_entries" USING btree ("organization_id","name","unit");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_rate_entries_project_id_idx" ON "organization_rate_entries" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_rate_entries_org_source_idx" ON "organization_rate_entries" USING btree ("organization_id","source_type");
