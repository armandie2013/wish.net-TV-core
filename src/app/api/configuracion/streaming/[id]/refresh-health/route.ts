import { refreshStreamingNodeHealthController } from "@/controllers/streaming.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return refreshStreamingNodeHealthController(request, context);
}