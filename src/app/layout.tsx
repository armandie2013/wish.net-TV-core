import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getGeneralSettings } from "@/services/general-settings.service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();

  return {
    title: settings.nombreEmpresa,
    description: "Core administrativo IPTV",
  };
}

const themeScript = `
(() => {
  try {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (prefersDark ? "dark" : "light");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}