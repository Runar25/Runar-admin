# Rúnar V4 — sféry runy, pevná kotva, emoce, dveře Asku (lab, od 2026-11-26)

**Tenhle soubor vlastní jen jednu věc:** vstupní bod V4 — co V4 je, co navrhuje, kde naráží na platná rozhodnutí, co owner
k rizikům řekl a pořadí kroků. Měření a znění vlastní soubory kroků v této složce; rozhodnutí `RUNAR_DECISIONS.md` 2026-11-26 (4).
Lane: CODE-read (owner 2026-11-26: *„může spadat pod read, ale jeho úkol bude pracovat na Rúnar V4“*), produkční kód nesahá.

## 1. Co V4 je
Owner 2026-11-26: *„dostaneš projekt, na kterém pracujeme s Gemini. Úplně nový pohled na výklad od Rúnara. S V3 toho nebude mít možná až
tak společného.“* Zdroj doslova: [zdroj-gemini-architektura.pdf](zdroj-gemini-architektura.pdf) (text pro hledání:
[zdroj-gemini-architektura.txt](zdroj-gemini-architektura.txt)).

**Proč V4, ne V3:** V3 (`docs/eval/2026-10-23-v3-charakter/v3-k-ledu.md`, k ledu od 2026-11-09) přestavovala prompt, ale model dál psal
celé čtení pokaždé znovu. V4 mění, KDO text píše: pevný předem napsaný obraz pro každou runu a sféru, model do něj jen zasahuje.

## 2. Co návrh Gemini obsahuje (stručně, podrobnosti ve zdroji)
1. **Sféry runy:** každá runa má 4 (až 5) vlastní „čočky“ (Kenaz: Insight & Clarity · Craft & Shaping · Drive & Friction · Fever & Exposure).
   Člověk si po tahu jednu vybere. Nahrazují AREA OF LIFE. Blank sféry nemá (jeden obraz).
2. **Pevná kotva:** obraz sféry, 4 věty (~60 slov), třetí osoba, hmotný obraz, bez rady. Daily Rune = 1 věta, „fyzikální kotva“ runy.
3. **Emoce na vstupu** zabarví jen větu 1 (atmosféra) a 3 (třecí bod); věty 2 a 4 zůstanou. Emoci nepojmenuje.
4. **„Let the rune choose“:** 5. volba, systém vybere sféru v kontrastu k emoci (slepé místo).
5. **Ask jako dveře:** ke každé sféře 2 připravené otázky (princip · stín) + volná otázka s nápovědou podle runy + čipy Work / People / Self /
   Life Rune. Osobní kontext (řemeslo, situace) až v Asku: 2 věty „odrazu“ do materiálu člověka. Směr pohledu runy ven × dovnitř.
6. **Paměť sfér:** u stejné runy příště vidět, kterou sféru už otevřel; 4/4 = runa v Kolekci rozsvícená.
7. **Pustit:** AREA OF LIFE, WHAT ARE YOU SEEKING, THIS READING IS FOR. **Přesunout do Asku:** THE SITUATION, životní runa.
8. **Čočka obrazů:** Land (islandská příroda, výchozí) · Craft (materiál, dílna) · Current (město, technologie) — k A/B testu.

## 2b. Ownerova rozhodnutí 2026-11-26 (druhá zpráva)
1. *„Obrazy budou úplně nové. Začneme od začátku s jedním pro každou runu. Gemini měl obrazy jinak poskládané, takže tady to budeme muset ještě
   pilovat.“* → banka v2 (190 obrazů) zdrojem obrazů V4 není; aspekty z inventury jsou jen vodítko pro světlé sféry.
2. *„Budeme určitě potřebovat rozmanitost ve čtení, aby nebyla čtení stejná.“*
3. *„Je to úplně jiný pohled na výklad … koukat z nového pohledu než na předchozí verze. Rúnar zůstává a uvidíme, jestli bude potřeba, aby se
   proměnil.“*
4. *„Sfér bude tolik, kolik runa dovolí. Někde víc, někde míň.“*
5. *„Land a Craft by pro nás měly být směry, kudy se vydat“* (přes CODE-tune) → režim Current zatím ne. Obsah runy dne se řeší ve V4 —
   [runa-dne.md](runa-dne.md); CODE-tune ji jen nasadí do knihovny.

**Dokumenty V4:** [kostra-v4.md](kostra-v4.md) (stavba čtení + srovnání s kostrou v2) · [emoce.md](emoce.md) (Gemini × P10, návrh devíti) ·
[zasady-pusobeni.md](zasady-pusobeni.md) (co owner řekl s Gemini a co Gemini navrhl o působení na člověka) ·
[inventura-aspekty-sfery.md](inventura-aspekty-sfery.md) · [pro-gemini-1.md](pro-gemini-1.md) (podklad ke konzultaci s Gemini, owner
2026-11-26; odpověď [zdroj-gemini-odpoved-1.md](zdroj-gemini-odpoved-1.md), rozbor [odpoved-1-rozbor.md](odpoved-1-rozbor.md)).

