# RUNAR_TREE_MAP.md — Co všechno ovlivňuje strom (kompletní mapa pák)
# STĚŽEJNÍ SYSTÉMOVÁ REFERENCE. Cíl: nic neuniká — každá páka, co tvaruje/hýbe stromem, je tu.
# Grounded v enginu: runar-branch.js · runar-trunk.js · build_crown_composer.py (lab) = build_tree_production.py (produkce, 1:1).
# §20: hodnoty (curve=0.65, maxMains=9…) NEOPISUJE — bydlí v kódu; tady je MAPA VZTAHŮ (co → co → jak).
# VÝZNAM (co má páka ZNAMENAT + PROČ) doplňuje Cowork-tree (sémantická vrstva) — sloupec „význam →Cowork".
# Vznik 2026-08-07 (CODE-tree). Živý dokument — bude se upravovat, jak na systému začneme dělat.
# Vlastník: CODE-tree (mechanika + implementace) · Cowork-tree (význam) · KUKY (rozhoduje).

## Jak číst
- **Vrstva** = kdy páka působí. **Páka** = proměnná. **Mechanika** = co dělá (fakt z kódu).
  **Kde** = odkud se řídí. **Význam →Cowork** = co má znamenat + PROČ (design, zatím TBD).
- ⚠️ **SPÍCÍ** = engine to UMÍ, ale strom to dnes nepoužívá (zapojit = nová práce, ne od nuly).
- 🆕 **NOVÉ** = KUKY směr, ještě není v kódu.
- ⭐ **Model (KUKY):** runa/větev/koren má JEDEN základní tvar (identita); area/intention/seeking ho
  MĚNÍ, usměrňují, posouvají (modulace); růst v čase = pohyb (živý strom se přeskupuje tím, jak roste).

---

## Vrstva A — IDENTITA RUNY (pevná: runa = ona sama)
Laděno v branch composeru → `RUNE_TUNE`; fallback = signatura v `RUNES` (runar-branch.js).

