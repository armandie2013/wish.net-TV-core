import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(payload.sub).select(
    "nombre email rol localidad estado"
  );

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-white px-6 py-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Dashboard principal
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Bienvenido al panel administrativo IPTV.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Nombre</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {user.nombre}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Email</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Rol</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {user.rol}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Localidad</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {user.localidad}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}