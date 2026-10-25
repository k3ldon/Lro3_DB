"""Shared loaders for the RO3 migration ETL."""
from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any

DATA_ROOT = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\RO3Emu\data"
CONFIG_DIR = os.path.join(DATA_ROOT, "config")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "web", "data")


def load_config(name: str) -> dict[str, Any]:
    """Load a config table. Tables are either dicts keyed by string id or lists with _iID."""
    with open(os.path.join(CONFIG_DIR, f"{name}.json"), encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, dict):
        return {int(k): v for k, v in raw.items()}
    return {int(row["_iID"]): row for row in raw}


@lru_cache(maxsize=8)
def localization(lang: str = "en") -> dict[str, str]:
    with open(os.path.join(CONFIG_DIR, f"Localization_{lang}.json"), encoding="utf-8") as f:
        raw = json.load(f)
    return {k: v.get("_kDes", "") for k, v in raw.items()}


def loc(name_id: Any, lang: str = "en") -> str | None:
    """Resolve a localization id (or list whose first element is the id) to text."""
    if isinstance(name_id, list):
        name_id = name_id[0] if name_id else 0
    if not name_id:
        return None
    return localization(lang).get(str(name_id))


def attri_table() -> dict[int, dict[str, Any]]:
    return load_config("AttributeConfig")


ATTRI_NAMES_FALLBACK = {
    1: "STR", 2: "AGI", 3: "VIT", 4: "INT", 5: "DEX", 6: "LUK",
    101: "HP", 102: "SP", 103: "PATK", 104: "MATK", 105: "PDEF",
    106: "MDEF", 109: "HIT", 110: "FLEE", 111: "CRIT", 112: "CSPD", 113: "MSPD",
}


def attri_name(attri_id: int, table: dict[int, dict[str, Any]]) -> str:
    row = table.get(attri_id)
    if row:
        n = loc(row.get("_iName"))
        if n:
            return n
    return ATTRI_NAMES_FALLBACK.get(attri_id, f"ATTR_{attri_id}")
