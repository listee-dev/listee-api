import { z } from "zod";

import {
  ApiError,
  handleRoute,
  parseJsonBody,
  respondWithData,
} from "@/app/api/auth/utils";
import {
  SupabaseRequestError,
  supabaseRefreshToken,
} from "@/services/supabase-auth";

const tokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "refreshToken must not be empty.")
    .refine((value) => value === value.trim(), {
      message: "refreshToken must not include leading or trailing whitespace.",
    }),
});

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, tokenSchema);
    try {
      const tokenResponse = await supabaseRefreshToken(input);
      return respondWithData(tokenResponse, 200);
    } catch (error) {
      if (error instanceof SupabaseRequestError) {
        throw new ApiError(error.statusCode, error.message);
      }
      throw error;
    }
  });
}
