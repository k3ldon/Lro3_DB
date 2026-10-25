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
      <h1 className="mb-2 text-2xl font-bold">Ítems <span className="text-sm font-normal text-zinc-500">({total})</span></h1>
      <form className="mb-4 flex gap-2" action="/items">
        <input
          name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500/50"
        />
        <select name="quality" defaultValue={String(quality || "")}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
          <option value="">Toda calidad</option>
          {[1, 2, 3, 4, 5, 6].map((qv) => <option key={qv} value={qv}>{qualityLabel(qv)}</option>)}
        </select>
        <button className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/20">
          Filtrar
        </button>
      </form>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Ítem</th>
              <th className="px-4 py-3">Calidad</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Nv. req.</th>
              <th className="px-4 py-3">Tradeable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)} className="border-b border-zinc-900 hover:bg-zinc-900/60">
                <td className="px-4 py-2">
                  <a href={`/items/${r.id}`} className={`quality-${r.quality} q-text hover:underline`}>{String(r.name)}</a>
                </td>
                <td className="px-4 py-2"><QualityBadge quality={Number(r.quality)} /></td>
                <td className="px-4 py-2 text-zinc-400">{String(r.type)}</td>
                <td className="px-4 py-2 text-zinc-400">{String(r.levelNeed)}</td>
                <td className="px-4 py-2 text-zinc-400">{r.tradeable ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2 text-sm">
        {page > 1 && <a href={`/items?q=${encodeURIComponent(sp.q || "")}&quality=${quality}&page=${page - 1}`} className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:border-amber-500/50">← Anterior</a>}
        <span className="px-2 py-1.5 text-zinc-500">{page} / {pages}</span>
        {page < pages && <a href={`/items?q=${encodeURIComponent(sp.q || "")}&quality=${quality}&page=${page + 1}`} className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:border-amber-500/50">Siguiente →</a>}
      </div>
    </div>
  );
}
