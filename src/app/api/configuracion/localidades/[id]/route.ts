import {
  getLocationByIdController,
  updateLocationController,
} from "@/controllers/location.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getLocationByIdController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return updateLocationController(request, context);
}