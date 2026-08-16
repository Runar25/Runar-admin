---
name: read-design-before-voice-work
description: "Práce na hlasu/promptu Rúnara začíná čtením RUNAR_DESIGN.md „Kdo je Rúnar\" a specifikace nálad — jinak se přepisuje rozhodnuté"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-16T20:27:46.898Z
---

Než sáhneš na `VOICE_PROFILES`, `DEF_CHAR`, buildery v `runar-character.js` nebo na cokoli,
co určuje **jak Rúnar mluví**, přečti **napřed**:

1. `RUNAR_DESIGN.md` sekce **„Kdo je Rúnar"** (zhruba ř. 14–152) — kánon hlasu
2. `RUNAR_BACKLOG.md` **„Nálady — specifikaci PŘEPSALY důkazy"** (~ř. 251–263)
3. `RUNAR_DECISIONS.md` — `grep -n "nálad\|hlas\|voice" RUNAR_DECISIONS.md`

**Why:** KUKY 2026-08-16, po tom, co jsem během jednoho dne **čtyřikrát** navrhl něco už
rozhodnutého: *„jak tě mám donutit si nastudovat projekt Rúnar???"* Konkrétně:
- napsal jsem `direct` jako „krátké věty" — `RUNAR_BACKLOG.md:258` říká doslova
  **„`direct` NENÍ kratší věty… je to méně úkolů na jedno čtení"**
- ptal jsem se, jestli je povolený **postoj** — `RUNAR_DESIGN.md:124` odpovídá
  **„postoj ano, radu ne"**
- navrhl jsem slít `DEF_CHAR` a `VOICE_PROFILES` — datované rozhodnutí 2026-08-14 je
  drží oddělené schválně (*„profil je čistý tón a nic víc"*)
- tvrdil jsem, že obecnost = Barnum = vada — `RUNAR_DESIGN.md:47` říká opak
  (*„to není slabina, je to základ poctivého pozicování"*); čára vede mezi
  **zrcadlem a orákulem**, ne mezi obecným a konkrétním

**How to apply:** protokol na to existuje (`MEMORY.md`, Session Start Protocol, bod 5
„Doc podle úkolu") — jen ho po compactu nikdo nepřipomene. Proto to hlásí i SessionStart
hook (`~/.claude/runar-context.py`, mapa typ úkolu → povinný doc). <!-- doc-links:ok 2026-08-16 hook je uživatelský soubor mimo repo (platí pro všechny session), do gitu nepatří -->


⚠️ **A žádná ukázková věta bez ověření.** Copy se píše hlasem Rúnara a **v EN nebo IS**,
nikdy jako česká improvizace do chatu — appka češtinu nemá. Kandidáta prožeň
`measure_readings.js --rules` (čte zákazy přímo z promptu), IS navíc `is-vazba.py`
a `is-grammar-qa.py`. Souvisí: [[copy-always-in-runar-voice]], [[dont-invent-fact-critical]],
[[measure-dont-eyeball]].
