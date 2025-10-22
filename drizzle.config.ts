import { schemaPath } from "@listee/db";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.POSTGRES_URL;

if (databaseUrl === undefined || databaseUrl.length === 0) {
  throw new Error("POSTGRES_URL is not set.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: schemaPath,
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
