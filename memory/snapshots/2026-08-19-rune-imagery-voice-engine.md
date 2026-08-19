---
name: 2026-08-19-rune-imagery-voice-engine
description: Kde jsme skončili 2026-08-19 — engine runové obraznosti + hlasu (6 os pestrosti), spolupráce CODE-read × Cowork, co visí a další krok. Session-stav, ne sklad faktů (ty mají vlastníky).
metadata:
  node_type: memory
  type: snapshot
---

# Snapshot 2026-08-19 — engine runové obraznosti + hlasu (CODE-read × Cowork)

**Historický záznam ke dni.** Jen session-stav + další krok. Rozhodnutí/měření/úkoly mají vlastníky
(ukazatele dole), sem se NEopisují (§20).

## Kde jsme v oblouku
Od „čtení jsou moc stejná / starý hlas" k **navrženému + generováním ověřenému enginu**, jak Rúnar
skládá čtení. CODE-read (já) testuje/měří/mapuje a předává; **Cowork staví obsahové banky** (25 run);
produkční kód nesahám. Vše ověřováno na opus-4-8, EN i IS, nativně (IS se VYTVÁŘÍ z významu, §2 —
NEpřekládá z EN faset; owner na to trval).

## Engine = ŠEST os pestrosti (spec v DESIGN má zatím jen 1–4)
1. **POLE + rozprostírač** (který obraz) — dvouúrovňové (domény→fragmenty), rotace domén proti slévání.
2. **FORMA L1** (obraz + esenční řádek + umístění) — cíl; L2 = „direct".
3. **TVAR věty** (jak postaveno) — „střídej tvar", jinak monotonie (6/6→0/6).
4. **NÁZVOSLOVÍ** (jakými slovy význam) — banka faset, rozšiřuje slovník.
5. ⭐ **KÁNON-framing** (NOVÉ 2026-08-19) — studené čtení/rada protéká i s obecnými zákazy u symbolů,
   co samou povahou míří na čáru (landvættir=„jsi chráněn", hvalreki=„jsi varován"). Potřebují guardrail.
6. ⭐ **STÁŘÍ/nechutnost obrazu** (NOVÉ 2026-08-19) — autentické ≠ současné; subsistenční severské
   obrazy vyjdou středověké/gore (hvalreki, need-fire, landvættir-lodě). Preferovat nadčasové/moderní.
→ osy 5–6 NEJSOU v DESIGN specu (má 1–4) — čekají na ratifikaci ownerem.

## Stav Coworkových bank
- **Názvosloví: 25 run hotovo** (161 faset).
- **Pole obrazů: 5 kalibračních + audit dávka 1/3 (Freyr) + 2/3 (Hagal)** hotové, vč. kría-řešení
  (labuť→Jera, kría→Algiz) a 4 nových vazeb (ledovec→Isa, hvalreki→Nauthiz, landvættir→Algiz,
  need-fire→Nauthiz). **Dávka 3/3 (Týr + Blank) VISÍ** + rozšíření palety (vazba-first, tiered).
- Vše CODE-read ověřil generováním; nálezy → EVAL_LOG (ukazatel dole).

## DALŠÍ KROK (kde navázat)
1. **Cowork** vrátí: dávku 3/3 · rozšíření palety · **3 opravy z dneška** (hvalreki DROP/reframe —
   archaic+gore · need-fire reconsider — archaic · landvættir reframe BEZ lodí — spraví archaic I
   cold-reading). Framing-guardraily + archaic-screen relayovány (v chatu, směr docs/archive).
2. **CODE-read** (já): každou vrácenou dávku ověřit + **generační test** (fit) + **kánon-eval** +
   **archaic-soudce**. Nástroje hotové (viz dole).
3. **CODE-tune**: implementace do `runar-character.js` (AŽ owner řekne — teď „testujeme, žádná
   implementace") · odstranit Jera „těsto" z živého poolu · přidat archaic+kánon eval do smoke.
4. **Owner**: ratifikovat směr + osy 5–6 do DESIGN · otázka vlastnictví DESIGN (BACKLOG).

## Nástroje (CODE-read eval harnessy)
Ve scratchpadu session (session-temp, nemusí přežít); **korpusy přežijí v `~/runar-eval/*.txt`**.
Klíčové vzory k obnově: soudce archaic/nechutnost + kánon-check (4×/vazba, číst na omen/radu/stáří).
Systémový prompt pro testy = `~/runar-eval/ref-fehu-{en,is}-focused.jsonl.meta.json` (runově nezávislý).
API klíč `~/.anthropic-key` (30 dní od 2026-08-17). Model testů = opus-4-8 napřímo.

## Identita / mechanika
Jsem **CODE-read**: prefix `[read]`, commit `git -c user.name='CODE-read' commit -F <msg> -- <cesty>`
(per-commit, ne git config). ㉛ aktivní a opravená (soudí jen `0d2abbc..HEAD`, předkonvenční historie
neblokuje). NIKDY `--no-verify` / `git add -A`.

## Ukazatele (pravda bydlí zde, ne v snapshotu)
- Engine spec (osy 1–4) → `RUNAR_DESIGN.md` „Jak Rúnar skládá čtení".
- Směr (pole+rozprostírač/L1/tvar/Isa-relaxace) → `RUNAR_DECISIONS.md` 2026-08-18.
- Měření → `RUNAR_EVAL_LOG.md` 2026-08-18 (⑦⑧) + 2026-08-19 (kánon-check).
- Coworkovy banky/handoffy → chat + `docs/archive/` (po převzetí přes CODE).
- Korpusy čtení → `~/runar-eval/*.txt`.
