import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
npc = json.load(open(CFG+r"\NPCConfig.json", encoding="utf-8"))
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
def nm(v):
    k = v.get("_kName")
    if isinstance(k, list) and k and k[0]:
        return loc.get(str(k[0]), {}).get("_kDes")
    return None
# monsters: NPCType? find distinct NPCType counts and sample drop-bearing combat npc
from collections import Counter
types = Counter(v.get("_iNPCType") for v in npc.values())
print("npc types:", types)
mons = [v for v in npc.values() if v.get("_iNPCType") == 3]
print("type3:", len(mons), nm(mons[0]) if mons else None)
md = [v for v in npc.values() if v.get("_iDrop") or v.get("_iNormalDrop")]
print("npcs with drops:", len(md), nm(md[0]) if md else None, {k: md[0][k] for k in ("_iDrop","_iNormalDrop","_iLevel") if k in md[0]})
mvp_npcid = 5020001
print("baphomet-ish:", nm(npc.get("5020001", {})))
print(json.dumps({k: v for k, v in npc["5020001"].items() if "Drop" in k or k in ("_kName","_iLevel","_iAttributeVariated","_iNPCType")}, ensure_ascii=False))
