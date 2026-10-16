# Kontrola promptu tvorby čtení — 2026-10-16 (CODE-read)

Podklad pro CODE-tune (opravy) a pro ownera (rozhodnutí). Intake, ne kánon: po převzetí se položky přesouvají do kódu / BACKLOGu
a soubor jde do archivu. Owner 2026-10-16: *„můžeme do hloubky zkontrolovat celý prompt tvorby čtení, že je všechno v pořádku,
správně, bez vad… připravujeme vše na spuštění do produkce a tam chceme vychytat všechny mouchy.“*

Jak: prompty z produkčních builderů bez volání modelu (single, Norny, Kříž, Podkova, Yggdrasil × IS/EN, Ask; životní runa a rozbor jména
sondou), verze promptu v5.09-crisis-112. Tři kontroly: logika a soulad · islandština promptu (check-is, Greynir na 423 větách, korpus
`is-vazba.py` ~120 frází, slovník) · prompt proti oficiálním návodům OpenAI a Anthropic. Známé nálezy (audit 2026-10-07, návody
2026-10-04, odložené) se neotvírají — u bodů je odkaz. Řádky = `v2/runar-character.js`, pokud není uvedeno jinak.

## A. Opravy (jasné vady, bez rozhodnutí ownera) — pro CODE-tune

### A1. Krize v Asku (vysoká)
Systém `:28` (EN) / `:81` (IS): při řeči o sebepoškození Rúnar jmenuje 112. Ask `RP_ASK.rules` `:1925` / `:1967`: „If the question is not
about this reading … do NOT answer it — turn the seeker back to the runes“. Krizová věta v Asku je přesně „not about this reading“ a
konkrétní pokyn v user promptu ji může přebít (DECISIONS 2026-10-16 (1): „neověřeno, jak sol větu poslechne“).
→ do pravidla mimo téma (EN i IS) výjimku: kromě řeči o sebepoškození — tam platí věta o 112.

### A2. Islandština v živých promptech (doloženo korpusem / slovníkem; opravy ověřené Greynirem)
1. `:1786` (každý IS single) „Sleppu öllu uppfyllingarefni.“ → **„Slepptu öllu uppfyllingarefni.“** (slepptu öllu 62× / sleppu öllu 0×).
2. `:1965` (každý IS Ask) „með einni eða tveimur hlýjum kveðjuorðum“ — kveðjuorð je střední rod → **„með einu eða tveimur hlýjum kveðjuorðum“**.
3. `:88` (každý IS systém) pravidlo „Sögn sem endar á -ar í 3. persónu tekur -ir/-ð í 2. persónu eintölu“ je chybné (hann talar / þú talar;
   þú talar 11 882× / þú talir 1 554× = konjunktiv) → **„Sumar sagnir hafa aðra mynd í 2. persónu eintölu en í 3. persónu: Hann fer en þú
   ferð, hann sér en þú sérð, hann á en þú átt.“**
4. Slabé „rúna“ proti „rún/rúnir“, které předepisuje sám gramatický blok (rúnin 76× / rúnan 0×; hver rún 6× / hver rúna 0×):
   `:1767` „DREGNA RÚNA“ → **„DREGNA RÚNIN:“** · `:989` → **„Hver rún heldur áfram þar sem sú á undan skildi við — einn samfelldur vefur,
   aldrei upptalning.“** · `:2258`, `:2451`, `:2540` → **„Sérhver rún verður að setja mark sitt.“** · JSON `:2261`, `:2370`, `:2454`, `:2543`
   → **„Skilaðu EINGÖNGU þessu JSON-fylki, einum hlut fyrir hverja rún í röð, engu á undan eða eftir.“** a **„…sem tilheyrir þessari rún.“**
   (Nepoužívané štítky `LífsRúna`/`LÍFSRÚNA` opravit spolu.)
5. `:2250` Kříž „Lesturinn fer í einum flæði — ekki fimm aðskildir lestrar.“ (flæði střední rod; souřadná část ve 4. pádě) →
   **„Lestu allar fimm sem eitt samfellt flæði — ekki sem fimm aðskilda lestra.“**
