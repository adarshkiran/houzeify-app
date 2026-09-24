CREATE TABLE "estimates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"customer_user_id" text,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"pricing_method" text NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"location" text,
	"area_sqft" integer,
	"current_version_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimate_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"estimate_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimate_items" (
	"id" text PRIMARY KEY NOT NULL,
	"estimate_version_id" text NOT NULL,
	"category" text,
	"name" text NOT NULL,
	"description" text,
	"quantity_milli" bigint,
	"unit" text,
	"rate_paise" bigint,
	"amount_paise" bigint,
	"rate_source" text,
	"effective_date" text,
	"confidence" text,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_rate_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"rate_paise" bigint NOT NULL,
	"effective_from" text NOT NULL,
	"effective_to" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_customer_user_id_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_versions" ADD CONSTRAINT "estimate_versions_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_versions" ADD CONSTRAINT "estimate_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_version_id_estimate_versions_id_fk" FOREIGN KEY ("estimate_version_id") REFERENCES "public"."estimate_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD CONSTRAINT "organization_rate_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_rate_entries" ADD CONSTRAINT "organization_rate_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "estimates_project_id_idx" ON "estimates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "estimates_organization_id_idx" ON "estimates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "estimates_project_id_updated_at_idx" ON "estimates" USING btree ("project_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "estimate_versions_estimate_id_version_unique" ON "estimate_versions" USING btree ("estimate_id","version_number");--> statement-breakpoint
CREATE INDEX "estimate_versions_estimate_id_idx" ON "estimate_versions" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "estimate_items_estimate_version_id_idx" ON "estimate_items" USING btree ("estimate_version_id");--> statement-breakpoint
CREATE INDEX "organization_rate_entries_org_id_idx" ON "organization_rate_entries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_rate_entries_org_name_idx" ON "organization_rate_entries" USING btree ("organization_id","name");
