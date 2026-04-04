// import {
//   getUsersController,
//   createUserController,
// } from "@/controllers/user.controller";

// export async function GET() {
//   return getUsersController();
// }

// export async function POST(request: Request) {
//   return createUserController(request);
// }

import {
  getUsersController,
  createUserController,
} from "@/controllers/user.controller";

export async function GET(request: Request) {
  return getUsersController(request);
}

export async function POST(request: Request) {
  return createUserController(request);
}