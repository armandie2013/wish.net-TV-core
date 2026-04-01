import { changeOwnPasswordController } from "@/controllers/auth.controller";

export async function POST(request: Request) {
  return changeOwnPasswordController(request);
}