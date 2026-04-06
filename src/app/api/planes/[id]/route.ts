import {
  getPlanByIdController,
  updatePlanController,
} from "@/controllers/plan.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getPlanByIdController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return updatePlanController(request, context);
}