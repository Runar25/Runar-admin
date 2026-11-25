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
| Business, kredity | `RUNAR_PRICING.md` | 🔄 |
| Fyzické produkty, Rúnakort jako karta, balíčky | `RUNAR_PRODUKTY.md` | 🔄 |
| Design: hlas Rúnara, stavba čtení, obraz | `RUNAR_DESIGN.md` | 📜 |
| Vegvísir (odložený, není spread) | `RUNAR_VEGVISIR.md` | 📜 |
| Spready — pozice, místo ve stromě, přístup | `RUNAR_SPREADY.md` | 📜 |
| Mytologie — bytosti, katalog dvergů, islandský kalendář | `RUNAR_MYTOLOGIE.md` | 📜 · 🔒 |
| Popisy run pro člověka | `RUNAR_POPISY_RUN.md` | 📜 |
| Strom života | `RUNAR_TREE.md` | 📜 |
| Sítě a web — čísla v čase (monitoring, CODE-web) | `docs/monitor/site-a-web.md` | stav |
| Otevřené úkoly | `RUNAR_BACKLOG.md` | stav |
| Měsíční údržba — postup (oblasti, otázky, pořadí) | `RUNAR_UDRZBA.md` · `scripts/utils/udrzba.py` | 🏛 |
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
- [shrine-admin-not-lab.md](shrine-admin-not-lab.md) — runar-shrine.html je admin, ne lab; `teach` píše do produkce
- [vocab-natvrdo-a-migrace.md](vocab-natvrdo-a-migrace.md) — Jak najít natvrdo zapsané vocab/tier termíny a po přejmenování ručně grepnout staré (k CLAUDE.md §13, §15)
- [cowork-bash-mount.md](cowork-bash-mount.md) — Cowork: flaky bash mount uřezává repo soubory — čti z git objektu; Cowork do repa nepíše
- [protokol-externi-dokumenty.md](protokol-externi-dokumenty.md) — Protokol pro externí dokumenty (patche, design docy): jak je přijímat a kam zapsat
- [naklady-testovani.md](naklady-testovani.md) — testovací čtení píšeš sám, slepý soudce = subagent; API jen produkční model a srovnání modelů, malý vzorek
- [handoff-text-in-code-block.md](handoff-text-in-code-block.md) — text k předání jiné session do code blocku
- [neposilat-praci-coworku.md](neposilat-praci-coworku.md) — co umí Code, udělá sám; žádný handoff Coworku přes ownera
- [paste-sql-explicitly.md](paste-sql-explicitly.md) — SQL pro ownera vlož celé, žádné „jako minule"
- [read-token-from-clipboard.md](read-token-from-clipboard.md) — eval token si načti ze schránky sám
- [runar-api-key-file.md](runar-api-key-file.md) — Anthropic klíč v `~/.claude/runar-api-key.txt`, ownera nežádat
- [ukladej-cteni-a-hlasy.md](ukladej-cteni-a-hlasy.md) — každé čtení i hlas z pokusu uložit s tím, z čeho vznikl (archiv hlasů)
- [ask-owner-for-checks-you-cannot-run.md](ask-owner-for-checks-you-cannot-run.md) — co Code neověří, napřed zkusit, pak vyžádat od ownera
- [vyznamy-run-historie-jen-zdroj.md](vyznamy-run-historie-jen-zdroj.md) — významy run hledáme nové; historie je zdroj, ne mez
- [match-existing-visual-first.md](match-existing-visual-first.md) — nové UI: napřed existující vizuál
- [verify-agent-claims-about-code.md](verify-agent-claims-about-code.md) — handoff, rozbor GPT i shoda Cowork↔Code = tvrzení k ověření na HEAD; „Cowork tvrdí“ ≠ „KUKY rozhodl“
- [propose-content-not-code.md](propose-content-not-code.md) — Cowork dodává obsah, kód ne
- [bash-no-cd-prefix.md](bash-no-cd-prefix.md) — NIKDY `cd … &&` ani `| tail` na Bash
- [api-guard-py-false-positive.md](api-guard-py-false-positive.md) — dvě jména `.py` v příkazu → hlídač API; cesty přes `--pathspec-from-file`
- [edit-tool-escapes-new-text.md](edit-tool-escapes-new-text.md) — soubor s escapy u+XXXX (runar-translations.js): Edit přepíše i nový text, kotvu měň patch skriptem po celých řádcích
- [ceske-nazvy-spreadu-v-kodu.md](ceske-nazvy-spreadu-v-kodu.md) — ve v2/ názvy spreadů anglicky
- [guard-test-the-lifecycle.md](guard-test-the-lifecycle.md) — nová kontrola do smoke: projdi všechny stavy hlídané věci; `count != 1` v patchi = duplikát, napřed zjisti proč
- [read-the-check-before-push.md](read-the-check-before-push.md) — pipe do grepu zahodí exit kód; čti verdikt
- [napred-dohledej-co-uz-je.md](napred-dohledej-co-uz-je.md) — před měřením/položkou prohledej docs a git log ostatních lane
- [parallel-code-sessions-collision.md](parallel-code-sessions-collision.md) — víc session ve sdíleném stromě: commit_vlastni, pathspec nikdy prázdný, status před sáhnutím
- [loading-a-page-proves-existence-not-authenticity.md](loading-a-page-proves-existence-not-authenticity.md) — načtená URL ≠ pravá stránka
- [break-your-own-work-before-reporting.md](break-your-own-work-before-reporting.md) — na hotový kus zaútoč sám, pak hlas
- [soudce-vidi-jen-co-uzivatel.md](soudce-vidi-jen-co-uzivatel.md) — slepý soudce dostane jen to, co vidí uživatel; nález soudce (GPT, „you“) je podnět k ověření, ne vada
- [selhany-verifier-neni-vyvraceny-nalez.md](selhany-verifier-neni-vyvraceny-nalez.md) — agent nebo verifier, který spadl, hlas zvlášť — ne jako „vyvráceno“ (pozor na .filter(Boolean) ve workflow)
- [rekni-kterou-variantu-testujes.md](rekni-kterou-variantu-testujes.md) — před testem řekni, kterou variantu testuješ
- [ownerovo-slovo-neni-spec.md](ownerovo-slovo-neni-spec.md) — ownerovo hodnotící slovo („delší“) převeď na číslo, nebo se zeptej; verdikt zapiš vlastní větou, jeho příklad = směr
- [glyph-text-vs-our-svg.md](glyph-text-vs-our-svg.md) — tvar runy ověř proti NAŠÍ kresbě
- [sanity-check-measurements.md](sanity-check-measurements.md) — výsledek 0/N nebo N/N ověř protipříkladem; páka musí hýbat vazbou, která výsledek drží; slovo z jednoho vzorku není vada
- [co-dela-cteni-silnym.md](co-dela-cteni-silnym.md) — co dělá čtení silným (ownerem potvrzeno)
- [strop-serveru-neni-narok.md](strop-serveru-neni-narok.md) — limit v proxy ≠ nárok tieru
- [admin-ucty-nejsou-nalez.md](admin-ucty-nejsou-nalez.md) — data admin účtů nejsou nález o soukromí
- [schranka-runar-gmail.md](schranka-runar-gmail.md) — schránka runar@: štítky, jen koncepty, nic neodeslat bez ano
- [emaily-kratke.md](emaily-kratke.md) — každý e-mail na jednu obrazovku telefonu
- [always-show-reading-samples.md](always-show-reading-samples.md) — ownerovi ukaž text čtení i instrukce, které do něj vstoupily
- [modelove-stromy-neposilat.md](modelove-stromy-neposilat.md) — ownerovi jen jeho strom před/po
- [testovani-jedne-runy-je-zamer.md](testovani-jedne-runy-je-zamer.md) — owner testuje jednu runu schválně
- [write-for-owner-not-process.md](write-for-owner-not-process.md) — zpráva ownerovi: výsledek, ne proces; cesty od C:, každý bod a otázka s číslem, otázky neopakovat v průběžných zprávách
- [cheapest-deciding-measurement-first.md](cheapest-deciding-measurement-first.md) — před agenty, dávkou nebo API: nejlevnější rozhodující měření, záměr + předpoklad, agenti max 3–5, API nad ~50 jen s ano; žádný proces pro uklidnění
- [fix-substance-not-shape.md](fix-substance-not-shape.md) — security: oprav podstatu, ne tvar
- [copy-always-in-runar-voice.md](copy-always-in-runar-voice.md) — copy vždy hlasem Rúnara
- [cowork-handoff-quality-bar.md](cowork-handoff-quality-bar.md) — standard Cowork handoffů
- [review-everything-first-pass.md](review-everything-first-pass.md) — revize textů: vše v obou jazycích napoprvé
- [runar-not-public-yet.md](runar-not-public-yet.md) — Rúnar není veřejně spuštěný
- [is-grammar-adjective-gender.md](is-grammar-adjective-gender.md) — nejdřív rod podstatného, pak přídavné
- [is-vazba-check.md](is-vazba-check.md) — islandskou vazbu ověř `is-vazba.py`, nehádej
- [windows-ui-v-en.md](windows-ui-v-en.md) — owner má Windows v EN: popisky UI anglicky; náhledy a screenshoty webu a appky v EN verzi
- Strom (CODE-tree): [runar-trunk-incremental-rule.md](runar-trunk-incremental-rule.md) · [tree-roots-rebuild.md](tree-roots-rebuild.md)

## Index snapshots — dobrovolné; historický záznam ke svému datu, ne popis dneška
- Starší (2026-05-30 → 2026-09-26): složka `snapshots/`.
- [snapshots/2026-10-05-vegvisir-odlozen.md](snapshots/2026-10-05-vegvisir-odlozen.md) — Vegvísir odložen
- [snapshots/2026-10-05-lab-co-uz-vime.md](snapshots/2026-10-05-lab-co-uz-vime.md) — LAB přestavby promptu: co už je změřeno
- [snapshots/2026-10-05-tree-proporce-strany-spicka.md](snapshots/2026-10-05-tree-proporce-strany-spicka.md) — strom: proporce, strany, špička
- [snapshots/2026-10-07-tune-audit-zaloha.md](snapshots/2026-10-07-tune-audit-zaloha.md) — §30 hooky, v5.04, lab otázek v Asku
- [snapshots/runar-tree-engine-lab.md](snapshots/runar-tree-engine-lab.md) · [snapshots/runar-tree-living-movement.md](snapshots/runar-tree-living-movement.md) — strom: lab enginu a živý pohyb (červen–srpen 2026)
