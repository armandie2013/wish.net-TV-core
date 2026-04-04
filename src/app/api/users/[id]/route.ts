// import {
//   getUserByIdController,
//   updateUserController,
// } from "@/controllers/user.controller";

// export async function GET(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   return getUserByIdController(request, context);
// }

// export async function POST(
//   request: Request,
//   context: { params: { id: string } }
// ) {
//   return updateUserController(request, context);
// }

import {
  getUserByIdController,
  updateUserController,
} from "@/controllers/user.controller";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return getUserByIdController(request, context);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return updateUserController(request, context);
}