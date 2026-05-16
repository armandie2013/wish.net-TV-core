import "dotenv/config";
import { createInitialAdmin } from "../src/services/auth.service";

function getArg(flag: string) {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function getBooleanArg(flag: string) {
  const value = getArg(flag);
  if (value === undefined) return undefined;

  return ["true", "1", "si", "sí", "yes"].includes(value.toLowerCase());
}

function parseBooleanEnv(value?: string) {
  if (!value) return undefined;

  return ["true", "1", "si", "sí", "yes"].includes(value.toLowerCase());
}

async function run() {
  try {
    const customEmail = getArg("--email") || process.env.SEED_ADMIN_EMAIL;

    const nombre = getArg("--nombre") || process.env.SEED_ADMIN_NOMBRE;
    const email = customEmail;
    const password = getArg("--password") || process.env.SEED_ADMIN_PASSWORD;
    const localidad =
      getArg("--localidad") || process.env.SEED_ADMIN_LOCALIDAD;
    const conexionesRaw =
      getArg("--conexiones") || process.env.SEED_ADMIN_CONEXIONES;
    const mustChangePassword =
      getBooleanArg("--mustChangePassword") ??
      parseBooleanEnv(process.env.SEED_ADMIN_MUST_CHANGE_PASSWORD);

    const conexionesPermitidas = conexionesRaw
      ? Number(conexionesRaw)
      : undefined;

    const adminsToEnsure = customEmail
      ? [
          {
            nombre,
            email,
            password,
            localidad,
            conexionesPermitidas,
            mustChangePassword,
            isProtected: true,
          },
        ]
      : [
          {
            nombre: "Administrador",
            email: "admin@wishnet.local",
            password: "Admin123456!",
            localidad: "principal",
            conexionesPermitidas: 3,
            mustChangePassword: false,
            isProtected: true,
          },
          {
            nombre: "Administrador",
            email: "armandie2018@gmail.com",
            password: "Admin123456!",
            localidad: "principal",
            conexionesPermitidas: 3,
            mustChangePassword: false,
            isProtected: true,
          },
        ];

    for (const adminConfig of adminsToEnsure) {
      const admin = await createInitialAdmin(adminConfig);

      console.log("Admin listo:");
      console.log({
        id: String(admin._id),
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        estado: admin.estado,
        localidad: admin.localidad,
        conexionesPermitidas: admin.conexionesPermitidas,
        mustChangePassword: admin.mustChangePassword,
        isProtected: admin.isProtected,
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error al crear el admin:", error);
    process.exit(1);
  }
}

run();