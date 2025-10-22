CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"default_category_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_checked" boolean DEFAULT false NOT NULL,
	"category_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_system_name_idx" ON "categories" USING btree ("created_by","name") WHERE "categories"."kind" = 'system';--> statement-breakpoint
CREATE POLICY "Users can view their categories" ON "categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("categories"."created_by" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can insert categories" ON "categories" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("categories"."created_by" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can update their categories" ON "categories" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("categories"."created_by" = (select auth.uid())) WITH CHECK ("categories"."created_by" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can delete their categories" ON "categories" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("categories"."created_by" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can view their profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can insert their profile" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can update their profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("profiles"."id" = (select auth.uid())) WITH CHECK ("profiles"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can view their tasks" ON "tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
      "tasks"."created_by" = (select auth.uid())
      OR EXISTS (
        SELECT 1
        FROM "categories"
        WHERE "categories"."id" = "tasks"."category_id"
        AND "categories"."created_by" = (select auth.uid())
      )
    );--> statement-breakpoint
CREATE POLICY "Users can insert tasks in their categories" ON "tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
      "tasks"."created_by" = (select auth.uid())
      OR EXISTS (
        SELECT 1
        FROM "categories"
        WHERE "categories"."id" = "tasks"."category_id"
        AND "categories"."created_by" = (select auth.uid())
      )
    );--> statement-breakpoint
CREATE POLICY "Users can update their tasks" ON "tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
      "tasks"."created_by" = (select auth.uid())
      OR EXISTS (
        SELECT 1
        FROM "categories"
        WHERE "categories"."id" = "tasks"."category_id"
        AND "categories"."created_by" = (select auth.uid())
      )
    ) WITH CHECK (
      "tasks"."created_by" = (select auth.uid())
      OR EXISTS (
        SELECT 1
        FROM "categories"
        WHERE "categories"."id" = "tasks"."category_id"
        AND "categories"."created_by" = (select auth.uid())
      )
    );--> statement-breakpoint
CREATE POLICY "Users can delete their tasks" ON "tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
      "tasks"."created_by" = (select auth.uid())
      OR EXISTS (
        SELECT 1
        FROM "categories"
        WHERE "categories"."id" = "tasks"."category_id"
        AND "categories"."created_by" = (select auth.uid())
      )
    );