import { getDb } from "@/db";
import { QualityBadge, qualityLabel } from "@/components/quality";

export const dynamic = "force-dynamic";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; quality?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const db = getDb();
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 50;
  const q = (sp.q || "").trim().toLowerCase();
  const quality = Number(sp.quality) || 0;

  const where: string[] = [];
  const args: (string | number)[] = [];
  if (q) { where.push("name_lower LIKE ?"); args.push(`%${q}%`); }
  if (quality) { where.push("quality = ?"); args.push(quality); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = (db.prepare(`SELECT COUNT(*) c FROM items ${whereSql}`).get(...args) as { c: number }).c;
  const rows = db.prepare(
    `SELECT id, name, quality, type, level_need AS levelNeed, icon, tradeable FROM items ${whereSql}
     ORDER BY quality DESC, name LIMIT ? OFFSET ?`
  ).all(...args, perPage, (page - 1) * perPage) as Array<Record<string, unknown>>;

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[#000000]">Ítems <span className="text-sm font-normal text-[#666666]">({total.toLocaleString("es")})</span></h1>
      <form className="mb-4 flex flex-wrap gap-2" action="/items">
        <input
          name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 border border-[#b4b4b4] px-2 py-1 text-sm"
        />
        <select name="quality" defaultValue={String(quality || "")}
          className="border border-[#b4b4b4] px-2 py-1 text-sm">
          <option value="">Toda calidad</option>
          {[1, 2, 3, 4, 5, 6].map((qv) => <option key={qv} value={qv}>{qualityLabel(qv)}</option>)}
        </select>
        <button className="border-0 bg-[#ff6600] px-4 py-1 text-sm font-bold text-white">
          Filtrar
        </button>
      </form>

      <table className="whitetable alignment1" cellSpacing={1}>
        <thead>
          <tr className="grayrow">
            <th className="px-4 py-1 text-left">Ítem</th>
            <th className="px-4 py-1">Calidad</th>
            <th className="px-4 py-1">Tipo</th>
            <th className="px-4 py-1">Nv. req.</th>
            <th className="px-4 py-1">Tradeable</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="px-4 py-1">
                <a href={`/items/${r.id}`} className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                  <span className={`quality-${r.quality} icon-frame q-border h-6 w-6 shrink-0`}>
                    {r.icon ? <img src={String(r.icon)} alt="" width={24} height={24} loading="lazy" /> : null}
                  </span>
                  <span className={`quality-${r.quality} nameclr hover:underline`}>{String(r.name)}</span>
                </a>
              </td>
              <td className="px-4 py-1"><QualityBadge quality={Number(r.quality)} /></td>
              <td className="px-4 py-1 text-[#666666]">{String(r.type)}</td>
              <td className="px-4 py-1 text-[#666666]">{String(r.levelNeed)}</td>
              <td className="px-4 py-1 text-[#666666]">{r.tradeable ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {page > 1 && <a href={`/items?q=${encodeURIComponent(sp.q || "")}&quality=${quality}&page=${page - 1}`} className="random">← Anterior</a>}
        <span className="px-2 text-[#666666]">{page} / {pages}</span>
        {page < pages && <a href={`/items?q=${encodeURIComponent(sp.q || "")}&quality=${quality}&page=${page + 1}`} className="random">Siguiente →</a>}
      </div>
    </div>
  );
}
