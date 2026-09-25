-- S24 Plan Analyzer foundation — persisted analysis rows linked to project documents.
-- No OCR/vision engine in this migration — status may be 'unavailable' honestly.

CREATE TABLE IF NOT EXISTS "plan_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"source_document_id" text NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"engine_message" text,
	"extracted_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_analyses" ADD CONSTRAINT "plan_analyses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_analyses" ADD CONSTRAINT "plan_analyses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_analyses" ADD CONSTRAINT "plan_analyses_source_document_id_project_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."project_documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_analyses" ADD CONSTRAINT "plan_analyses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plan_analyses_project_id_idx" ON "plan_analyses" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plan_analyses_project_id_status_idx" ON "plan_analyses" USING btree ("project_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plan_analyses_source_document_id_idx" ON "plan_analyses" USING btree ("source_document_id");
