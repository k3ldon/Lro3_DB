import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
CFG = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data\config"

def peek(name, n=1):
    with open(f"{CFG}\\{name}", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        print(f"== {name}: list[{len(data)}]")
        for row in data[:n]:
            print(json.dumps(row, ensure_ascii=False)[:1500])
    else:
        print(f"== {name}: dict keys {list(data)[:20]}")
        print(json.dumps(data, ensure_ascii=False)[:800])

for n in ["ItemConfig.json", "EquipConfig.json", "CardConfig.json", "NPCConfig.json",
          "MVPConfig.json", "DropPoolConfig.json", "DropGroupConfig.json",
          "NPCDropConfig.json", "NpcNormalDropConfig.json", "Localization_en.json",
          "EquipAttriGroupConfig.json", "EquipSpecialGroupConfig.json",
          "NpcLevelPointRespawnConfig.json", "AttriMonsterConfig.json", "AttributeConfig.json"]:
    peek(n)
