import { schemaPath } from "@listee/db";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { ZodError } from "zod";
import { getEnv } from "./src/app/env";

loadEnvConfig(process.cwd());

const databaseUrl = (() => {
  try {
    return getEnv().POSTGRES_URL;
  } catch (error) {
    if (error instanceof ZodError) {
      const issue = error.issues.find((entry) => {
        return entry.path.join(".") === "POSTGRES_URL";
      });
      if (issue !== undefined) {
        if (issue.code === "invalid_type") {
          throw new Error("POSTGRES_URL is not set.");
        }
        throw new Error(issue.message);
      }
    }
    throw error;
  }
})();

export default defineConfig({
  dialect: "postgresql",
  schema: schemaPath,
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
