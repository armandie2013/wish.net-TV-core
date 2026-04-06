import {
  getLocationsController,
  createLocationController,
} from "@/controllers/location.controller";

export async function GET(request: Request) {
  return getLocationsController(request);
}

export async function POST(request: Request) {
  return createLocationController(request);
}