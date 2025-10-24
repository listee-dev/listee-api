import { dispatchToListeeApi } from "@/app/api/handler";

export async function GET(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}

export async function PATCH(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return await dispatchToListeeApi(request);
}
