# Snapshot 2026-10-05 — CODE-read: LAB přestavby promptu — co už bylo změřeno (před startem)

Historický záznam ke dni. **Čísla a doklady vlastní `RUNAR_EVAL_LOG.md` / `RUNAR_DECISIONS.md`** — tady jen výtah s odkazy,
aby lab nezačínal od nuly. Owner 2026-10-05: *„napřed si je načti, ať víš, co jak fungovalo a co ne… stejně pojedeme, protože to budeme
celé předělávat."* Zadání: handoff CODE-tune proti `598522d` (audit body 4 · 5 · 6 · 8 + prompt pro přemýšlející modely; nic do v2/).

## Bod 4 — zákazy × pozitivní pokyny
- **Zákaz v řádku oblasti odebrat CELÝ = vyvráceno** (DECISIONS 2026-09-20 (9); EVAL 09-20 (10)): chlad 2/6 → 4/6. Vyhrála **pojmenovaná
  výjimka** („except in the closing line…“) — dosednutí 6/6. „Nezkoušet znovu.“
- **Zákaz + pozitivní cíl vedle sebe** funguje líp než holý zákaz i holé odebrání: Ask W2 (EVAL 10-03 (3)), ✦ „turn it toward the seeker“
  (09-30, v4.83), esence N3 (09-26 (4)).
- **Pozitivní pokyn řídí ZPŮSOB, obsah nedodá** (EVAL 09-09: „prostý název MUSÍ dorazit“ 17 → 17 %; 09-12 „jen pokyn hlasu“ vazbu nedonesl).
- **Pojmenované zakázané slovo se zasévá** (v1.2 „already“; 09-09 „not 'Fehu is wealth'“ zabil obsah 17 % proti 93 %).
- **Některé návyky nejsou z pravidel** — koncovka Asku: bez všech zákazů naráz 8/14 = produkce (EVAL 10-04 (3)).
- Odebrat vadu bez náhrady umí odkrýt vadu, kterou držela (EVAL 09-06 ASK1: rada 1/4 → 2/4).

## Bod 5 — data uvnitř pokynů / opis
- **Co stojí jako hotová věta, model opíše**: rúnaþula 2/2, citovaná věta 24/25, „Fehu is that warmth“ 32/33, výčet sloves 19/41,
  holé sdělení o sezóně 5/6, obraz ~50 % slov / místo 100 % (EVAL 09-09).
- **Rozhoduje sloveso/rám**: „use this one“ 12 → 56 %; rám zdroje „comes from here… Let it become your own seeing“ 56 → 32 % (DECISIONS 08-14).
  **Podmínka bez vyslovitelné fráze** neopisuje: sezóna D 0/6 (EVAL 09-19 (6)); „one detail the sentence does not name“.
- **Jednou, ne dvakrát**: podoba oblasti 2× = doslovný opis 3/3, 1× = 1/3 (EVAL 10-03). Glosa zmizí až z hlavičky i pokynu (09-22 (2)).
- **Neochuzovat**: seznamy klíčových slov u solu nesou identitu run (6/12 → 3/12 bez nich, 1 slovo nejhorší; EVAL 09-23 (3)).
- Formát „jedna vazba“ (Gebo — exchange ↔ response) 0 opsaných slov; hotová věta 10 slov; seznam 4/5 klíčů (EVAL 09-12).
- IS opisuje řádově víc než EN (32 % proti 9 %). Separace XML/Markdownem **neměřena**.

## Bod 6 — předepsaný postup
- **Počet vět model drží přesně (24/24), slova ne** (EVAL 09-20 (4)); číslo se čte jako střed, mez jako mez (09-08 HUTNOST).
- **Pevné role po větách: +10,4 % znaků, nulový zisk** (09-08) · **povinnost přidaná navrch = tvrzení** (Norns B, 09-20 (8)).
- **Šablonu dělá ZADÁNÍ, ne příklad** (esence E-NIC 58 %, E-UKAZ nový jediný tvar 100 %; 09-08). Pestrost dá los (E-LOS3).
- **Pětifázový oblouk se nestaví — vzniká sám 3/5** (DECISIONS 08-23). Věta 2 přetížená (26 %), věta 3 bez zadání (EVAL 09-26 (1)).
- Ponechat (změřené): los délky · poslední věta = most „may be“ · úhel (owner: „bez něj všechno stejně“) · připomínka délky s číslem
  na konci (Opus −8 slov) · ✦ ≤ 12 slov · jeden obraz · „Mention <runa> by name once“.

## Bod 8 — „The image must connect to where this person is standing right now“
- Vznikla 2026-06-07 (VOICE_PROFILES.focused, commit 7a5e7b5), **žádný změřený přínos**; přímo testována nikdy nebyla.
- Hypotéza „dělá *You stand*“ padla — to je úhel 6 + bývalý ENDING_OPEN[1] (EVAL 09-18).
- Podezřelá: plní větu 3 přenosem do života (EVAL 09-26 (1)); tvrzení vznikají, když věta popisuje JEHO místo scény (09-24 Norns, 09-12 V3).
- Pozor: oblast je nejsilnější nosič tématu otázky (bez area 1/4 proti 4/4; EVAL 09-06). Přenos k člověku nechat v řízeném mostu.
- Kotví se na ni smoke `scripts/verify_contract_wiring.js:213`; IS dvojče `runar-character.js:864`.

## Přemýšlející modely
- Opus 5 bez `thinking: disabled` → prázdný text na 700 (DECISIONS 09-24 (11)) · Opus 5 low: +41 % ceny, 1/6 useknuté (EVAL 10-04 (3)) ·
  Opus 5.5 nejde vypnout, 500–700 tok., IS na 700 0/3 textů, $0,04, 16 s (EVAL 09-22 (1)) · sol 6.1 low: rozpory v obraze, 8,5–17,4 s,
  rozbil produkci (DECISIONS 10-05 (3)). Strop ≥ ~2000 + kontrola stop_reason; effort délku neřídí.
- Oprava pro jeden model druhému často nic nedá (one detail, glosa, World/Elements jen sol). Subagent produkční vady nereprodukuje (09-19 (3)).

## Metodika pro lab
Jedna páka na rameno, ≥ 5 opakování, pilot napřed · obrácená páka · soudce vidí jen to, co uživatel · různě formulované rubriky,
max 3–5 soudců · všechny losy zaznamenat (délka!) · IS korpusem a is-grammar-qa · ownerovi celé texty.
