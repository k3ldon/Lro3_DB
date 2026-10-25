import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
cards = json.load(open(CFG+r"\CardConfig.json", encoding="utf-8"))
print("total", len(cards))
from collections import Counter
c = Counter(x["_iCardID"] for x in cards)
dups = {k:v for k,v in c.items() if v>1}
print("dup cardIDs:", len(dups), list(dups.items())[:5])
# look at one dup group
gid = next(iter(dups))
rows = [x for x in cards if x["_iCardID"]==gid]
for r in rows: print(json.dumps(r, ensure_ascii=False)[:300])
