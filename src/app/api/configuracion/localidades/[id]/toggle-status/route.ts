import { toggleLocationStatusController } from "@/controllers/location.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return toggleLocationStatusController(request, context);
}