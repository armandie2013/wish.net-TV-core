import {
  getM3uSourcesController,
  createM3uSourceController,
} from "@/controllers/m3u-source.controller";

export async function GET(request: Request) {
  return getM3uSourcesController(request);
}

export async function POST(request: Request) {
  return createM3uSourceController(request);
}