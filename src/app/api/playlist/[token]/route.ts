import { getPlaylistByTokenController } from "@/controllers/playlist.controller";

export async function GET(
  request: Request,
  context: { params: { token: string } }
) {
  return getPlaylistByTokenController(request, context);
}