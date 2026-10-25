import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"
award = json.load(open(CFG+r"\AwardConfig.json", encoding="utf-8"))
print(type(award), len(award))
import re
s = json.dumps(award)
i = s.find("21001")
print(s[max(0,i-200):i+400])
