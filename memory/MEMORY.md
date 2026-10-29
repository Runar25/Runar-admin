# Claude Memory Index
# Zkukula (Kuky) — Agndofa / Rúnar project

⚠️ **INDEX, ne sklad faktů.** Vlastní jen Session Start Protocol a rozcestník. Žádná čísla, SW verze, hashe, stavy ani tier tabulky (§20).
Přidáváš sem fakt? Nepřidávej — patří k vlastníkovi; sem nanejvýš jednořádkový odkaz.

---

## Session Start Protocol
1. Tento soubor · 2. [working-style.md](working-style.md) (Explore→Plan→Implement) · 3. `CLAUDE.md` (pravidla §1+) ·
4. `RUNAR_DECISIONS.md` — při sporu vyhrává novější záznam; celý se nečte, hledá se `node scripts/utils/uz_vime.js <pojmy>` ·
5. doc podle úkolu (rozcestník) + cílový soubor. Pak: „Mám kontext — jsem připraven."
⚠️ Nová funkce nebo změna chování → napřed ownerem schválený plán; rozpory, duplikáty a vlastní kontroly oprav bez ptaní (working-style).
⭐ Rozejdou-li se zdroje nebo jde-li o rozhodnutou věc → CLAUDE.md §20 (vyhrává produkce; dohledat, neptat se).

---

## Rozcestník — kde co bydlí (jediné místo)
Druh: 🔒 externě ukotveno (etymologie, IS gramatika) · 📜 vytvořený kánon (Rúnar, mytologie, hlas) · 🔄 interně rozhodnuto (tiery, ceny) · 🏛 architektonické (pravidla, lanes).

| Co hledáš | Vlastník | Druh |
|---|---|---|
| Tiery, limity · ceny spreadů · VOCAB · SPREAD_CONFIG | `v2/runar-config.js` — **doky to NEOPISUJÍ** | 🔄 |
| Runy, ætty, AREAS/SEEKS/INTENTIONS | `v2/runar-runes.js` | 🔒 |
| Prompty, buildery, délky čtení, IS gramatika | `v2/runar-character.js` | 🔒 · 📜 hlas |
| Model čtení (`SOL_MODEL`) + záloha (`MODELS`) | `supabase/functions/claude-proxy/index.ts` | 🔄 |
| Pravidla §1+, lanes, commit prefixy | `CLAUDE.md` | 🏛 |
| Proč pravidlo zní, jak zní (důvody, doklady, historie) · podrobnosti stavu systémů | `docs/pravidla-duvody.md` · `docs/projekt-mapa.md` (na požádání) | 🏛 |
| Proč je něco tak (datovaná rozhodnutí) | `RUNAR_DECISIONS.md` | log |
| Business, kredity, fyzické produkty | `RUNAR_PRICING.md` | 🔄 |
| Design: hlas Rúnara, stavba čtení, obraz, Vegvísir | `RUNAR_DESIGN.md` | 📜 |
| Spready — pozice, místo ve stromě, přístup | `RUNAR_SPREADY.md` | 📜 |
| Mytologie — bytosti, katalog dvergů, islandský kalendář | `RUNAR_MYTOLOGIE.md` | 📜 · 🔒 |
| Popisy run pro člověka | `RUNAR_POPISY_RUN.md` | 📜 |
| Strom života | `RUNAR_TREE.md` | 📜 |
| Otevřené úkoly | `RUNAR_BACKLOG.md` | stav |
| GDPR, privacy | `RUNAR_PRIVACY.md` | 🔒 |
| Co owner řekl dřív | `node scripts/utils/najdi_v_konverzacich.js "<text>"` | stav |
| Pravidla pro soubor (hook při dotyku) | `scripts/utils/pravidla_mapa.json` | 🏛 |
| Prófsteinn — test čtení při stížnosti | `scripts/profsteinn.js` | 🔄 |
| SW verze / commit / co je nasazené | `v2/sw.js` a `git log` — nikdy ne v docu | stav |
| Dverg Tarot (karty s dvergy) — samostatný produkt mimo Rúnara | `dverg-tarot/README.md` | — |

