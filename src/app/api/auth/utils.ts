import type { ZodType } from "zod";

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const message = issue?.message ?? "Invalid request body.";
    throw new ApiError(400, message);
  }

  return result.data;
}

export const respondWithData = <T>(data: T, status = 200): Response => {
  return Response.json({ data }, { status });
};

export const respondWithError = (message: string, status: number): Response => {
  return Response.json({ error: message }, { status });
};

export const handleRoute = async (
  handler: () => Promise<Response>,
): Promise<Response> => {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return respondWithError(error.message, error.statusCode);
    }
    console.error("Unhandled auth route error:", error);
    return respondWithError("Internal server error.", 500);
  }
};
