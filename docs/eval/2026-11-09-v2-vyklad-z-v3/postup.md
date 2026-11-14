# Lab „výklad z V3 do v2“ — postup: kam se dívat napřed a co projít, než owner uvidí ukázku

2026-11-14, CODE-read. Owner: *„něco otestujeme, zapíšeme a ty to ignoruješ … nebudeme pokračovat dál, dokud nebudeš mít pořádek v tom, co máš
a jak to máš dělat … ve v2 jsme už udělali velký kus práce ohledně skládání obrazů, to má být první místo, kam se koukáš.“*
**Tenhle soubor vlastní jen pořadí kroků a seznam kontrol.** Pravidla sama neopisuje — bydlí v odkázaných místech (§20).
Důvod vzniku: ukázky 7.4 a 7.9 v `README.md` porušily věci dávno změřené a zapsané (README 7.10). Hook při dotyku je vypsal, ale nic
nenutilo ukázku proti nim projít; to teď dělá `kontrola_ukazky.py` a tenhle seznam.

## 1. Kam se dívat, v tomhle pořadí
1. **v2 — jak se skládá obraz** (první místo): `RUNAR_DESIGN.md` oddíl „Stavba čtení a obraz“ — „Co je OBRAZ“, „Obraz — dvě síta“, „Typ obrazu“,
   „Délka a tvar obrazu“ (jedna scéna, jeden, kdo koná; žádná druhá událost; kolem 12 slov; po každé změně znovu branou identity), „Obraz od modelu“.
2. **v2 — co do čtení vstupuje dnes:** `node scripts/anatomie_promptu.js` (kusy promptu) a banka `RUNE_IMAGES` v `v2/runar-character.js`;
   úhly otevření `READING_ANGLES` v `v2/runar-utils.js` (sedm, člověka do obrazu staví jeden).
3. **Co owner určil pro V3:** `../2026-10-23-v3-charakter/zadani-v3.md` oddíly A, B, C, F, G (celé, ne z paměti).
4. **Co owner na obrazech chválil a odmítl:** `../2026-10-23-v3-charakter/krok43-obrazy-dnesni-doba.md` §1, `krok45-obraz-z-vyznamu.md` §1,
   `cil-a-vzory.md` (vzorové věty s verdiktem).
5. **Co lab změřil o runě, kterou píšu:** `grep -il <runa> ../2026-10-23-v3-charakter/krok*.md` — např. Fehu jako dávání se čte jako Gebo (krok 44).
6. **Tenhle lab:** `README.md` oddíly 3–7 (co už je zkoušeno a co owner k čemu řekl).

## 2. Než owner uvidí ukázku — každý bod s dokladem, jinak ukázka nejde ven
1. `python -X utf8 docs/eval/2026-11-09-v2-vyklad-z-v3/kontrola_ukazky.py <soubor>` — strojové věci (stejný začátek, délka, role, čas). Červená = přepsat.
2. **Úhel významu** je ze schváleného zdroje a u runy sedí s tím, co lab změřil (krok 1.5). Doklad: odkaz.
3. **Obraz prošel pravidly v2** z kroku 1.1 (jeden děj, jeden, kdo koná, délka) a **věrohodností**: stává se tohle lidem opravdu takhle?
   Vzor ownerovy otázky: „jak moc se někomu stane, že vymění vlnu za cukr a kávu?“
4. **Slepá kontrola runy:** soudce vidí jen větu obrazu a vybírá z více run (ne „o čem to je“) — obraz daru táhne ke Gebu, domov k Othile.
5. **Jiný děj, ne jiný předmět:** nová ukázka nesmí být předchozí scéna s vyměněným podstatným jménem.
6. **Vstup do scény je z losu** (krok 1.2); „Imagine“ je jedna z možností.
7. U ukázky napsat, co z bodů 2–6 doloženo není. Co doloženo není, se neschvaluje, jen ukazuje.
