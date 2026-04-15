import { getMeController, } from "@/controllers/app.controller";

export async function GET(request: Request) {
  return getMeController(request);
}