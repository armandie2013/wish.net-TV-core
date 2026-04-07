import { getChannelStreamRedirectController } from "@/controllers/app.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getChannelStreamRedirectController(request, context);
}