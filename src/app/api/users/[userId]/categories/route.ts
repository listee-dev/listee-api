import { dispatchToListeeApi } from "@/app/api/handler";

export async function GET(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}

export async function POST(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}
