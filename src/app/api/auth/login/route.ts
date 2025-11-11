import { SupabaseAuthError } from "@listee/auth";

import {
  ApiError,
  handleRoute,
  parseJsonBody,
  respondWithData,
} from "@/app/api/auth/utils";
import { loginSchema } from "@/app/api/auth/validation";
import { getSupabaseAuthClient } from "@/app/supabase-auth-client";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, loginSchema);
    try {
      const authClient = getSupabaseAuthClient();
      const tokenResponse = await authClient.login(input);
      return respondWithData(tokenResponse, 200);
    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        throw new ApiError(error.statusCode, error.message);
      }
      throw error;
    }
  });
}
