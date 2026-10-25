import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
npc = json.load(open(CFG+r"\NPCConfig.json", encoding="utf-8"))
n = npc["100001"]
print("rest npc keys:", [k for k in sorted(n.keys()) if "Name" in k or "Drop" in k or "Level" in k or "Icon" in k or "Model" in k])
print({k: n[k] for k in n if k in ("_iDrop","_iNormalDrop","_iLevel","_iNPCType","_iName","_kIcon","_iAttributeVariated","_iAttribute","_iDropPlanID")})
# name id of monster
mid = n.get("_iName") or n.get("_kName")
print("name field sample:", mid)
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
for k,v in list(npc.items())[:5]:
    nm = v.get("_iName") or v.get("_kName")
    print(k, nm, loc.get(str(nm[0]) if isinstance(nm,list) else str(nm), {}).get("_kDes") if nm else None)
# sample _kIcon values on items
items = json.load(open(CFG+r"\ItemConfig.json", encoding="utf-8"))
icons = {items[i].get("_kIcon") for i in list(items)[:50]}
print("icons:", list(icons)[:10])
