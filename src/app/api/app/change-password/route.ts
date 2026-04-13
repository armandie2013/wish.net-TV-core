import { appChangePasswordController } from "@/controllers/app.controller";

export async function POST(request: Request) {
  return appChangePasswordController(request);
}