## 3. Co už máme v datech (nepsat znovu)
- **Emoce:** pokus P10 (`docs/kostra/pokusy.json`, BACKLOG 10 „How I feel“): *What feels closest to you right now?* — Uncertainty · Pressure ·
  Conflict · Loss · Frustration · Hope · Relief · Something is changing · I don't know (9 voleb). Pocit vybere stránku runy pro větu 3, význam nemění.
  Zrcadlení × kontrast na n=4: rozdíl malý, kontrast u Hagalazu obrací pohled. Owner 2026-11-26: *„celkem je jedno, jestli to bude mřížka,
  ale budou to emoce“*.
- **Aspekty obrazů = základ sfér:** [inventura-aspekty-sfery.md](inventura-aspekty-sfery.md) — světlá strana sféry má, stínové sféry ne.
- **Pevné texty z knihovny:** runa dne (DECISIONS 2026-11-17 (1)) — IS se kontroluje dřív, než ji kdo uvidí; varianty se neopakují.
- **Ask na tier:** `TIERS.*.asks_per_reading` v `v2/runar-config.js` (Standard 1, Premium 2) — Gemini píše totéž, sedí.
- **Druhá strana a stín:** P16, P20 — týž cíl jako stínové sféry.

## 4. Kde V4 naráží na platná rozhodnutí (VAROVÁNÍ, §21) a co owner řekl (2026-11-26)
| # | rozpor | co platí dnes | owner 2026-11-26 |
|---|---|---|---|
| 1 | čtení bez „you“ (3. osoba) | v2 mluví k člověku záměrně: registr `direct`, „you stand“, most jako možnost (DESIGN „Stavba Single čtení“) | otevřené |
| 2 | pustit AREA a SEEKING | most stojí na nich: AREA = kam dosedne, SEEKING = tvar (DESIGN, 2026-09-20) | otevřené |
| 3 | stejná runa + sféra = stejný text | runa dne: *„čtení jedné runy se nesmí opakovat“* | *„budeme zkoušet to udělat pestřejší“* |
| 4 | pevné 4 věty u každé runy | povinný tvar = strojový podpis (2026-07-14) | jako bod 3 |
| 5 | IS: ukázky Gemini jen EN; úprava vět 1 a 3 vrací neověřenou IS | §2 IS primární, myslet islandsky od začátku | *„musí se to testovat“* |
| 6 | spready jen naznačené | pět výkladů = základ produkce (§32) | *„ano, je potřeba to zkusit na single; ze spreadu jsme se bavili o Nornách“* |
| 7 | 9 emocí na vstupu | P10 | *„budou to emoce, už je máme v kostře“* |

Norny pozor: Gemini navrhl pozice Situace / Tření / Směr; naše Norny jsou „co tě utvořilo → kde stojíš → kam se kloníš“ (RUNAR_SPREADY.md).

## 5. Fakta od Gemini, která kánon nemá (§23 — neověřeno, nepoužít bez zdroje)
1. Kenaz jako horečka / vřed (sféra Fever & Exposure).
2. Blank jako „Wyrd / Odin“.
3. Tvrzení o účinku (návykovost, „curiosity gap“, psychologické principy) — názor modelu, ne měření.

## 6. Kroky
1. ✅ Inventura aspektů × sféry (bez API) — [inventura-aspekty-sfery.md](inventura-aspekty-sfery.md).
2. ✅ Emoce Gemini × P10 a návrh devíti — [emoce.md](emoce.md); zásady působení — [zasady-pusobeni.md](zasady-pusobeni.md);
   kostra V4 a doporučení „odděleně“ — [kostra-v4.md](kostra-v4.md).
3. Sféry pro všech 25 run — tolik, kolik runa dovolí (owner); owner vybírá.
4. Jeden nový obraz pro každou runu (owner), EN + IS islandsky od začátku — psaný v session, ne přes API (paměť naklady-testovani).
5. Pestrost: jak se čtení téže runy a sféry neopakuje (owner: rozmanitost nutná) — počet obrazů, nebo jiná stavba textu (4R3, 4R5).
6. Pokus „obraz × emoce“ (navazuje na P10): číslo pokusu do `pokusy.json` a ownerovo ano dřív, než poběží model.
7. Rozhodnutí ownera 4R1 (osoba) a 4R2 (oblast, hledání) — bez nich se nepíše prompt.
