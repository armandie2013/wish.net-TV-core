import { importM3uSourceNowController } from "@/controllers/m3u-source.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return importM3uSourceNowController(request, context);
}