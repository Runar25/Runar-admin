# Snapshot 2026-06-16 — In-app reporter, provozní náklady/daně, koordinace 2 session

## SW: v105 · Poslední commit: d60d082
## (navazuje na 2026-06-14-pricing-audit-reprice.md)

---

## 1. In-app reporter + bug_reports (tester hlášení)
Dva specy: `runar_reporter_spec_CODE.md` (CODE = reporter + tabulka), `runar_copy_triage_COWORK.md` (Cowork = triáž).
**Postaveno (CODE/MAIN doména):**
- DB `sql/2026-06-14_bug_reports.sql` — 16 sloupců, RLS, anon jen INSERT. KUKY spustil v Supabase.
- `runar-reporter.js` — samostatný modul: injektuje plovoucí ⚑ tlačítko + sheet panel + styl (Rúnar tmavá+zlatá),
  zachytí selection/screen text, jméno testera 1× (localStorage), texty přes t() (EN+IS, 22 klíčů). Offline fronta
  (localStorage `bug_queue`), flush init/online/po odeslání. Načten v reader.html po app.js.
- **Sloupce navíc nad spec (pro auto-routing triáže):** `flagged_source` (selection/screen), `i18n_key`
  (překladový klíč když [data-i18n]), `screen_context` (tab + #kontejner).
- **Fáze 2** (678c0b2): `data-i18n` na 6 prvcích pre-reading formuláře (name/area/seek/intention/q/begin) →
  reporter připojí i18n_key → Cowork routuje rovnou na klíč v translations.js.

### ⭐ GOTCHA — Supabase anon .upsert() ≠ .insert() na RLS
Reporter původně používal `.upsert(rep,{onConflict,ignoreDuplicates})` → **403 / 42501** (RLS).
Plain `.insert(rep)` jako anon **prošel** (201). Diagnostikováno naživo přes preview.
**FIX (e51445d):** reporter používá plain `.insert()`; dedupe přes UNIQUE `client_uuid` —
duplicita vrátí **23505**, což bereme jako „už odesláno" → vyřadit z fronty. Idempotence zachována.
RLS policy `to public with check(true)` + grant insert. Ověřeno e2e (Sent, fronta=0) + dedupe (201→23505).
**Pravidlo:** pro insert-only tabulky používej plain insert + UNIQUE constraint, NE upsert.

### Další gotchas (deployment/cache)
- **sw.js = HTML network-first, JS/CSS cache-first.** Změny *.html (vč. data-i18n) dorazí i BEZ SW bumpu →
  proto git hook na samotné HTML nebumpuje. JS změny SE bumpují (cache-first) → tester musí dostat nový SW.
- **Tester drží starý cachovaný JS** dokud se SW neupdatuje. Fix u testera: DevTools → Application →
  Service Workers → **Unregister** → reload (NE „Clear site data" — smaže frontu reportů). Fronta v localStorage
  přežije, nasbírané reporty se po updatu flushnou. KUKY ověřil: po unregister+reload „vse ok".

## 2. Provozní náklady + daně + break-even → RUNAR_PRICING.md (d60d082)
Sekce „Operating costs, taxes & break-even (Agndofa ehf., Iceland)". Postaveno jako interaktivní kalkulačka (widget).
- **Fixní ~$202/měs:** Claude dev/Max $100 (dočasný), Shopify Basic $39, Supabase $25, ElevenLabs Creator $22,
  Apple $8.25, Hetzner $6, doména $1.50, Google $0.70, Resend $0.
- **Variabilní ~$1.81/už:** API+hlas $0.85 + Shopify platby ~2.9%+$0.30/txn.
- **Daně IS (Agndofa ehf.):** VSK 24% (osvobození pod 2M obratu ≈47 už); zaměstnavatelské odvody ~19.5-21.5%
  (tryggingagjald 6.35 · lífeyrissjóður mótframlag 11.5 · sjúkrasjóður 1 · orlofssjóður 0.25 · starfsmennta ~0.35);
  osobní daň+odvody ~33% (tekjuskattur+útsvar progresivní + lífeyrir 4 + stéttarfélag); firemní 20% / dividenda 22%.
- **Break-even ~8 už; 500k ISK čistého/měs ≈ 353 platících.** Odvody ~zdvojnásobí počet vs hrubý model.
  Claude $100 dočasný → po launchi break-even ~5. Odhady — ověřit s účetním. Zdroje (ASÍ, PwC, Skatturinn) v doc.

## 3. Mood field odstraněn (38f9713, SW v103)
„HOW ARE YOU FEELING?" pryč z produkce (dekorativní). intention zůstává. `_moodContext` dormantní.

## 4. CLAUDE.md trim + koordinace 2 session (95424de, 1340347)
CLAUDE.md 356→234 ř. Tree-lab historie (145 ř.) přesunuta do **RUNAR_TREE_LAB.md** (doménový doc TREE session).
Přidán **koordinační protokol**: domény (MAIN=reading/pricing/config/reader, TREE=vizuální engine),
git/commit konvence (`[tree]` vs `[reading]`/`[pricing]`), řešení konfliktů. **Sdílená sémantická vrstva
(runa→růst):** runar-runes.js (aett/world/element) + config = SDÍLENÉ; TREE růst drží v runar-branch.js,
do runar-runes.js sahá jen ADITIVNĚ + flag do MEMORY. TREE session reálně paralelně pracuje (RUNAR_TREE_LAB.md
roste — crown composer, per-rune authoring, routing) — jejích souborů se MAIN nedotýká.

---

## Stav na konci
SW v105 · vše MAIN pushnuté (HEAD d60d082) · patch skripty v scripts/archive/ · paměť+RUNAR_PRICING zrcadleno.
TREE session má rozpracované (necommitnuté) tree soubory — to je JEJICH, nedotýkat se.

### Zbývá
- 🔴 Launch: Resend SMTP, Shopify webhook, Standard checkout
- 🟡 Monthly limit enforcement (jednotky) v claude-proxy
- 🟢 Reporter fáze 2 rozšířit (víc data-i18n prvků až dle reálných reportů)
- 🟢 KUKY 14 dní testuje → pak Cowork triáž bug_reports
- 🟢 Tree of Life (TREE session, paralelně)
