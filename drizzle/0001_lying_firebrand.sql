CREATE INDEX "idx_categories_created_by" ON "categories" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_categories_updated_by" ON "categories" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "idx_profiles_default_category_id" ON "profiles" USING btree ("default_category_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_category_id" ON "tasks" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_created_by" ON "tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_tasks_updated_by" ON "tasks" USING btree ("updated_by");