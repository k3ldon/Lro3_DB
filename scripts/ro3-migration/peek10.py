import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
items = json.load(open(CFG+r"\ItemConfig.json", encoding="utf-8"))
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
# items with _iCardGroup
cg = [(k,v) for k,v in items.items() if v.get("_iCardGroup")]
print("items with cardGroup:", len(cg))
for k,v in cg[:6]:
    print(k, v["_iCardGroup"], v["_iCardPart"], loc.get(str(v["_iName"][0]),{}).get("_kDes"))
# cards cardIDs range vs cardGroup
cards = json.load(open(CFG+r"\CardConfig.json", encoding="utf-8"))
cids = sorted({x["_iCardID"] for x in cards})
print("card id range:", cids[0], cids[-1], len(cids))
groups = sorted({v["_iCardGroup"] for _,v in cg})
print("cardGroups:", groups[:10], len(groups))
# do cardGroup values match cardIDs?
print("match:", len(set(groups) & set(cids)))
