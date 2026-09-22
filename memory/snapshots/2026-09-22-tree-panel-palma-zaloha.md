---
name: 2026-09-22-tree-panel-palma-zaloha
description: CODE-tree 2026-09-22 — kde jsme skončili po kůře a palmě: panel rozdělen, páka proti palmě, crown composer zálohovaný v gitu; co visí
metadata:
  type: project
---

# 2026-09-22 — kde jsme skončili (session CODE-tree)
**Historický záznam k tomuto dni, ne popis dneška.** Čísla a rozhodnutí vlastní `RUNAR_TREE.md`
(řádky o exitFloor a o rozdělení panelu), stav `git log`. Tady je jen to, co jinde nebydlí.
Navazuje na [snapshots/2026-08-18-tree-kura-a-silueta.md](2026-08-18-tree-kura-a-silueta.md).

## Uprostřed čeho jsme byli
- **Kůra je odložená.** KUKY: *„kůrou jsme se zabývali, ale není to ono."* Všechny páky kůry
  leží ve složené sekci ODLOŽENO; nic se nesmazalo. Nevracet se k ní bez nového směru od ownera.
- **Panel koruny rozdělen** na TVAR / VZHLED / ODLOŽENO. Owner teď **sám ladí posuvníky** —
  ⚠️ výchozí hodnoty NEMĚNIT, dokud neřekne (*„až to budu chtít přepsat, dám vědět"*).
  Jeho aktuální hodnoty žijí jen v prohlížeči; do repa se dostanou tlačítkem „uložit pro Code"
  (helper 7798 → `_tree_state.json`). Poslední uložení je z 2026-08-10, tedy staré.
- **Palma:** páka `exitFloor` pomáhá, ale na jeho logu (6 větví) nestačí — zbytek palmy je
  v POČTU větví. Další krok závisí na tom, co owner uvidí s `maxMains`; nestavět nic navíc.
- **Mapa Cowork-read (pozorovací vrstva, `detectPatterns`)** — odpověděno v chatu. Pro strom z ní
  plyne jedno: svislá osa dnes nese POŘADÍ větve, ne čas ani intention, a věk stromu je počet
  čtení (`vlog.length × readingEvery`), ne data. Owner zatím nerozhodl, jestli jim to poslat
  handoffem, nebo jen zapsat. `detectPatterns` sám je lane CODE-tune.

## Záloha (proč existuje tenhle soubor)
- `build_crown_composer.py` byl do dneška **mimo git** — jediná kopie práce od 2026-08-09
  (WebGL, exitFloor, panel). Commitnut `[tree]`; generované HTML zůstává mimo git jako dosud.
- Lokální kopie labu + enginu + `_tree_state.json`:
  `v2/tree-snapshots/crown-panel-exitfloor-webgl-2026-09-22/` (gitignorované, jen tento disk).

## Co visí
1. **Hook** (`~/.claude/tree-guard.sh`): SessionStart při compactu přepíše marker → Stop hook
   zapomene změny session; fallback nekontroluje platnost JSON. Zápis čeká na **souhlas ownera**
   (klasifikátor ho bez něj blokuje — neobcházet).
2. Publikovat lab koruny na web? Otevřené rozhodnutí ownera (zdroj je teď v gitu, stránka ne).
