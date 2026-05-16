import { deleteUserController } from "@/controllers/user.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return deleteUserController(request, context);
}