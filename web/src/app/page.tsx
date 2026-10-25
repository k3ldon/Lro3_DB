import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const db = getDb();
  const count = (t: string) => (db.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as { c: number }).c;

  const stats = [
    { label: "Ítems", value: count("items"), href: "/items" },
    { label: "Monstruos", value: count("monsters"), href: "/monsters" },
    { label: "MVPs", value: count("mvps"), href: "/mvps" },
    { label: "Cartas", value: count("cards"), href: "/cards" },
  ];

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-5xl font-black tracking-tight text-transparent">
          Ragnarok Online 3
        </h1>
        <p className="mt-3 text-zinc-400">Base de datos construida directamente desde los datos del emulador.</p>
        <p className="mt-1 text-sm text-zinc-600">Pulsa <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 text-xs">Ctrl K</kbd> para buscar cualquier cosa.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="panel p-6 text-center transition hover:border-amber-500/40">
            <div className="text-3xl font-bold text-amber-300">{s.value.toLocaleString("es")}</div>
            <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
