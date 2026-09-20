CREATE TABLE "construction_issues" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"stage" text,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text,
	"assignee_id" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"created_by" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"stage" text,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text,
	"assignee_id" text,
	"due_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "construction_issues" ADD CONSTRAINT "construction_issues_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_issues" ADD CONSTRAINT "construction_issues_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_issues" ADD CONSTRAINT "construction_issues_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_tasks" ADD CONSTRAINT "construction_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_tasks" ADD CONSTRAINT "construction_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction_tasks" ADD CONSTRAINT "construction_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "construction_issues_project_id_idx" ON "construction_issues" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "construction_issues_project_id_status_idx" ON "construction_issues" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "construction_tasks_project_id_idx" ON "construction_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "construction_tasks_project_id_status_idx" ON "construction_tasks" USING btree ("project_id","status");