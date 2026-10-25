import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
npc = json.load(open(CFG+r"\NPCConfig.json", encoding="utf-8"))
npcdrop = json.load(open(CFG+r"\NPCDropConfig.json", encoding="utf-8"))
ndrop = json.load(open(CFG+r"\NpcNormalDropConfig.json", encoding="utf-8"))
dp = json.load(open(CFG+r"\DropPoolConfig.json", encoding="utf-8"))
dg = json.load(open(CFG+r"\DropGroupConfig.json", encoding="utf-8"))
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
items = json.load(open(CFG+r"\ItemConfig.json", encoding="utf-8"))
def name(k):
    return loc.get(str(k[0]), {}).get("_kDes") if isinstance(k, list) and k else None
# Horong drop 200131 -> NPCDropConfig?
print("npcdrop has 200131:", "200131" in npcdrop, "ndrop:", "200131" in ndrop)
d = npcdrop.get("200131") or ndrop.get("200131")
print(json.dumps(d, ensure_ascii=False)[:600])
# follow a pool: 21 -> pool 21
pool = dp["21"]
groups = []
for i in range(1, 17):
    g = pool.get(f"_iDropGroup_{i}")
    if g: groups.append(g)
print("pool21 groups:", groups[:5])
# group 8 details -> DropItem
gr = dg["8"]
print("group8:", json.dumps(gr[0], ensure_ascii=False))
it = items.get(str(gr[0]["_kDropItem"]))
print("dropitem name:", name(it["_iName"]) if it else None, it.get("_iQuality") if it else None)
