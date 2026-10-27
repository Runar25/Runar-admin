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

## Kolo 2 — doplnění GPT a ownerův verdikt nad ukázkou 2 (2026-10-27)
**Owner k ukázce 2 (dveře):**
- esence *„Gebo is the rune of the gift that only lives while it keeps moving“* — ✘ *„pořád to stejné dokola … vadí mi, že to zní stejně;
  dá se to říct jinak, líp“*;
- obraz *„A door held open for someone behind you stays open for the next one too, and the hand forgets it is holding anything“* — ✔
  *„perfektní, vzorová: ukazuje malé věci, činnosti, které každý ocení, a přitom je to taková blbost“*; s takovým obrazem mu pohyb v esenci nevadí;
- rub *„The one holding the door no longer sees the room ahead“* — ~ *„takové ok“*;
- otázka *„Which door are you still holding out of habit, long after the last person passed?“* — ✔ *„vede k zamyšlení více směry“*
  (hodný · zvyk · držím dveře někomu, komu bych už neměl) — *„o to nám jde: vyvolat zamyšlení, které může být různě vnímané“*;
- délka: **50–58 slov** (jako v2).

**Gemini × GPT:**
| | Gemini | GPT | lab / owner |
|---|---|---|---|
| stavba | 4 povinné části, každá 4 možnosti, kombinace losem | 4 části jako způsob uvažování, ne šablona; rub jen když je přirozený | model bez přemýšlení si sám nevybere (krok 2: volný konec → detail 8/9) — pořadí a druh musí stát v promptu; los kategorií ano (bez něj telefon 33×), hotové věty ne |
| esence | definice zákonitosti (4 druhy) | ne vždy definice; ukotvit, co je v TOMHLE čtení podstatné | owner: „Gebo is the rune of…“ zní pořád stejně ✘ (i v2 rámec „{R} {V}“ dělá týž začátek) |
| obraz | hmota + mysl, domény řemeslo/příroda/tělo/stavba | volněji: obraz musí nést podstatu, mysl jen když vyplyne | owner: malý všední úkon, který každý zná a ocení (dveře) ✔ |
| rub | přímá cena mechanismu (opotřebení, slepý úhel, křehkost, provázanost) | „hranice platnosti obrazu“, ne povinná slabina | sedí s ownerovou formulí z 2026-09-20: druhá půlka ukáže, co v obraze NENÍ (5/5) |
| zrcadlení | 4 otázky, všechny na chybu / cenu | otázka z obrazu, ne vždy na problém (cena · vztah · možnost · význam); „otázka nevkládá odpověď“ | owner: otázka čtená více směry ✔; Gemini všechny 4 předpokládají chybu = skryté moralizování (GPT má pravdu) |

**Kde mám jiný názor než GPT:** „kombinace jako produkční algoritmus = mechanické“ — změřili jsme opak: bez losu model sahá pořád po
stejném (kroky 9, 10, 21). Losovat se má **druh** (směr otázky, co obraz ukazuje), ne hotová věta.

## Návrh v3 po kole 2 (EN; do promptu jen vylosované)
```
THE READING — 4 sentences, 50 to 58 words, in this order: {P: picture first | core first}.
- THE PICTURE: one small everyday act that almost everyone has done or been given, in which Gebo is at work. Show it; do not explain it.
- THE CORE: one sentence that carries the picture over into what Gebo is here — {E: a pull between two things | how it works | what it
  joins | what it becomes} — in words of your own, starting from the picture.
- THE EDGE: where the picture stops holding — what it leaves out, or what it costs — said of the picture.
- THE MIRROR: one open question that grows out of the picture and that different readers could take in different ways; let it turn
  toward {Z: a habit | a bond | a possibility | what the gift means | what keeping it costs}.
Reply with the reading only.
```
Měří se (předem): rada · tvrzení o čtenáři ve větách 1–3 · začátek esence (kolik čtení začíná „Gebo is/stands for/represents…“) ·
délka 50–58 · obraz = malý všední úkon (slepý soudce ano/ne) · otázka připouští víc čtení (slepý soudce ano/ne).
