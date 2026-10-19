# Průchod appkou jako uživatel — Visitor → Rune Seeker → Premium (CODE-read, 2026-10-19)

Zadání: owner přes CODE-tune 2026-10-19 (BACKLOG „Uvítání a navedení“). Tenhle soubor je **mapa dnešního stavu** (co se kdy objeví)
a seznam vad, které cestou vypadly. Návrhy (okno Upgrade, helper „?“, zvýraznění, zapojení therunekeeper.com) přijdou zvlášť, až owner
potvrdí, jak rozumím stylu. Intake, ne kánon — po převzetí zmizí.

Zdroj: kód v2/ (subagent, řádky v hlavičkách níž ověřené jen tam, kde to stojí) + prohlížeč, produkce, telefon 375 px, IS, návštěvník
s čistým úložištěm. Přihlášené stavy jen z kódu a z podvrženého stavu v prohlížeči (`currentUser`, `userTier`, nic se neukládá) —
**skutečnou registraci a přihlášení jsem neprošel** (účty nezakládám); to musí owner nebo tester.

## Mapa: krok × co se objeví × kdy × dává smysl?

| Krok | Co se objeví | Kdy | Smysl? |
|---|---|---|---|
| Visitor, první otevření | okno „Where to start“ (Ansuz, 2 tlačítka) | jednou na prohlížeč, 1,8 s po načtení | **ano** — jediná cesta, jak se dozvědět, že Rúnar mluví obrazy; po zavření letí k „How a reading works“ |
| | pozdrav „Það er gaman að sjá þig.“ v horní liště | každé načtení | ano |
| | horní pruh Gestur + GERAST LEITANDI | vždy | ano, ale viz další řádek |
| | „· Gerast Leitandi til að opna“ u 3 polí formuláře | vždy | **ne** — s pruhem jsou to 4 pozvánky naráz; u „Þessi lestur er fyrir“ navíc nic zamčené není (kód: pole záměru se neomezuje) |
| | helper „?“ vlevo dole → bublina nad „How a reading works“ | po klepnutí | **napůl** — ukazuje správně, ale jen na 3 místa a vzhledem jako žlutá cedulka; tohle je ownerovo „okno tap here“ |
| | Safn rúna: pozvánka + 20 zamčených run (toast při klepnutí) | vždy / každé klepnutí | ano; toast při každém klepnutí je hlučný |
| | Lífsrúnin: datum → runa + „Skráðu þig til að lesa…“ | po zadání data | ano; text říká „přihlas se“, tlačítko „staň se Leitandi“ — dvě různé věci |
| | Lestrar (deník): brána Gestur | vždy | ano |
| | Menu: „REIKNINGUR ÞINN“ + Gestur + rozbalené TAKTU FERÐINA LENGRA (Leitandi, Vegfarandi „bráðlega“, Ferðalangur „bráðlega“) + e-mail | při otevření | **napůl** — návštěvník nemá účet, a přesto „tvůj účet“; v menu **chybí přihlášení**; dva účty „bráðlega“ bez ceny a bez cesty |
| Visitor táhne | mřížka 25 run + všech 5 výkladů; u Norn a dalších toast „přihlas se“ a návrat na jednu runu | při tahu | ano (základ §32) |
| | po tahu: runa + karta „Sem Gestur sérðu…“ + SAFN RÚNA + GERAST LEITANDI | hned | ano — jasné, proč čtení nepřišlo |
| Registrace | okno přihlášení (Google / kód e-mailem) → okno se jménem → u testera souhlas | po BECOME / SIGN IN | ano, ale viz vady 1–3 |
| | pozdrav „Það er gaman að sjá þig aftur.“ | i při **úplně prvním** přihlášení | **ne** (vada 4) |
| Rune Seeker, má čtení zdarma | pruh „1 eftir“ + „+“ s popisem + „+ RÚNAKORT“; zámky „{card} opnar allt“ | vždy | ano |
| | po čtení: hlas, Ask jako ukázka „otevře se s Vegfarandi“ | každé čtení | **ne** — láká na účet, který nejde koupit |
| Rune Seeker, 0 čtení | pruh „0 spár eftir“ + Rúnakort (kód, odkaz „koupit na agndofa.is“) | vždy | napůl — **jediná cesta dál je Rúnakort**, na Vegfarandi / Ferðalangur žádná |
| | DRAW ANOTHER / START OVER → prázdná obrazovka bez formuláře | po čtení | **ne** (vada 6) |
| | rozbalovací okno nahoře (jméno): účet, e-mail, „0 spár eftir“ | po klepnutí | **ne** — bez akce, nic nepovede dál (ownerův screenshot) |
| Standard / Premium | pruhy zmizí; v rozbalovacím okně „x spár eftir“; v menu vlastní účet a u Standardu Ferðalangur „bráðlega“ | vždy | ano; ale chybí, **kde předplatné spravovat / zrušit**, a Rúnakort se nedá uplatnit (`#sp-gift` skryté) |
| | „Ask: další otázka s Ferðalangur“ (Standard) | po poslední otázce | ne, dokud nejde koupit |

**Shrnutí:** návštěvník ví, co dělat (okno + pruh + karta po tahu), jen pozvánek je naráz moc. Od registrace dál appka **neříká, jak
jít výš** — žádné tlačítko, cena ani okno; účty nad Leitandi jsou „bráðlega“, a přesto na ně lákají tři texty (Ask, deník, Ask navíc).

## Vady, které cestou vypadly (→ BACKLOG, CODE-tune)
Ověřeno v kódu: 1, 4, 5, 6. Jen z kódu, v prohlížeči neviděno: 2, 3, 7.
1. Okno se jménem se vrací: „Halda áfram án nafns“ jen skryje, `fetchUserProfile` ho při prázdném jménu otevře znovu (i po obnovení
   tokenu a po chybě čtení) — `runar-app.js` `showNamePrompt` / `skipName`.
2. Souhlas testera totéž (✕ zavře do dalšího načtení profilu).
3. Dvě okna naráz: okno se jménem není `.modal-overlay`, „Where to start“ na něj nečeká.
4. První přihlášení zdraví „again“ (`showTopbarGreeting`: každý Rune Seeker = returning).
5. Yggdrasil: toast „plná síla 14.–28. 12.“ při **každém** přidání runy (až 9× za výklad) — `readRune` v `runar-reading.js`.
6. Rune Seeker bez čtení: DRAW ANOTHER / START OVER skončí bez formuláře, po obnovení stránky formulář je.
7. Možný závod při registraci: `upsertProfile` se nečeká před `fetchUserProfile` → nový účet může na chvíli vidět „0 spár eftir“.
8. Drobnosti: „· {card} opnar allt“ / „Gerast Leitandi til að opna“ i u pole záměru, které zamčené není; menu návštěvníka „REIKNINGUR
   ÞINN“ a bez přihlášení; `tree_visitor_read` „přihlas se“ × tlačítko „staň se“; IS `gift_card_btn` „+ RÚNAKORT“ × EN „+ GET A …“;
   mrtvé `#upgrade-gate` (statický EN text), `#credits-banner`, `setText('free-redeem-link')` bez prvku, `updateTopbarGreeting` nedefinovaná.
9. `RUNAR_PRICING.md` si odporuje: Premium „~$36/month“ v nadpisu × „~$40“ v tabulce předplatného.

## Ceny dnes
Rúnakort balíčky: `CARD_PACKS` v `runar-config.js` (čte jen nápověda). Předplatné (ISK měsíčně / ročně) **jen v `RUNAR_PRICING.md`** —
okno Upgrade bude potřebovat ceny v configu (§10, §20); návrh přijde s ním.
