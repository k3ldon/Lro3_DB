import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
npc = json.load(open(CFG+r"\NPCConfig.json", encoding="utf-8"))
npcdrop = json.load(open(CFG+r"\NPCDropConfig.json", encoding="utf-8"))
h = npc.get("200131") or {}
print("200131 in npc:", bool(h))
# find npc whose _iDrop=200131? Horong npc id? search
ids = [k for k,v in npc.items() if v.get("_iDrop")==200131 or v.get("_iNormalDrop")==200131]
print("npc ids referencing 200131:", ids[:5])
# the drop id 200131 looks like npcID*100+? Actually NPCDropConfig keys look like npcID*10+slot? 10020..
# Horong _iDrop value is likely an NPCDropConfig key directly? check 200131 pattern: keys like 100240001
print("sample keys npcdrop:", list(npcdrop.keys())[:15])
# Check horong drop: find horong id
for k,v in npc.items():
    if isinstance(v.get("_kName"), list) and v["_kName"]:
        pass
# verify: _iDrop references NPCDropConfig key prefixed by npc id? Check a key: 10020 => maybe npc 1002 dropplan?
