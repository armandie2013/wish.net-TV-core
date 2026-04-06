import {
  getChannelByIdController,
  updateChannelController,
} from "@/controllers/channel.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getChannelByIdController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return updateChannelController(request, context);
}