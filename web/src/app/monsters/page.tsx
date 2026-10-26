import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export default async function MonstersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const db = getDb();
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 50;
  const q = (sp.q || "").trim().toLowerCase();

  const whereSql = q ? "WHERE name_lower LIKE ?" : "";
  const args: string[] = q ? [`%${q}%`] : [];
  const total = (db.prepare(`SELECT COUNT(*) c FROM monsters ${whereSql}`).get(...args) as { c: number }).c;
  const rows = db.prepare(
    `SELECT id, name, level, is_mvp AS isMvp, hp, element, icon FROM monsters ${whereSql}
     ORDER BY is_mvp DESC, level LIMIT ? OFFSET ?`
  ).all(...args, perPage, (page - 1) * perPage) as Array<Record<string, unknown>>;
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[#000000]">Monstruos <span className="text-sm font-normal text-[#666666]">({total.toLocaleString("es")})</span></h1>
      <form className="mb-4 flex flex-wrap gap-2" action="/monsters">
        <input name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 border border-[#b4b4b4] px-2 py-1 text-sm" />
        <button className="border-0 bg-[#ff6600] px-4 py-1 text-sm font-bold text-white">Filtrar</button>
      </form>

      <table className="whitetable alignment1" cellSpacing={1}>
        <thead>
          <tr className="grayrow">
            <th className="px-4 py-1 text-left">Monstruo</th>
            <th className="px-4 py-1">Nivel</th>
            <th className="px-4 py-1">HP</th>
            <th className="px-4 py-1">Elemento</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="px-4 py-1">
                <a href={`/monsters/${r.id}`} className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                  <span className="icon-frame h-6 w-6 shrink-0">
                    {r.icon ? <img src={String(r.icon)} alt="" width={24} height={24} loading="lazy" /> : null}
                  </span>
                  {r.isMvp ? <span className="ffruit">[MVP]</span> : null}
                  <span className="nameclr hover:underline">{String(r.name)}</span>
                </a>
              </td>
              <td className="px-4 py-1 text-[#666666]">{String(r.level)}</td>
              <td className="px-4 py-1 text-[#666666]">{Number(r.hp).toLocaleString("es")}</td>
              <td className="px-4 py-1 text-[#666666]">{String(r.element)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {page > 1 && <a href={`/monsters?q=${encodeURIComponent(sp.q || "")}&page=${page - 1}`} className="random">← Anterior</a>}
        <span className="px-2 text-[#666666]">{page} / {pages}</span>
        {page < pages && <a href={`/monsters?q=${encodeURIComponent(sp.q || "")}&page=${page + 1}`} className="random">Siguiente →</a>}
      </div>
    </div>
  );
}
