import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
# maybe cards drop as items with _iID = cardID? Check ItemConfig for id 1420100
items = json.load(open(CFG+r"\ItemConfig.json", encoding="utf-8"))
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
it = items.get("1420100")
print("item 1420100:", json.dumps({k:it[k] for k in ("_iName","_iType","_iQuality","_iCardPart","_iSubType") if it and k in it}, ensure_ascii=False) if it else None)
if it: print("name:", loc.get(str(it["_iName"][0]),{}).get("_kDes"))
