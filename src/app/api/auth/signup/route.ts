import { SupabaseAuthError } from "@listee/auth";

import {
  ApiError,
  handleRoute,
  parseJsonBody,
  respondWithData,
} from "@/app/api/auth/utils";
import { signupSchema } from "@/app/api/auth/validation";
import { getSupabaseAuthClient } from "@/app/supabase-auth-client";

export async function POST(request: Request): Promise<Response> {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, signupSchema);
    try {
      const authClient = getSupabaseAuthClient();
      await authClient.signup(input);
    } catch (error) {
      if (error instanceof SupabaseAuthError) {
        throw new ApiError(error.statusCode, error.message);
      }
      throw error;
    }
    return respondWithData(null, 200);
  });
}