6. `:2538` Yggdrasil „Lestu frá Ásgarðr niður til Hel“ → **„Lestu frá Ásgarði niður til Heljar — eitt flæði, ein rödd.“** (til Heljar 452× / til Hel 15×).
7. `:2447` Podkova „— ekki sjö aðskildir lestrar.“ → **„— ekki sem sjö aðskilda lestra.“** (Norny to už mají správně).
8. `:89` „Fleirtala: öllum böndum jöfnum; …“ (0×, E001) → **„Sama gildir í fleirtölu, til dæmis endurteknir straumar, endurteknar bænir og endurtekin orð.“**
9. `:92` „Kynið er tilgreint í ÁVARP“ → **„Kynið er tilgreint í línunni ÁVARP; fylgdu því.“**
10. `:68` „einhversstaðar“ → **„einhvers staðar“**; `:77` „prédíkar“ → **„prédikar“** (12 944× / 4×).
11. `:74–76` blok „never“ — kalky (0× v korpusu): „spáir aldrei um hlutlæg örlög“, „fullyrðir aldrei algerar sannanir“ (sannanir = důkazy),
    „hræðslubyggðar spár“, „klisju velferðarfræði“ (velferð = sociální péče) → **„Rúnar spáir aldrei fyrir um örlög og setur aldrei fram
    algild sannindi.“** · **„Rúnar vekur aldrei ótta með spám sínum.“** · **„Rúnar notar aldrei klisjur úr sjálfshjálparbókum eða slangur nútímans.“**
    (Seznam klišé v IS = obsahová položka BACKLOG, tady jen slova.)
12. `:1777` „LESTRARHORNIÐ (fylgdu þessum opnunarpunkti …)“ — opnunarpunkt 0× (upphafspunkt 359×), lestrarhorn lze číst jako „čtenářský koutek“
    (neověřeno) → **„SJÓNARHORN (fylgdu þessum upphafspunkti og láttu hann móta tóninn og byrjunina):“** (`_promptDraws` čte text úhlu, ne štítek).
13. `v2/runar-utils.js:726` podoba „Innri Vöxtur“ „hægri breytingu“ (zní jako „pravý“; 0×) → **„hægfara breytingu“** (12×).
14. `:2443` štítky Podkovy (jdou i do STÖÐURNAR v Asku): „hvað er að ríkja“ → **„hvað ríkir nú“** · „hvað þyngir eða hindrar“ (þyngja chce
    předmět) → **„hvað þyngir róðurinn eða hindrar“** · „hvað er inni í þér“ → **„hvað býr hið innra“** · „hvert er þetta að fara“ → **„hvert þetta stefnir“**.
15. `:2450`, `:2539` „í úttakinu“ (technické „output“, 0×) → **„Nefndu ekki staðsetningarnar í textanum en berðu þær í röddinni.“** a
    **„Nöfn heimanna og laganna koma ekki fyrir í textanum.“**
16. `:2527` Yggdrasil 7 „auður sem fannst, ekki var ræktaður“ → **„auður sem fannst en var ekki ræktaður“**.
17. `:2025–2034` „FYRIR HVAÐ LESTURINN VAR DREGINN“ / „þegar lesturinn var dreginn“ (táhnou se runy; 0×) → **„Þetta spurði hann þegar
    rúnirnar voru dregnar: „…““**, hlavička **„FYRIR HVAÐ RÚNIRNAR VORU DREGNAR —“**.
18. Drobnosti: `:1937` „…um hann“ → **„…um lesturinn:“** · `:1935` „Rúnir sem dregnar voru: Kenaz.“ → **„Rúnin sem dregin var: Kenaz.“**
    (viz i ZNÁMÉ „dregnar“ níž) · `:1967` „Verðu aldrei almennur aðstoðarmaður.“ → **„Vertu aldrei almennur aðstoðarmaður.“** ·
    `:2041` „snýr að öðru hvoru“ (= hlavně „občas“) → **„að öðru hvoru þeirra“** (neověřeno, duál byl vědomý, DECISIONS 2026-09-11 (3)).
19. IS × EN: HOW YOU SPEAK (`v2/runar-config.js:607–610`) — IS chybí „if it cannot be felt, it does not belong here“ → **„Það sem ekki er
    hægt að finna fyrir á ekki heima hér.“**; chybí i „No filler“ a pravidlo přítomného času.

### A3. Logika a technické vady
1. Ask délka (střední): IS `:1963` „ekki meira en um 90 orð … Svarið má vera lengra ef skýringin þarf þess.“ výslovně povoluje přesah;
   strop `RUNAR_MODES.ask.max_tokens` 320 a IS je na tokeny hustší → usekne `_trimToSentence`. EN `:1922` dvojznačné. → jedno číslo,
   věta jako zdůvodnění („90 slov, protože se nečte nahlas“), bez svolení.
