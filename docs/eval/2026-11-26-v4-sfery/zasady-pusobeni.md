# Jak má V4 na člověka působit — co owner řekl s Gemini a co Gemini navrhl (2026-11-26)

**Vlastní jen:** výtah z rozhovoru ownera s Gemini o tom, co a jak má Rúnar člověku říct a jak na něj má zapůsobit. Rozlišuje
**owner** (jeho slova = směr, §21) a **Gemini** (návrh, neměřeno). Zdroj doslova: [zdroj-gemini-architektura.txt](zdroj-gemini-architektura.txt)
(čísla stran PDF v závorce). Kde to naráží na platnou kostru v2, je to u bodu (K = `docs/kostra/KOSTRA.md`). Owner 2026-11-26:
*„zapsat to, co jsem si řekl s Gemini ohledně jak a co by měl model člověku říct, jak by na něj měl zapůsobit“*.

## 1. Co owner chce (jeho slova z rozhovoru)
1. **Čtení má zaujmout** — *„zaujmout natolik, že se chceš vrátit, v čemž mu pomáhá Ask“* (s. 10–11).
2. **Neukázat všechno naráz** — *„díky sférám má uživatel možnost vidět, že je toho víc na prozkoumání … nenabídneme všechno naráz, tak má důvod
   se vrátit“* (s. 10).
3. **Otevírat dveře do poznání run** — runa dá *„jasné možnosti“*, na co se ptát; *„spíš mu ukázat cestu, co dělat dál, na co se ptát“* (s. 3).
4. **Ukázat, kde hledat, ne odpovědět** — *„podstata runy by měla jen ukázat, kde člověk podle významu runy má hledat odpověď. Někdy venku, někdy
   uvnitř“* (s. 11).
5. **Lidé mají najít, co sami nevidí** — *„každodenní podněty … aby lidé s námi zůstali a hledali u nás to, co sami třeba nevidí“* (s. 1).
6. **Osobní kontext až v Asku** — area, seeking, intention *„přijdou až později skrze Ask“*; na začátku jen to, jak se člověk cítí (s. 18).
7. **Paměť a jednoduchost** — u stejné runy vidět minulou sféru; *„musí to být maximálně intuitivní“*, ovládne *„i dítě“* (s. 14).
8. **Vkus se liší** — někdo chce přírodu, jiný moderní obrazy; základ je islandská příroda (s. 8–9). Primárně IS a EN.

## 2. Co navrhl Gemini — hlas a obsah
| # | zásada (Gemini) | strana | proti kostře v2 |
|---|---|---|---|
| 1 | **Kotva + odraz:** pevný obraz runy se nemění; osobní vrstva jen jako 2 věty pod ním, ve třetí osobě, v materiálu člověka (pigment, kód) | 1–2 | nové |
| 2 | **Třetí osoba v obraze**, „you“ jen v UI; v Asku „you“ smí, zakázat jen rozkaz a hodnocení (*should, must, need to, try to*) | 12–13 | ⚠️ v2 mluví k člověku (K1.6 „you“ podle úhlu) |
| 3 | **Žádná rada ani imperativ** — Rúnar nikdy neříká, co udělat | 14 | = J3 |
| 4 | **Povinný hmotný obraz** — každá odpověď, i v Asku, nese fyzikální mechanismus runy | 14 | blízko J4 |
| 5 | **Projekce:** čím méně obraz vysvětluje, tím víc si ho člověk vztáhne; dovysvětlení kouzlo bere | 13 | ⚠️ K2-A (esence s definicí runy) jde opačně; K2-B blízko |
| 6 | **Nevysvětlovat runu** („Wunjo stands for…“) a **nekončit návodnou otázkou** („Could belonging…?“) | 16 | ⚠️ K4 má otázku jako jeden z tvarů konce |
| 7 | **Přerámování bez moralizování:** nepohodlí ukázat jako tření, které něco čistí; žádná toxická pozitivita | 13 | blízko J5 |
| 8 | **Kontrola u člověka:** volí sféru a otázky, je aktivní pozorovatel, ne příjemce věštby | 13–14 | = J1 |
| 9 | **Psychologie pod kapotou:** žádný terapeutický slovník (trauma, healing, inner child, mindset, blocks, toxic); stavba psychologická, slova hmotná | 14 | nové (dnes není pravidlo) |
| 10 | **Směr pohledu runy:** runa ven (Kenaz, Raidho, Fehu, Thurisaz) → odpověď v kontaktu s hmotou; runa dovnitř (Isa, Laguz, Perth, Othila) → v ubrání podnětů | 11 | nové; zařazení run neověřeno |
| 11 | **Emoce mění atmosféru, ne objekt**; nepojmenovat ji | 19–21 | ⚠️ P10 pojmenovává → [emoce.md](emoce.md) |
| 12 | **Stín uvnitř sféry** místo obrácené runy (merkstave) | 15 | = K3.3 |

## 3. Co navrhl Gemini — návrat a objevování (mechaniky)
1. **Sféry jako čočky** runy, z nichž člověk otevře jednu; ostatní zůstávají vidět (s. 2, 4).
2. **Let the rune choose:** sféru v kontrastu k emoci — ukáže úhel, který by si člověk sám nevybral (s. 2).
3. **Dveře Asku:** 2 připravené otázky ke sféře (princip · stín) + volná otázka s nápovědou podle runy (*„Ask where the heat is needed“*) — učí
   ptát se na to, kam se podívat, ne na budoucnost (s. 3, 12).
4. **Čipy na jedno kliknutí:** In my work · With another person · Inside myself · Life Rune (s. 15–16).
5. **Paměť sfér:** prozkoumaná sféra tlumená s fajfkou, klikatelná; 4/4 → runa v Kolekci zlatě (s. 15).
6. **Save with a note** do deníku pod čtením (s. 16).
7. **Životní runa** jen v Asku, s jednořádkovým taháku, proč tam je (s. 16, 19).
8. **Čočky obrazů** Land / Craft / Current; digitální obrazy rychle stárnou, hmotný moderní svět ano (s. 8–10).

## 4. Co z toho není ověřené (§23, §24)
- Účinky („návykové“, „okamžitý aha moment“, „curiosity gap“, „10× přirozenější“) jsou tvrzení modelu, ne měření.
- Tři „ověřené psychologické principy“ (projekce, přerámování, locus of control) Gemini uvádí bez zdroje.
- Rozdělení run ven × dovnitř je od Gemini; ownerovy popisy run (`RUNAR_POPISY_RUN.md`) s ním nikdo neporovnal.
