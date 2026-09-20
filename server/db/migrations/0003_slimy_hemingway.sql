CREATE TABLE "house_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"building_type" text NOT NULL,
	"plot_area" integer,
	"plot_dimensions" text,
	"site_conditions" text,
	"built_up_area" integer NOT NULL,
	"floors" text NOT NULL,
	"bhk" text,
	"bedrooms" integer,
	"bathrooms" integer,
	"has_living_room" boolean DEFAULT true NOT NULL,
	"has_dining_area" boolean DEFAULT true NOT NULL,
	"has_kitchen" boolean DEFAULT true NOT NULL,
	"has_utility_area" boolean DEFAULT false NOT NULL,
	"has_balcony" boolean DEFAULT false NOT NULL,
	"has_staircase" boolean DEFAULT false NOT NULL,
	"has_terrace" boolean DEFAULT false NOT NULL,
	"parking" integer,
	"finish_level" text NOT NULL,
	"special_requirements" text[],
	"budget_expected" integer,
	"budget_min" integer,
	"budget_max" integer,
	"timeline_start" text,
	"timeline_completion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "house_requirements" ADD CONSTRAINT "house_requirements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "house_requirements_project_id_unique" ON "house_requirements" USING btree ("project_id");