# Vegvísir — plné texty testů z 2026-09-12

**Proč tu jsou:** `RUNAR_EVAL_LOG.md` nese k těmto testům jen verdikty a úryvky; plné texty ležely jen ve
scratchpadu session CODE-read. HANDOFF58 (Cowork, 2026-09-15) žádá u každého testu plný text, aby ho owner
mohl posoudit vlastním okem. Přeneseno 2026-09-15 před koncem session. Texty psali pisatelé v konverzaci
(Claude), ne produkční model.

| soubor | co to je |
|---|---|
| `formulace.json` | 7 formulací otázky × Isa/Perth = 14 textů → EVAL_LOG 2026-09-12 „Jak otázka zve životní runu" |
| `formulace-klic.json` | klíč masek k formulace.json (slepé souzení) |
| `v3real.json` | V3 skutečná (střed = Gebo jako chůze ve variantách) → EVAL_LOG „V3 SKUTEČNÁ" |
| `v3-texty.json` | NE-V3 (střed = celé čtení životní runy, chybná definice) → EVAL_LOG „NE-V3" |
| `format-texty.json` | F1–F5 formát ukotvení → EVAL_LOG „F1–F5" |
| `roz-texty.json` | V2 při 90 slovech R1–R4 → EVAL_LOG „V2 při 90 slovech" |
| `osy-texty.json` | ramena podle os (s obrazem) · osy-klic.json = klíč |
| `osy-klic.json` | klíč k osy-texty.json |
| `bezobrazu.json` | ramena bez obrazu, jen ukotvení · bezobr-klic.json = klíč |
| `bezobr-klic.json` | klíč k bezobrazu.json |
| `perth-texty.json` | Perth × Gebo varianty · perth-klic.json = klíč |
| `perth-klic.json` | klíč k perth-texty.json |
| `vegv1-texty.json` | Vegvísir první ramena · vegv1-klic.json = klíč · vegv1-zadani.json = zadání |
| `vegv1-klic.json` | klíč k vegv1-texty.json |
| `vegv1-zadani.json` | zadání k vegv1-texty.json |

Nepřeneseno schválně: soubory s produkčními daty uživatelů a test „(3c) produkční otázky" (zapsán jako zbytečný).
