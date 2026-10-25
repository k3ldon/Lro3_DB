import json, io, sys, os, glob
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
loc = json.load(open(CFG+r"\Localization_en.json", encoding="utf-8"))
# search any config containing 1420100
hits = []
for f in glob.glob(CFG+r"\*.json"):
    try:
        txt = open(f, encoding="utf-8").read(400000)
        if "1420100" in txt: hits.append(os.path.basename(f))
    except: pass
print("files mentioning 1420100:", hits)
