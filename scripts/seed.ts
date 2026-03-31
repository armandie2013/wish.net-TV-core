import "dotenv/config";
import { createInitialAdmin } from "../src/services/auth.service";

async function run() {
  try {
    const admin = await createInitialAdmin();
    console.log("Admin listo:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error al crear el admin:", error);
    process.exit(1);
  }
}

run();