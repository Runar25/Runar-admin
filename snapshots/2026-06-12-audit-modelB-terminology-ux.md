# Snapshot 2026-06-12 — Audit fixy, RS model B, terminologie, čtení, UX

## SW verze: v93
## Poslední commit: 07e9215
## ~24 commitů, vše pushnuté na GitHub, backend (claude-proxy) deployed

---

## 1. Audit fixy (vocab/tier z VOCAB/TIERS)
- **voice_btn_done i18n** (069e48b) — „RÚNAR HAS SPOKEN" byl natvrdo EN ve 4 místech → t('voice_btn_done').
- **Berkano→Berkana** (f4aebe6) — TRANSFORMATION_PAIRS měl špatné jméno runy, pár se nikdy nematchnul.
- **Card name z VOCAB** (3a34977→5e2c1aa) — kanonicky „Rune Reading Card"; přidán `vlp()` plurál helper; redeem_card_code/shop_buy_more klíče s {card}; panely + app.js přes tp()/vl()/vlp(). Ověřeno runtime EN+IS.
- **Tier jména + gift_card_btn** (682daec) — PANEL_TIERS jména z TIERS[x].label (_tierName helper); redeem-link lokalizace (byl stuck EN); gift_card_btn {card}.
- **§15 pravidlo** (f8a3b71) — vocab/tier termíny VŽDY z VOCAB/TIERS. Known-offenders list → working-style.md.
- **free_spreads smazán** (4a6cd7d) — mrtvý config, nečetl se nikde (gating = jen !currentUser).
- **IS akcenty** (f69470c) — Yggdrasil positions.is + AETTY theme_is/name_is odakcentované → diakritika (Haesta→Hæsta, voxtur→vöxtur, Aett→ætt). Nerenderovaná data, ale §2.

## 2. RS free model B — PAYWALL (df3a424, db22f21) + backend deploy
**Rozhodnuto: 1 free čtení při registraci, pak vše za kredity. ŽÁDNÝ měsíční reset, žádný drip.**
- Jediný signál = DB `free_balance` (DEFAULT 1). 1 free MÁ hlas.
- Frontend: `userFreeBalance` global z free_balance; měsíční localStorage systém (getFreeMonthCount/syncMonthlyCount) přepojen/odstraněn; shouldUseCredit = RS && userFreeBalance<=0.
- Backend (claude-proxy): pondělní drip ODSTRANĚN; chyba weekly_limit→no_credits. Deployed.
- **BUG #1 (přijato bez fixu):** delete account + re-register → 1 free znovu (DB default). Prevence vyžaduje persistent tracking přežívající smazání (email-hash, obejitelné). Zneužití = 1 čtení.

## 3. Délky čtení + weaving (c9d592d)
- Délky: Single **4**, Norns **8-9**, Kříž **9-10**, Horseshoe **11-12**, Yggdrasil **14-15**, Life Rune **8-9**. Format default generický.
- Multi-rune weaving: všechny runy musí prostoupit text kvalitou; runy se **NEjmenují** (fix BUG #2 — Horseshoe/Yggdrasil zmiňovaly jen 1 runu). 8 builderů EN+IS.
- Délkový propočet: počet run × váha. Single zkráceno (nejvyšší objem → úspora ElevenLabs).

## 4. Terminologie stones → rune reading (cca6906, f4b281a)
- VOCAB.unit „rune stone"/„rúnasteinn" → „rune reading"/„spá" (propíše vn('unit'): credit counter, redeem, life rune cost).
- Hardcoded literály (tree_rs_cost/balance EN+IS), IS rs_credits_desc, panely, komentáře.
- Poetické „stones" (Rúnarův hlas) ZŮSTÁVAJÍ. RS Life Rune = 3 rune readings.

## 5. No-duplicate runy (63603a6)
- Multi-rune spread: vybraná runa = grid button `disabled` (_syncGridUsed z 4 _updateSpreadXSlots), data-rune na tlačítkách, drawRandomRune losuje jen z !disabled. CSS .rb:disabled. Pokrývá auto i manuál.

## 6. Model-B copy + cleanup + DRY
- **Model-B copy** (64abf90) — rs_banner_counter/desc, rs_credits_desc, rs_exhausted_one/many (EN+IS) už neříkají „monthly/this month".
- **Dead code** (f263659) — smazán měsíční/reset cluster (getFreeMonthCount, freeMonthKey, nextReset*, resetNotif*, showResetModal, closeResetModal) + reset-notif-modal HTML + readings_renewed/reset_body klíče. Nula zbylých referencí.
- **DRY spread helper** (009a614) — 4 generate fce → `_generateSpreadReading(o)` + 4 wrappery (~315→~95 ř.). Chování beze změny.

## 7. Responsivní mobilní layout
- **Rune grid** (19dc99e) — mobil auto-fill `minmax(64px)` = 4 runy/řádek na ~375px (z 3), škáluje 3-5. SVG `clamp(38px,11vw,72px)`.
- **Spread tlačítka** (iterace: 19dc99e scroll<480 → e04d69e scroll všude → **07e9215 finál 3+2 grid**). KUKY chtěl 3+2 pod sebou, symetrické: `display:grid; repeat(6,1fr)`; horní 3 span 2, spodní 2 (nth-child 4,5) span 3. Vše vidět, žádný scroll. Ověřeno 544px+375px.

## 8. atab-tree i18n + lang-switch (e323a7c)
- Záložka „TREE OF LIFE" se nepřekládala (stuck EN) → přidáno do updateUIText. IS = „TRÉ LÍFSINS".
- KUKY hlásil IS-visení v menu na iOS při IS→EN. Sken všech viditelných prvků (s přihlášením i bez): **0 stuck** — aktuální kód čistý. Příčina = stará SW cache na iOS.

---

## Stav na konci dne
SW v93 · vše pushnuté · backend deployed · MEMORY+CLAUDE.md+working-style zrcadlené · patch skripty v scripts/archive/.

### Zbývá (netýká se dneška)
- 🔴 Launch: Resend SMTP, Shopify webhook, Standard checkout
- 🟢 Capacitor / App Store (Island 70% iOS)
- 🟢 Tree of Life vizuál — Cowork (Fable 5, jiný Code instance)
- Drobnost: „SINGLE RUNE" se na ~375px zalomí na 2 řádky (na 544px ne) — KUKY ví, řekne jestli vadí.
