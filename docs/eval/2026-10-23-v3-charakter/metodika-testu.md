# V3 lab — jak testy vyhodnocovat: pravidla ze zdrojů a co to znamená pro to, co už máme

2026-10-26, CODE-read. Owner: „to, že dostaneme definici, neznamená, že je správně — ukáže to jen test. Pak je hrozně důležité vědět, jak ten
test správně vyhodnotit … ověř, jak se mají správně vyhodnocovat, když zkoumáme, jak model reaguje, co můžeme očekávat, jaká jsou obecná
pravidla … kriticky a najdi nejlepší řešení.“
Rešerše: subagent s webem; zdroje otevřené, výpočty Fisher/Wilson/síla testu spočítané v Pythonu. Otevřeno: Miller 2024 (Anthropic, „Adding
Error Bars to Evals“, arxiv 2411.00640) · Sclar 2023 (arxiv 2310.11324) · Mizrahi 2024 (arxiv 2401.00595) · POSIX 2024 (arxiv 2410.02185) ·
IFScale 2025 (arxiv 2507.11538) · Corsi 2026 (EDM, faktoriál GPT × Claude × Gemini) · Zheng 2023 (arxiv 2306.05685) · Wang 2023 (arxiv
2305.17926) · Panickssery 2024 (arxiv 2404.13076) · Thakur 2024 (arxiv 2406.12624) · Shankar 2024 (arxiv 2404.12272) · He 2024 (arxiv
2411.10541) · Anthropic docs „Define success criteria and build evaluations“. Jen z vyhledávání: Brown–Cai–DasGupta 2001, Czitrom 1999,
McHugh 2012, Bavaresco 2025. Neotevřeno: Montgomery (DoE), Nosek 2018, Benjamini–Hochberg 1995, „Lost in the Middle“.

## Pravidla
1. **n = 5 rozliší jen skoro úplné převrácení.** Fisher oboustranně: 5/5 × 0/5 p = 0,008 · 4/5 × 0/5 p = 0,048 · 5/5 × 2/5 p = 0,17 ·
   7/7 × 2/7 p = 0,02. Wilsonův interval pro 5/5 je 57–100 %.
2. **Kolik čtení na variantu** (síla 80 %): rozdíl 80 × 20 % → ~15 · 90 × 50 % → ~25–30 · 60 × 30 % → ~50 · 70 × 50 % → přes 100.
3. **Hlásit k/n + 95% Wilsonův interval**, ne holé procento; srovnání Fisherovým testem. Výsledek na n ≤ 7 = směr k ověření, ne rozhodnutí.
4. **Jedno znění ≠ prvek.** Malá změna formulace hýbe výstupem hodně, nejvíc u volného psaní (Sclar, Mizrahi, POSIX). Prvek se zkouší ve
   2–3 parafrázích a „funguje“, jen když účinek drží ve všech.
5. **Přidávání po jednom nepozná interakce** a pokyny si v promptu konkurují (Czitrom, IFScale). Pro 2–3 klíčové prvky malý faktoriál
   (každá kombinace); jinak aspoň obrácená páka — prvek z plného promptu ODEBRAT (CLAUDE.md §25 A).
6. **Kritéria zmrazit předem**, na zvláštní pilotní dávce; hodnotit naslepo (bez štítku varianty, zamíchané). Kdo hodnotí výstupy, posouvá
   si kritéria („criteria drift“, Shankar). Regex ověřit proti ručnímu hodnocení.
7. **Jeden hlavní ukazatel určit předem**; ostatní jsou průzkumné — u mnoha ukazatelů naráz vyjde něco náhodou.
8. **Slepý soudce = jiný model než generátor** (model straní vlastním textům, Panickssery; Anthropic docs totéž); pořadí prohazovat;
   zdůvodnění před verdiktem; otázky ano/ne.
9. **Soudce ověřit**: 30–50 textů ohodnotit ručně, spočítat Cohenovu kappu (ne jen % shody); pod ~0,6 mu nevěřit (konvence).
10. **Přenos mezi modely nefunguje samozřejmě** (He 2024: nejlepší formáty se mezi řadami modelů překrývají málo; Corsi 2026: u GPT,
    Claude a Gemini rozhodovaly jiné prvky). Nález z Opusu je pro sol hypotéza; přijatý prvek ověřit na solu.
11. **Holý test ≠ plný prompt** — víc pokynů = horší plnění každého (IFScale). Konečně rozhodnout v plném promptu na produkčním modelu.
12. Vždy napsat hranici: n, model, kolik parafrází, co se netvrdí. Přímé měření přenosu Claude → GPT ani holý → plný prompt v literatuře není.

## Co to znamená pro kroky 1–19 (sebekritika)
1. **Drží** (velký rozdíl i na malém n): konec otázkou se „never a conclusion“ 5/5 × 0/5 (p = 0,008) · rada ve 28/30 čtení s rysy ·
   los konce poslechnut 9/9 · los daru 7/7 · úhel pohledu 7/7.
2. **Hranice, nic víc:** slib zrušený „compassionate“ (4/5 × 0/5, p = 0,048) · „Perhaps“ s „never predicts fate“ (4/5 × 0/5) — jedno znění,
   jeden model, n = 5.
3. **Netvrdí se:** všechny rozdíly 1–2 z 5 · jídlo 0/7 × 3/7 (krok 19) · cokoli o jedné scéně z jednoho běhu.
4. **Chyby metody:** jedno znění na rys (bod 4) · hodnotil jsem já, se znalostí varianty (bod 6) · kritéria se posouvala — kontrola z kroku
   17 neviděla „may return“ (bod 6) · slepý soudce byl Opus nad Opusem (bod 8) · rysy na holém nastavení (bod 11).

## Návrh, jak testovat dál (CODE-read; schvaluje owner)
1. **Hlavní ukazatel předem** u každého kroku (např. „rada ve čtení ano/ne“).
2. **15 čtení na variantu**, rozdělených na 3 parafráze × 5 — zachytí rozdíl kolem 80 × 20 % a ukáže, jestli drží přes znění.
3. **Kritéria napsaná předem** (kodebook v souboru kroku), hodnocení naslepo: texty zamíchat, štítky skrýt; regex + ruční kontrola vzorku.
4. **Soudce jiný model** (sol; volání přes API jen s ownerovým ano) a jednou ověřit proti ručnímu hodnocení (kappa).
5. **Krok, který rozhoduje** (přijetí prvku do v3), zopakovat na solu a v plném promptu v3.
6. **Kombinace rysů:** místo všech trojic faktoriál jen z rysů, které přežijí bod 2 (ne všech 4).
