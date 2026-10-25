import { getDb } from "@/db";
import { notFound } from "next/navigation";
import { QualityBadge } from "@/components/quality";

export const dynamic = "force-dynamic";

export default async function CardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cardId = Number(id);
  const db = getDb();
  const tiers = db.prepare(
    `SELECT id, card_id AS cardId, name, quality, tier, level, power, icon, basic_attributes AS attrs, cost
     FROM cards WHERE card_id = ? ORDER BY tier`
  ).all(cardId) as Array<Record<string, unknown>>;
  if (!tiers.length) notFound();

  return (
    <div className={`quality-${tiers[0].quality}`}>
      <div className="panel q-border border-2 p-6">
        <div className="flex items-start gap-5">
          <div className="icon-frame q-border h-24 w-24 shrink-0 border-2">
            {tiers[0].icon ? <img src={String(tiers[0].icon)} alt="" width={88} height={88} /> : null}
          </div>
          <div>
            <h1 className="q-text text-2xl font-bold">{String(tiers[0].name)}</h1>
            <div className="mt-2 flex gap-2"><QualityBadge quality={Number(tiers[0].quality)} /></div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#aaaaaa]">Tiers</h2>
        {tiers.map((t) => {
          const attrs = JSON.parse(String(t.attrs)) as { name: string; value: number }[];
          return (
            <div key={String(t.id)} className="panel p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#080706]">Tier {String(t.tier)}</h3>
                <span className="stat-chip text-[#c87d28]">{Number(t.power)} power</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {attrs.map((a, i) => (
                  <span key={i} className="stat-chip text-[#2d56a6]">{a.name} +{a.value}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