2. Čtení „pro někoho“ v IS oslovuje rodem MAJITELE účtu: `_addressContext` (`:1229–1235`) čte `userGender` i v režimu `someone`
   (`runar-reading.js:467–479`) → v `someone` použít `hk` (nebo se zeptat).
3. Single s otázkou: `qBranch` `:1799` / `:1778` „Let Kenaz answer: "<q>" — through image and symbol, not advice.“ — „answer“ zve
   k předpovědi (proti „never predicts fate“); s Confirmation stojí vedle „Neither confirm nor refute.“ (`:1212`); „through image and
   symbol“ je zbytek odebraný 2026-08-21 z `noqBranch` → „Let the reading turn toward their question“, „through image and symbol“ pryč.
4. Životní runa a rozbor jména dostávají `_noColdRead` „Describe the image“ / „Lýstu myndinni“ (`:1452`, `:2156`), ač obraz nemají
   (pravidla: „Explain the meaning in words, not in images“; `_describeRule` odtud odešel 2026-09-27) → znění bez „popiš obraz“.
5. EN esence u solu (`runar-utils.js:573–576`, `:597–601`, od v5.01 „begins "Kenaz stands for"“) × „Mention Kenaz by name once, woven
   naturally“ (`:1803`, `:1799`) — dva pokyny na totéž místo → u EN solu „Mention … by name once“ vynechat.
6. Dvojitá mezera ve všech 4 spreadech × EN/IS bez jména („No labels.  11-12 sentences.“) — `_namePlacement` vrací `''`
   (`:2260/2278`, `:2369/2387`, `:2453/2467`, `:2542/2560`).
7. „PERSON: you“ / „MANNESKJAN: þú“ / „Seeker: you“ jako jméno v hlavičce (`:1837`, `:2301`, `:2396`, `:2475`, `:2568`) → bez jména hlavičku vynechat.
8. Blok korekcí v Nornách, Podkově a Yggdrasilu stojí ZA pokynem „return ONLY this JSON“ (`:2427–2430`, `:2509–2511`, `:2607–2609`);
   v single a Kříži před ním → sjednotit (před).
9. ✦ „on a new line“ (`:1709`) × „no line breaks between thoughts“ (`runar-utils.js:528`) a „No breaks.“ ve spreadech (jen Standard/Premium).
10. Nejasné: konec [4] s dosazeným cílem (`runar-utils.js:493`, `:509`) „seen again from inside the image in something the seeker is
    outgrowing and looks different there“; Yggdrasil „Set the changed image down beside what the seeker brought“ (`:2550`, `:2531`) —
    „changed image“ nevysvětleno, EN „brought“ × IS „spurði um“.
11. Drobnosti: Ask u spreadu „drawn from the image and the rune“ v j. č. (`:1930`) · komentář `runar-utils.js:311` „early/middle/late“, pool má 2 ·
    IS životní runa znovu „You are Runar“ bez čárky (`:1371`) = duplikát systémového úvodu · IS gramatika 7(c) „kynhlutlaus eða samræmdur“
    (`:94`) × bod 5 „Kynið er tilgreint í ÁVARP; fylgdu því“ (`:92`).
12. Proxy: `SOL_EFFORTS = ["none", "minimal"]` (`supabase/functions/claude-proxy/index.ts:170`) — gpt-6-sol `minimal` nemá (stránka modelu:
    none/low/medium/high/xhigh/max; ověřeno) → při 400 zbytečné druhé volání → zúžit na `["none"]`, opravit komentář.
13. ZNÁMÉ, pořád platí (návody 2026-10-04 bod 3): „Respond in English.“ na konci spreadů a životní runy (`:2268`, `:2373`, `:2457`, `:2546`,
    `:1393`) vedle „Respond only in English.“ v systému (`:60`); Norny „not three separate readings“ dvakrát (`:2378`, `:2387`).

## B. K rozhodnutí ownera (obsah, kánon, pokus)
1. **Studené čtení ve struktuře promptu:** otázka runy jako zdroj konce u run, jejichž otázka mluví o nitru (IS Laguz „Hvað finnur þú innra
   með þér…?“ pár řádků pod „ENGIN KÖLD LESNING“; EN Uruz „what strength is already in you“; Eihwaz, Dagaz, Berkana, Ingwaz — `runar-utils.js:818–842`)
   a štítky pozic „Inner state (what lives inside)“ / „Innri staða (hvað er inni í þér)“ (Podkova `:2458`, `:2443`), „subconscious“ (Kříž
   `:2273`, `:2255`). Známá je jen třída („connect to where this person is standing“, návody 2026-10-04 bod 8).
