import {
  getStreamingNodeByIdController,
  updateStreamingNodeController,
} from "@/controllers/streaming.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getStreamingNodeByIdController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return updateStreamingNodeController(request, context);
}