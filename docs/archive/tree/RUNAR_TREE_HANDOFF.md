# RÚNAR — Tree of Life vizuální engine — HANDOFF / COMPACT
# Stav k 2026-06-12. Jediný zdroj pravdy pro pokračování po compactu.
# Doplňuje: CLAUDE.md (repo), RUNAR_TREE_GROWTH_MAP.md (placement analýza),
#           memory: runar-tree-engine-lab.md, runar-trunk-incremental-rule.md

---

## 0. CO TEĎ DĚLÁME (jednou větou)
Stavíme Canvas 2D engine "Stromu života", který roste z runových čtení uživatele.
Jsme ve fázi LAB — vše jsou samostatné laby, NIC není napojené na DB/reader.
Iterujeme vizuál po dílech (kmen → koruna → spojit), schvaluje KUKY očima.

## 1. JAK SPUSTIT
- **PERMANENTNÍ server (KUKY): `serve.bat` v repo rootu** — dvojklik → http.server 7788 +
  _savepng.js 7799, okno nechat otevřené; běží nezávisle na Claude session (vznik 2026-06-14,
  preview server padal).
- Claude captures: launch.json profil "mockup" (preview_start) nebo běžící serve.bat.
- Rozcestník (6 karet): `http://localhost:7788/v2/tree-lab-index.html`
- Screenshoty: `preview_screenshot` na těchto stránkách TIMEOUTUJE. Použít helper:
  `node C:\Users\zkuku\Downloads\Runar-admin\_savepng.js` (běží na portu 7799, na pozadí).
  Pak v prohlížeči: `cv.toDataURL('image/jpeg').split(',')[1]` → POST na localhost:7799
  → uloží `_tree_shot.jpg` → Read ten soubor. (Stránky samy fungují, jen screenshot tool zlobí.)

## 2. ABSOLUTNÍ PRACOVNÍ PRAVIDLA
1. **JS jen přes Python build skripty** (`build_*.py`). Edit tool kazí apostrofy → SyntaxError. (CLAUDE §1)
2. **PŘÍRŮSTKOVĚ na schválené verzi, NIKDY přepis.** KUKY se rozčílil, když jsem přepsal
   hotový kmen. Nové featury = opt-in slider default tak, aby base zůstala identická.
   Viz memory [[runar-trunk-incremental-rule]].
3. **SNAPSHOT před každou větší změnou** → `v2/tree-snapshots/<name>/` (vč. build_*.py).
4. Po buildu vždy `node --check` generovaného JS.
5. Barvu NEŘEŠÍME (paleta skutečného jasanu je nastavená; KUKY: "barvu nech jak je").

## 3. ARCHITEKTURA (zafixovaná rozhodnutí)
- **JEDEN LIMB ENGINE** pro vše: jedna tapered painterly funkce kreslí kořeny, prameny
  kmene, větve i subvětve. PRAMEN = spojitý limb kořen → kmen → hlavní větev.
- **PER-ELEMENT VĚK:** každý element má birthDay; TLOUŠŤKA roste KONTINUÁLNĚ (log, nikdy
  nezastaví → staré vždy tlustší), DÉLKA saturuje. Nový element vzniká malý mezi staršími
  velkými → vizuální rozmanitost + viditelné stárnutí. Nahrazuje globální scale.
- **KMEN = svazek pramenů**, překryv (bundleSpread) + painterly hloubka → jedno tělo
  (ne kabely). TWIST (spirálové vlákno) roste s věkem. Buttress flare se otevírá až ~8 měsíců
  (gate dle věku, jinak mezery). "Staré žebro" (rib): 1-2 zakládací prameny po 1.5 roce
  vystupují do strany ve spodní části kmene. C-náklon z Life Rune se vrací k vertikále
  (báze i vrch v ose).
- **KOŘENY = limb engine dolů**, vějíř dle indexu pramene (monotónní, min křížení),
  hloubka dle věku (staré hluboko, mladé mělce/u povrchu), plynule z báze kmene (no neck).
- **KORUNA = hlavní větve vějířem z vrcholu kmene + subvětve rozprostřené PO DÉLCE**
  (rekurzivně, ne bambule na špičce), per-element věk.
- **STABILITA (kritické):** geometrie elementu závisí JEN na jeho indexu/seedu, NE na
  celkovém počtu → přidání pramene/větve NEPŘESKUPÍ existující. Ověřeno.

## 4. PLACEMENT FRAMEWORK (sémantika — DOHODNUTO, zatím NEZAPOJENO)
Viz detail RUNAR_TREE_GROWTH_MAP.md. Klíč: třídicí osa musí být INTRINSIC runě (area/
intention jsou volitelné → nemůžou být kostra).
- **ætt** (freya/heimdall/tyr, po 8 runách, v datech `aett`) = **3 hlavní osy**.
  freya = teplá/up (Fire+Air), heimdall = stínová/kořeny (Shadow+Earth, těžké runy),
  tyr = plynoucí (Water). Z `runar-runes.js`.
- **element** (Fire/Water/Air/Earth/Shadow) = sub-větev (statisticky).
- **world** (Asgard/Midgard/Hel, v datech, NEPOUŽITÉ) = intrinsic VÝŠKA (Asgard nahoru,
  Hel kořeny) — na stejné ose jako intention/mood (Norns urð/verðandi/skuld).
