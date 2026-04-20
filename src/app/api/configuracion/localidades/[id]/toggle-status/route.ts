import { toggleLocationStatusController } from "@/controllers/location.controller";

export async function POST(req: Request, ctx: any) {
  return toggleLocationStatusController(req, ctx);
}