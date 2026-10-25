"""Download only the VFS containers needed for icon sprite bundles."""
import json
import os
import struct
import sys
import time
import urllib.request

import zstandard

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_icons import Vfs, needed_icons, lower_hash

REPO = "http://100.67.128.113:8790"
MANIFEST = r"C:\Users\Carlos\AppData\Local\Temp\kilo\manifest.json"
OUT = r"C:\Users\Carlos\AppData\Local\Temp\kilo\vfs_missing"

v = Vfs()
stems = [os.path.splitext(i)[0] for i in needed_icons()]

need_conts = set()
for stem in stems:
    entries = v.bundles.get(lower_hash(f"{stem}.png")) or v.bytes_map.get(lower_hash(f"{stem}.png"))
    if not entries:
        continue
    for fh, dyn, vh in entries:
        if fh != vh:
            need_conts.add(f"{vh ^ dyn:x}.bundle")
print(f"{len(stems)} stems, {len(need_conts)} containers needed", flush=True)

m = json.load(open(MANIFEST, encoding="utf-8"))
files = {}
for f in m["files"]:
    name = f["path"].rsplit("/", 1)[-1]
    if name in need_conts and f["path"].startswith("ro3_Data/StreamingAssets/VFS/"):
        files[name] = f
print(f"{len(files)} found in manifest; {len(need_conts - set(files))} not in manifest", flush=True)

os.makedirs(OUT, exist_ok=True)
zstd = zstd_decomp = zstandard.ZstdDecompressor()
done = fail = 0
for i, (name, f) in enumerate(sorted(files.items())):
    outp = os.path.join(OUT, name)
    if os.path.exists(outp) and os.path.getsize(outp) == f["size"]:
        done += 1
        continue
    ok = False
    for attempt in range(3):
        try:
            parts = []
            for ch in f["chunks"]:
                url = f"{REPO}/chunks/{ch['h'][:2]}/{ch['h']}.zst"
                with urllib.request.urlopen(url, timeout=60) as r:
                    data = zstd_decomp.decompress(r.read())
                if len(data) != ch["s"]:
                    raise ValueError(f"chunk size {len(data)} != {ch['s']}")
                parts.append(data)
            blob = b"".join(parts)
            if len(blob) != f["size"]:
                raise ValueError(f"file size {len(blob)} != {f['size']}")
            with open(outp, "wb") as fp:
                fp.write(blob)
            done += 1
            ok = True
            break
        except Exception as e:
            if attempt == 2:
                print(f"FAIL {name}: {e}", flush=True)
                fail += 1
            else:
                time.sleep(2)
    if (i + 1) % 50 == 0:
        print(f"{i + 1}/{len(files)} done={done} fail={fail}", flush=True)

print(f"done={done} fail={fail} -> {OUT}", flush=True)
