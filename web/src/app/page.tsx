import { getDb } from "@/db";

export const dynamic = "force-dynamic";

function sample(db: ReturnType<typeof getDb>, sql: string) {
  return db.prepare(sql).all() as Array<Record<string, unknown>>;
}

export default function Home() {
  const db = getDb();
  const count = (t: string) => (db.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as { c: number }).c;

  const topItems = sample(
    db,
    `SELECT id, name, quality, icon FROM items WHERE icon != '' AND quality >= 5 ORDER BY quality DESC, id LIMIT 6`
  );
  const topMonsters = sample(
    db,
    `SELECT id, name, level, is_mvp AS isMvp, icon FROM monsters WHERE icon != '' ORDER BY is_mvp DESC, hp DESC LIMIT 4`
  );
  const topCards = sample(
    db,
    `SELECT card_id AS cardId, name, quality, icon, MAX(power) AS power FROM cards
     WHERE icon != '' GROUP BY card_id ORDER BY power DESC LIMIT 4`
  );

  const stats = [
    { label: "Ítems", value: count("items"), href: "/items" },
    { label: "Monstruos", value: count("monsters"), href: "/monsters" },
    { label: "MVPs", value: count("mvps"), href: "/mvps" },
    { label: "Cartas", value: count("cards"), href: "/cards" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero: obsidian bento */}
      <section className="panel-dark relative overflow-hidden p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#927e72]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#2d56a6]/15 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#927e72]">Ragnarok Online 3</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-[#f5f4f0] sm:text-5xl">
          La base de datos viva de RO3.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#aaaaaa]">
          Ítems, monstruos, MVPs y cartas extraídos directamente de los datos del emulador,
          con iconos originales del cliente y tablas de drop completas.
        </p>
        <p className="mt-6 text-xs text-[#6b686a]">
          Pulsa <kbd className="rounded border border-[#3a3835] bg-[#161513] px-1.5 py-0.5 text-[10px] text-[#aaaaaa]">Ctrl K</kbd> para buscar cualquier cosa.
        </p>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="panel p-6 text-center transition hover:shadow-md">
            <div className="text-3xl font-bold text-[#080706]">{s.value.toLocaleString("es")}</div>
            <div className="mt-1 text-sm text-[#aaaaaa]">{s.label}</div>
          </a>
        ))}
      </section>

      {/* Bento: items + monsters */}
      <section className="grid gap-4 lg:grid-cols-3">
        <a href="/items" className="panel group p-6 transition hover:shadow-md lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-[#080706]">Ítems destacados</h2>
            <span className="text-xs text-[#927e72] group-hover:underline">Ver todos →</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {topItems.map((it) => (
              <div key={String(it.id)} className={`quality-${it.quality} flex flex-col items-center gap-1.5`}>
                <div className="icon-frame q-border h-16 w-16 border-2">
                  {it.icon ? <img src={String(it.icon)} alt="" width={56} height={56} loading="lazy" /> : null}
                </div>
                <span className="q-text line-clamp-2 text-center text-[11px] leading-tight">{String(it.name)}</span>
              </div>
            ))}
          </div>
        </a>

        <a href="/monsters" className="panel group p-6 transition hover:shadow-md">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-[#080706]">Monstruos</h2>
            <span className="text-xs text-[#927e72] group-hover:underline">Ver →</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {topMonsters.map((m) => (
              <li key={String(m.id)} className="flex items-center gap-3">
                <div className="icon-frame h-9 w-9 shrink-0">
                  {m.icon ? <img src={String(m.icon)} alt="" width={32} height={32} loading="lazy" /> : null}
                </div>
                <span className="truncate text-sm">{String(m.name)}</span>
                <span className="ml-auto text-xs text-[#aaaaaa]">Nv. {String(m.level)}</span>
              </li>
            ))}
          </ul>
        </a>
      </section>

      {/* Cards bento */}
      <section className="panel p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-[#080706]">Cartas más potentes</h2>
          <a href="/cards" className="text-xs text-[#927e72] hover:underline">Ver todas →</a>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topCards.map((c) => (
            <a key={String(c.cardId)} href={`/cards/${c.cardId}`} className="flex items-center gap-3 rounded-xl border border-[rgba(78,75,77,0.12)] p-3 transition hover:shadow-sm">
              <div className={`quality-${c.quality} icon-frame q-border h-12 w-12`}>
                {c.icon ? <img src={String(c.icon)} alt="" width={44} height={44} loading="lazy" /> : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{String(c.name)}</div>
                <div className="text-xs text-[#aaaaaa]">{Number(c.power)} power</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
