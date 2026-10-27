# V3 lab, krok 22 — rozbor struktury Gemini (Esence · Obraz Hmota a Mysl · Rub · Zrcadlení) a návrh promptu (před testem)

2026-10-27, CODE-read. Owner: „1. jenže tak funguje výklad run a tarot, je pro uživatele · 3. … já si to představuju spíš takhle (obrázek 1
struktura, obrázek 2 větší rozbor) · zkusíme propracovat tuhle verzi od Gemini, probereme to a budeme ladit.“ Zdroj: PDF „Udělej mi runové
čtení pro runu gebo!“ (Gemini, ownerův Downloads) — 4 části, každá se 4 možnostmi A–D, a dva složené příklady (Uruz, Isa).
Opravuji svůj bod 1 z 2026-10-27: obracet se ke čtenáři je podstata výkladu (owner) — zrcadlení se ptá přímo jeho; hlídá se jen, aby věty 1–3
netvrdily jeho stav jako fakt.

## Struktura Gemini a co k ní víme
| část | Gemini | sedí s | pozor |
|---|---|---|---|
| 1 Esence principu | jedna věta, definice zákonitosti; možnosti A napětí dvou sil · B fyzikální/funkční zákonitost · C archetypální role · D rytmus cyklu | ownerem uznaná definiční věta (Tiwaz „the choosing to finish one thing well…“); v2 esence se slovesem z korpusu | B a C svádí k vymyšlené mechanice (v2 esence má „No invented mechanism“); Gemini příklad Tiwaz „bez ohledu na vedlejší ztráty“ není v našem kánonu Tiwaz (§23 — neověřeno, nebrat) |
| 2 Obraz jevu: Hmota a Mysl | fyzický děj + paralelní pohyb mysli; domény A řemeslo · B příroda · C tělo · D stavba | výzkum: konkrétní obraz nejsilnější (Sadoski); psychický obraz skrze scénu, ne jako popis čtenáře (ověřeno, Dickson & Kelly) | A a D jsou odborné (dláto podél let, trám v loži) — owner: předměty, které si člověk spojí se svým životem (kosa „moc lidí se nedotkne“) |
| 3 Rub principu | cena, kterou systém platí za to, že funguje; A opotřebení · B slepý úhel · C křehkost z tuhosti · D tření z provázanosti | ownerem uznaná SMĚNA (slepý test 5/5); v2 „never makes fear-based predictions“ | stín musí být vnitřní cena principu, ne přidaná nelichotivá věta (Hyman 25 %); Gemini příklad Uruz „rozbije kovadlinu“ je fyzikálně pochybný — vymyšlená mechanika |
| 4 Zrcadlení | jedna otázka na místo, kde čtenář tu daň platí; A setrvačnost · B cena · C slepý úhel · D tlačení proti stavu | ownerem uznané otázky (kneel/roar, „tlačíš na pilu“ jako možnost konce); v2 konec otázkou | otázka předpokládá, že to čtenář dělá (Loftus: předpoklad mění odpověď) — owner bere; „Where in your life…“ se opakuje (kroky 17–18) → začátky střídat |

**Co Gemini přináší navíc proti dnešní v3:** (a) každá část má 4 vylosovatelné možnosti → 4 × 4 × 4 × 4 = 256 tvarů na runu (+ doména) — los
v kódu, ne „interně zvol“ (to model neumí, krok 9); (b) věta 3 není „co dar stojí“ (to v kroku 21 sklouzávalo k dluhu čtenáře 29/90), ale
cena mechanismu samotného; (c) mysl se do obrazu dostává obecně („mysl se zúží do jednoho proudu“), ne jako výrok o čtenáři.

**Délka:** Gemini věty mají 20–30 slov → čtení ~100 slov; v2 má 50–58 slov (hlas a cena: `LENGTH_BUDGETS`, `RUNAR_PRICING.md`). Délku
rozhodne owner; návrh níž drží 55–70.

## Návrh promptu pro první test (EN; do promptu jen ta jedna vylosovaná možnost z každé části)
```
THE READING — four sentences, in this order:
1. One plain sentence that begins "Gebo {V}" and names {E: the point where two opposite pulls meet | the way a thing works when this rune
   is at work | the place this rune takes between people | the time in a cycle this rune marks}.
2. One everyday physical process from {D: work with the hands | weather, water, soil, plants | the body: breath, balance, weight | a home:
   doors, stairs, tables, rooms}, in which this is at work, and what the mind does when the same thing happens in it.
3. What that same process costs, simply by working this way — {R: wear | what falls out of sight | stiffness | what the bond carries across}
   — said of the process, as a plain fact.
4. One question that turns the reader to where this cost may be paid in their own days — {Z: a habit kept up out of momentum | what keeping
   it going costs | what drops out of sight | pushing against how things are}. Do not begin it with "Where in your life".
4 sentences, 55 to 70 words. Reply with the reading only.
```
{V} = los z `ESSENCE_VERBS_SOL` (v2). Systém = definice v3 (WHO YOU ARE · HOW YOU SPEAK; povaha podle kroku 21 nic nemění — zatím vynechat
nebo nechat, rozhodne owner).

## Vlastní ukázky ve tvaru Gemini (Gebo; CODE-read, neschváleno, jen aby bylo nad čím ladit)
1. (E napětí · D tělo · R tření z provázanosti · Z cena) Gebo stands for the point where what you give and what you take meet. Two people
   carrying one table down the stairs find a pace neither would choose alone, and the mind stops counting whose arms ache more. Yet every
   stumble of one runs straight into the other's hands. What does keeping in step cost you, and who carries it when you slip?
2. (E zákonitost · D domov · R slepý úhel · Z setrvačnost) Gebo is the rune of the gift that only lives while it keeps moving. A door held
   open for someone behind you stays open for the next one too, and the hand forgets it is holding anything. The one holding the door no
   longer sees the room ahead. Which door are you still holding out of habit, long after the last person passed?
3. (E rytmus · D příroda · R opotřebení · Z tlačení proti stavu) Gebo marks the season of exchange, when what was given starts to come back.
   Two shrubs in one hedge grow into each other's gaps until the wind finds no way through, and no one can say any more which branch is
   whose. Neither can grow straight again. What has grown around you so closely that standing alone would now feel like cold wind?
