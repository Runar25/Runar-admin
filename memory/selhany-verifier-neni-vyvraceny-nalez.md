---
name: selhany-verifier-neni-vyvraceny-nalez
description: "Ve workflow splácne .filter(Boolean) „vyvráceno\" a „agent spadl\" do jednoho — selhané ověření se musí počítat a ohlásit zvlášť"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-09-22T09:17:36.046Z
---

Ve workflow vrací `agent()` **null** i když agent spadne (limit, API chyba) — ne jen když nic
nenašel. Následné `.filter(Boolean)` proto zahodí **dvě různé věci pod jednou nálepkou**:
nález, který refuter vyvrátil, a nález, který nikdo neposoudil.

**Doloženo 2026-09-22** (audit banky obrazů Rúnar): sweep našel 39 nálezů, ale limit uťal
20 refuterů. Výsledek workflow vypadal jako „přežily 4" — a zbylých 20 v něm nebylo vidět
vůbec. Bez dopočtu z `journal.jsonl` by se to četlo jako „banka je hotová".

**Jak to dělat:**
- V posledním kroku **spočítej** `nalezeno` vs `s verdiktem` vs `bez verdiktu` a vrať všechna tři.
- Selhané agenty čti z `journal.jsonl` (mapuj `agentId` → `label` z řádků `type:"started"`;
  `type:"result"` nese hodnotu) — tool result sám selhání jmenuje, ale ne který nález ztratil.
- Neověřené **vypiš jmenovitě** do `RUNAR_BACKLOG.md` a řekni ownerovi „neposouzené kandidáty",
  ne „čisté". Ticho o useknutém ověření je horší než červená.

Táž rodina jako [[read-the-check-before-push]] (pipe do grepu zahodí exit kód) a
[[sanity-check-measurements]] (čisté číslo = red flag): **zahozený signál se tváří jako dobrá
zpráva.** Souvisí s [[break-your-own-work-before-reporting]] — útok na vlastní práci platí
i na nástroj, kterým útočím ([[attack-the-metric-not-just-the-result]]).
