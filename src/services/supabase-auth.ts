import { getEnv } from "@/app/env";

export type SupabaseTokenResponse = {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly token_type: string;
  readonly expires_in: number;
};

export class SupabaseRequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isSupabaseTokenResponse = (
  value: unknown,
): value is SupabaseTokenResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.access_token) &&
    isString(value.refresh_token) &&
    isString(value.token_type) &&
    isNumber(value.expires_in)
  );
};

const readPayload = async (response: Response): Promise<unknown> => {
  const raw = await response.text();
  if (raw.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse response.";
    throw new SupabaseRequestError(502, message);
  }
};

const formatSupabaseError = (payload: unknown, fallback: string): string => {
  if (isRecord(payload)) {
    const candidates = [
      payload.error,
      payload.error_description,
      payload.message,
      payload.msg,
    ];
    for (const candidate of candidates) {
      if (isString(candidate) && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
  }

  return fallback;
};

const requestSupabase = async (
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> => {
  const env = getEnv();
  const base = new URL(env.SUPABASE_URL);
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(targetPath, base);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await readPayload(response);
  if (!response.ok) {
    const message = formatSupabaseError(
      payload,
      `Supabase request failed with status ${response.status}`,
    );
    throw new SupabaseRequestError(response.status, message);
  }

  return payload;
};

const extractTokenResponse = (payload: unknown): SupabaseTokenResponse => {
  if (isSupabaseTokenResponse(payload)) {
    return payload;
  }

  if (isRecord(payload)) {
    const nested = payload.data;
    if (isSupabaseTokenResponse(nested)) {
      return nested;
    }
  }

  throw new SupabaseRequestError(
    502,
    "Supabase response did not include token details.",
  );
};

export type SignupParams = {
  readonly email: string;
  readonly password: string;
  readonly redirectUrl?: string;
};

export const supabaseSignup = async (params: SignupParams): Promise<void> => {
  const path =
    params.redirectUrl === undefined
      ? "/auth/v1/signup"
      : `/auth/v1/signup?redirect_to=${encodeURIComponent(params.redirectUrl)}`;
  await requestSupabase(path, {
    email: params.email,
    password: params.password,
  });
};

export type LoginParams = {
  readonly email: string;
  readonly password: string;
};

export const supabaseLogin = async (
  params: LoginParams,
): Promise<SupabaseTokenResponse> => {
  const payload = await requestSupabase("/auth/v1/token?grant_type=password", {
    email: params.email,
    password: params.password,
  });
  return extractTokenResponse(payload);
};

export type RefreshTokenParams = {
  readonly refreshToken: string;
};

export const supabaseRefreshToken = async (
  params: RefreshTokenParams,
): Promise<SupabaseTokenResponse> => {
  const payload = await requestSupabase(
    "/auth/v1/token?grant_type=refresh_token",
    {
      refresh_token: params.refreshToken,
    },
  );
  return extractTokenResponse(payload);
};
