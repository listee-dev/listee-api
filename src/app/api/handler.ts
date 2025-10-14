import { createFetchHandler } from "@listee/api";

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

const honoFetchHandler = createFetchHandler();

export const dispatchToListeeApi = async (
  request: Request,
): Promise<Response> => {
  const originalUrl = new URL(request.url);
  const targetUrl = new URL(request.url);
  targetUrl.pathname = stripApiPrefix(originalUrl.pathname);

  const honoRequest = new Request(targetUrl, request);
  return await honoFetchHandler(honoRequest);
};
