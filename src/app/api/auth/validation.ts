import { z } from "zod";

const trimmedNonEmpty = (label: string) =>
  z
    .string()
    .min(1, `${label} must not be empty.`)
    .refine((value) => value === value.trim(), {
      message: `${label} must not include leading or trailing whitespace.`,
    });

export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email("Email must be a valid email address."));

export const passwordSchema = trimmedNonEmpty("Password");

export const refreshTokenSchema = trimmedNonEmpty("refreshToken");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = loginSchema.extend({
  redirectUrl: z
    .string()
    .trim()
    .pipe(z.url("redirectUrl must be a valid URL."))
    .optional(),
});

export const tokenSchema = z.object({
  refreshToken: refreshTokenSchema,
});
