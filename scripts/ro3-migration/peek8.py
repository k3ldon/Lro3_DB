import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
base = r"C:\Users\Carlos\Downloads\erods\Lro3_DB\web\data\ro3"
for n in ["items","monsters","mvps","cards"]:
    d = json.load(open(base+chr(92)+n+".json", encoding="utf-8"))
    print("==", n)
    row = next((m for m in d if n=="monsters" and m.get("isMvp")), d[0])
    print(json.dumps(row, ensure_ascii=False)[:500])
# MVP monster hp check
mons = json.load(open(base+r"\monsters.json", encoding="utf-8"))
mvp = next(m for m in mons if m["isMvp"])
print("mvp monster:", mvp["name"], "hp:", mvp.get("hp"), "stats:", mvp.get("stats"))
