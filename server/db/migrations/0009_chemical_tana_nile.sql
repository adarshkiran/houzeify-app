CREATE TABLE "boq_items" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"section_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"stage" text,
	"quantity_milli" bigint NOT NULL,
	"unit" text NOT NULL,
	"rate_paise" bigint NOT NULL,
	"amount_paise" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boq_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_section_id_boq_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."boq_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_sections" ADD CONSTRAINT "boq_sections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_sections" ADD CONSTRAINT "boq_sections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "boq_items_project_id_idx" ON "boq_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "boq_items_section_id_idx" ON "boq_items" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "boq_sections_project_id_idx" ON "boq_sections" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "boq_sections_project_id_name_unique" ON "boq_sections" USING btree ("project_id",lower("name"));