Vrstvy pravdy: kanonická = root `RUNAR_*.md`, `memory/*.md`, `CLAUDE.md` · historie = `memory/snapshots/`, `docs/archive/`, DECISIONS · intake (NENÍ pravda) = `docs/inbox/`.

---

## Index paměti
- [working-style.md](working-style.md) — workflow, Python skripty, verifikace
- [is-done-together-not-for-sigrun.md](is-done-together-not-for-sigrun.md) — IS rovnou hotová a ověřená, žádný draft pro Sigrún
- [handoff-text-in-code-block.md](handoff-text-in-code-block.md) — text k předání jiné session do code blocku
- [neposilat-praci-coworku.md](neposilat-praci-coworku.md) — co umí Code, udělá sám; žádný handoff Coworku přes ownera
- [paste-sql-explicitly.md](paste-sql-explicitly.md) — SQL pro ownera vlož celé, žádné „jako minule"
- [read-token-from-clipboard.md](read-token-from-clipboard.md) — eval token si načti ze schránky sám
- [runar-api-key-file.md](runar-api-key-file.md) — Anthropic klíč v `~/.claude/runar-api-key.txt`, ownera nežádat
- [cteni-generuj-tady-ne-pres-api.md](cteni-generuj-tady-ne-pres-api.md) — testovací čtení piš sám, ne přes API; slepé souzení subagentem
- [ukladej-cteni-a-hlasy.md](ukladej-cteni-a-hlasy.md) — každé čtení i hlas z pokusu uložit s tím, z čeho vznikl (archiv hlasů)
- [full-path-and-numbered-lists.md](full-path-and-numbered-lists.md) — úplná cesta k souboru; VŠECHNY body a otázky ownerovi číslované
- [ask-owner-for-checks-you-cannot-run.md](ask-owner-for-checks-you-cannot-run.md) — co Code neověří, napřed zkusit, pak vyžádat od ownera
- [dont-invent-fact-critical.md](dont-invent-fact-critical.md) — chybí fakt/lore → zastav a flagni
- [function-not-ceremony.md](function-not-ceremony.md) — nestavět proces pro uspokojení
- [proceed-dont-ask.md](proceed-dont-ask.md) — dohodnutý plán odjeď celý, neptej se mezi kroky
- [one-patch-script-path.md](one-patch-script-path.md) — patch do vlastního gitignored slotu session
- [match-existing-visual-first.md](match-existing-visual-first.md) — nové UI: napřed existující vizuál
- [verify-agent-claims-about-code.md](verify-agent-claims-about-code.md) — handoff jiné session = žádost, ne fakt
- [propose-content-not-code.md](propose-content-not-code.md) — Cowork dodává obsah, kód ne
- [bash-no-cd-prefix.md](bash-no-cd-prefix.md) — NIKDY `cd … &&` ani `| tail` na Bash
- [heredoc-mangles-backslash-escapes.md](heredoc-mangles-backslash-escapes.md) — skript s escape sekvencemi piš nástrojem Write
- [api-guard-py-false-positive.md](api-guard-py-false-positive.md) — dvě jména `.py` v příkazu → hlídač API; cesty přes `--pathspec-from-file`
- [edit-tool-escapes-new-text.md](edit-tool-escapes-new-text.md) — Edit na řádku s `\uXXXX` → patch skriptem
- [ceske-nazvy-spreadu-v-kodu.md](ceske-nazvy-spreadu-v-kodu.md) — ve v2/ názvy spreadů anglicky
- [guard-test-the-lifecycle.md](guard-test-the-lifecycle.md) — kontrolu testuj proti všem stavům hlídané věci
- [read-the-check-before-push.md](read-the-check-before-push.md) — pipe do grepu zahodí exit kód; čti verdikt
- [pathspec-nesmi-byt-prazdny.md](pathspec-nesmi-byt-prazdny.md) — prázdný pathspec = commit celého indexu
- [napred-dohledej-co-uz-je.md](napred-dohledej-co-uz-je.md) — před měřením/položkou prohledej docs a git log ostatních lane
- [parallel-code-sessions-collision.md](parallel-code-sessions-collision.md) — víc session ve sdíleném stromě: pathspec, commit_vlastni, status
- [test-vstup-jako-v-produkci.md](test-vstup-jako-v-produkci.md) — test formulace: napřed jeden hotový prompt porovnej s produkcí
- [prompt-directive-makes-model-copy.md](prompt-directive-makes-model-copy.md) — „použij tenhle text“ = opíše doslova; rámuj jako zdroj
- [falsify-by-reversing-the-lever.md](falsify-by-reversing-the-lever.md) — hypotézu „přidej X“ testuj ubráním X (§25)
- [loading-a-page-proves-existence-not-authenticity.md](loading-a-page-proves-existence-not-authenticity.md) — načtená URL ≠ pravá stránka
- [a-guard-that-refuses-is-a-detector.md](a-guard-that-refuses-is-a-detector.md) — „přepiš jen při jednom výskytu“ = detektor duplikátu
- [break-your-own-work-before-reporting.md](break-your-own-work-before-reporting.md) — na hotový kus zaútoč sám, pak hlas
- [attack-the-metric-not-just-the-result.md](attack-the-metric-not-just-the-result.md) — útoč na nástroj dřív než na výsledek (§25 B)
- [soudce-vidi-jen-co-uzivatel.md](soudce-vidi-jen-co-uzivatel.md) — slepý soudce vidí jen to, co uživatel
- [you-neni-prohresek.md](you-neni-prohresek.md) — „you“ ve čtení není prohřešek
- [selhany-verifier-neni-vyvraceny-nalez.md](selhany-verifier-neni-vyvraceny-nalez.md) — spadlý agent ≠ vyvrácený nález
- [test-the-lever-that-binds.md](test-the-lever-that-binds.md) — měň vazbu, která výsledek opravdu drží
- [rekni-kterou-variantu-testujes.md](rekni-kterou-variantu-testujes.md) — před testem řekni, kterou variantu testuješ
- [ownerovo-slovo-neni-spec.md](ownerovo-slovo-neni-spec.md) — konverzační přídavné jméno není zadání
- [ownerovo-hodnoceni-zapis-smysl.md](ownerovo-hodnoceni-zapis-smysl.md) — verdikt ownera zapiš srozumitelně, ne jeho slova; příklad = směr
- [measure-dont-eyeball.md](measure-dont-eyeball.md) — dojem není nález; změř, nebo „nevím"
- [glyph-text-vs-our-svg.md](glyph-text-vs-our-svg.md) — tvar runy ověř proti NAŠÍ kresbě
- [sanity-check-measurements.md](sanity-check-measurements.md) — extrémní číslo = red flag; ověř protipříkladem
- [co-dela-cteni-silnym.md](co-dela-cteni-silnym.md) — co dělá čtení silným (ownerem potvrzeno)
- [oprava-promptu-odebira-vadu.md](oprava-promptu-odebira-vadu.md) — vadu odeber; přidaný požadavek → formule
- [prompt-nepojmenuj-co-hned-zakazes.md](prompt-nepojmenuj-co-hned-zakazes.md) — nepojmenuj v promptu, co hned zakážeš
- [rozkaz-a-studene-cteni-hranice.md](rozkaz-a-studene-cteni-hranice.md) — „Look…“ ani fyzický důsledek nejsou porušení kánonu
- [gpt-rozbor-neni-zavazny.md](gpt-rozbor-neni-zavazny.md) — rozbor soudce je podnět, ne verdikt
- [strop-serveru-neni-narok.md](strop-serveru-neni-narok.md) — limit v proxy ≠ nárok tieru
- [admin-ucty-nejsou-nalez.md](admin-ucty-nejsou-nalez.md) — data admin účtů nejsou nález o soukromí
- [nacti-cteni-a-reporty.md](nacti-cteni-a-reporty.md) — „načti čtení a reporty“ → `node scripts/nacti_cteni.js`
- [schranka-runar-gmail.md](schranka-runar-gmail.md) — schránka runar@: štítky, jen koncepty, nic neodeslat bez ano
- [emaily-kratke.md](emaily-kratke.md) — každý e-mail na jednu obrazovku telefonu
- [always-show-reading-samples.md](always-show-reading-samples.md) — ownerovi ukaž text čtení i instrukce, které do něj vstoupily
- [modelove-stromy-neposilat.md](modelove-stromy-neposilat.md) — ownerovi jen jeho strom před/po
- [testovani-jedne-runy-je-zamer.md](testovani-jedne-runy-je-zamer.md) — owner testuje jednu runu schválně
- [write-for-owner-not-process.md](write-for-owner-not-process.md) — ownerovi výsledek, ne proces
- [cheapest-deciding-measurement-first.md](cheapest-deciding-measurement-first.md) — ⛔ agenti max 3–5, API nad ~50 jen s ano, vždy záměr + malý vzorek
- [work-efficiently-ask-if-simpler.md](work-efficiently-ask-if-simpler.md) — před těžkým nástrojem: nejde to jednodušeji?
- [decisions-are-directions-not-locks.md](decisions-are-directions-not-locks.md) — rozhodnutí = směr, ne zámek
- [find-a-gap-close-it-now.md](find-a-gap-close-it-now.md) — díru zavři v témže tahu
- [fix-substance-not-shape.md](fix-substance-not-shape.md) — security: oprav podstatu, ne tvar
- [copy-always-in-runar-voice.md](copy-always-in-runar-voice.md) — copy vždy hlasem Rúnara
- [read-design-before-voice-work.md](read-design-before-voice-work.md) — před hlasem/promptem RUNAR_DESIGN „Kdo je Rúnar" + „Slova, která dáváme modelu"
- [prompt-map-artifact.md](prompt-map-artifact.md) — mapa promptu zrušena, pravda = kód
- [cowork-handoff-quality-bar.md](cowork-handoff-quality-bar.md) — standard Cowork handoffů
- [review-everything-first-pass.md](review-everything-first-pass.md) — revize textů: vše v obou jazycích napoprvé
- [runar-not-public-yet.md](runar-not-public-yet.md) — Rúnar není veřejně spuštěný
- [is-grammar-adjective-gender.md](is-grammar-adjective-gender.md) — nejdřív rod podstatného, pak přídavné
- [en-formulace-overit-zdrojem.md](en-formulace-overit-zdrojem.md) — anglickou formulaci ověř korpusem
- [is-vazba-check.md](is-vazba-check.md) — islandskou vazbu ověř `is-vazba.py`, nehádej
- [windows-ui-v-en.md](windows-ui-v-en.md) — owner má Windows v EN
- Strom (CODE-tree): [runar-tree-engine-lab.md](runar-tree-engine-lab.md) · [runar-trunk-incremental-rule.md](runar-trunk-incremental-rule.md) · [runar-tree-living-movement.md](runar-tree-living-movement.md) · [tree-roots-rebuild.md](tree-roots-rebuild.md)

## Index snapshots — dobrovolné; historický záznam ke svému datu, ne popis dneška
- Starší (2026-05-30 → 2026-09-26): složka `snapshots/`.
- [snapshots/2026-10-05-vegvisir-odlozen.md](snapshots/2026-10-05-vegvisir-odlozen.md) — Vegvísir odložen
- [snapshots/2026-10-05-lab-co-uz-vime.md](snapshots/2026-10-05-lab-co-uz-vime.md) — LAB přestavby promptu: co už je změřeno
- [snapshots/2026-10-05-tree-proporce-strany-spicka.md](snapshots/2026-10-05-tree-proporce-strany-spicka.md) — strom: proporce, strany, špička
- [snapshots/2026-10-07-tune-audit-zaloha.md](snapshots/2026-10-07-tune-audit-zaloha.md) — §30 hooky, v5.04, lab otázek v Asku
