import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
award = json.load(open(CFG+r"\AwardConfig.json", encoding="utf-8"))
mvps = json.load(open(CFG+r"\MVPConfig.json", encoding="utf-8"))
# resolve MVP award multiverse ids: MultiverseGroupConfig maps id -> AwardConfig
mv = json.load(open(CFG+r"\MultiverseGroupConfig.json", encoding="utf-8"))
print("multiverse keys sample:", list(mv)[:5] if isinstance(mv,dict) else mv[:2])
# For Baphomet mvp id 17: awards 21017..25017
for aid in ("21017","22017","23017","24017","25017"):
    row = award.get(aid)
    if isinstance(row, list): row = row[0]
    print(aid, "->", {k:v for k,v in (row or {}).items() if k in ("_iDropPool","_kAward")})
