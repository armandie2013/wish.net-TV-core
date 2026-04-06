import { getLiveController } from "@/controllers/app.controller";

export async function GET(request: Request) {
  return getLiveController(request);
}