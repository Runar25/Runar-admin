# Otázka na oblast v Asku z pěti různých pohledů (CODE-tune, 2026-10-07) — LAB, do produkce nic

Owner 2026-10-07: *„zkus to. Jen anglicky a zkus víc variant otázky, ale takové varianty, které tu otázku berou z úplně rozdílných pohledů.“*
a *„teď to dělat nebudeme… budeme dělat čtení a zjišťovat“* (žádná změna v produkci). Výsledek vlastní `RUNAR_EVAL_LOG.md` 2026-10-07 (2).

| soubor | co |
|---|---|
| `ask_oblast.js` | produkční `buildSysPrompt` + `buildAskPrompt` (v5.04) přes vm, sol, vstup čtení bez řádku ✦; do bloku o zadání se k oblasti připíše podoba z TOHO čtení; 6 otázek × 3 čtení × 2 = 36 volání |
| `rozbor_oblast.js` | pojistka · ozvěna otázky · podoba oblasti v odpovědi · podíl slov ze čtení · délka · nejčastější začátek; `<runa>` jako 2. argument vypíše texty |

Vstup: tři ownerova čtení z 2026-10-06 (sol) — Raidho · Healing & Wellbeing (podoba *the pace that can be kept*), Perth · Career &
Creativity (*skill and the long practice behind it*), Algiz · Love & Relationships (*being seen through another person's eyes*). Čtení i odpovědi
nesou jméno → mimo repo (`~/runar-eval/audit-2026-10-07/cteni.json`, `~/runar-eval/ask-oblast-2026-10-07.json`).

Otázky (štítek oblasti zůstává jako nadpis — DECISIONS 2026-09-11):
- **B0** dnešní tip *„{area} — can you make this image clearer?“* (s podobou v promptu — srovnání, ne produkce)
- **P1** runa → oblast *„{area} — how does {rune} affect it in this reading?“* (vzor ownerovy otázky na životní runu)
- **P2** výklad *„{area} — what does this reading mean for it, in plain words?“* (vzor *„Explain {rune} without the image.“*)
- **P3** podoba *„{area} — how does this image relate to {face}?“*
- **P4** všední den *„{area} — where might I notice this in my days?“*
- **P5** těžkost *„{area} — where does this get hard for me?“*
