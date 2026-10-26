"""ETL: extract RO3 config tables into normalized JSON for the web DB build.

Run: python extract_ro3.py
Outputs to web/data/ro3/*.json
"""
from __future__ import annotations

import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from common import (CONFIG_DIR, attri_name, attri_table, load_config, loc)  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))  # Lro3_DB
OUT = os.path.join(ROOT, "web", "data", "ro3")
os.makedirs(OUT, exist_ok=True)


def write(name: str, data) -> None:
    with open(os.path.join(OUT, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {name}.json ({len(data)} rows)")


def basic_attributes(attrs, table) -> list[dict]:
    if not attrs:
        return []
    if isinstance(attrs, list):  # [[attrId, value], ...] (rows may have extra cols)
        pairs = [(r[0], r[1]) for r in attrs if isinstance(r, list) and len(r) >= 2]
    else:                        # {attrId: value}
        pairs = list(attrs.items())
    return [
        {"id": a, "name": attri_name(a, table), "value": v}
        for a, v in pairs
    ]


def extract_items(items, equips, table) -> list[dict]:
    rows = []
    for iid, it in items.items():
        equip_id = it.get("_iEquipId") or 0
        eq = equips.get(equip_id)
        rows.append({
            "id": iid,
            "name": loc(it.get("_iName")) or f"Item {iid}",
            "desc": loc(it.get("_iDescription")) or "",
            "type": it.get("_iType"),
            "subType": it.get("_iSubType"),
            "quality": it.get("_iQuality", 1),
            "levelNeed": it.get("_iLevelNeed", 0),
            "stackLimit": it.get("_iStackLimit", 0),
            "tradeable": bool(it.get("_iTrade")),
            "bagTab": it.get("_iBagTab", 0),
            "icon": (it.get("_kIcon") or "").split("/")[-1],
            "cardPart": it.get("_iCardPart", 0),
            "equip": None if not eq else {
                "rank": eq.get("_iRank", 0),
                "headPos": eq.get("_iHeadPos", 0),
                "entries": eq.get("_iEntries", 0),
                "basicAttributes": basic_attributes(eq.get("_kBasicAttribute"), table),
                "special": eq.get("_kSpecial") or {},
            },
        })
    return rows


def extract_cards(cards, items, table) -> list[dict]:
    rows = []
    for c in cards.values():
        if not isinstance(c, dict) or not c.get("_iCardID"):
            continue
        item = items.get(c["_iCardID"])
        rows.append({
            "id": c["_iID"],           # unique per tier row
            "cardId": c["_iCardID"],   # card family == item id (type 4)
            "name": (loc(item.get("_iName")) if item else None) or f"Card {c['_iCardID']}",
            "quality": item.get("_iQuality", 1) if item else 1,
            "cardPart": item.get("_iCardPart", 0) if item else 0,
            "icon": (item.get("_kIcon") or "").split("/")[-1] if item else "",
            "tier": c.get("_iTier", 0),
            "level": c.get("_iLevel", 0),
            "power": c.get("_iPower", 0),
            "isOpen": bool(c.get("_iIsOpen")),
            "showLibrary": bool(c.get("_iShowLibrary")),
            "basicAttributes": basic_attributes(c.get("_kBasicAttribute"), table),
            "cost": c.get("_kCost") or [],
            "flashPower": c.get("_iFlashPower", 0),
        })
    return rows


def extract_drop_groups(groups) -> dict[int, list[dict]]:
    out: dict[int, list[dict]] = {}
    for gid, rows in groups.items():
        out[gid] = [
            {
                "rowId": r.get("_iID"),
                "item": r.get("_kDropItem"),
                "weight": r.get("_iWeights", 0),
                "min": r.get("_iMinNumber", 1),
                "max": r.get("_iMaxNumber", 1),
                "minLevel": r.get("_iMinLevelLimit", 0),
                "maxLevel": r.get("_iMaxLevelLimit", 999),
                "bind": r.get("_iBind", 0),
                "questLimit": r.get("_iQuestLimit", 0),
            }
            for r in (rows if isinstance(rows, list) else [rows])
        ]
    return out


def extract_drop_pools(pools) -> dict[int, list[dict]]:
    out: dict[int, list[dict]] = {}
    for pid, p in pools.items():
        slots = []
        for i in range(1, 17):
            g = p.get(f"_iDropGroup_{i}")
            if isinstance(g, list) and len(g) >= 2:
                slots.append({
                    "slot": i,
                    "group": g[0],
                    "chance": g[1],          # per 1_000_000
                    "rolls": g[2] if len(g) > 2 else 1,
                    "picks": g[3] if len(g) > 3 else 1,
                })
        if slots:
            out[pid] = slots
    return out


def drop_refs(npc: dict) -> dict:
    return {
        "drop": npc.get("_iDrop") or 0,
        "normalDrop": [n for n in (npc.get("_iNormalDrop") or []) if n],
    }


def model_stem(units, npc) -> str:
    u = units.get(npc.get("_iUnitID"), {})
    return (u.get("_kModelPath_Default") or "").replace(".prefab", "")


class MonsterIcons:
    """Resolve monster icons: fuzzy-match the unit model name against the
    headicon_monster_* universe in the VFS (client art is keyed by monster
    family, not by NPC row), then pets, then NPCConfig._kHeadIcon."""

    def __init__(self, units):
        import sys as _sys
        scripts = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "scripts"))
        if scripts not in _sys.path:
            _sys.path.insert(0, scripts)
        from extract_icons import Vfs
        vfs_dir = os.environ.get(
            "RO3_VFS_DIR",
            r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\ro3_Data\StreamingAssets\VFS",
        )
        self.units = units
        try:
            self.vfs = Vfs(vfs_dir)
        except Exception as e:
            print(f"  warn: VFS unavailable ({e}), falling back to _kHeadIcon")
            self.vfs = None
        self.stems: list[str] = []
        if self.vfs:
            self.stems = self._discover_stems()
            print(f"  monster icon universe: {len(self.stems)} stems")
        self._cache: dict[int, str] = {}

    def _discover_stems(self) -> list[str]:
        """Probe plausible headicon_monster_<stem>.png names from model paths."""
        stems = set()
        for u in self.units.values():
            m = (u.get("_kModelPath_Default") or "")
            if not m.startswith("model_"):
                continue
            b = re.sub(r"^model_(monsterjunior|boss|npc|pet|monstersenior|monster)_", "", m.replace(".prefab", ""))
            q = re.sub(r"(low|middle|high|fine)\d*$", "", b)
            for target in (q, b):
                for pre in ("mainstory", "substory", "gvg", "guild", "event", "world",
                            "tower", "temple", "park", "payon", "prontera", "izlude",
                            "glastheim", "gvgtarget", "gvt", "pvp", "tutorial"):
                    if target.startswith(pre):
                        target = target[len(pre):]
                target = re.sub(r"\d+$", "", target)
                if len(target) >= 4:
                    stems.add(target)
        return sorted(s for s in stems if self.vfs.raw(f"headicon_monster_{s}.png"))

    def resolve(self, npc) -> str:
        uid = npc.get("_iUnitID")
        if uid in self._cache:
            return self._cache[uid]
        icon = ""
        if self.vfs is not None:
            model = model_stem(self.units, npc)
            if model.startswith("model_pet_"):
                cand = f"pet_icon_head_{model.rsplit('_', 1)[-1]}.png"
                if self._exists(cand):
                    icon = cand
            else:
                icon = self._from_model(model) or ""
        if not icon:
            icon = (npc.get("_kHeadIcon") or "").split("/")[-1]
        self._cache[uid] = icon
        return icon

    def _from_model(self, model: str) -> str | None:
        if not model.startswith("model_"):
            return None
        b = re.sub(r"^model_(monsterjunior|boss|npc|pet|monstersenior|monster)_", "", model)
        targets = []
        for t in (re.sub(r"(low|middle|high|fine)\d*$", "", b), b):
            for pre in ("mainstory", "substory", "gvg", "guild", "event", "world",
                        "tower", "temple", "park", "payon", "prontera", "izlude",
                        "glastheim", "gvgtarget", "gvt", "pvp", "tutorial"):
                if t.startswith(pre):
                    t = t[len(pre):]
            targets.append(re.sub(r"\d+$", "", t))
        seen = set()
        for target in targets:
            target = re.sub(r"\d+$", "", target)
            if target in seen:
                continue
            seen.add(target)
            best, blen = None, 0
            for s in self.stems:
                n = 0
                for a, c in zip(target, s):
                    if a != c:
                        break
                    n += 1
                if n >= len(s) - 1 and n > blen:
                    best, blen = s, n
            if best:
                for cand in (f"headicon_monster_{best}.png", f"headicon_monster_{best}_1.png"):
                    if self._exists(cand):
                        return cand
        return None

    def _exists(self, name: str) -> bool:
        if not name:
            return False
        return self.vfs.raw(name) is not None


