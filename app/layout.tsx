import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snake 3D Minimalista",
  description: "Juego de Snake en 3D con estética minimalista, 6 modos y leaderboard en Supabase.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}