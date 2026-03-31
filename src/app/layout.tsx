import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "wish.net-TV-core",
  description: "Core administrativo IPTV",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}