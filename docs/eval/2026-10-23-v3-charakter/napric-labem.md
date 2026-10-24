# V3 lab — srovnání všech čtení napříč kroky: co model používá sám, bez ohledu na zadání

2026-10-24, CODE-read. Owner: „máš taky kontrolovat všechna čtení proti sobě, i když mají jiná zadání, abys přišel na to, jestli se něco mění.
Pořád platí, že hledáme to, co model používá, ať víme, co můžeme nechat a co vyhodit.“
Pomocný skript CODE-read (scratchpad session, mimo repo) projde všechny soubory labu, vezme jen řádky s texty čtení (bez bloků se zadáním) a spočítá vzorce po krocích.
⚠️ Počty jsou výskyty, ne podíl: některé soubory obsahují pro srovnání i sloupec z předchozího kroku (krok 7, 9-sol, 11, 11-sol, 13), takže
čísla nejsou normalizovaná. Čte se z nich, KDE se vzorec objevuje a kde chybí.

## Dvě rodiny zadání
- **A — holé čtení o 4 větách** (Gebo + obraz moře, bez prostředí a daru): kolo 1–2 (`vysledky.md`), kroky 12, 14, 15, 17 — cca 55 čtení.
- **B — věta 1 se scénou** (prostředí, dar, úhel, úkol „one situation from life“): kroky 6–11, 13, 16 — cca 170 vět.
(Kroky 1–5 jsou mezi: 4 věty se zadanou stránkou runy / materiálem GPT.)

## Co model přináší sám (v zadání to nestojí)
| vzorec | v A | v B | odkud |
|---|---|---|---|
| „Gebo asks (you)…“ | 21 | 0 | model: když má čtenáři říct, co runa znamená, udělá z runy toho, kdo žádá |
| „keeps score / tally / ledger / count“ | 16 | 0 | model: jeho vlastní výklad Gebo (dar bez počítání) |
| „open hands / both hands“, „a gift held too tightly…“, „without shame“ | 7 / 7 / 8 | 0 | model: ustálené obraty k Gebo |
| „two strokes / lines crossing“ (tvar runy) | 15 (+ krok 4 A/B) | 0 | model: když nemá scénu, vykládá tvar runy |
| slib návratu („what you offer returns to you“) | 11 | 1 | model: výchozí slib u Gebo (zastaví ho rysy V2 / V3, krok 17) |
| rozkaz „Let … / Give …“ | 13 | 0 | model: výchozí rada (zastavil jen celý charakter E) |
| jídlo jako dar | 0 | 86 | model: výchozí představa daru, jakmile staví scénu |
| telefon displejem dolů (dar = pozornost) | 0 | 32 | model: výchozí scéna pro „pozornost“ |
| vnuk krájí dědovi maso (dar = pomoc u stolu) | 0 | 23 | model: výchozí scéna pro „pomoc“ |
| těsto s babičkou (dar = dovednost v kuchyni) | 0 | 9 | model: výchozí scéna pro „dovednost“ |
| „quietly“, „without being asked / unasked“ | 2 | 16 / 9 | model: jak ukáže, že dar je svobodný |
| otcova nemoc, šála po zemřelém | 1 | 12 | model: výchozí váha pro „pozornost“ a „dar, na kterém záleží“ |

## Co přichází ze zadání
| vzorec | odkud |
|---|---|
| „in the same / one breath“ (35×, jen A) | z obrazu v zadání „The sea gives and takes on the shore in the same breath“ — opis vstupu |
| „It does not promise…“ (krok 1, 8/9) | ze slova „promise“ v pokynu prvku 3 |
| úhel pohledu („you“ / 3. osoba) | z bloku POINT OF VIEW (krok 11, drží 7/7 u Opusu i solu) |
| dar podle losu | z bloku THE GIFT (krok 10, 7/7) |

## Plyne
1. **Model má ke Gebo vlastní zásobu** — „Gebo asks you“, „keep score / ledger“, „open hands“, „a gift held too tightly“, „without shame“,
   tvar „two strokes crossing“, slib návratu, rozkaz „Let…“. Objeví se vždy, když zadání nedá scénu; my ji do promptu nedáváme, takže ji
   nejde „vyhodit“ — jde ji jen NAHRADIT úkolem, který modelu dá něco jiného dělat (scéna z krok 6+: v B se neobjeví ani jednou).
2. **Jakmile staví scénu, má model ke každému druhu daru jednu výchozí scénu** (pozornost → telefon, pomoc → maso, dovednost → těsto,
   dar s cenou → poslední pomeranč / šála po zemřelém) a dar je skoro vždy jídlo. Pestrost tedy nedá model; musí ji dát vstupy, které
   výchozí scénu nepustí (konkrétnější prostředí, druh daru, který jídlem být nemůže) — bod 8 ownerovy zprávy.
3. **Co z promptu můžeme nechat:** POINT OF VIEW a THE GIFT (los) — model je dodrží beze zbytku a mění podle nich scénu. **Co vyhodit
   nebo přepsat:** slova, která se opíšou („promise“, obraz jako hotová věta s „in the same breath“).
4. Charakterové rysy (kroky 16–17) mění hlavně tón a konec (slib, „perhaps“, otázka), scénu ve větě 1 skoro ne.
