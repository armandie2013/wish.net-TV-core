import {
  getStreamingNodesController,
  createStreamingNodeController,
} from "@/controllers/streaming.controller";

export async function GET(request: Request) {
  return getStreamingNodesController(request);
}

export async function POST(request: Request) {
  return createStreamingNodeController(request);
}