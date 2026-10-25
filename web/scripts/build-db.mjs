import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "data", "ro3");
const dbPath = join(root, "ro3.db");
const assetsDir = join(root, "public", "assets", "ro3");

// Resolve an icon filename to a verified /assets/ro3/{category}/{stem}.webp path.
const stemExists = (category, filename) => {
  if (!filename) return "";
  const stem = filename.replace(/\.png$/i, "");
  const p = join(assetsDir, category, `${stem}.webp`);
  if (existsSync(p)) return `/assets/ro3/${category}/${stem}.webp`;
  // MVP head icons carry a "_1" suffix variant; fall back to the base icon.
  if (stem.endsWith("_1")) {
    const base = stem.slice(0, -2);
    if (existsSync(join(assetsDir, category, `${base}.webp`))) {
      return `/assets/ro3/${category}/${base}.webp`;
    }
  }
  return "";
};

mkdirSync(dirname(dbPath), { recursive: true });
rmSync(dbPath, { force: true });
rmSync(`${dbPath}-wal`, { force: true });
rmSync(`${dbPath}-shm`, { force: true });
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
CREATE TABLE items (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_lower TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '', type INTEGER NOT NULL, sub_type INTEGER NOT NULL DEFAULT 0,
  quality INTEGER NOT NULL DEFAULT 1, level_need INTEGER NOT NULL DEFAULT 0,
  stack_limit INTEGER NOT NULL DEFAULT 0, tradeable INTEGER NOT NULL DEFAULT 0,
  bag_tab INTEGER NOT NULL DEFAULT 0, icon TEXT NOT NULL DEFAULT '', card_part INTEGER NOT NULL DEFAULT 0,
  equip TEXT
);
CREATE INDEX idx_items_name ON items(name_lower);
CREATE INDEX idx_items_quality ON items(quality);

CREATE TABLE monsters (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_lower TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0, npc_type INTEGER NOT NULL DEFAULT 0,
  element INTEGER NOT NULL DEFAULT 1, is_mvp INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '', hp INTEGER NOT NULL DEFAULT 0,
  stats TEXT, drop_table INTEGER NOT NULL DEFAULT 0, normal_drops TEXT
);
CREATE INDEX idx_monsters_name ON monsters(name_lower);
CREATE INDEX idx_monsters_level ON monsters(level);

CREATE TABLE mvps (
  id INTEGER PRIMARY KEY, npc_id INTEGER NOT NULL, name TEXT NOT NULL, name_lower TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0, map_id INTEGER, refresh_time INTEGER NOT NULL DEFAULT 0,
  head_icon TEXT NOT NULL DEFAULT '', awards TEXT, preview TEXT, pools TEXT
);

CREATE TABLE cards (
  id INTEGER PRIMARY KEY, card_id INTEGER NOT NULL, name TEXT NOT NULL, name_lower TEXT NOT NULL,
  quality INTEGER NOT NULL DEFAULT 1, card_part INTEGER NOT NULL DEFAULT 0, icon TEXT NOT NULL DEFAULT '',
  tier INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0, power INTEGER NOT NULL DEFAULT 0,
  is_open INTEGER NOT NULL DEFAULT 0, basic_attributes TEXT, cost TEXT
);
CREATE INDEX idx_cards_card ON cards(card_id);
CREATE INDEX idx_cards_name ON cards(name_lower);

CREATE TABLE drop_pools (id INTEGER PRIMARY KEY, slots TEXT NOT NULL);
CREATE TABLE drop_groups (id INTEGER PRIMARY KEY, rows TEXT NOT NULL);
CREATE TABLE npc_drops (id INTEGER PRIMARY KEY, envs TEXT NOT NULL);
CREATE TABLE npc_normal_drops (id INTEGER PRIMARY KEY, row TEXT NOT NULL);
`);

const read = (n) => JSON.parse(readFileSync(join(dataDir, `${n}.json`), "utf-8"));

const insItem = db.prepare(`INSERT INTO items VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const it of read("items")) {
  insItem.run(it.id, it.name, it.name.toLowerCase(), it.desc, it.type, it.subType, it.quality,
    it.levelNeed, it.stackLimit, it.tradeable ? 1 : 0, it.bagTab, stemExists("item", it.icon), it.cardPart,
    it.equip ? JSON.stringify(it.equip) : null);
}

const insMon = db.prepare(`INSERT INTO monsters VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const m of read("monsters")) {
  insMon.run(m.id, m.name, m.name.toLowerCase(), m.level, m.npcType, m.element, m.isMvp ? 1 : 0,
    stemExists("monster", m.icon), m.hp || 0, m.stats ? JSON.stringify(m.stats) : null, m.drops?.drop || 0,
    JSON.stringify(m.drops?.normalDrop || []));
}

const insMvp = db.prepare(`INSERT INTO mvps VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
for (const m of read("mvps")) {
  insMvp.run(m.id, m.npcId, m.name, m.name.toLowerCase(), m.level, m.mapId, m.refreshTime,
    stemExists("monster", m.headIcon), JSON.stringify(m.awards), JSON.stringify(m.preview), JSON.stringify(m.pools || {}));
}

const insCard = db.prepare(`INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
for (const c of read("cards")) {
  insCard.run(c.id, c.cardId, c.name, c.name.toLowerCase(), c.quality, c.cardPart, stemExists("card", c.icon),
    c.tier, c.level, c.power, c.isOpen ? 1 : 0,
    JSON.stringify(c.basicAttributes), JSON.stringify(c.cost));
}

const insPool = db.prepare(`INSERT INTO drop_pools VALUES (?,?)`);
for (const [id, slots] of Object.entries(read("drop_pools"))) insPool.run(Number(id), JSON.stringify(slots));
const insGroup = db.prepare(`INSERT INTO drop_groups VALUES (?,?)`);
for (const [id, rows] of Object.entries(read("drop_groups"))) insGroup.run(Number(id), JSON.stringify(rows));
const insND = db.prepare(`INSERT INTO npc_drops VALUES (?,?)`);
for (const [id, envs] of Object.entries(read("npc_drops"))) insND.run(Number(id), JSON.stringify(envs));
const insNND = db.prepare(`INSERT INTO npc_normal_drops VALUES (?,?)`);
for (const [id, row] of Object.entries(read("npc_normal_drops"))) insNND.run(Number(id), JSON.stringify(row));

const counts = db.prepare(`SELECT 'items' t, COUNT(*) c FROM items UNION ALL SELECT 'monsters', COUNT(*) FROM monsters
  UNION ALL SELECT 'mvps', COUNT(*) FROM mvps UNION ALL SELECT 'cards', COUNT(*) FROM cards
  UNION ALL SELECT 'drop_pools', COUNT(*) FROM drop_pools UNION ALL SELECT 'drop_groups', COUNT(*) FROM drop_groups`).all();
console.log("DB built:", counts.map((r) => `${r.t}=${r.c}`).join(" "));

for (const t of ["items", "monsters", "mvps", "cards"]) {
  const col = t === "mvps" ? "head_icon" : "icon";
  const { total, with_icon } = db.prepare(
    `SELECT COUNT(*) total, SUM(CASE WHEN ${col} != '' THEN 1 ELSE 0 END) with_icon FROM ${t}`).get();
  console.log(`  ${t}.${col}: ${with_icon}/${total}`);
}
db.close();
