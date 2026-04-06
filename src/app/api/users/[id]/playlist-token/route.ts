import {
  ensureUserPlaylistTokenController,
  regenerateUserPlaylistTokenController,
} from "@/controllers/user-playlist.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return ensureUserPlaylistTokenController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return regenerateUserPlaylistTokenController(request, context);
}