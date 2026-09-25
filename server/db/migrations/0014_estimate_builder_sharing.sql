-- S27 Estimate Builder + customer sharing foundation.
-- Adds shared_version_id (version pinned for customer view) and
-- source_reference on estimate_items for S26 rate snapshot fidelity.
-- Does NOT create BOQ tables or lock/final workflows.

ALTER TABLE "estimates" ADD COLUMN IF NOT EXISTS "shared_version_id" text;
--> statement-breakpoint
ALTER TABLE "estimate_items" ADD COLUMN IF NOT EXISTS "source_reference" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimates_shared_version_id_idx" ON "estimates" USING btree ("shared_version_id");
