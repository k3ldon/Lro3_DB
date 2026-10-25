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
      <h1 className="mb-2 text-2xl font-bold text-[#080706]">Cartas <span className="text-sm font-normal text-[#aaaaaa]">({total.toLocaleString("es")})</span></h1>
      <form className="mb-4 flex flex-wrap gap-2" action="/cards">
        <input name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 rounded-full border border-[rgba(78,75,77,0.15)] bg-white px-4 py-2 text-sm" />
        <button className="rounded-full bg-[#080706] px-4 py-2 text-sm text-[#f5f4f0] transition hover:bg-[#2a2826]">Filtrar</button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((c) => (
          <a key={String(c.cardId)} href={`/cards/${c.cardId}`}
            className={`quality-${c.quality} panel p-4 transition hover:shadow-md`}>
            <div className="flex items-center gap-3">
              <span className={`quality-${c.quality} icon-frame q-border h-14 w-14 border-2`}>
                {c.icon ? <img src={String(c.icon)} alt="" width={48} height={48} loading="lazy" /> : null}
              </span>
              <div className="min-w-0">
                <h2 className="q-text truncate font-semibold">{String(c.name)}</h2>
                <div className="mt-1 flex gap-1.5 text-xs text-[#aaaaaa]">
                  <span className="stat-chip">{Number(c.power)} power</span>
                  {Number(c.maxTier) > 0 && <span className="stat-chip">T{String(c.maxTier)}</span>}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {page > 1 && <a href={`/cards?q=${encodeURIComponent(sp.q || "")}&page=${page - 1}`} className="pill-link border border-[rgba(78,75,77,0.15)] bg-white">← Anterior</a>}
        <span className="px-2 text-[#aaaaaa]">{page} / {pages}</span>
        {page < pages && <a href={`/cards?q=${encodeURIComponent(sp.q || "")}&page=${page + 1}`} className="pill-link border border-[rgba(78,75,77,0.15)] bg-white">Siguiente →</a>}
      </div>
    </div>
  );
}
