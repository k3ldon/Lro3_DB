"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";

type Results = {
  items: { id: number; name: string; quality: number; type: number; levelNeed: number; icon: string }[];
  monsters: { id: number; name: string; level: number; isMvp: boolean; icon: string }[];
  mvps: { id: number; npcId: number; name: string; level: number; headIcon: string }[];
  cards: { cardId: number; name: string; maxTier: number; power: number; quality: number; icon: string; tiers: number }[];
};

const EMPTY: Results = { items: [], monsters: [], mvps: [], cards: [] };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Results>(EMPTY);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setRes(EMPTY); return; }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (r.ok) setRes(await r.json());
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => { setOpen(false); window.location.href = href; };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-400 hover:border-amber-500/50 hover:text-zinc-200"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Buscar…</span>
        <kbd className="ml-2 rounded border border-zinc-700 bg-zinc-800 px-1.5 text-[10px]">Ctrl K</kbd>
      </button>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Omnisearch"
        className="fixed inset-0 z-50"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm"
        contentClassName="mx-auto mt-[12vh] w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
      >
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Buscar ítems, monstruos, MVPs, cartas…"
          className="w-full border-b border-zinc-800 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-500"
        />
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-zinc-500">Sin resultados.</Command.Empty>

          {res.items.length > 0 && (
            <Command.Group heading="Ítems" className="text-amber-500/80 text-xs uppercase tracking-wider">
              {res.items.map((i) => (
                <Command.Item
                  key={`i${i.id}`}
                  value={`item ${i.name}`}
                  onSelect={() => go(`/items/${i.id}`)}
                  className={`quality-${i.quality} flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-200 data-[selected=true]:bg-zinc-800`}
                >
                  <span className="q-text h-2 w-2 rounded-full bg-[var(--q)]" />
                  <span className="q-text">{i.name}</span>
                  <span className="ml-auto text-xs text-zinc-500">Nv. {i.levelNeed}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {res.monsters.length > 0 && (
            <Command.Group heading="Monstruos" className="text-amber-500/80 text-xs uppercase tracking-wider">
              {res.monsters.map((m) => (
                <Command.Item
                  key={`m${m.id}`}
                  value={`monster ${m.name}`}
                  onSelect={() => go(`/monsters/${m.id}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-200 data-[selected=true]:bg-zinc-800"
                >
                  {m.isMvp && <span className="rounded bg-red-500/20 px-1 text-[10px] font-bold text-red-400">MVP</span>}
                  <span>{m.name}</span>
                  <span className="ml-auto text-xs text-zinc-500">Nv. {m.level}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {res.mvps.length > 0 && (
            <Command.Group heading="MVPs" className="text-amber-500/80 text-xs uppercase tracking-wider">
              {res.mvps.map((m) => (
                <Command.Item
                  key={`v${m.id}`}
                  value={`mvp ${m.name}`}
                  onSelect={() => go(`/monsters/${m.npcId}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-200 data-[selected=true]:bg-zinc-800"
                >
                  <span className="rounded bg-red-500/20 px-1 text-[10px] font-bold text-red-400">MVP</span>
                  <span>{m.name}</span>
                  <span className="ml-auto text-xs text-zinc-500">Nv. {m.level}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {res.cards.length > 0 && (
            <Command.Group heading="Cartas" className="text-amber-500/80 text-xs uppercase tracking-wider">
              {res.cards.map((c) => (
                <Command.Item
                  key={`c${c.cardId}`}
                  value={`card ${c.name}`}
                  onSelect={() => go(`/cards/${c.cardId}`)}
                  className={`quality-${c.quality} flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-200 data-[selected=true]:bg-zinc-800`}
                >
                  <span className="q-text h-2 w-2 rounded-full bg-[var(--q)]" />
                  <span className="q-text">{c.name}</span>
                  <span className="ml-auto text-xs text-zinc-500">{c.power} power</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
