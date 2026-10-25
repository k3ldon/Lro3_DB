"""Extract icon assets from the RO3 client VFS into web/public/icons.

Icons live in Unity SpriteAtlas bundles (e.g. Item_Card, Common_Icon,
HeadIconAtlas): each atlas bundle packs one Texture2D plus a
name->spriteRect map. This finds the atlas containing each requested icon
name and crops it out of the atlas image.
"""
import json
import os
import struct
import sys

import UnityPy

CLIENT = r"C:\Users\Carlos\Downloads\RO3Emu-win-x64"
VFS_DIR = os.path.join(CLIENT, "ro3_Data", "StreamingAssets", "VFS")
DATA_DIR = r"C:\Users\Carlos\Downloads\erods\Lro3_DB\web\data\ro3"
OUT_DIR = r"C:\Users\Carlos\Downloads\erods\Lro3_DB\web\public\icons"
META = os.path.join(VFS_DIR, "assetmeta.data")

# SpriteAtlas bundle files (basename -> atlas tags found by scan).
ATLAS_BUNDLES = {
    "f0d5d0f83cca209a.bundle": "Item_Card",
    "c860dcd58865b85f.bundle": "Item_Mount",
    "8e102b0db1762e2d.bundle": "Card_Icon",
    "19655e8e15a5c261.bundle": "Common_Icon",
    "ea5b7a3862258d73.bundle": "Main_Icon",
    "407fbe39429b5df0.bundle": "HeadIconAtlas",
    "15f22d1420edae9c.bundle": "Pet_Icon",
    "e26fe6f18aad8a44.bundle": "CommonHeadMonster_Icon",
    "a3337e7906d89569.bundle": "CommonHeadJob_Icon",
    "3e2da8948df5f6c9.bundle": "CommonHeadBoss_Icon",
    "fabbb33eb51c68f5.bundle": "CommonHeadNpc_Icon",
    "ebda4b47a834ddb3.bundle": "CommonHeadExplicit_Icon",
}

M64 = (1 << 64) - 1
C1 = 9782798678568883157
C2 = 5545529020109919103


def rotl(x, r):
    return ((x << r) | (x >> (64 - r))) & M64


def fmix(k):
    k ^= k >> 33
    k = (k * 18397679294719823053) & M64
    k ^= k >> 33
    k = (k * 14181476777654086739) & M64
    k ^= k >> 33
    return k


def murmur64(buf, seed=0):
    h1 = h2 = seed
    length = len(buf)
    nb = length // 16
    for i in range(nb):
        k1, k2 = struct.unpack_from("<QQ", buf, i * 16)
        k1 = (k1 * C1) & M64
        k1 = rotl(k1, 31)
        k1 = (k1 * C2) & M64
        h1 ^= k1
        h1 = rotl(h1, 27)
        h1 = (h1 + h2) & M64
        h1 = (h1 * 5 + 1390208809) & M64
        k2 = (k2 * C2) & M64
        k2 = rotl(k2, 33)
        k2 = (k2 * C1) & M64
        h2 ^= k2
        h2 = rotl(h2, 31)
        h2 = (h2 + h1) & M64
        h2 = (h2 * 5 + 944331445) & M64
    tail = buf[nb * 16:]
    r = length & 15
    t1 = t2 = 0
    for i in range(min(r, 15) - 1, 7, -1):
        t2 ^= tail[i] << ((i - 8) * 8)
    if r > 8:
        t2 = (t2 * C2) & M64
        t2 = rotl(t2, 33)
        t2 = (t2 * C1) & M64
        h2 ^= t2
    for i in range(min(r, 8) - 1, -1, -1):
        t1 ^= tail[i] << (i * 8)
    if r > 0:
        t1 = (t1 * C1) & M64
        t1 = rotl(t1, 31)
        t1 = (t1 * C2) & M64
        h1 ^= t1
    h1 ^= length
    h2 ^= length
    h1 = (h1 + h2) & M64
    h2 = (h2 + h1) & M64
    return (fmix(h1) + fmix(h2)) & M64


def lower_hash(name):
    return murmur64(name.lower().encode("utf-8"))


