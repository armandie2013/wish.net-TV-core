import { meController } from "@/controllers/auth.controller";

export async function GET(request: Request) {
  return meController(request);
}