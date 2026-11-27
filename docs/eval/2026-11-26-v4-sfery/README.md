# Rúnar V4 — lab (od 2026-11-26)

**Tenhle soubor vlastní jen:** vstup do složky — co V4 je, kde co leží a co dál. **Platný stav V4 je v jednom souboru:
[kostra-v4.md](kostra-v4.md)** (runa dne, single čtení, spready, otevřené otázky). Lane: CODE-read, produkční kód nesahá
(owner 2026-11-26: *„může spadat pod read, ale jeho úkol bude pracovat na Rúnar V4“*). Rozhodnutí: `RUNAR_DECISIONS.md` 2026-11-26 (4)–(10).

## Co je V4
Owner 2026-11-26: *„úplně nový pohled na výklad od Rúnara. S V3 toho nebude mít možná až tak společného.“* V3 (k ledu od 2026-11-09,
`docs/eval/2026-10-23-v3-charakter/v3-k-ledu.md`) přestavovala prompt, ale model dál psal celé čtení. V4 mění, kdo text píše: předem napsaný
a ověřený obraz runy a sféry; model jen v Asku (zatím návrh). Vzniklo z rozhovoru ownera s Gemini.

## Kde co leží
| soubor | co vlastní |
|---|---|
| [kostra-v4.md](kostra-v4.md) | **jediná kostra V4** — co platí, co je návrh, otevřené otázky, názory labu a co je potřeba od Gemini |
| [vychozi-bod-gpt-gemini.md](vychozi-bod-gpt-gemini.md) | společný výchozí bod pro GPT a Gemini — přepisuje se z kostry, ne naopak |
| [runa-dne.md](runa-dne.md) | pracovní záznam runy dne: rozhodnutí v pořadí, návrhy vět Kenaz a jejich kontrola |
| [emoce.md](emoce.md) | odkud je devítka emocí (naše P10 × Gemini) a proč takhle |
| [emoce-ve-cteni-resers.md](emoce-ve-cteni-resers.md) | kam emoce dosedá ve výkladu podle praxe a výzkumu (runy, tarot, astrologie, aplikace) |
| [zasady-pusobeni.md](zasady-pusobeni.md) | co owner řekl s Gemini o tom, jak má Rúnar na člověka působit, a co Gemini navrhl |
| [v4-v2-mapa.md](v4-v2-mapa.md) | co z V4 už máme ve v2 pod jiným jménem, co je opravdu nové |
| [inventura-aspekty-sfery.md](inventura-aspekty-sfery.md) | které stránky run už má banka obrazů v2 (vodítko pro sféry; obrazy V4 jsou nové) |
| [konzultace/](konzultace/) | rozhovor s Gemini doslova a jeho rozbory — historie, ne platný stav |
| [skripty/](skripty/) | skript inventury (bez API) |
| [test-zameny/](test-zameny/README.md) | slepý test záměny sfér pěti run (4M1), 2026-11-27 |

**Konzultace s Gemini (pořadí):** [zdroj-gemini-architektura.pdf](konzultace/zdroj-gemini-architektura.pdf) (výchozí rozhovor) →
[pro-gemini-1.md](konzultace/pro-gemini-1.md) (náš podklad) → [zdroj-gemini-odpoved-1.md](konzultace/zdroj-gemini-odpoved-1.md) →
[odpoved-1-rozbor.md](konzultace/odpoved-1-rozbor.md) → [zdroj-gemini-odpoved-2.md](konzultace/zdroj-gemini-odpoved-2.md) ·
runa dne: [zdroj-gemini-runa-dne-architektura.md](konzultace/zdroj-gemini-runa-dne-architektura.md) · kolo 3 na kostru (oddíl 9):
[zdroj-gemini-odpoved-3.md](konzultace/zdroj-gemini-odpoved-3.md) → [odpoved-3-rozbor.md](konzultace/odpoved-3-rozbor.md) · co je sféra
(owner × Gemini × GPT, 2026-11-27): [zdroj-gemini-kenaz-oblasti.txt](konzultace/zdroj-gemini-kenaz-oblasti.txt) (předchůdce) →
[zdroj-gemini-gpt-sfery.txt](konzultace/zdroj-gemini-gpt-sfery.txt) → [sfery-2026-11-27-rozbor.md](konzultace/sfery-2026-11-27-rozbor.md)
(kritika + návrh, jak V4 třídit).

## Co dál
1. ✅ Odpověď Gemini na kostru (kolo 3) uložena a rozebrána. Další kolo: opravit sféry proti ownerovým popisům (rozbor oddíl 8).
2. Owner rozhodne otevřené otázky (kostra oddíl 8).
3. Sféry pro prvních pět run → test záměny (4M1, 4M3) → owner schválí. 4M1 na větách o mechanice proběhl 2026-11-27:
   [test-zameny/](test-zameny/README.md). Zbývá 4M3 a test na hotových obrazech.
4. Runa dne Kenaz: věty ve tvaru obraz + význam, třetí osoba, islandsky od začátku, Greynir.
5. Ukázka sfér v Kolekci run (owner: *„koukneme na to, jak to bude vypadat“*).
6. Až bude single: Norny.
