import {
  createCategoryQueries,
  createCategoryRepository,
  createCategoryService,
  createDatabaseHealthChecker,
  createFetchHandler,
  createTaskQueries,
  createTaskRepository,
  createTaskService,
} from "@listee/api";
import { createSupabaseAuthentication } from "@listee/auth";
import { getDb } from "@listee/db";
import { getEnv } from "../env";

const API_PREFIX = "/api";

let cachedAuthentication: ReturnType<
  typeof createSupabaseAuthentication
> | null = null;

const getAuthentication = (): ReturnType<
  typeof createSupabaseAuthentication
> => {
  if (cachedAuthentication !== null) {
    return cachedAuthentication;
  }

  const appEnv = getEnv();
  const projectUrl = appEnv.SUPABASE_URL;
  const audience = appEnv.SUPABASE_JWT_AUDIENCE;
  const issuer = appEnv.SUPABASE_JWT_ISSUER;
  const requiredRole = appEnv.SUPABASE_JWT_REQUIRED_ROLE;
  const clockTolerance = appEnv.SUPABASE_JWT_CLOCK_TOLERANCE_SECONDS;
  const jwksPath = appEnv.SUPABASE_JWKS_PATH;

  cachedAuthentication = createSupabaseAuthentication({
    projectUrl,
    audience,
    issuer,
    requiredRole,
    clockToleranceSeconds: clockTolerance,
    jwksPath,
  });

  return cachedAuthentication;
};

const stripApiPrefix = (pathname: string): string => {
  if (!pathname.startsWith(API_PREFIX)) {
    return pathname;
  }

  const stripped = pathname.slice(API_PREFIX.length);
  if (stripped.length === 0) {
    return "/";
  }

  return stripped;
};

const database = getDb();
const databaseHealth = createDatabaseHealthChecker(database);
const categoryRepository = createCategoryRepository(database);
const taskRepository = createTaskRepository(database);
const categoryService = createCategoryService({
  repository: categoryRepository,
});
const taskService = createTaskService({
  repository: taskRepository,
});
const categoryQueries = createCategoryQueries({ service: categoryService });
const taskQueries = createTaskQueries({ service: taskService });

const honoFetchHandler = createFetchHandler({
  databaseHealth,
  categoryQueries,
  taskQueries,
  authentication: {
    authenticate: async (context) => {
      const provider = getAuthentication();
      return await provider.authenticate(context);
    },
  },
});

export const dispatchToListeeApi = async (
  request: Request,
): Promise<Response> => {
  try {
    const originalUrl = new URL(request.url);
    const targetUrl = new URL(request.url);
    targetUrl.pathname = stripApiPrefix(originalUrl.pathname);

    const honoRequest = new Request(targetUrl, request);
    return await honoFetchHandler(honoRequest);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while handling the request.";
    console.error("Unhandled Listee API error:", error);
    return Response.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
};
