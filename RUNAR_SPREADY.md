# RUNAR_SPREADY.md
# Spready — pozice, místo ve stromě, co má který vyvolat, kdo na co dosáhne. Designový záměr, ne jak.
# Čísla (ceny, kapacity) vlastní `v2/runar-config.js`, významy pozic packy `RP_*` v `v2/runar-character.js` — doc je neopisuje (§20).
# Hlas a stavba čtení → RUNAR_DESIGN.md · Norny a světy jako bytosti → RUNAR_MYTOLOGIE.md · strom → RUNAR_TREE.md.
---

## Spreads — pozice a logika

### Architektura spreadů ve stromě

```
SPREAD            STROM                      RITUÁL
1 runa            uzel na větvi              každodenní
3 runy (Norns)    větev → kmen               zakládací + hlubší
5 run (Kříž)      větev (střed + 4 výhonky)  týdenní
7 run (Horseshoe) větvená větev (7 bodů)     sezónní kmen
9 run (Yggdrasil) uzel kořenů — nejsilnější  kdykoliv (slunovrat = větší síla)
```

### Co má uživatel cítit na konci (designový záměr, 2026-08-23)
| Spread | Konec | Pocit |
|---|---|---|
| Norns | recognition | „Vidím vývoj." |
| Kříž | integration | „Rozumím situaci." |
| Horseshoe | direction | „Vidím, kam se to pohybuje." |
| Yggdrasil | revelation | „Teď vidím celý obraz." |

Celek pro všechna čtení → „Co má čtení v člověku vyvolat“ (`RUNAR_DESIGN.md`, Kdo je Rúnar). Je to **záměr, ne slovník promptu** — štítky se do instrukcí NEpíšou (model by je performoval
didakticky). Od v4.14 mají dosednutí (`landing` v packu) **všechny čtyři spready** — sdílená
formule „co se stalo viditelným…", liší se jen strukturální část (pohyb v čase · síly kolem
středu · celý oblouk · celý obraz naráz); single drží otázkový los (v4.11). Zda se čtyři
pocity skutečně dělí, měří oblouk (`scripts/oblouk.py`). → RUNAR_DECISIONS.md 2026-08-23.

### Vztahy mezi taženými runami (KUKY 2026-08-24, syntéza owner+GPT+měření)
- **Vztah = charakter setkání v obraze** — soulad · tření · mlčení jsou NÁLEZY čtení,
  **nikdy morální známka cesty**. „Harmonické runy = správná cesta, trnité = špatná" dělá
  ze zrcadla orákulum — zakázáno. Tření je hodnota („dar podaný přes zamrzlou hladinu"),
  ne vada k uhlazení.
- **Kategorie vztahů = slovník SOUZENÍ, nikdy prompt-nabídka.** Pozorovací čočky: naváže ·
  stojí proti · promění · zesílí · ozvěna · tření · vznikne třetí (emergence) · **mlčení**
  (non-relation — poctivý nález). ⚠️ Do promptu NIKDY: nabídka „smíš nechat být" = změřeno
  0/6 (model ji vezme vždy), povinné „najdi vztah" = model vztah vyrobí vždy (hladce a
  prázdně). Prompt nese povinnou malou VAZBU (fráze/místo/thread); charakter vztahu je
  emergentní a soudí se těmito čočkami. Rozšiřuje trojici „naváže·změní·otevře" (Vegvísir).
- **Žádná statická mapa vztahů 25×25** — vztah žije v konkrétních tažených obrazech, ne
  v páru run (per-pár se neměří, n=1 na dvojici; T2-038 = chyba výběru, ne obsahu).

### Single (1 runa)
Jedna runa, žádné pozice. Přímé čtení energie daného momentu.
Strom: malý uzel na větvi.

### Norns (3 runy) ✅ ZAKLÁDACÍ RITUÁL
```
[Urður] — [Verðandi] — [Skuld]
```
Urður = co tě utvořilo. Nelze odestát. Kořen ze kterého vychází vše.
Verðandi = co se právě tká. Přítomný okamžik jako živá nit.
Skuld = kam se kloníš teď. Směr tvého vlákna, ne dekret osudu. Ne předpověď — trajektorie, kterou můžeš změnit.

Tři Norny = tři kořeny Yggdrasilu. Zakládací rituál stromu — jedním čtením jsou zasazeny všechny tři kořeny najednou. Osa tvého stávání (co tě utvořilo → kde stojíš → kam se kloníš), ne osud. Každá Norna mluví jiným hlasem a jinou vahou.

Strom: větev → kmen. Zakládací rituál.

*Rezerva: 9-run verze (3+3+3 pro každou Nornu) — vymyšlená, hlubší. Zatím neimplementovat.*

### Kříž (5 run)
```
         [2]
   [4] — [1] — [5]
         [3]

1  střed      — jádro situace, co je teď
2  nad        — co vědomě vidíš / co aspiruješ
3  pod        — co je skryté / kořen / podvědomí
4  za tebou   — co přichází z minulosti
5  před tebou — kam situace směřuje
```
IS pozice: zdroj pravdy `RP_KRIZ.is.positions` (`v2/runar-character.js`), doc je NEOPISUJE (§20).
Strom: větev s centrálním uzlem a čtyřmi výhonky.

