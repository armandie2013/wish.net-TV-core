import { toggleChannelStatusController } from "@/controllers/channel.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return toggleChannelStatusController(request, context);
}