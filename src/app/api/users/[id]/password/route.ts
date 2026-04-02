// import { resetUserPasswordController } from "@/controllers/user.controller";

// export async function POST(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   return resetUserPasswordController(request, context);
// }

import { resetUserPasswordController } from "@/controllers/user.controller";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return resetUserPasswordController(request, context);
}