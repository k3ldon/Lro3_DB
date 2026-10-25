import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
items = json.load(open(CFG+r"\ItemConfig.json", encoding="utf-8"))
it = items["1"]
print("ITEM keys:", sorted(it.keys()))
# a sample equip item
eq = [v for v in items.values() if v.get("_iEquipId")]
print("items with equipId:", len(eq))
print(json.dumps(eq[0], ensure_ascii=False)[:900])
npc = json.load(open(CFG+r"\NPCConfig.json", encoding="utf-8"))
print("NPC keys:", sorted(npc["100001"].keys())[:60])
# monster-like npc: find one with AttributeVariated
mv = [v for v in npc.values() if v.get("_iAttributeVariated")]
print("npcs with variated:", len(mv))
print(json.dumps(mv[0], ensure_ascii=False)[:600])
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
print(loc[str(items["1"]["_iName"][0])])
