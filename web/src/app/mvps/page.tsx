import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export default async function MvpsPage() {
  const db = getDb();
  const rows = db.prepare(
    `SELECT m.id, m.npc_id AS npcId, m.name, m.level, m.refresh_time AS refreshTime, m.head_icon AS headIcon,
            mo.hp, mo.element
     FROM mvps m LEFT JOIN monsters mo ON mo.id = m.npc_id ORDER BY m.level`
  ).all() as Array<Record<string, unknown>>;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[#000000]">MVPs <span className="text-sm font-normal text-[#666666]">({rows.length})</span></h1>
      <table className="whitetable alignment1" cellSpacing={1}>
        <thead>
          <tr className="grayrow">
            <th className="px-4 py-1 text-left">MVP</th>
            <th className="px-4 py-1">Nivel</th>
            <th className="px-4 py-1">HP</th>
            <th className="px-4 py-1">Elemento</th>
            <th className="px-4 py-1">Respawn</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={String(m.id)}>
              <td className="px-4 py-1">
                <a href={`/monsters/${m.npcId}`} className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                  <span className="icon-frame h-6 w-6 shrink-0">
                    {m.headIcon ? <img src={String(m.headIcon)} alt="" width={24} height={24} loading="lazy" /> : null}
                  </span>
                  <span className="ffruit">[MVP]</span>
                  <span className="nameclr hover:underline">{String(m.name)}</span>
                </a>
              </td>
              <td className="px-4 py-1 text-[#666666]">{String(m.level)}</td>
              <td className="px-4 py-1 text-[#666666]">{m.hp ? Number(m.hp).toLocaleString("es") : "—"}</td>
              <td className="px-4 py-1 text-[#666666]">{m.element ? String(m.element) : "—"}</td>
              <td className="px-4 py-1 text-[#666666]">{Number(m.refreshTime) / 60} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
