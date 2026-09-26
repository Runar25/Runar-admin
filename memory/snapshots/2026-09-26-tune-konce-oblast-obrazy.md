---
name: 2026-09-26-tune-konce-oblast-obrazy
description: CODE-tune — rozdělaná práce před compactem 2026-09-26; owner čeká na reset tokenů, pak konce čtení, obrazy od GPT, slova oblasti
metadata:
  type: project
---

# CODE-tune · 2026-09-26 · rozdělaná práce (jen to, co jinde nebydlí)

Stav nasazeného vlastní `git log` (poslední `[tune]` f679170: dva Asky živě). Rozhodnutí 2026-09-25 (1)–(8) v DECISIONS.
Owner (KUKY) má vyčerpané tokeny — **nic nezačínat bez jeho pokynu po resetu**, agenti max 3–5 (memory cheapest-deciding-measurement-first).

**Až owner řekne, pořadí (vše rozepsané v RUNAR_BACKLOG.md):**
1. **Konce čtení** — položka „Konce čtení: víc tvarů (typy 6/7/9)“: návrh obraz / napětí / návrat k otázce + přerozdělení
   podle SEEKING; napřed pilot na Opus 5 (~6 čtení na tvar, stejné losy, 1 slepý soudce). Owner rozdělení ještě NEPOTVRDIL.
2. **Obrazy od GPT** — `docs/inbox/2026-09-25-gpt-obrazy-24-run-plus-blank.txt` + `…-komplexni-obrazovy-prostor.txt`;
   owner: „inspirace, musí být zkrácené či mírně upravené“. EN + IS nativně, ověřit nástroji, ukázat před zapojením.
3. **Slova oblasti (malování → ne „work“)** + **mapa „co jde do které věty“** — handoff pro CODE-read předán ownerovi v chatu
   (psáno proti f679170). CODE-tune implementuje až podle nálezu CODE-read.
4. **Hagalaz „opens the field where the boards once stood“** — esenční rámec [1] („runa ve scéně něco dělá“) — součást bodu 3.

**Ověřit při první příležitosti:** řádek v `gpt_reviews` po dalším rozboru luny · reporty k dvěma Askům (Standard 1 / Premium 2)
a k textu zamčeného Asku · Blank (v4.59) neopakuje doslova „not yet known, not yet decided“.

**Úklid (neblokuje):** DB sloupec `life_rune_in_readings` + mrtvé větve čočky; `test_lever_maps.js` červený od 2026-09-08.
