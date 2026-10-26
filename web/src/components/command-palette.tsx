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
        className="ml-4 inline-flex items-center gap-2 border-0 bg-transparent px-1 py-0 text-sm text-[#ffffff] underline transition hover:text-[#ff6600]"
      >
        <Search size={12} />
        <span className="hidden sm:inline">Buscar…</span>
        <kbd className="ml-1 hidden rounded border border-[#666666] bg-transparent px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
      </button>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Omnisearch"
        className="fixed inset-0 z-50"
        overlayClassName="fixed inset-0 bg-[#080706]/40 backdrop-blur-sm"
        contentClassName="mx-auto mt-[12vh] w-full max-w-xl rounded-2xl border border-[rgba(78,75,77,0.15)] bg-[#faf9f5] shadow-2xl overflow-hidden"
      >
        <Command.Input
          value={q}
          onValueChange={setQ}
          placeholder="Buscar ítems, monstruos, MVPs, cartas…"
          className="w-full border-b border-[rgba(78,75,77,0.12)] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[#aaaaaa]"
        />
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-[#aaaaaa]">Sin resultados.</Command.Empty>

          {res.items.length > 0 && (
            <Command.Group heading="Ítems" className="text-[#927e72] text-xs uppercase tracking-wider">
              {res.items.map((i) => (
                <Command.Item
                  key={`i${i.id}`}
                  value={`item ${i.name}`}
                  onSelect={() => go(`/items/${i.id}`)}
                  className={`quality-${i.quality} flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[rgba(78,75,77,0.08)]`}
                >
                  <span className="icon-frame h-7 w-7 shrink-0">
                    {i.icon ? <img src={i.icon} alt="" width={24} height={24} /> : null}
                  </span>
                  <span className="q-text">{i.name}</span>
                  <span className="ml-auto text-xs text-[#aaaaaa]">Nv. {i.levelNeed}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {res.monsters.length > 0 && (
            <Command.Group heading="Monstruos" className="text-[#927e72] text-xs uppercase tracking-wider">
              {res.monsters.map((m) => (
                <Command.Item
                  key={`m${m.id}`}
                  value={`monster ${m.name}`}
                  onSelect={() => go(`/monsters/${m.id}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[rgba(78,75,77,0.08)]"
                >
                  <span className="icon-frame h-7 w-7 shrink-0">
                    {m.icon ? <img src={m.icon} alt="" width={24} height={24} /> : null}
                  </span>
                  {m.isMvp && <span className="rounded-full bg-[#b8292f]/10 px-1.5 text-[10px] font-bold text-[#b8292f]">MVP</span>}
                  <span>{m.name}</span>
                  <span className="ml-auto text-xs text-[#aaaaaa]">Nv. {m.level}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {res.mvps.length > 0 && (
            <Command.Group heading="MVPs" className="text-[#927e72] text-xs uppercase tracking-wider">
              {res.mvps.map((m) => (
                <Command.Item
                  key={`v${m.id}`}
                  value={`mvp ${m.name}`}
                  onSelect={() => go(`/monsters/${m.npcId}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[rgba(78,75,77,0.08)]"
                >
                  <span className="rounded-full bg-[#b8292f]/10 px-1.5 text-[10px] font-bold text-[#b8292f]">MVP</span>
                  <span>{m.name}</span>
                  <span className="ml-auto text-xs text-[#aaaaaa]">Nv. {m.level}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {res.cards.length > 0 && (
            <Command.Group heading="Cartas" className="text-[#927e72] text-xs uppercase tracking-wider">
              {res.cards.map((c) => (
                <Command.Item
                  key={`c${c.cardId}`}
                  value={`card ${c.name}`}
                  onSelect={() => go(`/cards/${c.cardId}`)}
                  className={`quality-${c.quality} flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-[rgba(78,75,77,0.08)]`}
                >
                  <span className={`quality-${c.quality} icon-frame q-border h-7 w-7 shrink-0`}>
                    {c.icon ? <img src={c.icon} alt="" width={24} height={24} /> : null}
                  </span>
                  <span className="q-text">{c.name}</span>
                  <span className="ml-auto text-xs text-[#aaaaaa]">{c.power} power</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command.Dialog>
    </>
  );
}