class Vfs:
    def __init__(self, vfs_dir=VFS_DIR):
        self.dir = vfs_dir
        self.containers = {}
        with open(os.path.join(vfs_dir, "assetmeta.data"), "rb") as f:
            b = f.read()
        o = 0

        def read():
            nonlocal o
            (n,) = struct.unpack_from("<I", b, o)
            o += 4
            m = {}
            for _ in range(n):
                asset, load_type, dyn, file_hash, vfs_hash = struct.unpack_from("<QBHQQ", b, o)
                m.setdefault(asset, []).append((file_hash, dyn, vfs_hash))
                o += 27
            return m

        self.bundles = read()
        self.bytes_map = read()

    def raw(self, name):
        h = lower_hash(name)
        entries = self.bytes_map.get(h) or self.bundles.get(h)
        if not entries:
            return None
        file_hash, dyn, vfs_hash = entries[0]
        if file_hash == vfs_hash:
            fh = f"{file_hash:016x}"
            with open(os.path.join(self.dir, fh[:2], f"{file_hash:x}.bundle"), "rb") as f:
                return f.read()
        return self._container(f"{vfs_hash ^ dyn:x}.bytes").get(file_hash)

    def _container(self, fname):
        if fname in self.containers:
            return self.containers[fname]
        path = os.path.join(self.dir, fname)
        if not os.path.exists(path):
            index = {}
        else:
            with open(path, "rb") as f:
                head = f.read(24)
                if head[:4] != b"RO3V":
                    raise ValueError("bad magic " + fname)
                (offset, size) = struct.unpack_from("<QQ", head, 8)
                f.seek(offset)
                m = f.read(size)
            (n,) = struct.unpack_from("<I", m, 0)
            entries = [struct.unpack_from("<QQ", m, 4 + i * 16) for i in range(n)]
            (total,) = struct.unpack_from("<Q", m, 4 + n * 16)
            entries.sort(key=lambda e: e[1])
            index = {}
            with open(path, "rb") as f:
                for i, (key, off) in enumerate(entries):
                    end = entries[i + 1][1] if i + 1 < len(entries) else total
                    f.seek(off)
                    index[key] = f.read(end - off)
        self.containers[fname] = index
        return index


