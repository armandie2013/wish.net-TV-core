import {
  getPlansController,
  createPlanController,
} from "@/controllers/plan.controller";

export async function GET(request: Request) {
  return getPlansController(request);
}

export async function POST(request: Request) {
  return createPlanController(request);
}