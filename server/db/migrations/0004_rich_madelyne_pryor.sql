ALTER TABLE "projects" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "timeline_start" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "timeline_completion" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_organization_id_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "projects_organization_id_updated_at_idx" ON "projects" USING btree ("organization_id","updated_at");