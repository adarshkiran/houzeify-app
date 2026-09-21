ALTER TABLE "daily_progress" ADD COLUMN "visibility" text DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD COLUMN "published_by" text;--> statement-breakpoint
ALTER TABLE "project_documents" ADD COLUMN "visibility" text DEFAULT 'internal' NOT NULL;--> statement-breakpoint
CREATE TABLE "project_customers" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"invited_by" text NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"removed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_customers" ADD CONSTRAINT "project_customers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_customers" ADD CONSTRAINT "project_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_customers" ADD CONSTRAINT "project_customers_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_customers_project_id_unique" ON "project_customers" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_customers_user_id_idx" ON "project_customers" USING btree ("user_id");
