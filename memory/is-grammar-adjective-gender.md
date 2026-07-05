---
name: is-grammar-adjective-gender
description: "Psaní islandštiny pro Rúnar — nejdřív urči rod podstatného (kk/kvk/hk), pak skloňuj přídavné; slovník rodu přírodních slov"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

Při psaní islandštiny pro Rúnar je moje opakovaná chyba špatně určený ROD podstatného jména, což se přenese do špatného tvaru přídavného. **Oprava: vždy nejdřív pojmenuj rod podstatného (kk/kvk/hk), AŽ POTOM vyber tvar přídavného** — rod neodhaduj z koncovky ani z angličtiny.

Ověřené korekce (2026-06-14, KUKY potvrdil):
- `frost` = hvorugkyn → „hart frost" (sterk), „fyrsta harða frostið" (veik, po určitém členu -ið + řadovce). NE „harður" (to je karlkyn).
- `súld` = kvenkyn → „grá súld". NE „grátt" (hvorugkyn).
- Past: stejný kořen, jiný rod — `frostbiti` (kk) = „harður frostbiti" ✅, ale `frost` (hk) = „hart frost".
- Určitý člen (-ið/-inn/-in) spouští VEIK (slabé) skloňování přídavného.

Plný slovník rodu přírodních slov + detail je v Rúnar `working-style.md` (§ Islandská gramatika). **Proč:** Rúnar je IS-primární a hodně o islandštině; čím lepší moje IS, tím lepší produkt (KUKY). **Jak aplikovat:** před napsáním každého IS jmenného spojení pojmenuj rod, pak vyber tvar přídavného.

**Velký IS audit (2026-07-05, KUKY potvrdil) — 58 nálezů opraveno + 2 drift kopie chycené guardem. Trvalá pravidla:**
- `rún` = kvk, SILNÁ deklinace: **sg `rún` (EIN RÚN, ne rúna), pl `rúnir` (ne `rúnar` ani `rúnur`)**. „dregur X rúnar" → „X rúnir". Ověř: def pl = „rúnirnar". (Pozn.: pár starých stringů má slabé „rúnur" — neflagováno, nechat.)
- **Jednotka čtení = `lestur`, NE `spá` tam, kde bychom měnili lestur→spá.** intention_lbl „ÞESSI LESTUR ER FYRIR" zůstává; „3 LESTUR"→„3 LESTRAR" (ne SPÁR). Existující `spá` (no_credits, rs_exhausted) = OK, nechat. `kredit`/`inneign` = placený kredit (jiné než lestur/spá); „Keyptu þér" (koupit), ne „Fáðu þér".
- `gildistími` = kk → „enginn gildistími". `dagsetning`/`uppspretta`/`list`/`stund` = kvk. `flæði`/`frost` = hk.
- **Spread jména IS**: Cross→Áttaviti, Horseshoe→Skeifa (skeifuna acc), Norns→Nornir, Single→Ein rún, Yggdrasil zůstává. „Podkova"/„Trojice" = české leftovery.
- **Regression guardy** pro všechny tyto v `check-is.py` BAD_PATTERNS (2026-07-05 blok) + scan rozšířen o config/runes/journal. Před commitem IS: `python -X utf8 check-is.py`.
- Wiring: mode buttons + tree labely + DOB + journal filtry se v readeru NEpřekládaly (hardcoded HTML) → teď přes `t()` v updateUIText/updateTreeTab. Deferováno: slot hover-tooltips (low).
