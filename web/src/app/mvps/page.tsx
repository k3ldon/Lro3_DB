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
      <h1 className="mb-2 text-2xl font-bold text-[#080706]">MVPs <span className="text-sm font-normal text-[#aaaaaa]">({rows.length})</span></h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <a key={String(m.id)} href={`/monsters/${m.npcId}`}
            className="panel p-4 transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="icon-frame h-14 w-14 shrink-0">
                {m.headIcon ? <img src={String(m.headIcon)} alt="" width={48} height={48} loading="lazy" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate font-bold text-[#080706]">{String(m.name)}</h2>
                  <span className="shrink-0 rounded-full bg-[#b8292f]/10 px-2 py-0.5 text-[10px] font-bold text-[#b8292f]">MVP</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  <span className="stat-chip text-[#4e4b4d]">Nv. {String(m.level)}</span>
                  {m.hp ? <span className="stat-chip text-[#4e4b4d]">HP {Number(m.hp).toLocaleString("es")}</span> : null}
                  <span className="stat-chip text-[#c87d28]">Respawn {Number(m.refreshTime) / 60} min</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
