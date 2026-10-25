import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "RO3 Database — Ragnarok Online 3",
  description: "Base de datos oficial de Ragnarok Online 3: ítems, monstruos, MVPs, cartas y drops.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-200 antialiased">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
            <a href="/" className="flex items-center gap-2 font-bold tracking-wide">
              <span className="text-amber-400">RO3</span>
              <span className="text-zinc-400 font-normal text-sm">Database</span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-zinc-400">
              <a href="/items" className="hover:text-amber-300">Ítems</a>
              <a href="/monsters" className="hover:text-amber-300">Monstruos</a>
              <a href="/mvps" className="hover:text-amber-300">MVPs</a>
              <a href="/cards" className="hover:text-amber-300">Cartas</a>
            </nav>
            <div className="ml-auto">
              <CommandPalette />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
