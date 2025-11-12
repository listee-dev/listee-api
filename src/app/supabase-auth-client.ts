import {
  createSupabaseAuthClient,
  type SupabaseAuthClient,
} from "@listee/auth";
import { getEnv } from "@/app/env";

let cachedClient: SupabaseAuthClient | null = null;

export const getSupabaseAuthClient = (): SupabaseAuthClient => {
  if (cachedClient !== null) {
    return cachedClient;
  }

  const env = getEnv();
  cachedClient = createSupabaseAuthClient({
    projectUrl: env.SUPABASE_URL,
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
  });
  return cachedClient;
};