- **area/intention/mood** = jen SMĚROVÁNÍ (volitelné). Kaskáda: holá runa = ætt+world+
  element; modifikátory dolaďují.

## 5. LABY (vše standalone, generátor = build_*.py)
| Lab | Cesta | Generátor | Stav |
|-----|-------|-----------|------|
| Crown Composer v2 | v2/tree-lab-crown-composer/ | build_crown_composer.py | KOSTRA SCHVÁLENA (koruna = pokračování pramenů kmene; konzumuje trunk+branch engine) |
| Trunk Composer | v2/tree-lab-trunk-composer/ | build_trunk_composer.py | HOTOVÝ |
| Branch Composer | v2/tree-lab-branch-composer/ | build_branch_composer.py | slovník tvarů (25 run vč. Óðinn) |
| V3 Skeleton | v2/tree-lab-v3-skeleton/ | build_tree_v3.py | celý strom (překonáno composery) |
| Hybrid | v2/tree-lab-hybrid/ | build_tree_hybrid.py | sémantická osa (experiment) |
| Liana v0.7 | v2/tree-snapshots/v07-liana/ | build_tree_lab.py | zmrazený originál |
Rozcestník: v2/tree-lab-index.html

## 6. SNAPSHOTY (pojistky)
- `tree-snapshots/trunk-final/` — AKTUÁLNÍ kanonický kmen (twist auto max 0.4, rib po 1.5r,
  buttress od půlky gated ~8mo, rootFan -2..2, per-element věk). KUKY: "nechme tuhle verzi být."
- `tree-snapshots/trunk-twist/`, `trunk-good/` — starší baseline kmene.
- `tree-snapshots/v07-liana/` — zmrazená liana.

## 7. TRUNK DEFAULTY (trunk-final, schváleno)
twist 0.4 (max, auto dle věku, mladý ~0.05) · bundleSpread 0.22 (níž=víc splývá) ·
contour 0.6 · baseFlare 0.55 (gate ~8 mes, od půlky kmene) · protrude 0.5 (rib po 1.5r) ·
rootFan -2..2 · rootLen 150 · matureDays 365 · minSize 0.2 · strandEvery 150 ·
strands = 3 + floor(treeAge/strandEvery).

## 8. DALŠÍ KROKY (pořadí) — CROWN SYSTÉM PŘENASTAVEN 2026-06-14
Koruna se NESTAVÍ zvlášť. Crown composer KONZUMUJE trunk+branch engine (read-only): hlavní
větev = POKRAČOVÁNÍ pramene kmene (kořen→kmen→hlavní větev = jeden limb → spojitelné). Z
vrcholu každého pramene vyroste main (role main, ox/oy/baseAng, šířka srovnaná = bezešvé);
děti = sub/twig = fraktál. Branch engine rozšířen o spec.ox/oy/baseAng (default = beze změny).
KUKY zásady: JEDNODUCHÉ (min. riziko), horizont ~3 roky, hlavní větve principiálně do nekonečna.
- (a) HOTOVO + schváleno ("kostra sedi"): kmen + 3 zakl. hlavní větve jako pokračování pramenů,
  bezešvé, roste v zámku s kmenem (7 mainů při 2 letech). Snapshot tree-snapshots/crown-skeleton/.
- (b) DALŠÍ: aby celá struktura DO SEBE ZAPADALA — fraktální patra (sub→twig), jednoduše,
  ověřit napojení a stabilitu do ~3 let. AŽ PAK: ohyb / délka / počty větví na patro.
- pak: variabilita kořenů (jiný kreativní prvek, koruna:kořeny 60:40), sémantika (ætt osy +
  area + world), listy, balance-warning. PLNÝ MERGE do hlavního stromu je vlastně tady už
  rozběhnutý (crown composer = trunk+koruna spolu) → finálně přenést do produkčního renderu.

## 9. ZAPARKOVANÉ / TODO
- **Balance warning** (feature návrh): počítat větve vlevo/vpravo; převaha → "nejsi v
  rovnováze" + návrh jiných oblastí života. Tree fáze. (příbuzné The Gathering)
- **Produkční formulář** (NEPROVEDENO): zrušit "HOW ARE YOU FEELING" (mood), NECHAT
  "THIS READING IS FOR" (intention); area/seeking otevřené ke změně. Dotkne se
  runar-reader.html + _moodContext/_intentionContext (runar-character.js) + startReading +
  parts[] + §13 full-path. Až po stromu.
- **Norns frekvence**: časté Norns → tlumit rychlý růst kořenů/kmene/větví.
- **DB**: tree_state/tree_readings neexistují. PRODUKČNÍ PRINCIP: pozici větve spočítat
  JEDNOU při čtení a uložit do branch_data — nikdy nepřepočítávat (jinak se lidem
  přeskládají stromy).

## 10. DŮLEŽITÉ KUKYHO PREFERENCE
- Iterujeme k jedné konkrétní podobě po mnoha prototypech — nepřepisovat hotové.
- "Musím to vidět" — vždy ukázat výsledek (screenshot helperem).
- Strom = zrcadlo uživatele, ne dekorace. Náklon/charakter decentní ("kdo má oko, vidí").
- Rychlost času: ~1 rok appky ≈ ~100 let stromu (jasan žije 300-400 let).
- Pomocné soubory: _savepng.js (screenshot helper, port 7799), _tree_shot.jpg (poslední snímek).
