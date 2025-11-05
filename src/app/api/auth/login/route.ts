import { z } from "zod";

import {
  ApiError,
  handleRoute,
  parseJsonBody,
  respondWithData,
} from "@/app/api/auth/utils";
import { SupabaseRequestError, supabaseLogin } from "@/services/supabase-auth";

const loginSchema = z.object({
  email: z.string().trim().email("Email must be a valid email address."),
  password: z
    .string()
    .min(1, "Password must not be empty.")
    .refine((value) => value === value.trim(), {
      message: "Password must not include leading or trailing whitespace.",
    }),
});

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, loginSchema);
    try {
      const tokenResponse = await supabaseLogin(input);
      return respondWithData(tokenResponse, 200);
    } catch (error) {
      if (error instanceof SupabaseRequestError) {
        throw new ApiError(error.statusCode, error.message);
      }
      throw error;
    }
  });
}
