CREATE TABLE "project_workforce_members" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"added_by" text NOT NULL,
	"removed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_workforce_members" ADD CONSTRAINT "project_workforce_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_workforce_members" ADD CONSTRAINT "project_workforce_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_workforce_members" ADD CONSTRAINT "project_workforce_members_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_workforce_members_project_id_idx" ON "project_workforce_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_workforce_members_project_id_status_idx" ON "project_workforce_members" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_workforce_members_active_unique" ON "project_workforce_members" USING btree ("project_id","user_id") WHERE "project_workforce_members"."status" = 'active';