def extract_monsters(npcs, mvps, npcdrop, ndrop, pools, groups, table) -> tuple[list[dict], list[dict]]:
    monsters, mvp_rows = [], []
    mvp_by_npc = {m["_iNPCID"]: m for m in mvps.values()}
    units = load_config("UnitConfig")
    icons = MonsterIcons(units)
    for nid, n in npcs.items():
        if not n.get("_iAttributeVariated"):
            continue  # non-combat NPC
        attri_key = f"{n['_iAttributeVariated']}000"
        stats = {}
        level = n.get("_iLevel", 0)
        mvp = mvp_by_npc.get(nid)
        if mvp:
            level = mvp.get("_iChallengeLevel", level)
        rows = []
        monsters.append({
            "id": nid,
            "name": loc(n.get("_kName")) or f"Monster {nid}",
            "level": level,
            "npcType": n.get("_iNPCType"),
            "element": n.get("_iElement", 1),
            "attributeKey": n.get("_iAttributeVariated"),
            "isMvp": mvp is not None,
            "icon": icons.resolve(n),
            "model": model_stem(units, n),
            "exp": n.get("_iFixedExp", 0),
            "drops": drop_refs(n),
            "hp": 0,  # filled by stats join below
        })
    # stats: AttriMonsterConfig[attri*1000 + level]
    attri = load_config("AttriMonsterConfig")
    for m in monsters:
        key = m["attributeKey"] * 1000 + (m["level"] or 0)
        row = attri.get(key)
        if not row and m["level"]:
            # try nearest level within same attribute family
            fam = [k for k in attri if k // 1000 == m["attributeKey"]]
            if fam:
                key = min(fam, key=lambda k: abs(k % 1000 - m["level"]))
                row = attri.get(key)
        if row:
            m["level"] = row.get("_iLevel", m["level"])
            m["hp"] = dict(row.get("_kAttri", []) and {a: v for a, v in row["_kAttri"]}).get(101, 0)
            m["stats"] = {a: v for a, v in row.get("_kAttri", [])}
        monsters_ids = m
    # MVPs
    multiverse = load_config("MultiverseGroupConfig")
    awards = load_config("AwardConfig")

    def resolve_pool(award_ref: int | None) -> int | None:
        """award id -> multiverse default -> AwardConfig._iDropPool"""
        if not award_ref:
            return None
        aid = award_ref
        mv = multiverse.get(aid)
        if mv and mv.get("_iValue_default"):
            aid = int(mv["_iValue_default"])
        row = awards.get(aid)
        if isinstance(row, list):
            row = row[0] if row else None
        if isinstance(row, dict) and row.get("_iDropPool"):
            return int(row["_iDropPool"])
        return None

    for m in mvps.values():
        npc = npcs.get(m["_iNPCID"], {})
        aw = m.get("_iAwardPreview")
        mvp_rows.append({
            "id": m["_iID"],
            "npcId": m["_iNPCID"],
            "name": loc(npc.get("_kName")) or f"MVP {m['_iID']}",
            "level": m.get("_iChallengeLevel", 0),
            "mapId": m.get("_iMapID"),
            "refreshTime": m.get("_iRefreshTime", 0),
            "headIcon": (m.get("_iHeadIcon") or "").split("/")[-1],
            "awards": {
                "firstDamage": m.get("_iFirstDamageAward"),
                "lastDamage": m.get("_iLastDamageAward"),
                "team": m.get("_iTeamAward"),
                "part": m.get("_iPartAward"),
                "rare": m.get("_iRareAward"),
                "rareChance": m.get("_iRareRewardProbability", 0),
            },
            "pools": {
                "firstDamage": resolve_pool(m.get("_iFirstDamageAward")),
                "lastDamage": resolve_pool(m.get("_iLastDamageAward")),
                "team": resolve_pool(m.get("_iTeamAward")),
                "part": resolve_pool(m.get("_iPartAward")),
                "rare": resolve_pool(m.get("_iRareAward")),
            },
            "preview": m.get("_kAwardPreview") or [],
        })
    return monsters, mvp_rows


def main() -> None:
    table = attri_table()
    items = load_config("ItemConfig")
    equips = load_config("EquipConfig")
    cards = load_config("CardConfig")
    npcs = load_config("NPCConfig")
    mvps = load_config("MVPConfig")

    write("items", extract_items(items, equips, table))
    write("cards", extract_cards(cards, items, table))
    write("drop_groups", extract_drop_groups(load_config("DropGroupConfig")))
    write("drop_pools", extract_drop_pools(load_config("DropPoolConfig")))
    write("npc_drops", {k: v for k, v in load_config("NPCDropConfig").items()})
    write("npc_normal_drops", {k: v for k, v in load_config("NpcNormalDropConfig").items()})
    monsters, mvp_rows = extract_monsters(npcs, mvps, None, None, None, None, table)
    write("monsters", monsters)
    write("mvps", mvp_rows)


if __name__ == "__main__":
    main()
