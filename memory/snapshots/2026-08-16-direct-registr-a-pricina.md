# 2026-08-16 — Registr `direct`, nalezená příčina, a tři měřidla, která lhala
# Snapshot session CODE-tune. Historický záznam ke svému datu.

## ⭐ NEJDŮLEŽITĚJŠÍ NÁLEZ DNE

**Prompt Rúnarovi podal význam runy a hned mu zakázal ho vyslovit.**

`_describeRule` říká *„say what the rune does in the world; **never what it means**"* — a přitom
`_spreadBlock` / `drawnCtx` mu ta klíčová slova o dva řádky výš dodá. Proto čtením nezbývalo než
obraz. **Tentýž zákaz přežíval i v `philosophy`**, takže `--without describe` ho neodstranil
a `gen-bare` (25 čtení, 15 vypnutých vrstev) **není holý Rúnar**.

KUKY: *„význam runy se vyslovit smí a položí se do pozice; co to znamená pro toho člověka,
zůstává jeho."*

## Co je hotové a nasazené

- **`VOICE_PROFILES.direct` přepsán.** Tón = **jedna věc na větu** (ne „krátké věty" — to
  specifikace ze 14. 8. výslovně vyvrací a měření to potvrdilo: ownerova reference má 20,8 slova
  na větu, naše čtení 20,0).
- **Registr nese `rules`** = pravidla, která mění oproti základu (`describe`, `philosophy`).
  `_describeRule(lang, key)` má klíč **volitelný** s fallbackem → všech sedm volajících beze změny.
  `activeVoice` přepíná celý prompt, ne jen systémový.
- **`_spine` NEDOTČEN** — jeho „not interpret" mluví o obrazu, ne o významu runy.
- `ACTIVE_VOICE_PROFILE` = **`focused`**. Nic nejede naostro.
- Mapa promptu překreslená na **v2.1** (tatáž URL, `memory/prompt-map-artifact.md`).
- `SessionStart` hook vypisuje po compactu: poslední commity · poslední rozhodnutí · mapu
  „sáhneš na tohle → přečti tenhle doc" · archiv čtení · dvě pravidla, co se nejčastěji zapomínají.
- `scripts/utils/tools.js` — jeden příkaz vypíše všech 38 nástrojů podle toho, k čemu jsou.

## Opravená měřidla (čísla z dneška před opravou NEPLATÍ)

| co | vada | dopad |
|---|---|---|
| `measure_readings` IS_AMBIG | JS `\b` neplatí na `þ` → **mrtvá větev** | podhodnocení |
| `measure_readings` IS_NEG | `\bekki\b` sedne uvnitř `þekki` → falešný zápor | podhodnocení |
| `test_no_planted_bans` | detektor EN-only → **81 IS obrazů nikdy nekontrolováno** | slepota |
| `finnur` v seznamu nároků | `finna` = i **najít** (`Þú finnur skjól`) | nadhodnocení |
| `is-vazba --freq` | API bere max **10 termů**, zbytek tiše zahodí → tisklo „NEDOLOŽENO (0)" | **falešný důkaz proti** |

**Platná islandská čísla: produkce 18 %, čerstvá dávka 2 %.**

## ⚠️ Co NEZNOVUNAVRHOVAT (dnes jsem to udělal čtyřikrát)

1. **`direct` = kratší věty** → `RUNAR_BACKLOG.md:258` říká doslova opak: **méně úkolů na čtení**.
2. **Je povolený postoj?** → `RUNAR_DESIGN.md:124`: **postoj ano, radu ne**.
3. **Slít `DEF_CHAR` a `VOICE_PROFILES`** → rozhodnutí 2026-08-14 je drží odděleně schválně
   (*„profil je čistý tón a nic víc"*).
4. **Obecnost = Barnum = vada** → `RUNAR_DESIGN.md:47` říká opak: projekce je **základ**
   poctivého pozicování; čára vede mezi **zrcadlem a orákulem**, ne mezi obecným a konkrétním.

Navíc: `intention` **zůstává** — krmí strom (`intZone`) a je to otázka uživatele. Že netvaruje
text, není důvod ho brát pryč (owner). Otázkou je nanejvýš jeho **formulace**.

## Otevřené

- **Sentenční rozpočet pro `direct`.** V 5,9 věty (norns) se „jedna věc na větu" u tří run nedá.
  Owner zatím řekl délku nechat.
- **Měřicí dávka** — backlog má u nálad `Naostro až po měření` a otázku, jestli měřit vůbec.
- **Perthovy obrazy.** Vygenerované `direct` čtení Perthu si význam **vymyslelo**
  (*„the thing not yet raised"* × kánon `chance, hidden things, fate in the making, luck, the unseen`).
  Perth je jediná runa z 25, kde **všechny tři** obrazy už samy nesou výklad
  (`waiting to be drawn up`, `you cannot see where`, `you do not yet know`).
  ⚠️ **Ten detektor „výkladu v obraze" jsem si vymyslel a nikdo na něj nezaútočil** (§27) —
  číslo „7 z 81" je „7 podle vzoru, který jsem si k tomu ušil". Perth jako jediná runa se
  všemi třemi obrazy zatíženými je pozorování, ne dokázaná příčina.
- **Vzor, který se opakuje potřetí:** zakážeme něco na výstupu a pošleme to na vstupu
  (`_noColdRead` jmenoval „already" 3× · `focused` měl studené čtení ve vzoru · obrazy nesou výklad).

## Kde owner chce pokračovat

**Od první instrukce, co tvoří prompt** — projít je od začátku, ne lovit jednotlivosti uvnitř.
Systémový prompt = **13 bloků, 3 906 znaků**, začíná `You are Rúnar, the rune keeper of Agndofa.`
a nenese runu, oblast ani sezónu. Reading prompt = 18 vrstev.
