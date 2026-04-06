import {
  getChannelsController,
  createChannelController,
} from "@/controllers/channel.controller";

export async function GET(request: Request) {
  return getChannelsController(request);
}

export async function POST(request: Request) {
  return createChannelController(request);
}