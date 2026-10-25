import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
award = json.load(open(CFG+r"\AwardConfig.json", encoding="utf-8"))
mv = json.load(open(CFG+r"\MultiverseGroupConfig.json", encoding="utf-8"))
print("award 21017:", json.dumps(award.get("21017"), ensure_ascii=False)[:200])
# multiverse resolve: find key 21017
r = mv.get("21017")
print("mv 21017:", json.dumps(r, ensure_ascii=False)[:300])
# search drop pool 21017 in DropPoolConfig
dp = json.load(open(CFG+r"\DropPoolConfig.json", encoding="utf-8"))
print("pool 21017 exists:", "21017" in dp)
if "21017" in dp:
    p = dp["21017"]
    slots = [p[f"_iDropGroup_{i}"] for i in range(1,17) if isinstance(p.get(f"_iDropGroup_{i}"), list)]
    print("slots:", slots[:5])
