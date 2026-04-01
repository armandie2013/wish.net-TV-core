import { toggleUserStatusController } from "@/controllers/user.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return toggleUserStatusController(request, context);
}