"""Download missing VFS .bytes containers from the LagnaroK patch repo."""
import json
import os
import sys

import zstandard

REPO = "http://100.67.128.113:8790"
VFS = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64\ro3_Data\StreamingAssets\VFS"
MANIFEST = r"C:\Users\Carlos\AppData\Local\Temp\kilo\manifest.json"
OUT = r"C:\Users\Carlos\AppData\Local\Temp\kilo\vfs_missing"

m = json.load(open(MANIFEST, encoding="utf-8"))
want = [f for f in m["files"] if f["path"].startswith("ro3_Data/StreamingAssets/VFS/")
        and "/" not in f["path"][len("ro3_Data/StreamingAssets/VFS/"):]]
print(f"manifest VFS root files: {len(want)}")

os.makedirs(OUT, exist_ok=True)
zstd = zstandard.ZstdDecompressor()
import urllib.request

chunks_done = {}
fail = []
ok = 0
import time
for i, f in enumerate(want):
    bad = True
    for attempt in range(3):
        try:
            name = f["path"].rsplit("/", 1)[-1]
            outp = os.path.join(OUT, name)
            if os.path.exists(outp) and os.path.getsize(outp) == f["size"]:
                ok += 1
                break
            parts = []
            bad = False
            for ch in f["chunks"]:
                h = ch["h"]
                data = chunks_done.get(h)
                if data is None:
                    url = f"{REPO}/chunks/{h[:2]}/{h}.zst"
                    with urllib.request.urlopen(url, timeout=60) as r:
                        data = zstd.decompress(r.read())
                    if len(data) != ch["s"]:
                        raise ValueError(f"size {len(data)} != {ch['s']}")
                    chunks_done[h] = data
                parts.append(data)
            blob = b"".join(parts)
            if len(blob) != f["size"]:
                raise ValueError(f"file size {len(blob)} != {f['size']}")
            with open(outp, "wb") as fp:
                fp.write(blob)
            ok += 1
            bad = False
            break
        except Exception as e:
            bad = True
            if attempt == 2:
                print(f"fail {f['path']}: {e}")
                fail.append(f["path"])
            else:
                time.sleep(2)
    if ok % 100 == 0 and not bad:
        print(f"{ok}/{len(want)}", flush=True)

print(f"done ok={ok} fail={len(fail)} -> {OUT}")
if fail:
    print("fails:", fail[:10])