### Horseshoe (7 run)
```
[1]       [7]
[2]       [6]
[3]       [5]
    [4]

1  minulost
2  přítomnost
3  skryté vlivy
4  překážky
5  okolí a druzí
6  co dělat
7  pravděpodobný směr
```
IS pozice: hotové v produkci — zdroj pravdy `RP_HORSESHOE.is.positions` (`v2/runar-character.js`),
doc je NEOPISUJE (§20).
Tvar podkovy: oválné U — levé rameno 1-2-3, pravé 5-6-7, 2 a 6 o půl kroku víc do stran (nejširší řada), čtyřka dole uprostřed mezi
3 a 5 o půl kroužku níž. Owner 2026-10-27: *„2 a 6 více do vnějších stran … zaoblené U, ale více oválné jako O“* (`RUNAR_DECISIONS.md`
2026-10-27 (2)); dno a čtyřka z 2026-10-11 (31), (37).
Strom: větvená větev se sedmi body → sezónní rituál kmene.

### Yggdrasil (9 run) — všichni přihlášení, KDYKOLIV
```
          [1]            koruna (1 = Ásgarðr)
      [2]     [3]        koruna
      [4]     [5]        kmen
  [6]     [7]     [8]    kořeny
          [9]            kořeny (9 = Hel)
```
Strom v appce od 2026-10-11 (KUKY: *„to má být podle toho, jak je yggdrasil spread vykládán… ok udělej strom“*, `RUNAR_DECISIONS.md`
2026-10-11 (40)): tradiční rozložení neexistuje, runové weby kladou Ásgarðr nahoru a Hel dolů; patra jsou patra výkladu.
**Významy pozic vlastní `RP_YGGDRASIL` v `v2/runar-character.js` — doc je NEOPISUJE** (§20;
táž poznámka jako u Horseshoe výš).
Nejde do větve — jde do kořenů stromu. **Kdykoliv, žádná brána na datum.**
Strom: devítibodový uzel v kořenech — nejsilnější bod celého stromu.

⚠️ **Slunovrat sem nepatří.** Zimní slunovrat je informace o **stromě**, ne o přístupu ke
spreadu: čtení udělané o slunovratu má ve stromě **větší váhu** (KUKY 2026-08-16). Kdo sem
vrátí datum jako podmínku, opakuje chybu, kterou owner opravoval pětkrát → `CLAUDE.md`.

### The Gathering (3–5 run)
**Nová role (2026-06-07): tree pattern detection — již není viditelné v journalu.**

Stará funkce (týdenní rituál, whispers-section, journal karta) odstraněna:
- whispers-section HTML blok smazán z runar-reader.html
- Gathering karty a filter odstraněny z runar-journal.js
- updateWhispersUI() odstraněno z renderJournal()
- Stará DB data (area='gathering') zůstávají v DB — tichý skip při renderování

Starý modul Gatheringu **odstraněn 2026-09-28** (DECISIONS 2026-07-04: ruční Gathering = mrtvý, ke smazání; 2026-09-28 (1) = provedení). Nová podoba = automatický Gathering nad deníkem, `RUNAR_TREE.md` §7. <!-- doc-links:ok 2026-09-28 soubor záměrně smazán -->
Nová logika potřebuje tree_state DB (neexistuje). Implementace: čeká na V3.

### UI — domluveno ✅
Přepínač pod "DRAW YOUR RUNE":
`[ SINGLE RUNE ]  [ NORNS ]  [ KŘÍŽ ]  [ HORSESHOE ]  [ YGGDRASIL ]`
Stejný styl jako V2 lab v shrine.

---

## Tier systém — přístup ke spreadům a stromu

### Spreads per tier — viz RUNAR_PRICING.md (kompletní tabulka)

Kdo na co dosáhne, vlastní `CLAUDE.md` („Spread systém → Gating“) a čísla `v2/runar-config.js` (`SPREAD_COSTS`,
`TIERS.*.monthly_readings`) — tady se neopisují (§20). Ve zkratce: blokuje se jen nepřihlášený; každý přihlášený dosáhne na
všechny spready — Rune Seeker za kredity (volné čtení jen na single), předplatitelé z měsíčních jednotek (počítají se jednotky
čtení, ne runy). Yggdrasil kdykoli; zimní slunovrat = větší síla ve stromě, NE podmínka přístupu (KUKY 2026-07-18).

### Tree of Life per tier

Stav vlastní `RUNAR_TREE.md` a kód (kdo záložku Strom vidí: `renderLivingTree` v `runar-tree.js`);
životní runu (výpočet) vidí každý i bez účtu, její čtení až po přihlášení a pro všechny stejné (builder tarif nedostává —
nepoužitý parametr `isPremium` a nečinný režim `life_rune_premium` zrušeny 2026-10-11, DECISIONS 2026-10-11 (22)); zakládací Norny i rozbor jména jsou rituály — zdarma pro každého přihlášeného, jednou (`claude-proxy`
`isRitual`).
