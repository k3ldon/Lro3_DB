import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const db = getDb();
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 48;
  const q = (sp.q || "").trim().toLowerCase();

  // Card families with their top tier
  const whereSql = q ? "WHERE name_lower LIKE ?" : "";
  const args: string[] = q ? [`%${q}%`] : [];
  const total = (db.prepare(
    `SELECT COUNT(*) c FROM (SELECT card_id FROM cards ${whereSql} GROUP BY card_id)`
  ).get(...args) as { c: number }).c;
  const rows = db.prepare(
    `SELECT card_id AS cardId, name, quality, icon, MAX(power) AS power, MAX(tier) AS maxTier
     FROM cards ${whereSql} GROUP BY card_id ORDER BY power DESC LIMIT ? OFFSET ?`
  ).all(...args, perPage, (page - 1) * perPage) as Array<Record<string, unknown>>;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Cartas <span className="text-sm font-normal text-zinc-500">({total})</span></h1>
      <form className="mb-4 flex gap-2" action="/cards">
        <input name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500/50" />
        <button className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/20">Filtrar</button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((c) => (
          <a key={String(c.cardId)} href={`/cards/${c.cardId}`}
            className={`quality-${c.quality} panel p-4 transition hover:border-[var(--q)]/50`}>
            <h2 className="q-text font-semibold">{String(c.name)}</h2>
            <div className="mt-2 flex gap-2 text-xs text-zinc-400">
              <span className="stat-chip">{Number(c.power)} power</span>
              {Number(c.maxTier) > 0 && <span className="stat-chip">Tier {String(c.maxTier)}</span>}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        {page > 1 && <a href={`/cards?q=${encodeURIComponent(sp.q || "")}&page=${page - 1}`} className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:border-amber-500/50">← Anterior</a>}
        <span className="px-2 py-1.5 text-zinc-500">{page} / {pages}</span>
        {page < pages && <a href={`/cards?q=${encodeURIComponent(sp.q || "")}&page=${page + 1}`} className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:border-amber-500/50">Siguiente →</a>}
      </div>
    </div>
  );
}
