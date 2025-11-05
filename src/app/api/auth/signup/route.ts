import { z } from "zod";

import {
  ApiError,
  handleRoute,
  parseJsonBody,
  respondWithData,
} from "@/app/api/auth/utils";
import { SupabaseRequestError, supabaseSignup } from "@/services/supabase-auth";

const signupSchema = z.object({
  email: z.string().trim().email("Email must be a valid email address."),
  password: z
    .string()
    .min(1, "Password must not be empty.")
    .refine((value) => value === value.trim(), {
      message: "Password must not include leading or trailing whitespace.",
    }),
  redirectUrl: z.string().trim().url().optional(),
});

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, signupSchema);
    try {
      await supabaseSignup(input);
    } catch (error) {
      if (error instanceof SupabaseRequestError) {
        throw new ApiError(error.statusCode, error.message);
      }
      throw error;
    }
    return respondWithData(null, 200);
  });
}
