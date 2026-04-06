import {
  getM3uSourceByIdController,
  updateM3uSourceController,
} from "@/controllers/m3u-source.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getM3uSourceByIdController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return updateM3uSourceController(request, context);
}