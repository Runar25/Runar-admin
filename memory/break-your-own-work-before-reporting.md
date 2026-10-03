---
name: break-your-own-work-before-reporting
description: "Po každém hotovém kusu práce na něj zaútoč SÁM a teprve pak ho ohlas — nečekej, až si to owner vyžádá"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-14T23:10:42.821Z
---

**KUKY 2026-08-14: „dřív jsi rozbíjel a přestal jsi to zase dělat."** Je to návyk, ne úkol na
zadání. Hotová práce se ohlašuje **až po** vlastním pokusu ji rozbít — ne „hotovo, ověřeno
golden", ale „hotovo, tady je, co jsem na to zkusil a co to přežilo".

**Co to chytilo, když jsem to udělal (a nechytilo, dokud jsem nemusel):** commit `e3a3c40`
jsem ohlásil jako hotový a ověřený — golden 2/32 klíčů, linty čisté, islandština přes
GreynirCorrect. Všechno pravda a všechno k ničemu. Owner mě musel vyzvat, a teprve pak jsem
našel **dvě vlastní regrese**: invarianty jsem vytáhl z vyměnitelného bloku hlasu do
`DEF_CHAR` — jenže vlastní postava ze Supabase nahrazuje `DEF_CHAR` celý, takže pravidlo
o obrazu i anti-ozvěna šly z **nepřepsatelného** místa do **přepsatelného**. A první oprava
nestačila; ukázal to až test proti VŠEM stavům.

**Proč zelené ověření nestačí:** golden, linty a gramatika ověřují, že se stalo to, co jsem
chtěl. Neověřují, jestli jsem chtěl správnou věc. Na to je jen jedna cesta — zeptat se
*„jak by tohle mohlo být špatně?"* a odpověď **spustit**, ne promyslet.

**Tři útoky, které tady zabraly nejčastěji:**
1. **Jinou cestou** — existuje větev kódu, kde moje úprava neplatí? (vlastní postava, jiný
   builder, jiný jazyk, chybějící pole)
2. **Proti vlastnímu měřidlu** — hledal jsem svou vlastní větu, nebo ten jev? Zkus širší
   záběr, který by chytil i parafrázi ([[sanity-check-measurements]]).
3. **Všechny stavy, ne šťastná cesta** — [[guard-test-the-lifecycle]].

**A když útok něco najde, napiš test, který to hlídá dál** (`scripts/utils/test_spine.js`
je z tohohle dne). Nález bez testu se vrátí.

Souvisí: [[attack-the-metric-not-just-the-result]] (útok na nástroj) · [[measure-dont-eyeball]] ·
[[read-the-check-before-push]].

**4. Proti ownerovým větám z posledního zadání, jedna po druhé (2026-10-03, CODE-tree).** Zóny jsem změřil
ze všech stran (skákání, strany, výšky, okrajové případy) a ohlásil „25 pramenů“ — a přitom owner v zadání
řekl *„graduant sdílí kmen a je jen větší, protože obsahuje 2 stejné elementy“* a já sám předtím napsal
„prameny budou místa element × zóna“. Starou mechaniku (vlastní pramen graduanta z kroku 2) jsem tiše
přenesl a žádné z mých měřidel se na tu větu neptalo. Owner: *„jak ti to mám vysvětlit??? 14 pramenů…
si načti všechno, jak to má být udělané“*. **Před hlášením vypiš jeho věty ze zadání jako seznam a u každé
napiš, čím ve výsledku je splněná (číslo, obrázek, test).** Kde to nejde, je to nález, ne hotovo.
Souvisí: [[napred-dohledej-co-uz-je]], [[ownerovo-slovo-neni-spec]].

**5. Měř v prostředí, ve kterém se owner dívá (2026-10-03, CODE-tree).** Lab si posuvníky NEPAMATUJE — owner v prohlížeči
vidí výchozí hodnoty z kódu. Já měřil s jeho uloženými (`_tree_state.json`: podlaha výstupu 0,13) a dvě ramena „přesně
z jednoho místa" při výchozí podlaze 0,50 mi utekla; on je uviděl hned. Kontroly, které mají chránit jeho pohled, pouštěj
s výchozími hodnotami (tak běží smoke ㉳) a jeho uložené ber jako druhý případ, ne jediný.

**6. Po změně modelu projdi VŠECHNO, co o něm mluví (2026-10-03, CODE-tree).** Krok 5 změnil, co je větvička (jedno čtení na rameni
elementu), a inspekce dál psala „tuhle runu jsi táhl 1x" (byl to počet čtení NA větvičce), „délka roste s opakováním runy" a u ramene
vždy „pořadí v elementu: 1."; posuvníky nahrazených mechanik visely bez účinku a RESET strom nemazal. Owner: *„proč se informace
nemění? proč pořád něco nefunguje? kdo dělá chybu a proč?"* Měřil jsem geometrii, ne to, co o ní říká rozhraní. **Po každé změně
modelu projdi: inspekci (každý druh části), přehled větví, text RŮST, audit posuvníků (`tree_diag.js sliders`, DEFAULTS=1), reset
a vymazání, docs.** Co jde, hlídá smoke ㉳ (místa větví, klikatelnost, inspekce = log).
