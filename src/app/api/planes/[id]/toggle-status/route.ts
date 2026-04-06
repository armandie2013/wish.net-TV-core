import { togglePlanStatusController } from "@/controllers/plan.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return togglePlanStatusController(request, context);
}