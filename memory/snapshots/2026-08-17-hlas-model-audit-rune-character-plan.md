---
name: 2026-08-17-hlas-model-audit-rune-character-plan
description: Kde jsme skončili 2026-08-17 — testování hlasu napříč modely, náklady, drop sonnet-5, a keep/drop/invest mapa promptu s plánem „bohatá podstata runy místo vloženého obrazu". Přesný bod navázání.
metadata:
  node_type: memory
  type: snapshot
---

# Snapshot 2026-08-17 — hlas × model, náklady, a plán „charakteristika runy"

**Historický záznam ke dni.** Rozdělaná práce + rozhodnutí. Živou pravdu vlastní kód/produkce.
Tahle session testovala, **jak má Rúnar znít** — CODE-tune v roli **CODE-reader** (owner: „codování
dělá CODE-tune, ty jsi code-reader" — čtu/testuju/mapuju, produkční kód nesahám, změny předávám).

---

## ⭐ KDE NAVÁZAT (schválený plán — owner: „beru tvůj plán")

1. **PROTOTYP „podstata runy místo vloženého obrazu".** Vzít **2–3 runy**, napsat jim **bohatou
   podstatu/charakteristiku** (konkrétně, smyslově, rovnou IS + EN parita), **vypnout vložený obraz**
   (`_seasonalImagery`) a změřit, jestli si **opus** obraz vytvoří sám a **sedne + zůstane konkrétní**.
   Owner potvrdil: **INVEST ano.** Owner navrhl navíc zkusit i variantu **PŘÍBĚH** (malý příběh místo
   jednoho obrazu) — „zní to tak lépe?" → v prototypu porovnat: (a) obraz self-generated, (b) příběh.
2. **TEST DÉLKY** (owner: délka = otázka ceny). Napřed **změřit současnou délku** (baseline, `S.length`
   = 3 věty / 38–45 slov), pak zkusit **delší** a vidět rozdíl. Modely: **opus-4-8 + sonnet-4-5.**
3. **Testovat na VŠECH 25 runách**, ne jen Fehu (Blank/Isa/Hagalaz jsou těžší pro self-generated obraz).
4. Až se směr potvrdí prototypem → **ratifikovat do `RUNAR_DESIGN.md`** (změna hlasu/kánonu = ownerovo
   rozhodnutí) + implementace = **CODE-tune** (já ne).

---

## NÁSTROJE A PŘÍSTUP (jak reprodukovat, klíče)

- **Anthropic API klíč:** `~/.anthropic-key` (owner ho dal, platí **30 dní** od 2026-08-17, může nechat).
  Přes něj se volají modely napřímo (`api.anthropic.com/v1/messages`), obchází proxy.
- **Eval token (proxy):** `~/.runar-eval-token` (Supabase admin JWT, **vyprší po 60 min** — owner ho
  obnoví v shrine konzoli `copy((await sb.auth.getSession()).data.session.access_token)`, načtu ze schránky).
- **Simulátor starého (májového) promptu:** `…/scratchpad/simulate_old_voice.js` — rekonstruuje květnový
  DEF_CHAR (git commit **2318304**, dumpy v scratchpadu `char-16may-2318304.js`, `runes-16may-2318304.js`)
  + shrine user prompt v1(`cace3c0`)/v2(`2318304`). Flagy: `--rune --lang --era v1|v2 --backend api|proxy
  --model --n --max --fix` (`--fix` = sjednotí RESPONSE FORMAT na jedno plynulé čtení bez `|||`), `--dry`.
  Tiskne i `in=/out=` tokeny.
- **Current prompt caller:** `…/scratchpad/run_prompt.js` — vezme PRAVÝ produkční prompt postavený
  `gen_batch --dry-run` (systémový z `.meta.json`, user z `.jsonl`) a pošle na API. Refy hotové:
  `~/runar-eval/ref-fehu-{en,is}-{focused,direct}.jsonl`. `gen_batch --dry-run` staví prompt **zdarma bez
  tokenu**; `gen_batch --voice direct|focused` přepíná rejstřík.
- ⚠️ scratchpad je session-temp → skripty nemusí přežít compact. Logika reprodukce je výš (git 2318304 +
  gen_batch dry-run). Klíče v ~/ přežijou.

---

## NÁLEZY

### Modely
- **sonnet-5 DROP — HOTOVO** (task_3bd64914, jiná session): `"claude-sonnet-5"` odstraněn z `MODELS`
  v `claude-proxy/index.ts:674` (zůstává opus-4-8 → opus-4-7), **deploy v59**. Viz snapshot
  `2026-08-17-sonnet5-drop-deployed.md`. Důvod: nepředvídatelný thinking (IS out kolísal 216 vs 495; na
  složitém `direct` promptu out ~560). ⚠️ ten snapshot hlásí „main checkout pozadu za origin/main" —
  **před commitem `git status`/`fetch`** (parallel-code-sessions-collision).
- Kandidáti dál: **opus-4-8** (produkce), **opus-4-7**, **opus-5**, **sonnet-4-5**.
- opus-5 má thinking defaultně zapnutý → nejvyšší výstup z opusů, mírně kolísá. opus-4-7 nejlevnější opus.

### Náklady (zapsáno v RUNAR_PRICING.md, commit 28526b3)
- Single Fehu, májový prompt, necachováno, dnešní ceník (opus $5/$25 · sonnet-5 $2/$10 zaváděcí ·
  sonnet-4-5 $3/$15): **sonnet-4-5 nejlevnější+nejstabilnější** (~$0,004 EN / $0,007 IS); opus ~$0,01–0,017.
- Dnešní `direct` prompt EN: sonnet-4-5 in1361/out91; opus-4-8 in1889/out96; sonnet-5 out **560** (thinking).
- ⭐ **Náklad ≠ jen model, ale i SLOŽITOST promptu** (spouští thinking). A **v CELKOVÉ ceně čtení model
  ~nerozhoduje — ElevenLabs ~90 %.** Model se volí podle hlasu/spolehlivosti, ne ceny.

### Hlas — princip (owner to sám shrnul, potvrzeno daty)
- **Čím víc řídí PROMPT, tím míň záleží na modelu** (sonnet-4-5 na sevřeném produkčním promptu drží čistě).
- **Čím volnější prompt, tím víc záleží na modelu** (opus na volném májovém promptu generuje pestré sedící
  obrazy sám; sonnet-4-5 je hubenější a chyboval — IS slipy „fyrsti grasi", „brýðir", „þú einn").
- Trade-off **kontrola ↔ svoboda**, ne „lepší/horší model". (Nabalování promptu původně kompenzovalo
  slabý sonnet-4-5; přechodem na opus se z toho stala zbytečná zátěž — opus je sám záruka kvality.)
- _(tenhle princip ještě NENÍ zapsán do RUNAR_EVAL_LOG.md — kandidát na zápis.)_

### `|||`
- Byl to **oddělovač dvou vrstev** starého (May) formátu. **Není pauza.** Produkce už dnes chce „jedno
  plynulé čtení" → `|||` nemá; konflikt byl jen v REKONSTRUKCI májového promptu (`--fix` ho vyřešil).

---

## KEEP / DROP / INVEST — mapa promptu (owner: „mapa je gold")

### ✅ KEEP — mantinely, které dobrý text nenahradí
| co | kde | proč |
|---|---|---|
| identity/personality/purpose | `character.js` DEF_CHAR (14–93) | kánon — kdo Rúnar je |
| `never` (žádná věštba/strach/klišé/„ferðalag"/vykřičníky) | DEF_CHAR.never | kánon, chybuje i opus bez nich |
| stance „nakresli obraz, nepodej závěr" | DEF_CHAR.philosophy / _spine | kánon zrcadlo≠orákulum (abstrakce = záměr) |
| `_noColdRead` | `character.js:645` | anti-cold-reading, kánon + Coworkem doloženo |
| anti-echo + „pojmenuj tvar, ne krok" | `_spine` (1073) | řeší „moc stejná" — **jiná věc než obraz!** |
| „jeden smyslový obraz, napojený na člověka, žádná dekorace" | `_spine` THE IMAGE | drží self-generovanou obraznost KONKRÉTNÍ |
| **islandský gramatický blok (7 pravidel)** + gender `_addressContext` + `getCorrPrompt` | `character.js:83–91` | **linchpin IS kvality** |
| RESPONSE FORMAT (jedno plynulé, bez labelů/`\|\|\|`) | DEF_CHAR.format | struktura |
| úhly `READING_ANGLES`/`_randomAngle` | `utils.js:212,235` | **skutečný lék na stejnost** (ne obraz!) |

### ❌ DROP / přepsat — homogenizátory + berličky za slabý model
| co | kde | proč |
|---|---|---|
| **`RUNE_IMAGES` (81 obrazů) + `_seasonalImagery` + `SEASON_POOLS`** | `character.js:464–546, 560, 243` | vložený obraz → čtení kolem něj **krouží**; fixní pool nejde napsat na všech 25 run; obří údržba. Nahradit podstatou runy. |
| nabalené mikro-pravidla/duplicity | roztroušené v builderu | vznikly kolem sonnet-4-5; opus je nepotřebuje |

### 🔧 INVEST — páka „charakteristika runy"
- **Obohatit `runar-runes.js`:** dnes jen `k`/`k_is` (hubené klíče) + `formula_is` (jednořádek, **jen IS**)
  + world/elements/aett. → Napsat **bohatou podstatu runy** (konkrétně, smyslově, IS+EN), aby si model
  obraz **vytvořil sám a seděl na runu z definice**. `formula_is` = zárodek, rozšířit + dodělat EN.
- **Napsat dobře hlasový rejstřík** (`HOW YOU SPEAK`/focused|direct, `config.js:396–462`).

### Doladit (páky, ne keep/drop)
- **délka** (`S.length` — dnes 38–45 slov; test baseline → delší), `_describeRule`/`_endingShape` (rejstřík).

---

## ⚠️ OPRAVA MAPY (owner 2026-08-17) — obrazy NEMĚLY být všechny přírodní
Owner: *„nechci aby byly všechny přírodní. Obrazy mají být cokoliv co je přirozené a pochopitelné pro
uživatele."* → Těch **17/81 lidských scén (chléb, káva, klíče) bylo ZÁMĚRNÉ**, ne drift. Problém tedy
**není „nejsou přírodní"** — problém je **FIXNÍ POOL** (nejde napsat na všechny runy, homogenizuje).
Řešení stejné: podstata runy → Rúnar tvoří obraz sám (nebo **PŘÍBĚH** — owner to chce zkusit).

## Otázka na `_spine` (owner) — kdy se načítá?
`_spine(lang)` je **volané uvnitř `buildSysPrompt`** (`character.js:1144`, poslední blok systémového
promptu). Takže je **součástí KAŽDÉHO čtení**, vždy aktivní v produkci. Není to volitelné.

---

## COMMITNUTO TUTO SESSION
- `93801b3` — snapshot `2026-08-17-first-static-readings-may-old-voice.md` (prvotní statická čtení + jak vznikala, model sonnet-4-5).
- `28526b3` — RUNAR_PRICING.md sekce „Volba modelu čtení — měření per model (2026-08-17)".
- `~/.claude/` (mimo repo) — compact-backup hook + runar-context.py rozšíření (po-compact vloží posl. zprávy ownera).
- Data ven ze Supabase: `~/runar-eval/static-readings-may-2026.{md,jsonl}`, `old-voice-simulation-ALL-2026-08-17.md`.
