import { deleteChannelController } from "@/controllers/channel.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return deleteChannelController(request, context);
}