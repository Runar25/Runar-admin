# Vegvísir — absolutní rubrika pouti (standard souzení)

**Vznik:** owner 2026-08-25 („párový soudce neskóruje, on řadí — udělej co je potřeba") ·
osy dle návrhu GPT, zpřísněné o to, co se dosud změřilo (TESTy 31–46).
**Vlastní:** tento soubor (jak se soudí pouť). Výsledky měření → `RUNAR_EVAL_LOG.md`.

**Changelog:** 2026-08-25 vznik · 2026-08-25 osa 4 přejmenována „Paměť" → **„Nit / kontinuita"**
(GPT: paměť je mechanismus, nit je to, co čtenář zažívá; otázka i měřítka beze změny) ·
2026-08-26 osy 1 a 4 ZOSTŘENY (vyžádané citace — na 8 ramenech nerozlišily, TEST 49) +
přidána **osa 9 Zastavující otázka** (owner: nese kvalitu ta otázka, ne popis).

**⚠️ TŘI VRSTVY KVALITY** (owner + GPT 2026-08-26): **obraz** (vidím to místo) · **runa**
(definiční věta = „Rúnarova knížečka", kterou runy nemají) · **otázka/napětí** (čtenář je
uvnitř obrazu a dokončí význam sám). Třetí vrstva je ta, kvůli které chce člověk čekat
dalších devět nocí — a NESMÍ se vynucovat instrukcí („na konci vytvoř lákavou otázku"
= dramaturgie zadními vrátky). Měří se osou 9, nepíše se do promptu.

---

## ⭐ Pravidlo nad rubrikou

> **Párové soudce používat na otázku „která z těch dvou". Absolutní na „jaké to je".
> Výsledky si nikdy neplést.**

Doloženo TESTem 46: párové soudy tvrdily, že v2 a v4 mají slabou nit — absolutně mají obě
nit **silnou**. Párový soudce vybere vítěze a poraženého si zracionalizuje. **Tvrzení
o vlastnosti textu nesmí nikdy pocházet z párového srovnání.**

**Jak se absolutně soudí:** jeden soudce = **jedna pouť** = **jedna osa**. Žádné srovnání,
žádný druhý text v promptu, pevná měřítka v zadání (ne „ohodnoť 1–10").

---

## Osy (9)

| # | Osa | Otázka soudci | Měřítka |
|---|---|---|---|
| 1 | **Jedna cesta** | **Vyjmenuj dvojice sousedních ramen, které NELZE prohodit, a u každé cituj větu, která to drží.** Kolik jich je? | počet + citace. ⚠️ Otázka „šlo by prohodit?" bez vyžádaných citací na 8 ramenech NEROZLIŠILA (slepenec dostal „mezi", TEST 49) — atmosféru lze najít vždy, citovatelnou jednosměrnou vazbu ne. |
| 2 | **Místo přítomné** | Pozná čtenář, **z čeho je** to místo uděláno? | ano/ne (ne = místo z nálady, ne z věcí) |
| 3a | **Runa vs. moment** | Vede kvalita runy, nebo sama událost? | runa · moment · vyvážené |
| 3b | **Typ hijacku** | Když vede moment: říká už sám význam runy (runový), nebo je jen příliš velký obraz (obrazový)? | žádný · runový · obrazový |
| 4 | **Nit / kontinuita** | Vrací se konkrétní věc a **mění funkci**? Pojmenuj ji, ke KAŽDÉMU stavu dej citaci — a **pozdější citace musí obsahovat ZPĚTNÝ ODKAZ** (určitý člen/deixe: „the moss now gone", „the water that ran thin behind you"). | silná (≥3 stavy se zpětným odkazem) · slabá · žádná. ⚠️ Samotné citace nestačily: slepenec dostal „silná" i podruhé (TEST 50) — nesouvisející čtení sdílejí obecný slovník a soudce z něj poskládá řetěz. Zpětný odkaz je to, co spravilo osu 1 (sham 0 vs pouť 2). |
| 5 | **Fyzická možnost** | Je někde věc, která tam být nemůže (patří k dřívějšímu místu a nemohla se přemístit)? | ano/ne + citace. *Stopa, vzpomínka a věc téže látky, kterou nové místo má samo, NENÍ chyba.* |
| 6 | **Přirozenost** | Nese se to samo, nebo je to inventura? | přirozené · mechanické — *mechanické = opakovaná konstrukce ve stejném slotu, runa vyložená přes položku z minula* |
| 7 | **Zastavení ≠ výpadek** | Když se rameno zastaví: zastavila se **cesta**, nebo model nevěděl, co s nesenou věcí? | zastavení · výpadek — *(owner 2026-08-25: Isa-zastavení je legitimní rameno)* |
| 8 | **Stojí za to číst dál** | Chtěl by čtenář vědět, co bude v dalším rameni? | ano/ne — **spodní hranice kvality** |
| 9 | **Zastavující otázka** | V kolika ramenech vznikla otázka nebo napětí, nad kterým se čtenář zastaví — **konkrétní situace, dvě skutečné možnosti, žádná označená jako správná**? | počet 0–N + citace. *(KUKY 2026-08-26: „Do you kneel at the quiet rim, or walk on toward the roar?" — reálná otázka, člověk nad ní musí přemýšlet. Tohle nese kvalitu, ne poetický popis.)* |

---

## Povinné kontroly u každé dávky (§27)

1. **Sham / slepenec** — čtveřice slepená z nesouvisejících čtení musí vyjít jako **série**
   (osa 1) a **slabou nit** (osa 4). Když ne, nástroj je rozbitý, ne data.
2. **Umí metrika říct i to dobré?** — alespoň jedna kontrolní čtveřice, u které čekáme
   opačný verdikt. Doloženo: metrika přirozenosti byla ověřena tím, že čtveřici **bez**
   carry označila za přirozenou (TEST 45).
3. **Nulová kontrola u každé osy, která hledá PŘEBÍRÁNÍ** — vzorek, který zdroj nikdy neviděl,
   souzený touž otázkou. Doloženo TESTem P1 (2026-08-27): slepý soudce označil 4/6 čtení
   z buňky, která příklady NEVIDĚLA, za imitaci — z toho jedno dokonce za „doslovné". Bez
   nulové kontroly je „imitace" nerozlišitelná od toho, že dvě čtení téže runy mluví o tomtéž.
4. **Predikované propady** — kdo dodává data, přiloží seznam kusů, o kterých si myslí, že
   propadnou. Když je test neoznačí, je rozbitý test. (Coworkova praxe od 2026-08-25;
   potvrzeno 4/5.)

## Co do rubriky ZÁMĚRNĚ NEPATŘÍ

**Osa „je tam vývoj?"** — přidat ji by znamenalo vývoj VYNUCOVAT, a to je přesně dramaturgie,
které se Vegvísir vyhýbá (owner: Isa-zastavení je legitimní rameno). Až bude na delších bězích
co pozorovat, ptát se místo toho slepě a otevřeně: *„Když dočteš poslední rameno, máš pocit,
že jsi jinde než na začátku — a proč?"* Odpověď smí být fyzicky · vnitřně · vztahově ·
významově · vůbec ne. To je pozorování, ne kritérium. → `RUNAR_BACKLOG.md`.

## Co rubrika NEMĚŘÍ (a ať se to netvrdí)

- **Emergenci** („vzniká něco třetího") — otevřená otázka padla vlastní kontrolou (TEST 36:
  i slepence dostaly „silná"). Měřitelná je jen **nucenou volbou s kotvou na vracející se věc**.
- **Vliv času** (devět nocí) — designová hypotéza, neověřitelná ničím, co umíme, do živých
  testerů.
- ~~Horní pásmo momentů~~ **NEPLATÍ od 2026-08-25:** v prvním vzorku nedostal „otevřený"
  žádný moment (0/10), ale revidovaný pool ho dostal **2/12** (Hagalaz kroupy na černém
  písku · Isa navátý sníh na ledu) — škála se používá celá, limit byl vlastností tehdejších
  dat, ne nástroje.
