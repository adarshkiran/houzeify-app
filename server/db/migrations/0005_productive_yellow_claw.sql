CREATE TABLE "daily_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"created_by" text NOT NULL,
	"date" text NOT NULL,
	"stage" text,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_progress_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"daily_progress_id" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" text NOT NULL,
	"storage_ref" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress_photos" ADD CONSTRAINT "daily_progress_photos_daily_progress_id_daily_progress_id_fk" FOREIGN KEY ("daily_progress_id") REFERENCES "public"."daily_progress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress_photos" ADD CONSTRAINT "daily_progress_photos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_progress_project_id_idx" ON "daily_progress" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "daily_progress_project_id_date_idx" ON "daily_progress" USING btree ("project_id","date");--> statement-breakpoint
CREATE INDEX "daily_progress_photos_daily_progress_id_idx" ON "daily_progress_photos" USING btree ("daily_progress_id");