def needed_icons():
    names = set()

    def add(obj):
        icon = obj.get("icon")
        if icon:
            names.add(icon)

    for fn in ("items.json", "monsters.json", "mvps.json", "cards.json"):
        with open(os.path.join(DATA_DIR, fn), encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            for x in data:
                add(x)
    return sorted(names)


class AtlasStore:
    """Loads SpriteAtlas bundles and crops sprites by name.

    Atlas bundles hold the packed Texture2D and the name list, but the
    Sprite objects with the rects live in per-item sibling bundles
    (<stem>.png in the VFS bytes table). Each such bundle holds ~240 sprites
    of the same atlas tag, so a small set of them covers the whole atlas.
    """

    def __init__(self, vfs: "Vfs", vfs_dir=VFS_DIR):
        self.vfs = vfs
        self.vfs_dir = vfs_dir
        self.index = {}  # sprite name -> rect
        self.images = {}  # atlas bundle -> PIL image of the packed texture
        self.names = {}  # atlas bundle -> set of packed sprite names
        self.local = {}  # stem -> Texture2D object with its own image

    def _bundle_path(self, name):
        p = os.path.join(self.vfs_dir, name[:2], name)
        return p if os.path.exists(p) else None

    def _all_objects(self, env):
        out = {}

        def walk(f):
            for sf in (getattr(f, "files", None) or {}).values():
                walk(sf)
            oa = getattr(f, "objects", None)
            if oa:
                for o in oa.values():
                    out[o.path_id] = o

        for f in env.files.values():
            walk(f)
        return out

    def _serial_files(self, env):
        out = []

        def walk(f):
            if type(f).__name__ == "SerializedFile":
                out.append(f)
            for sf in (getattr(f, "files", None) or {}).values():
                walk(sf)

        for f in env.files.values():
            walk(f)
        return out

    def load(self, bundle):
        path = self._bundle_path(bundle)
        if not path:
            return
        try:
            env = UnityPy.load(path)
        except Exception as e:
            print(f"  warn: cannot load {bundle}: {e}")
            return
        objs = self._all_objects(env)
        atlas = next((o for o in objs.values() if o.type.name == "SpriteAtlas"), None)
        tex = next((o for o in objs.values() if o.type.name == "Texture2D"), None)
        if atlas is None or tex is None:
            return
        try:
            tex_img = tex.read().image
            atlas_data = atlas.read()
        except Exception as e:
            print(f"  warn: cannot decode {bundle}: {e}")
            return
        self.images[bundle] = tex_img
        self.names[bundle] = set(atlas_data.m_PackedSpriteNamesToIndex)

    def load_sprite_bundle(self, stem):
        """Load an icon's own .png bundle: either its Sprite points into a
        packed atlas texture, or the bundle carries its own Texture2D."""
        if stem in self.index:
            return
        data = self.vfs.raw(f"{stem}.png")
        if data is None:
            return
        try:
            env = UnityPy.load(data)
            objs = self._all_objects(env)
            target = None
            for o in objs.values():
                if o.type.name != "Sprite":
                    continue
                d = o.read()
                if d.m_Name == stem:
                    target = d
                    break
            if target is None:
                return
            r = target.m_RD.textureRect
            if target.m_RD.texture.m_FileID == 0 and target.m_RD.texture.m_PathID:
                # texture lives in this bundle
                self.index[stem] = (None, (r.x, r.y, r.width, r.height))
                self.local[stem] = objs.get(target.m_RD.texture.m_PathID)
                return
        except Exception:
            return
        # sprite is packed into an atlas: find it by atlas tag or name set
        tags = getattr(target, "m_AtlasTags", None) or []
        for bundle, tag in ATLAS_BUNDLES.items():
            if bundle in self.names and (tag in tags or stem in self.names[bundle]):
                self.index[stem] = (bundle, (r.x, r.y, r.width, r.height))
                return

    def extract(self, name, out_png):
        hit = self.index.get(name)
        if not hit:
            return False
        bundle, (x, y, w, h) = hit
        if bundle is None:
            tex = self.local.get(name)
            if tex is None:
                del self.index[name]
                return False
            img = tex.read().image
        else:
            img = self.images[bundle]
        img.crop((int(x), int(y), int(x + w), int(y + h))).save(out_png)
        return True


def main():
    only_stems = set(sys.argv[1:]) or None
    os.makedirs(OUT_DIR, exist_ok=True)
    names = needed_icons()
    icons = {}
    for icon in names:
        stem = os.path.splitext(icon)[0]
        if only_stems and stem not in only_stems:
            continue
        icons[stem] = icon
    print(f"{len(names)} icon names, extracting {len(icons)}")

    vfs = Vfs()
    store = AtlasStore(vfs)

    # Load every atlas bundle, pulling in sibling sprite bundles as needed.
    for bundle in ATLAS_BUNDLES:
        store.load(bundle)
        # Retry icons not yet indexed after each atlas loads.
        found = sum(1 for s in icons if s in store.index)
        print(f"  {bundle}: indexed so far {len(store.index)}, covers {found}/{len(icons)}")

    ok = miss = 0
    for i, (stem, icon) in enumerate(sorted(icons.items())):
        out = os.path.join(OUT_DIR, icon)
        if stem not in store.index:
            store.load_sprite_bundle(stem)
        if stem in store.index and store.extract(stem, out):
            ok += 1
        else:
            miss += 1
            if os.path.exists(out):
                os.remove(out)
        if (i + 1) % 200 == 0:
            print(f"  {i + 1}/{len(icons)} ok={ok} miss={miss}")
    print(f"done: ok={ok} miss={miss} -> {OUT_DIR}")
    if miss:
        stems_missing = sorted(os.path.splitext(i)[0] for i in icons.values()
                               if os.path.splitext(i)[0] not in store.index)
        with open(os.path.join(OUT_DIR, "_missing.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(stems_missing))
        print(f"missing stems written to _missing.txt ({len(stems_missing)})")


if __name__ == "__main__":
    main()
