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
      <h1 className="mb-2 text-2xl font-bold text-[#000000]">Cartas <span className="text-sm font-normal text-[#666666]">({total.toLocaleString("es")})</span></h1>
      <form className="mb-4 flex flex-wrap gap-2" action="/cards">
        <input name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 border border-[#b4b4b4] px-2 py-1 text-sm" />
        <button className="border-0 bg-[#ff6600] px-4 py-1 text-sm font-bold text-white">Filtrar</button>
      </form>

      <table className="whitetable alignment1" cellSpacing={1}>
        <thead>
          <tr className="grayrow">
            <th className="px-4 py-1 text-left">Carta</th>
            <th className="px-4 py-1">Power</th>
            <th className="px-4 py-1">Tier máx.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={String(c.cardId)}>
              <td className="px-4 py-1">
                <a href={`/cards/${c.cardId}`} className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                  <span className={`quality-${c.quality} icon-frame q-border h-6 w-6 shrink-0`}>
                    {c.icon ? <img src={String(c.icon)} alt="" width={24} height={24} loading="lazy" /> : null}
                  </span>
                  <span className={`quality-${c.quality} nameclr hover:underline`}>{String(c.name)}</span>
                </a>
              </td>
              <td className="px-4 py-1 text-[#666666]">{Number(c.power)}</td>
              <td className="px-4 py-1 text-[#666666]">{Number(c.maxTier) > 0 ? `T${String(c.maxTier)}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {page > 1 && <a href={`/cards?q=${encodeURIComponent(sp.q || "")}&page=${page - 1}`} className="random">← Anterior</a>}
        <span className="px-2 text-[#666666]">{page} / {pages}</span>
        {page < pages && <a href={`/cards?q=${encodeURIComponent(sp.q || "")}&page=${page + 1}`} className="random">Siguiente →</a>}
      </div>
    </div>
  );
}
