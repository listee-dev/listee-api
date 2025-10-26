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
import { createHeaderAuthentication } from "@listee/auth";
import { getDb } from "@listee/db";

const API_PREFIX = "/api";

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
const authentication = createHeaderAuthentication();

const honoFetchHandler = createFetchHandler({
  databaseHealth,
  categoryQueries,
  taskQueries,
  authentication,
});

export const dispatchToListeeApi = async (
  request: Request,
): Promise<Response> => {
  const originalUrl = new URL(request.url);
  const targetUrl = new URL(request.url);
  targetUrl.pathname = stripApiPrefix(originalUrl.pathname);

  const honoRequest = new Request(targetUrl, request);
  return await honoFetchHandler(honoRequest);
};