| páka | mechanika | kde | význam →Cowork |
|---|---|---|---|
| `curve` (ohyb) | rovná ↔ zakroucená | RUNES.curve / RUNE_TUNE | proč je která runa jak zakroucená |
| `špička` (`tipc`) | konec: taper / fork / up / blunt | RUNE_CHAR / RUNE_TUNE | co který konec znamená |
| `rytmus` (`rhy`) | kam sedí odbočky: alt / opp / base / tip / even | RUNE_CHAR / RUNE_TUNE | co který rytmus znamená |
| `wob` / `tip` | vlnitost / zdvih špičky (dnes odvozeno z `curve`) | buildBranch | naautorovat per-runa (backlog #3b) |
| `taper` / `sub` / `lenMul` | ztenčení / počet vnitřních odboček / délka | RUNES / RUNE_TUNE | |

## Vrstva B — ELEMENT · SVĚT · ÆTT (kostra + charakter + barva)
| páka | mechanika | kde | význam →Cowork |
|---|---|---|---|
| `ELEMENT_ARCH` | per element: curveMul/taperMul/widthMul/elev (oheň ostrý·voda plynulá·vzduch lehký·zem silná/nízká·stín sukovitý/dolů) | runar-branch.js | už nese směr — potvrdit |
| barva | bark + element tint | `barkRgb` (ELEMENTS paleta) | |
| `WORLD_ELEV` | asgard ↑ / midgard střed / hel ↓ | runar-branch.js | |
| `AETT_CHAR` (síla = `aettStr`) | freya fluid/vzhůru · heimdall těžký/ukotvený · tyr přímý | crown builder | |

## Vrstva C — VSTUPY ČTENÍ (modulace: „area/intention posouvají tvar")
| vstup | mechanika | stav | význam →Cowork |
|---|---|---|---|
| `area` | POZICE: strana (`AREA_LAT`) · hustota odboček (`AREA_SUB`) | strana = LIVE (`areaSide`) · hustota do tvaru = ⚠️SPÍCÍ | dovnitř/ven |
| `intention` | POZICE: výška (`INT_AXIS`→`intZone`) · TVAR: délka/tip/sukovitost (`sLen`/`sTip`/`sGnarl`) | výška = LIVE · tvar = ⚠️SPÍCÍ | urð/verðandi/skuld |
| `seeking` | zatím nepoužito | 🆕 | 3. hlas výškové osy (backlog §3A) |
| `steer` | síla řízení celkově | `T.steer` | |
> ⚠️ **Reading → POZICE jede** (area→strana, intention→výška). **Reading → TVAR (steering v buildBranch) je SPÍCÍ** — strom neposílá `intention/area` do `buildBranch`. **Tvůj „tip lift řízený čtením" = zapojit tuhle spící vrstvu** (půl hotové).

## Vrstva D — POZICE / KOMPOZICE (kde větev vyleze z kmene)
| páka | mechanika | kde | pozn. |
|---|---|---|---|
| `emergence(k)` | výška odlomení (`frac`) + úhel; k0–2 zakládací, k≥3 postupně níž | build_*composer | ⚠️ vyladěno na ~9 → **při 25 chuchvalec** (nefix) |
| `exitIndex` | najde bod odlomení na kmeni dle `frac` | | |
| `lifeLean` | naklonění celku dle Life Rune | | |
| `intZone` / `areaSide` | posun `frac`/strany dle čtení | crownT | |

## Vrstva E — RŮST V ČASE (živý pohyb = přeskupení)
| páka | mechanika | kde | pozn. |
|---|---|---|---|
| `targetN` / `linearN` | počet hlavních větví roste s věkem (`strandEvery`, `maxMains`) | composer | |
| **růst pramenů** | nové prameny kmene v čase = nové hlavní větve; kmen mohutní GIRTH, ne počtem | runar-trunk.js `strandN` | 🆕 KUKY: **započítat do mapy** |
| `ageThick` / `ageLen` | tloušťka roste pořád, délka saturuje u zralosti | runar-trunk.js | |
| `sizeF` | born-visible (mladá větev vyroste na ~35 % a doroste) | composer | |
| **holý klacík → odbočky** | 🆕 větev I koren se narodí BEZ odboček; **+1 odbočka při KAŽDÉM dalším výskytu TÉŽE runy** → postupně na max | (k postavení) | KUKY model tempa; tempo z reálného objemu čtení |

## Vrstva F — KMEN
| `trunkT` | lean · wobble · thickness · `bundleSpread` (překryv pramenů = jedno tělo) · baseFlare · twist · `rootFan` | runar-trunk.js |

## Vrstva G — KOŘENY (mají být ≠ větev)
| páka | mechanika | kde | pozn. |
|---|---|---|---|
| `rootsT` | length · curve · `tipLift=0` (dolů) · tmavá barva (`ctNear/ctFar`) · `junctionThick` | runar-trunk.js / composer | |
| **koren ≠ větev** | 🆕 vlastní pravidla tvaru; twigy spíš **DELŠÍ** (ne víc jemných) | (k designu) | KUKY směr |
| šev kmen↔koren | barva se u země SEKÁ místo plynulého přechodu | (bug) | opravit |

## Vrstva H — ODBOČKY / TWIGY + GRADUACE 2./3. DOMINANTA
| páka | mechanika | kde | pozn. |
|---|---|---|---|
| `childN` | počet twigů | crownT | |
| `twRunes` | twig = ostatní runy elementu (dnes generováno znovu, negraduje) | composer | |
| **graduace 2./3. dominant** | 🆕 chová se jako prvních 9, ALE **odbočí od RODIČE v 1/5–3/5 jeho délky** (NIKDY u kmene, NIKDY na špičce — jinak nepřirozené); následuje rodiče do strany | (k postavení) | KUKY směr; doladit |

## Vrstva I — SÍLY / PŘITAŽLIVOST (→ Cowork design)
⭐ **Na KAŽDÝ výskyt ve stromě musí být odpověď „proč"** (KUKY). Které runy se přitahují, proč má
rodič zrovna tohoto potomka, proč runa přiroste zrovna sem. Deterministicky do TVARU (seed = hash),
NIKDY živě (zámek 2026-07-30). Vazba na Gathering: tytéž vztahy, co Rúnar pojmenuje slovy (RUNAR_TREE.md §7).
→ **Navrhuje Cowork-tree** (handoff 2026-08-07).

---

## Souvislosti
Kánon modelu = `RUNAR_TREE.md` · pozastavené směry = `RUNAR_BACKLOG.md` (tree) · mytologie/přitažlivost = `RUNAR_DESIGN.md`.
Kód-realita: runar-branch.js · runar-trunk.js · build_crown_composer.py (lab) · build_tree_production.py (produkce).
