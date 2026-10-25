import { getDb } from "@/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Slot = { slot: number; group: number; chance: number; rolls: number; picks: number };
type GroupRow = {
  rowId: number; item: number; weight: number; min: number; max: number;
  minLevel: number; maxLevel: number; bind: number; questLimit: number;
};
type Env = Record<string, { _iDropPool1?: number; _iEnvironment?: number } & Record<string, unknown>>;

function pct(chance: number) {
  if (chance >= 1_000_000) return "100%";
  return `${((chance / 1_000_000) * 100).toFixed(chance < 10_000 ? 3 : 1)}%`;
}

export default async function MonsterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const mon = db.prepare(
    `SELECT id, name, level, is_mvp AS isMvp, hp, stats, element, drop_table AS dropTable, normal_drops AS normalDrops
     FROM monsters WHERE id = ?`
  ).get(Number(id)) as undefined | Record<string, unknown>;
  if (!mon) notFound();

  const stats = mon.stats ? (JSON.parse(String(mon.stats)) as Record<string, number>) : {};
  const normalDropIds: number[] = mon.normalDrops ? JSON.parse(String(mon.normalDrops)) : [];

  const mvp = db.prepare(`SELECT id, npc_id, name, refresh_time, head_icon, awards, preview, pools FROM mvps WHERE npc_id = ?`)
    .get(Number(id)) as undefined | Record<string, unknown>;
  const mvpPools = mvp?.pools
    ? (JSON.parse(String(mvp.pools)) as Record<string, number | null>)
    : {};
  const mvpAwardLabels: Record<string, string> = {
    firstDamage: "Primer daño", lastDamage: "Último golpe", team: "Recompensa de equipo",
    part: "Participación", rare: "Rare drop",
  };

  const itemNames = new Map<number, { name: string; quality: number }>();
  const loadItem = (itemId: number) => {
    if (itemNames.has(itemId) || itemId === 100 || itemId === 101) return;
    const it = db.prepare(`SELECT name, quality FROM items WHERE id = ?`).get(itemId) as undefined | { name: string; quality: number };
    if (it) itemNames.set(itemId, it);
  };

  // Resolve drop environments: NPCDropConfig[dropId] envs 0/1/2 -> pools
  const dropSections: { title: string; env?: number; pools: { poolId: number; slots: Slot[] }[] }[] = [];
  const collectPools = (row: Env[string] | undefined): { poolId: number; slots: Slot[] }[] => {
    if (!row) return [];
    const pools: { poolId: number; slots: Slot[] }[] = [];
    for (const [k, v] of Object.entries(row)) {
      if (k.startsWith("_iDropPool") && typeof v === "number") {
        const slots = db.prepare(`SELECT slots FROM drop_pools WHERE id = ?`).get(v) as undefined | { slots: string };
        if (slots) pools.push({ poolId: v, slots: JSON.parse(slots.slots) as Slot[] });
      }
    }
    return pools;
  };

  if (mon.dropTable) {
    const nd = db.prepare(`SELECT envs FROM npc_drops WHERE id = ?`).get(Number(mon.dropTable)) as undefined | { envs: string };
    if (nd) {
      const envs = JSON.parse(nd.envs) as Env;
      const names = ["Drops normales", "Bonus Time", "Fatiga"];
      for (const [envStr, row] of Object.entries(envs)) {
        const pools = collectPools(row);
        if (pools.length) dropSections.push({ title: names[Number(envStr)] ?? `Env ${envStr}`, env: Number(envStr), pools });
      }
    }
  }
  for (const nid of normalDropIds) {
    const nnd = db.prepare(`SELECT row FROM npc_normal_drops WHERE id = ?`).get(nid) as undefined | { row: string };
    if (nnd) {
      const pools = collectPools(JSON.parse(nnd.row));
      if (pools.length) dropSections.push({ title: "Drops adicionales", pools });
    }
  }
  for (const [key, poolId] of Object.entries(mvpPools)) {
    if (!poolId) continue;
    const slots = db.prepare(`SELECT slots FROM drop_pools WHERE id = ?`).get(poolId) as undefined | { slots: string };
    if (slots) dropSections.push({
      title: `MVP · ${mvpAwardLabels[key] ?? key}`,
      pools: [{ poolId, slots: JSON.parse(slots.slots) as Slot[] }],
    });
  }

  // Prefetch all referenced items
  const groupCache = new Map<number, GroupRow[]>();
  for (const s of dropSections)
    for (const p of s.pools)
      for (const slot of p.slots) {
        if (!groupCache.has(slot.group)) {
          const g = db.prepare(`SELECT rows FROM drop_groups WHERE id = ?`).get(slot.group) as undefined | { rows: string };
          if (g) groupCache.set(slot.group, JSON.parse(g.rows) as GroupRow[]);
          else groupCache.set(slot.group, []);
        }
        for (const r of groupCache.get(slot.group) ?? []) loadItem(r.item);
      }

  return (
    <div>
      <div className="panel p-6">
        <div className="flex items-start gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold">
              {mvp ? <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">MVP</span> : null}
              {String(mon.name)}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-zinc-400">
              <span className="stat-chip">Nivel {String(mon.level)}</span>
              <span className="stat-chip">HP {Number(mon.hp).toLocaleString("es")}</span>
              <span className="stat-chip">Elemento {String(mon.element)}</span>
              {mvp ? <span className="stat-chip text-amber-300">Respawn {Number(mvp.refresh_time) / 60} min</span> : null}
            </div>
          </div>
        </div>
        {Object.keys(stats).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(stats).map(([a, v]) => (
              <span key={a} className="stat-chip text-sky-300">{a}: {v.toLocaleString("es")}</span>
            ))}
          </div>
        )}
      </div>

      {dropSections.length > 0 && (
        <div className="mt-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Tabla de drops</h2>
          {dropSections.map((s, si) => (
            <div key={si} className="panel p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">{s.title}</h3>
              {s.pools.map((p) => (
                <div key={p.poolId} className="mb-3 last:mb-0">
                  {p.slots.map((slot) => {
                    const rows = (groupCache.get(slot.group) ?? []).filter((r) => r.weight > 0);
                    const totalW = rows.reduce((a, r) => a + r.weight, 0);
                    return (
                      <div key={`${slot.slot}-${slot.group}`} className="mb-2 rounded-lg border border-zinc-800 p-2">
                        <div className="mb-1 flex gap-3 text-[11px] text-zinc-500">
                          <span>Prob. slot: <b className="text-zinc-300">{pct(slot.chance)}</b></span>
                          {slot.rolls > 1 && <span>Rolls: {slot.rolls}</span>}
                          {slot.picks > 1 && <span>Picks: {slot.picks}</span>}
                        </div>
                        <ul className="space-y-1">
                          {rows.map((r) => {
                            const item = itemNames.get(r.item);
                            const isExp = r.item === 100;
                            return (
                              <li key={r.rowId} className="flex items-center gap-2 text-sm">
                                <span className="w-14 text-right text-xs text-zinc-500">
                                  {totalW > 0 ? `${((r.weight / totalW) * 100).toFixed(1)}%` : ""}
                                </span>
                                {isExp ? (
                                  <span className="text-amber-300">Base EXP</span>
                                ) : item ? (
                                  <a href={`/items/${r.item}`}
                                    className={`quality-${item.quality} q-text hover:underline`}>{item.name}</a>
                                ) : (
                                  <span className="text-zinc-500">Item {r.item}</span>
                                )}
                                <span className="text-xs text-zinc-500">x{r.min === r.max ? r.min : `${r.min}–${r.max}`}</span>
                                {r.bind ? <span className="text-[10px] text-zinc-600">(ligado)</span> : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
