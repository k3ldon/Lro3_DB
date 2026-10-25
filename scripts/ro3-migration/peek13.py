import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
npc = json.load(open(CFG+r"\NPCConfig.json", encoding="utf-8"))
a = npc["5020001"]
print("drop:", a.get("_iDrop"), "normal:", a.get("_iNormalDrop"), "plan:", a.get("_iDropPlanID"))
print("dropPreview:", a.get("_iDropPreview"))
# dropPlanID=1: check NPCDropConfig key pattern for plan? MVP awards instead via AwardConfig
# check which npcs have drops
cnt = sum(1 for v in npc.values() if v.get("_iDrop") or v.get("_iNormalDrop"))
print("npcs with any drop ref:", cnt)
# check DropPickPlanConfig
print(open(CFG+r"\DropPickPlanConfig.json", encoding="utf-8").read()[:300])
