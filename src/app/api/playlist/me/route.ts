import { getOwnPlaylistController } from "@/controllers/playlist.controller";

export async function GET(request: Request) {
  return getOwnPlaylistController(request);
}