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
      <h1 className="mb-2 text-2xl font-bold text-[#080706]">Monstruos <span className="text-sm font-normal text-[#aaaaaa]">({total.toLocaleString("es")})</span></h1>
      <form className="mb-4 flex flex-wrap gap-2" action="/monsters">
        <input name="q" defaultValue={sp.q} placeholder="Filtrar por nombre…"
          className="w-64 rounded-full border border-[rgba(78,75,77,0.15)] bg-white px-4 py-2 text-sm" />
        <button className="rounded-full bg-[#080706] px-4 py-2 text-sm text-[#f5f4f0] transition hover:bg-[#2a2826]">Filtrar</button>
      </form>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[rgba(78,75,77,0.12)] text-left text-xs uppercase tracking-wider text-[#aaaaaa]">
            <tr>
              <th className="px-4 py-3">Monstruo</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">HP</th>
              <th className="px-4 py-3">Elemento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)} className="border-b border-[rgba(78,75,77,0.07)] transition hover:bg-[rgba(78,75,77,0.04)]">
                <td className="px-4 py-2">
                  <a href={`/monsters/${r.id}`} className="flex items-center gap-3">
                    <span className="icon-frame h-9 w-9 shrink-0">
                      {r.icon ? <img src={String(r.icon)} alt="" width={32} height={32} loading="lazy" /> : null}
                    </span>
                    {r.isMvp ? <span className="rounded-full bg-[#b8292f]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#b8292f]">MVP</span> : null}
                    <span className="hover:underline">{String(r.name)}</span>
                  </a>
                </td>
                <td className="px-4 py-2 text-[#aaaaaa]">{String(r.level)}</td>
                <td className="px-4 py-2 text-[#aaaaaa]">{Number(r.hp).toLocaleString("es")}</td>
                <td className="px-4 py-2 text-[#aaaaaa]">{String(r.element)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {page > 1 && <a href={`/monsters?q=${encodeURIComponent(sp.q || "")}&page=${page - 1}`} className="pill-link border border-[rgba(78,75,77,0.15)] bg-white">← Anterior</a>}
        <span className="px-2 text-[#aaaaaa]">{page} / {pages}</span>
        {page < pages && <a href={`/monsters?q=${encodeURIComponent(sp.q || "")}&page=${page + 1}`} className="pill-link border border-[rgba(78,75,77,0.15)] bg-white">Siguiente →</a>}
      </div>
    </div>
  );
}
