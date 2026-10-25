import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "RO3 Database — Ragnarok Online 3",
  description: "Base de datos oficial de Ragnarok Online 3: ítems, monstruos, MVPs, cartas y drops.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <nav className="pill-nav">
          <a href="/" className="flex items-center gap-1.5 px-3 font-bold tracking-wide text-[#080706]">
            RO<span className="text-[#927e72]">3</span>
          </a>
          <span className="mx-1 h-4 w-px bg-[rgba(78,75,77,0.15)]" />
          <a href="/items" className="pill-link">Ítems</a>
          <a href="/monsters" className="pill-link">Monstruos</a>
          <a href="/mvps" className="pill-link">MVPs</a>
          <a href="/cards" className="pill-link">Cartas</a>
          <span className="mx-1 h-4 w-px bg-[rgba(78,75,77,0.15)]" />
          <CommandPalette />
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <footer className="pb-8 text-center text-xs text-[#aaaaaa]">
          Datos extraídos del cliente RO3 · db.lagnarok.online
        </footer>
      </body>
    </html>
  );
}
