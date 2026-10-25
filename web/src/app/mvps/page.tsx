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
      <h1 className="mb-2 text-2xl font-bold">MVPs <span className="text-sm font-normal text-zinc-500">({rows.length})</span></h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <a key={String(m.id)} href={`/monsters/${m.npcId}`}
            className="panel p-4 transition hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{String(m.name)}</h2>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">MVP</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="stat-chip">Nv. {String(m.level)}</span>
              {m.hp ? <span className="stat-chip">HP {Number(m.hp).toLocaleString("es")}</span> : null}
              <span className="stat-chip text-amber-300">Respawn {Number(m.refreshTime) / 60} min</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
