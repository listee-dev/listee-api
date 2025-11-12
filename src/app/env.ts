import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const urlString = z.url();
const nonEmptyString = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), {
    message: "Value must not include leading or trailing whitespace.",
  });
const optionalNonEmptyString = nonEmptyString.optional();

const buildEnv = () => {
  return createEnv({
    server: {
      POSTGRES_URL: urlString,
      SUPABASE_URL: urlString,
      SUPABASE_PUBLISHABLE_KEY: nonEmptyString,
      SUPABASE_JWT_AUDIENCE: optionalNonEmptyString,
      SUPABASE_JWT_REQUIRED_ROLE: optionalNonEmptyString,
      SUPABASE_JWT_ISSUER: urlString.optional(),
      SUPABASE_JWKS_PATH: optionalNonEmptyString,
      SUPABASE_JWT_CLOCK_TOLERANCE_SECONDS: z.coerce
        .number()
        .int()
        .min(0, {
          message:
            "SUPABASE_JWT_CLOCK_TOLERANCE_SECONDS must be a non-negative integer.",
        })
        .optional(),
    },
    client: {},
    experimental__runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });
};

export type AppEnv = ReturnType<typeof buildEnv>;

let cachedEnv: AppEnv | null = null;

export const getEnv = (): AppEnv => {
  if (cachedEnv === null) {
    cachedEnv = buildEnv();
  }
  return cachedEnv;
};

export const resetEnvCache = (): void => {
  cachedEnv = null;
};
