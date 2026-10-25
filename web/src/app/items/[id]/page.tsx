import { getDb } from "@/db";
import { notFound } from "next/navigation";
import { QualityBadge } from "@/components/quality";

export const dynamic = "force-dynamic";

type Equip = {
  rank: number;
  headPos: number;
  entries: number;
  basicAttributes: { id: number; name: string; value: number }[];
  special: Record<string, unknown>;
};

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const item = db.prepare(
    `SELECT id, name, description, quality, type, sub_type AS subType, level_need AS levelNeed,
            stack_limit AS stackLimit, tradeable, icon, card_part AS cardPart, equip
     FROM items WHERE id = ?`
  ).get(Number(id)) as undefined | Record<string, unknown>;
  if (!item) notFound();

  const equip = item.equip ? (JSON.parse(String(item.equip)) as Equip) : null;

  return (
    <div className={`quality-${item.quality}`}>
      <div className="panel q-border border-2 p-6">
        <div className="flex items-start gap-5">
          <div className="icon-frame q-border h-24 w-24 shrink-0 border-2">
            {item.icon ? <img src={String(item.icon)} alt="" width={88} height={88} /> : null}
          </div>
          <div>
            <h1 className="q-text text-2xl font-bold">{String(item.name)}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <QualityBadge quality={Number(item.quality)} />
              <span className="stat-chip text-[#4e4b4d]">Tipo {String(item.type)}</span>
              {Number(item.levelNeed) > 1 && <span className="stat-chip text-[#4e4b4d]">Nv. {String(item.levelNeed)}</span>}
              <span className="stat-chip text-[#4e4b4d]">{item.tradeable ? "Tradeable" : "No tradeable"}</span>
            </div>
          </div>
        </div>
        {item.description ? <p className="mt-4 text-sm leading-relaxed text-[#4e4b4d]">{String(item.description)}</p> : null}
      </div>

      {equip && equip.basicAttributes.length > 0 && (
        <div className="panel mt-4 p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#aaaaaa]">Atributos base</h2>
          <div className="flex flex-wrap gap-2">
            {equip.basicAttributes.map((a) => (
              <span key={a.id} className="stat-chip text-[#2d56a6]">{a.name} +{a.value}</span>
            ))}
          </div>
          {equip.entries > 0 && (
            <p className="mt-3 text-xs text-[#aaaaaa]">{equip.entries} ranura(s) de afijos aleatorios</p>
          )}
        </div>
      )}
    </div>
  );
}