2. **Záměr × časové osy spreadů:** `_intentionContext` „Right now — speak in the present“ jde i do Noren (Urður = minulost, Skuld = budoucnost),
   Kříže a Podkovy s pozicemi Past/Future (`:2309`, `:2404`, `:2483`, `:2576`) → ve spreadech s vlastní osou vynechat, nebo bez slovesného času.
3. **Otázka ve spreadech bez pokynu:** Kříž, Norny, Podkova mají `Question: <q>` jen v hlavičce (`:2310`, `:2405`, `:2484`).
4. **IS osy Kříže:** „verdandi / skuld / urd“ nejsou islandská slova a u runy 3 IS „urd“ (minulost) × EN „hidden“; uzávěr EN „complete and
   whole“ × IS „Vertu hnitmiðaður“ (buď stručný).
5. **Pravidlo CLAUDE.md „system prompt model ignoruje, user prompt poslechne“:** vzniklo 2026-06-12 na jednom testu s Claudem
   (DECISIONS 2026-06-12); na solu neměřeno a výrobci učí opak (OpenAI Model Spec: developer/system má vyšší autoritu; Anthropic: stálá
   pravidla do systému, krátká připomínka na konec). Výklad: vyhrála POLOHA a KONKRÉTNOST pokynu, ne role. Protidoklad 2026-10-04: sol na
   38 čteních nenapsal ani jedno zakázané slovo ze seznamu, který stojí jen v systému. → přepsat větu na „neměřeno na solu“ a změřit malým
   vzorkem (jedno pravidlo v systému × totéž v user promptu).
6. **Lab (malé vzorky, ne produkce):** role `developer` místo `system` pro sol (`index.ts:188`; OpenAI pro novější modely doporučuje
   developer) · Structured Outputs s obalem `{segments:[…]}` místo „return ONLY this JSON“ (sol je podporuje; pole na nejvyšší úrovni
   neprojde) · „check every sentence before returning“ u solu s `reasoning_effort: none` nemá kde proběhnout (`:55`, IS `:87`, `:94`) ·
   velká písmena v IS systému (SKYLDA, HVERJA, ALDREI…, EN jedno) — Anthropic: novější modely „may overtrigger“ · obecné štítky povahy
   v PERSONALITY/IDENTITY („calm, compassionate“; OpenAI radí popsat konkrétní volby) · příprava promptu pro gpt-6.1-sol (`none` nemá,
   jen `low`; stránka gpt-6-sol odkazuje na 6.1 jako novější).

## C. ZNÁMÉ, neotvírá se (jen připomenutí)
IS Ask „Rúnir sem dregnar voru“ / „dregnu rúnirnar bera“ (EN odebráno 2026-10-06/07; DECISIONS 2026-10-06 (8), odložené) · IS esence „Aldrei
föst formúla“ × EN pevný začátek (vědomě, v5.01) · IS seznam klišé (BACKLOG) · „Ávarpaðu {name}“ akuzativ (DECISIONS 2026-07-14) — nové místo
téže třídy: „lestur lífsrúnar {name}“ chce genitiv (`RP_LIFE.is.intro`) · `_priorityContext` jen ve spreadech · `IMG_POSTAVA` chybí v Kříži,
Podkově, Yggdrasilu · spready bez připomínky délky (Opus) · zákazy místo kladných pokynů · data uvnitř pokynů · mrtvé `SEASON_POOLS`.

## D. Vedlejší nález v nástroji (opraveno)
`scripts/utils/gen_batch.js` skládal single bez otázky runy (od 2026-09-24) a bez připomínky délky (od 2026-10-04) — chyběly translations
a připomínka. Opraveno 2026-10-16 (CODE-read); otisk systémového promptu = produkční sonda. Pokus s korekcemi 2026-10-15 běžel na
starém skládání (obě ramena stejně, závěr o korekcích tím nedotčen).

## Hranice
Žádné volání modelu: všechny nálezy jsou textové, jak je model vyřeší, neměřeno. Neprošlo: banka `RUNE_IMAGES` (jen obrazy ze vzorků),
klíčová slova run, texty Kolekce mimo otázku runy a ✦, RP_LIFE/RP_NAME v IS jazykově, jiné hlasové profily než aktivní, cesta promptu ve
shrine, `is-gpt-check.py` (placený). Idiomy jen n-gramy do 3 slov.
