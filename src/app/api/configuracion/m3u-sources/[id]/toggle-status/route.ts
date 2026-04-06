import { toggleM3uSourceStatusController } from "@/controllers/m3u-source.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return toggleM3uSourceStatusController(request, context);
}