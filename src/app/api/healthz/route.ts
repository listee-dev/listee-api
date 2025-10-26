import { dispatchToListeeApi } from "../handler";

export async function GET(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}

export async function HEAD(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}
