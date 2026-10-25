import { NextResponse } from "next/server";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ items: [], monsters: [], mvps: [], cards: [] });
  const db = getDb();
  const like = `%${q}%`;

  const items = db.prepare(
    `SELECT id, name, quality, type, level_need AS levelNeed, icon FROM items
     WHERE name_lower LIKE ? ORDER BY quality DESC, name LIMIT 8`
  ).all(like);

  const monsters = db.prepare(
    `SELECT id, name, level, is_mvp AS isMvp, icon FROM monsters
     WHERE name_lower LIKE ? ORDER BY is_mvp DESC, level LIMIT 8`
  ).all(like);

  const mvps = db.prepare(
    `SELECT id, npc_id AS npcId, name, level, head_icon AS headIcon FROM mvps
     WHERE name_lower LIKE ? ORDER BY level LIMIT 4`
  ).all(like);

  const cards = db.prepare(
    `SELECT card_id AS cardId, name, MAX(tier) AS maxTier, MAX(power) AS power, quality, icon,
            COUNT(*) AS tiers
     FROM cards WHERE name_lower LIKE ?
     GROUP BY card_id ORDER BY power DESC LIMIT 6`
  ).all(like);

  return NextResponse.json({ items, monsters, mvps, cards });
}
