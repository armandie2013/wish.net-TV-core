import {
  getGeneralSettingsController,
  updateGeneralSettingsController,
} from "@/controllers/general-settings.controller";

export async function GET(request: Request) {
  return getGeneralSettingsController(request);
}

export async function POST(request: Request) {
  return updateGeneralSettingsController(request);
}