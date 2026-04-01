import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    const session = verifyAuthToken(token);
    if (session) {
      redirect("/dashboard");
    }
  }

  const error =
    searchParams?.error === "credenciales"
      ? "Email o contraseña incorrectos"
      : searchParams?.error === "datos-invalidos"
      ? "Datos inválidos"
      : "";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-white px-6 py-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            wish.net-TV-core
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ingreso al panel administrativo
          </p>
        </div>

        <form action="/api/auth/login" method="POST" className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue="admin@wishnet.local"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              defaultValue="Admin123456!"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Ingresar
          </button>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}