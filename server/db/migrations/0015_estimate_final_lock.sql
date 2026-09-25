-- Post-S27 Slice 1 — Final / Lock estimate lifecycle.
-- Adds locked_at / locked_by. Status 'locked' is app-enforced (text column).
-- Does NOT create BOQ tables.

ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "locked_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "locked_by" text;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimates" ADD CONSTRAINT "estimates_locked_by_users_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
