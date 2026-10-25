import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
award = json.load(open(CFG+r"\AwardConfig.json", encoding="utf-8"))
mv = json.load(open(CFG+r"\MultiverseGroupConfig.json", encoding="utf-8"))
# 21017 -> mv default 10021017 -> award 10021017
r = award.get("10021017")
if isinstance(r, list): r = r[0]
print("award 10021017:", json.dumps(r, ensure_ascii=False)[:300])
