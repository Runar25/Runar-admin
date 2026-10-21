// ═══════════════════════════════════════════════════════
// RÚNAR · CONFIG
// Central configuration — edit here, nowhere else
// ═══════════════════════════════════════════════════════

// ─── SUPABASE ───────────────────────────────────────────
const SB_URL = 'https://pmitxjvkeovijreepror.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXR4anZrZW92aWpyZWVwcm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzE0OTIsImV4cCI6MjA5Mzg0NzQ5Mn0.-qk3vHqZGkj9yplSlK1PUKbypxDeXOtllp49JLICGyw';

// ─── EDGE FUNCTIONS ─────────────────────────────────────
const PROXY     = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/claude-proxy';
const EL_PROXY  = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/elevenlabs-proxy';
const EL_STATIC = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/elevenlabs-static';
const RESET_TREE  = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/reset-tree';
// 2026-10-15: „Send Rúnar a line“ — zpráva z menu do runar@ (supabase/functions/send-line, owner „8. ano“)
const LINE_FN     = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/send-line';
// ASK_MULTI_LIVE ODEBRÁN 2026-09-26 (úklid): byl to vypínač náběhu dvou Asků (2026-09-24/25); od spuštění kdo smí Ask a kolikrát
// říká jen TIERS.*.asks_per_reading (zrcadlo serverového ASKS_PER_READING v claude-proxy, shodu hlídá smoke ⑨).
// 2026-10-09: GPT_REVIEW a GPT_REVIEW_LANG pryč — rozbor čtení modelem GPT (tlačítko „GPT-6 luna“, edge fn gpt-review) ZRUŠEN 2026-10-09 (KUKY „Lunu už nepoužívám… zrušit úplně“).
// Future proxies go here:
// const NOTIFY_PROXY = '...functions/v1/notify';
// const LUNAR_PROXY  = '...functions/v1/lunar-context';

// ─── FEATURE FLAGS ──────────────────────────────────────
// Word corrections (runar_corrections) go into the reading PROMPT as guidance
// (getCorrPrompt) so the model applies them IN CONTEXT — right case/tense/gender — instead
// of a blind substring replace. There is no post-processor: the deterministic one was
// context-blind (no case, no gender) and was removed 2026-08-09. Keep the prompt block
// short — distill recurring patterns into grammar rules (character.js), keep only genuine
// one-offs as word-corrections; the long tail goes to is-grammar-qa + native, not the prompt.
const CORRECTIONS_IN_PROMPT   = true;   // inject corrections into the reading prompt (in-context)

// Reading-prompt version tag — stored on every reading so eval batches group by version
// (separates a real improvement from variance). BUMP whenever the reading prompt changes
// (character.js reading builders / injected context / grammar rules).
// v3.0 MYND (2026-08-21): runa se rekne obycejnymi slovy a obraz je jeji instanci.
// Co do te verze patri: pravidlo pojmenovani ve `focused` · oblast jako ZDROJ OBRAZU (ne cil
// tvrzeni) · zakonceni a jeden uhel pod carou podmetu · losovana delka.
// Detail RUNAR_DECISIONS 2026-08-21, mereni RUNAR_EVAL_LOG 2026-08-21.
// ⚠️ Menis prompt? Bumpni tohle. Hlida to ㉜ — bez bumpu odmitne zapsat registr pravidel,
// protoze bez tagu se nova cteni v DB nerozeznaji od starych (stalo se 21. 8., pet migraci
// slo do produkce pod nezmenenou verzi).
// v4.0 MYND (2026-08-22): kostra dle verdiktu ownera — zaklad + uhel + zakonceni + jmeno
// + zakaz studeneho cteni. Esencni radek misto describe; vazba klic<-obraz v OBOU recich;
// oblast/co hledam/zamer/cocka+priorita docasne VEN ze single (vraci se po jednom, zmerene).
// v4.1 (2026-08-22): navrat oblasti do single (krok 1/3 navratu pak, mereno).
// v4.2 (2026-08-22): navrat registru 'co hledam' do single (krok 2/3, mereno).
// v4.3 (2026-08-22): navrat zameru do single (krok 3/3, mereno).
// v4.4 (2026-08-22): navrat cocky (zivotni runy) do single (krok 4, mereno).
// v4.5 (2026-08-22): Confirmation bez 'blind side' — vitez B z A/B/C (unaware 6/16 -> 0/16).
// v4.6 (2026-08-23): elementy v IS promptu islandsky (Frumefni: loft, ne Air).
// v4.7 (2026-08-23): kriz sjednocen na spolecny tvar pozic (spready krok 1).
// v4.8 (2026-08-23): Ask Runar prijima podekovani/rozlouceni (v obraze, bez predikce).
// v4.9 (2026-08-23): spready — nejmenuj dotazeno (esencni radek ven), vztahova vazba pozic.
// v4.10 (2026-08-23): minulost spreadu mluvi v materialu obrazu (chlad krok 1, A/B mereno).
// v4.11 (2026-08-23): tvar otevrene otazky — otazka obrazu / prosta volba, zadne tvrzeni po pulkach.
// v4.12 (2026-08-23): Yggdrasil V5 — vrstvy necasove (ukazuje/nese/zivi), 9 novych vyznamu, Norny z hlavicek ustoupily.
// ⚠️ v4.13–v4.16: radky chybi — verze se bumpla, duvod se sem nedopsal. Nedoplnuji je zpetne
//    (domyslet si je by byl vymysl, §23); dohledatelne jsou v `git log v2/runar-config.js`.
// v4.17 (2026-09-10): Ask zna zivotni runu. Do te doby ji `buildAskPrompt` nedostaval, takze
//    odpoved na „jak me ovlivnuje moje zivotni runa" si model musel domyslet. Prompt ji ted nese
//    jako tichy fakt — Runar ji nevyslovi sam od sebe, jen kdyz se na ni clovek zepta.
// v5.07 (2026-10-09): čtení pro všechny přes GPT-6 sol — výchozí READ_ENGINE 'sol' dává každému větu za obrazem a esenční
//    rámec pro sol (do té doby jen admin). Čtení před/po přepnutí se podle téhle verze rozliší. DECISIONS 2026-10-09 (13).
// v5.08 (2026-10-10): element runy z promptu pryč — hlavička single („· Elements“) i řádek ELEMENT u životní runy (KUKY „element
//    runy vůbec do čtení jít nemá“; model z něj dělal význam, report 048c14c1).
// v5.09 (2026-10-16): krize → 112 (Island a celá Evropa), ne čísla z jiných zemí — věta v DEF_CHAR_*.never (hlášení 59c64907: model
//    sám nabídl „In the US or Canada… 988“; owner „přeformulovat na něco evropského… nejsme poradna“).
//    Štítek anglicky (§31 — admin ho vidí u čtení); do pushe stál česky „v5.09-krize-112“, žádné čtení s ním uložené není.
// v5.10 (2026-10-16): pravidlo Asku „otázka mimo čtení → vrať k runám“ neplatí pro řeč o sebepoškození — jinak by přebilo větu o 112
//    ze v5.09 (CODE-read, kontrola promptu 2026-10-16; ownerův test 59c64907 byl v Asku).
// v5.11 (2026-10-16): spready bez časového rámce záměru (_intentionContext jen single) — owner „všechny časové tvary pro spready
//    ignorovat, jelikož mají svůj tvar“ (DECISIONS 2026-10-16 (3)); nápověda u „This reading is for“ to říká uživateli.
// v5.12 (2026-10-16): islandský systémový prompt — blok „never“ bez kalků, pravidlo 2. osoby opravené (bylo chybné: „þú talir“),
//    pravidlo 2 rozebratelné, „línunni ÁVARP“, pravopis (CODE-read, kontrola promptu A2).
// v5.13 (2026-10-16): islandské buildery — „Slepptu“, „rún“ místo „rúna/rúnu“, shoda a pád ve spreadech, „til Heljar“, štítky Podkovy
//    a Yggdrasilu, „í textanum“, úhel „SJÓNARHORN“, kveðjuorð v Asku (CODE-read, kontrola promptu A2).
//    + neaktivní hlasový profil „lyrical“ (aktivní je focused, do promptu nejde): „á sömu rún“, „rúnarinnar“ (našel nový vzor
//    v check-is.py), „kyrrlegir skógar“ (skógur je mužský rod — slovník). Jeho věta s výčtem za „eins og“ dál hlásí Greynir P_NT_ÍTölu.
// v5.14 (2026-10-16): islandské obrazy RUNE_IMAGES (12 oprav: Uruz „hrár kraftur“ i v runar-runes.js, Jera, Kenaz, Isa, Sowilo,
//    Laguz, Gebo, Berkana; Kenaz výheň význam „eldur“; Perth EN věta podle IS) — CODE-read, kontrola promptu A4.
// v5.15 (2026-10-16): čtení „pro někoho“ v IS oslovuje neutrálně („hán“), ne rodem majitele účtu (kontrola promptu A3.2).
// v5.16 (2026-10-16): logické drobnosti z kontroly promptu A3 — single s otázkou bez „Let X answer“, u EN solu bez druhého „Mention by
//    name“, životní runa a jméno bez „popiš obraz“, hlavička bez „you“, bez dvojitých mezer, korekce před JSON, „Respond in English“
//    a úvod jen v systému, ✦ jediný zalomený řádek, Yggdrasil „asked about“, IS 7(c), IS Ask délka bez svolení přesáhnout.
// v5.17 (2026-10-16): A3.3 („Let <runa> answer“), A3.5 („Mention by name“) a A3.9 (✦ řádek) zpět na znění před v5.16 — CODE-read je
//    prověřila historií: měřená páka (EVAL 2026-09-08, LAB 2026-10-05), záměr v4.83, owner „teď to funguje, tak neměním“.
// v5.18 (2026-10-20): islandský prompt bez knižního a archaického jazyka — tón pozitivně (pravidlo 7: „talar eðlilega íslensku … sagnorðum
//    fremur en nafnorðum“), bez „Skáldlegt og bókmenntalegt mál er í lagi“, jednodušší závěr Norn, úvod postavy bez „forn / gamall“, věta
//    o dulspeki pryč, 16 knižních / jmenných míst a kalků, moderní jména světů Yggdrasilu (i štítky v SPREAD_CONFIG). Owner, DECISIONS
//    2026-10-20 (1), (2), (4); průchod CODE-read. EN beze změny.
// v5.19 (2026-10-20): islandská klíčová slova devíti run běžnými slovy (velmegun, hið heilaga, leiðsögn, viska forfeðranna, að gera rétt,
//    þroski, Uruz bez „hrár kraftur“, innri vöxtur, óskrifað blað) v k_is i v 5. sloupci RUNE_IMAGES (16 obrazů). DECISIONS 2026-10-20 (5).
// v5.20 (2026-10-20): Ingwaz formula_is „innri vaxtar“ místo „innri þróunar“ — sladěno s klíčem v5.19 (DECISIONS 2026-10-20 (6)).
const RUNAR_PROMPT_VERSION = 'v5.20-ingwaz';

// Měsíční strop hlasu pro všechny (VOICE_MONTHLY_LIMIT = 5, od 2026-09-11) ZRUŠEN 2026-10-11: „limit na hlas max 5 na měsíc“ byl
// ownerův pokyn pro testery, omylem pro všechny (DECISIONS 2026-10-11 (49)); owner: „žádný měsíční strop 5 hlasů není!!!“. Rúnar přečte
// každé čtení, jednou, a hlídá to server (elevenlabs-proxy: hlas jen ke čtení, DECISIONS 2026-10-11 (61)); čtení drží jednotky tarifu.
// Větu o hlasu pro každý tier skládá TIER_FEATURES (klíč `voice`) a hlídá ji verify_tier_features.js.
// Testeři (příznak is_tester — v DB jsou rune_seeker, testeři nejsou tier): 15 hlasů měsíčně každý. Owner 2026-10-11 (přes CODE-read,
// BACKLOG část 43): „máme 5 testerů, tak jim dejme 15 hlasů Rúnara… ale budeme hlídat, ať nepřekročíme bezpečnou hladinu, třeba 120
// hlasů.“ ZRCADLÍ elevenlabs-proxy (vynucuje); shodu hlídá smoke ⑨ (verify_monthly_limits.js).
const VOICE_MONTHLY_LIMIT_TESTER = 15;
// Hladina kvóty ElevenLabs (VOICE_SAFE_SHARE 0,7) tu byla do 2026-10-11 — nahradila ji brzda kreditů (převod se smí vyčerpat, dobití ne,
// DECISIONS (48)). Žije jen na serveru (brzdaHlasu v supabase/functions/_shared/voice_usage.ts), klient ji nepotřebuje — stav ukazuje
// záložka VOICE ve shrine z edge funkce voice-usage.

// Rozbor jmena od modelu: prvni rozbor + JEDNO precteni po zmene severskeho jmena
// (KUKY 2026-09-12: dve kolonky na jmena). Vynucuje claude-proxy (ma ZRCADLO); tady je,
// aby klient vedel, kdy uz nabizet tlacitko nema. Shodu hlida verify_monthly_limits.js.
// Hotove vety (jmeno neni severske / neni v seznamu) model nevolaji a do limitu se NEpocitaji.
const NAME_LORE_LIMIT = 2;

// ─── ELEVENLABS ─────────────────────────────────────────
// ID hlasu, modely a nastavení hlasu vlastní server — supabase/functions/_shared/el_voice.ts (2026-10-11, owner „3. ano“). Do té doby
// tu stály kopie (EL_VOICE_ID_EN/IS, EL_MODEL_EN/IS, elVoiceId(), elModel()); četl je jen shrine a posílal je proxy, která je ignorovala.

// 2026-10-10: EL_VOICE_SETTINGS pryč — nikdo je nečetl. Nastavení hlasu (stability, similarity_boost, style, speaker boost) platí
// to v edge funkcích elevenlabs-proxy a elevenlabs-static; tady stála třetí stejná kopie (§20). Dvě kopie na serveru → BACKLOG část 21.

// ─── RÚNAR MODES ────────────────────────────────────────
// Each mode has its own prompt assembly, token limit, and UI flow.
// Add new modes here — the app reads from this object.
const RUNAR_MODES = {
  quick_reading: {
    label:      'Quick Reading',
    max_tokens: 700,
    voice:      true,
    layers:     2,        // how many output layers (short + deep)
    active:     true,
  },

  ceremonial: {
    label:      'Ceremonial — Cacao Ritual',
    max_tokens: 1200,
    voice:      true,
    layers:     null,     // step-based, not layer-based
    steps:      [],       // populated when ceremonial mode is built (Layer 4)
    active:     false,    // not live yet
  },
  // Jediný režim životní runy pro všechny tarify — „standard“ v názvu NENÍ tarif. life_rune_premium (strop 2000) zrušen
  // 2026-10-11: měl týž prompt a strop se nedotkl; premium je „jen víc čtení“ (CLAUDE.md Tier systém).
  life_rune_standard: {
    label:      'Life Rune Reading',
    max_tokens: 1200,
    voice:      false,
    layers:     null,
    active:     true,
  },
  // Rozbor jmena — samostatna volba vedle zivotni runy (KUKY 2026-09-11). Kratky text,
  // bez hlasu. Smi skoncit tim, ze jmeno seversky puvod NEMA — to je plnohodnotny vysledek,
  // ne selhani, proto staci malo tokenu.
  name_lore: {
    label:      'Name Lore',
    max_tokens: 700,
    voice:      false,
    layers:     null,
    active:     true,
  },
  // Ask — doplňující otázka ke čtení. Strop odpovědi čte runar-reading.js (do 2026-10-12 tam stál natvrdo, §10) a gen_batch.js.
  // Historie stropu: 120 usekával IS uprostřed věty (IS je na tokeny ~1,5–2× hustší) → 140 (KUKY: náklad, dlouhý Ask nedává smysl)
  // → 2026-09-06 320: prompt povoluje ~90 slov (změřeno jako optimum, TEST DILY) a 140 by IS odpověď usekl. Délku drží PROMPT;
  // _trimToSentence zařídí, že se useknutý zbytek nikdy neukáže.
  ask: {
    label:      'Ask',
    max_tokens: 320,
    active:     true,
  },
  daily_reflection: {
    label:      'Daily Reflection',
    max_tokens: 400,
    voice:      true,
    layers:     1,
    active:     false,    // not live yet — needs push notification system
  },
  conversational: {
    label:      'Conversation',
    max_tokens: 500,
    voice:      false,    // TBD
    layers:     null,
    active:     false,    // not live yet — needs multi-turn history
  },
};

// ─── SUBSCRIPTION TIERS ─────────────────────────────────
// Source of truth for what each tier can do.
// Backend (Edge Function) enforces this — never trust frontend alone.
// Values will evolve — update here only.
const TIERS = {
  free_trial: {
    label:            'Visitor',
    label_is:         'Gestur',
   // 2026-09-30: IS pády jména pro věty „…með {tier}“ (3. p.) a „yfir í {tier}“ (4. p.) — tierLabel() v runar-utils.js
    label_is_acc:     'Gest',
    label_is_dat:     'Gesti',
    readings:         1,          // historické: od 2026-08-02 návštěvník čtení nedostane (proxy 401), od 2026-10-10 ho appka ani neslibuje
    // ↓ VOICE FLAGS — flip here to enable/disable without touching logic
    // voice_monthly: návštěvník živý hlas NEMÁ — čtení od 2026-08-02 nedostane a elevenlabs-proxy nepřihlášeného odmítne (401).
    // 2026-10-10 false; do té doby true s komentářem, že návštěvník slyší hlas u svého čtení (neplatilo, CODE-read, DECISIONS (42)).
    // canUseVoice() sem padá i pro neznámý tier, takže „bez hlasu“ je i bezpečnější výchozí. Audio v Kolekci = voice_static.
    voice_monthly:    false,
    voice_credits:    false,      // n/a pro Visitor (nemůže mít kredity)
    voice_static:     true,       // pre-generované audio v Collection
    journal:          false,
    ceremonial:       false,
    asks_per_reading: 0,   // Ask otázek na jedno čtení, všechny zdarma (KUKY 2026-09-24); 0 = Ask jen jako teaser; JEDINÁ pravda o Asku tieru (2026-09-26)
    reading_thought:  false,   // myšlenka ✦ na konec čtení (KUKY 2026-09-30: „Standard a Premium“); čte _thoughtFor v runar-reading.js
    languages:        ['en', 'is'],
  },
  rune_seeker: {
    label:            'Rune Seeker',
    label_is:         'Leitandi',
    label_is_acc:     'Leitanda',
    label_is_dat:     'Leitanda',
    monthly_readings: null,        // legacy — RS uses free_balance (1 onboarding), no monthly reset
    // ↓ VOICE FLAGS — flip here to enable/disable without touching logic
    // voice_monthly: true = hlas pro free čtení (model B: 1 při registraci, bez měsíčního resetu)
    // Až budeme limitovat: flip na false → hlas jen při kreditech
    voice_monthly:    true,       // ← aktuálně otevřeno; připraveno pro gating
    voice_credits:    true,       // hlas při kreditním čtení — vždy
    voice_static:     true,       // pre-generované audio v Collection
    journal:          5,          // last N readings
    ceremonial:       false,
    asks_per_reading: 0,   // Ask otázek na jedno čtení, všechny zdarma (KUKY 2026-09-24); 0 = Ask jen jako teaser; JEDINÁ pravda o Asku tieru (2026-09-26)
    reading_thought:  false,   // myšlenka ✦ na konec čtení (KUKY 2026-09-30: „Standard a Premium“); čte _thoughtFor v runar-reading.js
    languages:        ['en', 'is'],
  },
  standard: {
    label:            'Rune Walker',
    label_is:         'Vegfarandi',
    label_is_acc:     'Vegfaranda',
    label_is_dat:     'Vegfaranda',
    monthly_readings: 50,          // Rune Walker: 50/month
    // Cena v ISK s DPH (2026-10-19: z RUNAR_PRICING.md „Subscription Pricing“ sem — jediné místo, čte okno Upgrade, web a kalkulačka
    // návratnosti; DECISIONS 2026-10-19 (7)). Roční = „pay 10 months, get 12“. Ceny rozhodl owner 2026-10-10 (DECISIONS 2026-10-10 (22)).
    price_isk_month:  3490,
    price_isk_year:   34800,
    voice_monthly:    true,
    voice_credits:    true,
    voice_static:     true,
    journal:          null,
    ceremonial:       false,
    asks_per_reading: 1,   // Ask otázek na jedno čtení, všechny zdarma (KUKY 2026-09-24); 0 = Ask jen jako teaser; JEDINÁ pravda o Asku tieru (2026-09-26)
    reading_thought:  true,   // myšlenka ✦ na konec čtení (KUKY 2026-09-30: „Standard a Premium“); čte _thoughtFor v runar-reading.js
    languages:        ['en', 'is'],
  },
  premium: {
    label:            'Rune Wanderer',
    label_is:         'Ferðalangur',
    label_is_acc:     'Ferðalang',
    label_is_dat:     'Ferðalangi',
    monthly_readings: 75,          // Rune Wanderer: 75/month
    // Cena v ISK s DPH (2026-10-19: z RUNAR_PRICING.md „Subscription Pricing“ sem — jediné místo, čte okno Upgrade, web a kalkulačka
    // návratnosti; DECISIONS 2026-10-19 (7)). Roční = „pay 10 months, get 12“. Ceny rozhodl owner 2026-10-10 (DECISIONS 2026-10-10 (22)).
    price_isk_month:  4900,
    price_isk_year:   49000,
    voice_monthly:    true,
    voice_credits:    true,
    voice_static:     true,
    journal:          null,
    ceremonial:       true,
    asks_per_reading: 2,   // Ask otázek na jedno čtení, všechny zdarma (KUKY 2026-09-24); 0 = Ask jen jako teaser; JEDINÁ pravda o Asku tieru (2026-09-26)
    reading_thought:  true,   // myšlenka ✦ na konec čtení (KUKY 2026-09-30: „Standard a Premium“); čte _thoughtFor v runar-reading.js
    languages:        ['en', 'is'],
    physical_unlock:  true,       // QR/NFC product linking
    seasonal_content: true,       // solstices, equinoxes, lunar events
  },
};

// Zpětná kompatibilita — staré DB hodnoty 'free' a 'credits' → rune_seeker
TIERS.free    = TIERS.rune_seeker;
TIERS.credits = TIERS.rune_seeker;

// ─── ADMIN ACCESS ───────────────────────────────────────
// Only these emails can access the Knowledge Shrine and Yggdrasil.
const ADMIN_EMAILS = ['kukula@agndofa.is', 'info@agndofa.is'];

// ─── E-MAILOVE PRIHLASENI ──────────────────────────────
// false = v prihlaseni jen Google. Vestaveny mailer Supabase dorucuje JEN clenum tymu projektu
// (overeno v dokumentaci 2026-09-12), takze cizi clovek by magic link nikdy nedostal.
// Zapnout az PO nastaveni vlastniho SMTP (rozhodnuto: Brevo, EU) v Supabase → Auth → SMTP.
// 2026-10-10 ZAPNUTO (KUKY „hotovo“): SMTP Brevo (smtp-relay.brevo.com, odesílatel noreply@therunekeeper.com — doména ověřená
// v Brevu, DKIM brevo1/brevo2), šablony „Magic Link“ i „Confirm signup“ s {{ .Token }} = supabase/templates/prihlaseni-kod.html.
// Kdo smí založit účet, hlídá hook hook_before_user_created (allowed_emails, uzavřený test, DECISIONS 2026-10-09 (6)).
const AUTH_EMAIL_ENABLED = true;
// ─── APP SETTINGS ───────────────────────────────────────
const APP = {
  default_lang:    'is',   // 2026-10-10 KUKY „nastavit mutaci apky primárně na IS, jako první“ — do té doby 'en'
  supported_langs: ['en', 'is'],
  stream_delay_ms: 25,        // word-by-word stream speed
  version:         '0.1.0',  // increment on significant changes
};

// ─── PATTERN WINDOW ─────────────────────────────────────
// Determines intensity of pattern reactions on the tree.
// Does NOT gate whether a pattern triggers — only how strongly.
// Adjust after first 50 users based on real data.
// Used by: plánovaný detectPatterns() (BACKLOG) — zatím ho nic nečte; runar-gathering.js odstraněn 2026-09-28.
const PATTERN_WINDOW = {
  high: 7,    // days — strong visual + heavier reading tone
  mid:  14,   // days — medium visual
  low:  30,   // days — subtle visual, Gathering still available
  // beyond low: pattern still recorded, minimal visual response
};

// ─── HEAVY RUNES ────────────────────────────────────────
// Icelandic natural forces that halt, absorb, or transform.
// Unavoidable — not inherently negative.
// [list may expand after first 50 users]
const HEAVY_RUNES = {
  names: ['Hagalaz', 'Nauthiz', 'Isa', 'Thurisaz', 'Perth',   'Tiwaz'],
  descriptions: {
    Hagalaz:  'storm from the north that closes paths',
    Nauthiz:  'polar night, light that does not come',
    Isa:      'path that vanished under snow',
    Thurisaz: 'volcano under the glacier, force without warning',
    Perth:    'geyser — you do not know when it erupts',
    Tiwaz:    'deliberate wintering, intentional surrender',
  },
  // Visual + reading response by count (per pattern_window intensity)
  thresholds: {
    2: 'tension',      // roots deepen slightly — urd axis
    3: 'nidhoggr',     // Nidhoggr trigger + heavier, slower reading tone
    4: 'winter_dark',  // strongest root pattern — slowest bloom, deepest urd
  },
};

// ─── TRANSFORMATION PAIRS ───────────────────────────────
// Two runes: one = state, one = the force that changes it.
// Together they form a story of change.
// PRECEDENCE: pair takes priority over heavy combination
//   when both runes match a defined pair (pair is more specific).
// [to test after first 50 users — pairs may be refined]
const TRANSFORMATION_PAIRS = {
  // TYP 1 — CYCLE: natural circle, no beginning or end
  cycle: [
    { runes: ['Jera',    'Hagalaz'], desc_en: 'harvest and storm, the year turns'           },
    { runes: ['Dagaz',   'Nauthiz'], desc_en: 'dawn after need — light arrives because it must' },
    { runes: ['Berkana', 'Isa'],     desc_en: 'growth frozen, but roots hold'                },
  ],
  // TYP 2 — BREAKTHROUGH: something breaks so something new can emerge
  breakthrough: [
    { runes: ['Thurisaz', 'Dagaz'],  desc_en: 'force opens the gate of light'               },
    { runes: ['Hagalaz',  'Sowilo'], desc_en: 'after the storm, sun'                         },
    { runes: ['Nauthiz',  'Fehu'],   desc_en: 'from need, wealth is born'                    },
  ],
  // TYP 3 — SHADOW AND LIGHT: two forces in balance
  shadow_light: [
    { runes: ['Sowilo',  'Isa'],     desc_en: 'light paused — energy waits'                  },
    { runes: ['Mannaz',  'Hagalaz'], desc_en: 'human facing chaos'                           },
    { runes: ['Tiwaz',   'Nauthiz'], desc_en: 'sacrifice as necessity'                       },
  ],
};

// ─── TIER LIMITS — single source of truth ───────────────
// Edit here only. All frontend constants read from this.
// Backend (claude-proxy) uses parallel values — sync manually when changing.
// Last updated: 2026-05-29
const TIER_LIMITS = {
  // Rule §8: ALL user-facing tier values live here — never hardcode in UI text.
  // When any value changes, update here only. Výpis featur tierů se skládá sám — TIER_FEATURES + tierFeatures() níž.
  free_trial: {
    onboarding:   1,     // historické (zkušební čtení návštěvníka) — od 2026-10-10 nic nehradí, viz _showVisitorJoin
    // weekly_drip odebráno 2026-10-10 ze všech tierů: mrtvé od modelu B (2026-06-12), nic ho nečetlo (nález CODE-read)
    // 2026-10-10 (KUKY schválil: „kolekce run a životní runa jsou zdarma, čtení po registraci“; kontrola architektury část 1 bod 3):
    // do té doby panel sliboval „Your first reading is a gift. No account, no payment.“ — návštěvník čtení od 2026-08-02 nedostane
    // (proxy 401). Bez rodu (dřív „tilbúinn“). Korpus: „eru ókeypis“ 1056×, „lestrar eru“ 8×, „skráning kostar“ 26×.
    panel_props: {
      en: ['The Runes Collection and your life rune are free.', 'Readings are for Rune Seekers.', 'Joining costs nothing.'],
      is: ['Safn rúna og lífsrúnin þín eru ókeypis.', 'Lestrar eru fyrir Leitendur.', 'Skráning kostar ekkert.'],
    },
  },
  rune_seeker: {
    onboarding:   1,     // 1 free reading at registration
    // Volné čtení má zúžené volby: prvních N oblastí a hledání (_volneCteniDalsi, runar-app.js). Do 2026-10-13 natvrdo 3 a 1 v buildPills (§10).
    free_reading_areas: 3,
    free_reading_seeks: 1,
    journal_entries: 5,
    onboarding_label_en: 'one free reading',
    onboarding_label_is: 'ein ókeypis spá',   // 2026-10-10: „frjáls“ = svobodný (kalk z EN „free“), zdarma = ókeypis („ókeypis aðgangur“ 596×)
    // panel_props + journal_label_* ODEBRÁNY 2026-09-26 — výpis featur skládá tierFeatures() z TIER_FEATURES (níž).
  },
  standard: {
    onboarding:    null,
    journal_entries: null,
  },
  premium: {
    onboarding:    null,
    journal_entries: null,
  },
};

// ─── BALÍČKY KREDITŮ (Rúnakort) ──────────────────────────────────────────────────
// KUKY 2026-10-10 (DECISIONS 2026-10-10 (22)): „starter 5, seeker 10, walker 20, wanderer 30, Elder 50… jinak platí ceny 3.6.“ Jediné
// místo balíčků v kódu — nápověda (runar-help.html) z něj skládá tabulku; do té doby tam stála vlastní kopie z 2026-05-20 (Elder 50 =
// 11.900 kr, ceny v €). Ceny v ISK; € owner neurčil (§23).
// Jména = jména účtů, kde je mají — KUKY 2026-10-10: „walker máme i jména účtu, proto jsem to udělal tak, že to jsou i jména credity
// plus elder… IS walker máš! je to stejné jako IS účet Walker.“ Balíček s `tier` bere jméno z TIERS (EN bez „Rune“, IS celé), takže se
// s účtem nerozejde. Starter a Elder účet nemají — islandsky Byrjandi a Öldungur (KUKY 2026-10-10: „nezůstanou v EN, ale budou IS!“;
// osoby jako jména účtů, řada = cesta: Byrjandi → Leitandi → Vegfarandi → Ferðalangur → Öldungur). U balíčku vždy s počtem kreditů.
// Stránka nákupu účtů a Rúnakortu na webu (2026-10-19, DECISIONS 2026-10-19 (7): nákup jen na therunekeeper.com, appka má okno „Your journey
// with Rúnar“). null = platby ještě neběží → u placených účtů v okně „Coming soon.“. Až CODE-web stránku spustí, sem její adresu.
const JOURNEY_URL = null;

const CARD_PACKS = [
  { name: 'Starter', name_is: 'Byrjandi', credits: 5,  isk: 1490 },
  { tier: 'rune_seeker', credits: 10, isk: 2490 },
  { tier: 'standard',    credits: 20, isk: 4490 },
  { tier: 'premium',     credits: 30, isk: 6490 },
  { name: 'Elder', name_is: 'Öldungur',   credits: 50, isk: 9990 },
];
function cardPackName(p, lng) {
  var T = p.tier && typeof TIERS !== 'undefined' ? TIERS[p.tier] : null;
  if (!T) return (lng === 'is' && p.name_is) || p.name;
  return lng === 'is' ? T.label_is : T.label.replace(/^Rune\s+/, '');
}

// ─── TIER FEATURES — co tier umí, SLOŽENÉ z nastavení (2026-09-26) ──────────────
// KUKY: „chtělo by to dělat tak, abychom to pořád nemuseli dělat manuálně. věci přibývají a odpadají.“ Do té doby byl výpis psaný
// ručně ve dvou kopiích (TIER_LIMITS.*.panel_props a runar-help.html) a obě zastaraly: Yggdrasil jako výhoda Premium (má ho každý
// přihlášený), Ceremonial mode (nepostaveno), The Gathering (nahrazuje se), Ask chyběl úplně, čísla opsaná natvrdo.
// Jak to funguje: každá featura = JEDEN řádek níž; `hodnota(tier, id)` čte nastavení tieru a vrací null (featura se neukáže) nebo
// hodnotu, ze které `en`/`is` složí větu. Číslo v nastavení se změní → věta se změní sama. Nová featura = nový řádek; zrušená =
// smazat řádek nebo vypnout její flag v TIERS. Nepostavené věci (ceremonial, seasonal_content, physical_unlock) tu ŘÁDEK NEMAJÍ —
// přibude, až budou postavené a budou mít ověřenou islandštinu.
// Premium: řádky, které má stejné jako Standard, se složí do „Everything a Rune Walker has.“ (TIER_FEATURES_BASE).
// IS šablony počítají s ženským „spá“ (VOCAB.cast, i `is_acc_def` + „þína“) — kdyby se slovo změnilo, přečíst znovu pády.
// Ověřeno kontrolami IS 2026-09-26 a věty o hlasu 2026-10-10 (nástroje: CLAUDE.md §2).
const _N_WORD = { en: ['', 'One', 'Two', 'Three', 'Four'], is_f: ['', 'Ein', 'Tvær', 'Þrjár', 'Fjórar'] };
const TIER_FEATURES = [
  { key: 'month', hodnota: function (t) { return t.monthly_readings > 0 ? t.monthly_readings : null; },
    en: function (n) { return n + ' ' + (n === 1 ? VOCAB.cast.en : VOCAB.cast.en_pl) + ' a month.'; },
    is: function (n) { return n + ' ' + (n === 1 ? VOCAB.cast.is : VOCAB.cast.is_pl) + ' á mánuði.'; } },
  // 2026-10-10: IS „frjáls/frjálsar“ → „ókeypis“ (frjáls = svobodný; kalk z EN „free“).
  { key: 'join', hodnota: function (t, id) { return (id !== 'free_trial' && !(t.monthly_readings > 0) && (TIER_LIMITS[id] || {}).onboarding > 0) ? TIER_LIMITS[id].onboarding : null; },
    en: function (n) { return n === 1 ? 'One free ' + VOCAB.cast.en + ' when you join.' : n + ' free ' + VOCAB.cast.en_pl + ' when you join.'; },
    is: function (n) { return n === 1 ? 'Ein ókeypis ' + VOCAB.cast.is + ' þegar þú skráir þig.' : n + ' ókeypis ' + VOCAB.cast.is_pl + ' þegar þú skráir þig.'; } },
  // 2026-10-10: už bez podmínky na voice_credits — karta otevírá čtení bez ohledu na hlas; vypnutý hlas z kreditu by jinak schoval i to.
  { key: 'card', hodnota: function (t, id) { return (id !== 'free_trial' && !(t.monthly_readings > 0)) ? true : null; },
    en: function () { return 'A ' + VOCAB.card.en + ' opens further ' + VOCAB.cast.en_pl + '.'; },
    is: function () { return VOCAB.card.is + ' opnar fleiri ' + VOCAB.cast.is_pl + '.'; } },
  // Hlas (DECISIONS 2026-10-10 (42), 2026-10-11 (61)): Rúnar přečte KAŽDÉ čtení, jednou — předplatitel všechna, Rune Seeker volné čtení
  // (voice_monthly) a čtení z karty (voice_credits); bez čtení nic (owner 2026-10-10: „1 hlas a jen jednou! jedno čtení a jeden hlas!“).
  // Do 2026-10-11 tu stálo „nejvýš VOICE_MONTHLY_LIMIT za měsíc“ — pětka byla ownerův pokyn pro testery (DECISIONS 2026-10-11 (49)).
  // Volné čtení se jmenuje jen tam, kde ho tier opravdu má (TIER_LIMITS.onboarding). IS: čte Rúnar, ne jeho hlas — „les upphátt“ 79×
  // v korpusu; věty 2026-10-11 ověřeny nástroji (CLAUDE.md §2), „hverja spá“ 5×.
  { key: 'voice', hodnota: function (t, id) {
      if (id === 'free_trial') return null;
      if (t.monthly_readings > 0) return t.voice_monthly ? 'month' : null;
      var volne = !!t.voice_monthly && (TIER_LIMITS[id] || {}).onboarding > 0, karta = !!t.voice_credits;
      return volne && karta ? 'volne_karta' : karta ? 'karta' : volne ? 'volne' : null; },
    en: function (v) {
      var volne = 'Rúnar\u2019s voice reads your free ' + VOCAB.cast.en + ' aloud';
      if (v === 'month') return 'Rúnar\u2019s voice reads every ' + VOCAB.cast.en + ' aloud.';
      if (v === 'karta') return 'With a ' + VOCAB.card.en + ', Rúnar\u2019s voice reads every ' + VOCAB.cast.en + ' aloud.';
      return v === 'volne_karta' ? volne + ', and every ' + VOCAB.cast.en + ' you open with a ' + VOCAB.card.en + '.' : volne + '.'; },
    is: function (v) {
      var volne = 'Rúnar les ókeypis ' + VOCAB.cast.is_acc_def + ' þína upphátt';
      if (v === 'month') return 'Rúnar les hverja ' + VOCAB.cast.is + ' upphátt.';
      if (v === 'karta') return 'Með ' + VOCAB.card.is_dat + ' les Rúnar hverja ' + VOCAB.cast.is + ' upphátt.';
      return v === 'volne_karta' ? 'Rúnar les upphátt ókeypis ' + VOCAB.cast.is_acc_def + ' þína og hverja ' + VOCAB.cast.is + ' sem þú opnar með ' + VOCAB.card.is_dat + '.' : volne + '.'; } },
  { key: 'journal', hodnota: function (t) { return t.journal === null ? 'all' : (t.journal > 0 ? t.journal : null); },
    en: function (v) { return v === 'all' ? 'Your full journal \u2014 every reading, back to the first.' : 'Journal of your last ' + v + ' readings.'; },
    is: function (v) { return v === 'all' ? 'Dagbók með öllum ' + VOCAB.cast.is_dat_pl + ' þínum, allt frá þeirri fyrstu.' : 'Dagbók með síðustu ' + v + ' ' + VOCAB.cast.is_dat_pl + ' þínum.'; } },
  { key: 'ask', hodnota: function (t) { return t.asks_per_reading > 0 ? t.asks_per_reading : null; },
    en: function (n) { return (_N_WORD.en[n] || n) + (n === 1 ? ' question' : ' questions') + ' of your own to Rúnar on every reading.'; },
    // 2026-10-21 (owner: „eigin nemusí být použito … překlad z EN — pokud ano, je to velká, velká chyba!!“): do té doby „Ein eigin
    // spurning til Rúnars við hverja spá“ = EN „One question of your own to Rúnar on every reading“ slovo po slově (88949d1, 2026-09-26;
    // korpus „eigin spurning“ 3×, ověřené jen kontrolami bez idiomů). Islandsky od obrazu: člověk se Rúnara sám zeptá na spá —
    // „Þú getur spurt Rúnar einu sinni út í hverja spá“; Greynir OK, korpus „getur spurt“ 1210×, „sinni út í“ 638×, „tvisvar út í“ 81×.
    is: function (n) { return 'Þú getur spurt Rúnar ' + (['', 'einu sinni', 'tvisvar', 'þrisvar'][n] || n + ' sinnum') + ' út í hverja ' + VOCAB.cast.is + '.'; } },
];
// Kdo stojí „nad“ kým: řádky shodné se základem se složí do jedné věty.
const TIER_FEATURES_BASE = { premium: 'standard' };
// Ta jedna věta po jazycích (2026-10-10 sem z tierFeatures, kde stála `L === 'is' ? … : …` natvrdo). Data, ne UI_TEXT — výpis skládá
// i runar-help.html, který překlady nenačítá. IS: jméno tieru v 1. pádě, je podmětem („Leitandi hefur“).
const TIER_FEATURES_ALL = {
  en: function (jm) { return 'Everything a ' + jm + ' has.'; },
  is: function (jm) { return 'Allt sem ' + jm + ' hefur.'; },
};
function tierFeatures(id, lang) {
  var L = lang === 'is' ? 'is' : 'en';
  var radky = function (tid) {
    var t = TIERS[tid] || {}, out = [];
    TIER_FEATURES.forEach(function (f) { var v = f.hodnota(t, tid); if (v !== null && v !== undefined) out.push({ key: f.key, text: f[L](v) }); });
    return out;
  };
  var moje = radky(id), zakl = TIER_FEATURES_BASE[id];
  if (!zakl) return moje.map(function (r) { return r.text; });
  var jehoR = radky(zakl), jeho = jehoR.map(function (r) { return r.text; });
  var mojeK = moje.map(function (r) { return r.key; });
  var navic = moje.filter(function (r) { return jeho.indexOf(r.text) === -1; });
  // „Everything …“ jen když tier má KAŽDOU featuru základu — jinak by věta tvrdila něco, co tier nemá
  var maVse = jehoR.every(function (r) { return mojeK.indexOf(r.key) !== -1; });
  if (!maVse || navic.length === moje.length) return moje.map(function (r) { return r.text; });
  var jm = L === 'is' ? TIERS[zakl].label_is : TIERS[zakl].label;
  var vse = TIER_FEATURES_ALL[L](jm);
  // „Everything …“ hned za první řádek, když je to počet čtení (nejdůležitější věc tieru); jinak na začátek
  return navic.length && navic[0].key === 'month'
    ? [navic[0].text, vse].concat(navic.slice(1).map(function (r) { return r.text; }))
    : [vse].concat(navic.map(function (r) { return r.text; }));
}

// ─── SPREAD COSTS ────────────────────────────────────────
// cost = number of runes in spread.
// free: cost from free_balance (null = not available with free balance — credits only).
// credits: cost in rune readings (from Rune Reading Card).
const SPREAD_COSTS = {
  single:    { free: 1,    credits: 1  },
  cross:     { free: null, credits: 3  },
  gathering: { free: null, credits: 3  },  // flat: 3 credits per Gathering reading
  horseshoe: { free: null, credits: 4  },
  norns:     { free: null, credits: 2  },
  yggdrasil: { free: null, credits: 5  },
  name_lore: { free: null, credits: 0  },  // ZDARMA — jako zivotni runa: textove, bez hlasu,
                                           // a jednou za ucet. Vynucuje PROXY podle `mode`.
  life_rune: { free: null, credits: 0  },  // ZDARMA (KUKY 2026-07-19) — textove cteni,
                                           // bez hlasu, ~$0.006. Vynucuje PROXY (mode),
                                           // ne tohle cislo; klient si zdarma rict nesmi.
};

// ─── MODEL_PRICES — ceník modelů čtení (USD / 1 M tokenů) ─────────────
// 2026-09-29 (KUKY „přesně vědět, kolik nás stojí… měřit automaticky, ať vidíme každé čtení“): přestěhováno ze
// scripts/utils/stats.js, aby cenu počítal JEDEN výpočet (readingCostUsd v runar-utils.js) pro deník, report i stats.js (§20).
// Ověřeno: Anthropic 2026-09-24 (platform.claude.com/docs/en/about-claude/pricing) · OpenAI 2026-09-24 (developers.openai.com/
// api/docs/pricing) · zápis do cache OpenAI 2026-09-25 (…/guides/prompt-caching: „cache writes cost 1.25× the uncached input rate“).
// Nový model → řádek sem. Model, který tu není, cenu nemá (null) a hlásí se — nepočítá se potichu.
const MODEL_PRICES = {
  anthropic: {   // [vstup, zápis cache 5 min, zápis cache 1 h, čtení cache, výstup]
    'claude-opus-5':   [5, 6.25, 10, 0.5, 25],
    'claude-opus-4-8': [5, 6.25, 10, 0.5, 25],
    'claude-opus-4-7': [5, 6.25, 10, 0.5, 25],
  },
  openai: {      // [vstup, vstup z cache, výstup]; zápis do cache = vstup × openaiCacheWrite
    'gpt-6-sol':  [2, 0.2, 10],
    'gpt-6.1-sol': [2, 0.1, 10],   // 2026-10-02 ověřeno developers.openai.com/api/docs/pricing (Standard, short context; cache write 2,50 = 1,25×)
    'gpt-6-luna': [0.1, 0.01, 0.5],
  },
  openaiCacheWrite: 1.25,
  usGeo: 1.1,    // Anthropic inference_geo 'us' = +10 %
};

// ─── VOCABULARY — single source of truth ─────────────
// Change here only — vn(key, n, lang) and vl(key, lang) in runar-utils.js
// use these to pluralize + translate everywhere in the UI.
const VOCAB = {
  unit: { en: 'rune reading', en_pl: 'rune readings', is: 'spá', is_pl: 'spár' },
  cast: { en: 'rune reading', en_pl: 'rune readings', is: 'sp\u00e1',      is_pl: 'sp\u00e1r', is_dat_pl: 'sp\u00e1m', is_acc_def: 'spána' },   // is_dat_pl: TIER_FEATURES (2026-09-26); is_acc_def: hlas Rune Seekera tamtéž (2026-10-10)
  card: { en: 'Rune Reading Card', en_pl: 'Rune Reading Cards', is: 'R\u00fanakort', is_pl: 'R\u00fanakort', is_dat: 'Rúnakorti', is_dat_def: 'Rúnakortinu' },   // is_dat: „með …“ v TIER_FEATURES a po vyčerpání volného čtení (2026-10-10, -11) · is_dat_def: „kóðann á …“ (redeem, 2026-10-11)
  reading: { en: 'reading', en_pl: 'readings', is: 'lestur', is_pl: 'lestrar' },   // počet v deníku (2026-10-10); korpus „einn lestur“ 15×, „tveir lestrar“ 3×
};
// ─── SPREAD CONFIG — single source of truth ──────────────
// rune_count: how many runes to draw
// positions.en / positions.is: position labels (null = single rune, no positions)
// credits: ZDE NENI — vlastnikem ceny je SPREAD_COSTS (§18). Kopie tu do 2026-07-19
// byla, nikdo ji necetl, a precenit v ni znamenalo nezmenit nic. Hlida smoke.
// tokens: max_tokens for Claude
const SPREAD_CONFIG = {
  single: {
    rune_count: 1,
    positions:  null,
    tokens:     700,
  },
  cross: {
    rune_count: 5,
    positions: {
      en: ['Centre / Core', 'Above / Aspiration', 'Below / Root', 'Behind / Past', 'Ahead / Direction'],
      is: ['Miðja / Kjarni', 'Ofan / Þrá', 'Undir / Rót', 'Að baki / Fortíð', 'Framar / Stefna'],
    },
    tokens:  1100,
  },
  norns: {
    rune_count: 3,
    positions: {
      en: ['Urður / Past', 'Verðandi / Present', 'Skuld / Future'],
      is: ['Urður / Fortíð', 'Verðandi / Nútíð', 'Skuld / Framtíð'],
    },
    tokens:  900,
  },
  horseshoe: {
    rune_count: 7,
    positions: {
      en: ['Past',       'Present',    'Hidden / Near future',
           'Challenges', 'Outside forces', 'Inner state', 'Outcome'],
      is: ['Fortíð',     'Nútíð',      'Dulið / Nánasta framtíð',
           'Hindranir',  'Ytri kraftar', 'Innri staða', 'Niðurstaða'],
    },
    tokens:  1300,
  },
  yggdrasil: {
    rune_count: 9,
    // POZOR: zadne `seasonal` pole. Yggdrasil je KDYKOLIV pro kazdeho prihlaseneho
    // (KUKY 2026-07-18, po pate oprave tehoz). Zimni slunovrat = vetsi sila ve strome,
    // NE podminka pristupu. Kdo sem vrati datumovou branu, dela to posesté.
    positions: {
      en: [
        'Asgard — Highest self',        // 1 skuld
        'Vanaheim — Harmony',           // 2 skuld
        'Alfheim — Creativity',         // 3 skuld
        'Midgard — Daily reality',      // 4 verdandi
        'Jotunheim — Challenge',        // 5 verdandi
        'Svartalfheim — Hidden craft',  // 6 urd
        'Nidavellir — Deep source',     // 7 urd
        'Niflheim — Origin',            // 8 urd
        'Hel — Completion',             // 9 urd
      ],
      is: [
        // 2026-10-20 (owner, DECISIONS 2026-10-20 (4)): moderní tvary jako v promptu (Ásgarðr 0× × Ásgarður 1 826×); Níðavellir 0× → Niðavellir
        'Ásgarður — Æðsta sjálfið',
        'Vanaheimur — Samhljómur',
        'Álfheimur — Sköpunarkraftur',
        'Miðgarður — Daglegur veruleiki',
        'Jötunheimar — Hindrun',
        'Svartálfaheimur — Dulin list',
        'Niðavellir — Djúp uppspretta',
        'Niflheimur — Uppruninn',
        'Hel — Lokið',
      ],
    },
    // Norns axis per position: skuld=1-3, verdandi=4-5, urd=6-9
    norns_axis: ['skuld','skuld','skuld','verdandi','verdandi','urd','urd','urd','urd'],
    tokens:  1800,
  },
};



// ─── VOICE PROFILES ─────────────────────────────────────────────────────────
// Každý profil nahrazuje voice + variability + imagery v systémovém promptu.
// Přepnutí produkce: změnit ACTIVE_VOICE_PROFILE.
// Shrine přepínač nemá — čte ACTIVE_VOICE_PROFILE jako reader; dávky skriptů přepínají přes `activeVoice` (runar-character.js).
// Do 2026-10-12 tu stálo, že shrine přepíná přes dropdown (localStorage: shrine_voice_profile) — ten nikdy nebyl.
const ACTIVE_VOICE_PROFILE = 'focused';

const VOICE_PROFILES = {

  // ── FOCUSED — jednoznačná poetika, jeden přesný obraz (produkce)
  // 2026-09-18 (handoff CODE-read, owner schvalil): VZORY HLASU ODEBRANY CELE („How a line
  // should land" + 4 vzorove vety + veta o sezone). Duvod: vzory byly tvary KONCE — druhy
  // mechanismus konce vedle losu konce (vzor 1 tvrdil nitro „What in you is finally ready",
  // vzor 2 sliboval vysledek „Come spring it straightens"); veta o sezone zadala neco, co
  // model nema cim splnit (datum v promptu neni). Test vymeny vzoru (EVAL_LOG 2026-09-15 T2)
  // nenasel rozdil -> odebrani je male riziko. Detail: DECISIONS 2026-09-18.
  focused: {
    label: 'Focused',
    en: `He speaks directly and warmly. Sentences run one clause, sometimes two joined by a comma — never a long unfolding line, never a clipped fragment.

Avoid abstract, mystical-sounding lines that say nothing plain — if it cannot be felt, it does not belong here.`,
    is: `Hann talar beint og hlýlega. Setningarnar eru einfaldar og hann tengir sjaldan fleiri en tvær með kommu. Hann skrifar hvorki langar flækjur né snubbótt brot.

Forðastu óhlutbundnar, dulúðlega hljómandi setningar sem segja ekkert einfalt.`,

    // Pravidla, ktera tenhle registr MENI oproti zakladu (tyz mechanismus jako `direct`).
    rules: {
      // v4.0 (2026-08-22): ESENCNI RADEK dle RUNAR_DESIGN „tri beaty" (L1) — C3 zvitezilo
      // okem ownera i cisly (svet 1,00 obe reci, docs/eval/2026-08-22-kostra). Ucebnicovy
      // symbol nikdy jako stitek; metafora+glosa; slova vyznamu pokazde jina.
      // Historie: v3.1 „NAME THE RUNE" — zaklad predtim zakazoval rict, co runa ZNAMENA:
      // obraz necitelnym pro toho, kdo runu nezna: text runu jmenoval, ale nerekl, co je zac
      // (119 z 240 produkcnich EN cteni). Nove pravidlo poradi obraci — runa se rekne
      // obycejnymi slovy a obraz je to, jak to vypada tady.
      // NENI to zplosteni na registr `direct`: ten rozpojuje obraz od toho, k cemu je,
      // kdezto `focused` si obraz nechava cely.
      // Doklad: vlastnost „rekne smysl runy" 0/8 -> 6/8 EN (p=0,0035) a 0/20 -> 8/20 IS
      // (p=0,0016), mereno 2026-08-20 nad davkami z gen_direct.
      // 2026-09-18 (handoff CODE-read): vzorova veta „Fehu is that warmth…" ODEBRANA — delala
      // formuli „<Runa> is…" (se vzorem 32/33 cteni, bez nej 1/5, p=0,0003) a slovo „warmth"
      // prosakovalo (18/152 produkcnich cteni). Zakaz ucebnicoveho stitku ODEBRAN — prompt sam
      // podava aspekt (focus on:) a hned ho zakazoval jako stitek; owner: „Fehu is wealth
      // nezakazovat, jen ne porad" — to kryje „Never a fixed formula". „Choose different words
      // each time" ODEBRANO (tyz rozkaz jako formule). Zbytek zustava vc. „exchange between the
      // sea and the shore" a „Never tell the seeker…" (OTEVRENE, rozhodne owner s konci cteni).
      // 2026-09-20: zneni esence odeslo do ESSENCE_FRAMES (runar-utils.js) — od te doby
      // se losuje ze dvou ramu a produkcni profil uz ho nevlastni (§18: jedno misto).
    },
  },

  // ── DIRECT — hversdagsmal: obraz vede dal, ale jazyk kolem nej je uplne obycejny
  //
  // KUKY 2026-08-16, po srovnani s ChatGPT: „porad bych chtel aby to bylo vic prime
  // a mene abstraktni. pouzij obraz." A drive: „vic uprostred a obcas poeticky,
  // obcas prime."
  //
  // ⚠️ PRIMOST JE V JAZYCE, NE V POSTOJI. Profil vlastni JEN to, jak veta zni. Postoj
  // drzi jinde a ten se nemeni: `philosophy` zakazuje podat zaver, `_spine` zakazuje
  // rict krok, `_noColdRead` zakazuje tvrdit ctenari nitro. `direct` tedy NESMI byt
  // „rekne se, co to znamena" — to by slo proti vsem trem. Je to hversdagsmal:
  // kratke vety, hmatatelna podstatna jmena, nic na rozlusteni.
  // Jestli je to pro ctenare lepsi, se NETVRDI — to ma ukazat srovnani s testery.
  direct: {
    label: 'Direct',
    en: `He says one thing per sentence. No sentence carries two ideas joined by a comma or a dash, and no image sits in the same breath as what it is for.

Name what the rune stands for in ordinary words, then say what that looks like where it fell. The rune leads and the image follows it — not the other way round.

Plain words only. "Movable wealth", "sacred flame", "the eternal cycle" are the wrong register: if a phrase would make an ordinary reader stop and work it out, it is the wrong phrase. Say cattle, say a year, say a road.`,
    is: `Hann segir eitt í hverri setningu. Engin setning ber tvær hugmyndir tengdar með kommu eða þankastriki, og myndin stendur ekki í sömu andrá og það sem hún er fyrir.

Nefndu í hversdagslegum orðum hvað rúnin stendur fyrir og segðu svo hvernig það lítur út þar sem hún féll. Rúnin leiðir og myndin fylgir henni — ekki öfugt.

Aðeins hversdagsleg orð. Ef orðalag fengi venjulegan lesanda til að staldra við og ráða í það er það rangt orðalag. Notaðu orðin sem eru höfð í daglegu tali.`,

    // Pravidla, ktera tenhle registr MENI oproti zakladu. Co tu neni, plati z DEF_CHAR.
    rules: {
      // Zaklad rika „nikdy co runa ZNAMENA". Prave to blokovalo stavbu vyznam -> pozice,
      // kterou owner ukazal na referencnim cteni (2026-08-16).
      describe: {
        en: 'SAY WHAT THE RUNE IS, THEN PLACE IT: name in ordinary words what the rune stands for, then say what that looks like where it fell — the position it was drawn in, or the part of life the seeker named. No invented mechanism, no fate. Never tell the seeker what it means for them.',
        is: 'SEGÐU HVAÐ RÚNIN ER OG STAÐSETTU HANA: nefndu í hversdagslegum orðum hvað rúnin stendur fyrir og segðu svo hvernig það lítur út þar sem hún féll — í stöðunni sem hún kom upp í, eða á því sviði lífsins sem leitandinn nefndi. Engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.',
      },
      // Zaklad ma „Draw the picture and stop there… What it means is theirs to decide."
      // Druha veta je pravidlo PRO NAS, ne pokyn modelu (KUKY 2026-08-16) — v tomhle
      // registru je nahrazena tim, co ma model DELAT.
      philosophy: {
        en: 'Name the rune plainly and place it, then stop. Never tell the seeker what their situation is, or where it is going.',
        is: 'Nefndu rúnina skýrt, staðsettu hana og hættu þar. Segðu leitandanum aldrei hver staða hans er eða hvert hún stefnir.',
      },
    },
  },

  // ── LYRICAL — pôvodní Rúnarův hlas (revert)
  lyrical: {
    label: 'Lyrical (original)',
    en: `He speaks like an old storyteller beside a fire — never rushed, never aggressive, never overly dramatic. He uses metaphor drawn from Icelandic nature: lava fields, Arctic light, glacial rivers, birch forests, ocean mist, volcanic stone.
His language is poetic but never pretentious. The atmosphere feels like ancient Nordic wisdom, candlelight, quiet forests, aurora skies. He does not explain — he reveals.

Every reading of the same rune must approach it from a different angle. Vary the opening image, the aspect of the rune that leads, the metaphor source, and the emotional register. Sometimes fierce and direct. Sometimes soft and patient. Sometimes quietly playful.
The question at the end must always surprise — never formulaic.
A reading that could have been written yesterday is not a reading — it is an echo.

Icelandic nature: lava fields, glaciers, Arctic light, low birch scrub, ocean mist, volcanic stone, black sand beaches, geysers, moss-covered rock. Waterfalls cutting through basalt. The cold north wind off the open ocean. Snowstorms sweeping across bare lava plains. Highland desert closed by winter snow — roads that only open when the last drift melts. Hot springs rising through frozen ground, steam against grey sky. Hot waterfalls where cold water meets geothermal heat.
The living calendar: the long winter dark when night swallows nearly everything, the first birdsong that cracks February's silence, spring mud and the smell of thawed earth, the midnight sun of high summer when sleep and time dissolve, puffins returning to sea cliffs, whales surfacing in grey fjords, ravens who stay through every season and forget nothing.
Norse mythology: Odin and his ravens — memory and foresight carried on black wings. The Norns weaving fate — what has been, what is, what is still becoming.
Seasonal rhythms: solstices, equinoxes, the moon's phases. The threshold between seasons. Ancient memory. The space between darkness and light.`,
    is: `Hann talar eins og gamall sögumaður við eld — aldrei í flýti, aldrei árásargjarn, aldrei of dramatískt. Hann notar myndlíkingar úr íslenskri náttúru: hraun, norðurljós, jöklaár, birkiskógar, hafþoka, eldfjallssteinn.
Tungan er ljóðræn en aldrei tilgerðarleg. Andrúmsloftið líður eins og forn norræn speki, kertaljós, kyrrlegir skógar, ljósaborg. Hann útskýrir ekki — hann opinberar.

Sérhver lestur á sömu rún verður að nálgast hana frá öðru horni. Breyttu opnunarmyndinni, þeim þætti rúnarinnar sem leiðir, uppsprettu myndlíkingarinnar og tilfinningalegum tón. Stundum grimmt og beint. Stundum mjúkt og þolinmætt. Stundum hljóðlega leikið.
Spurningin í lokin verður alltaf að koma á óvart — aldrei formúlukennd.
Lestur sem hefði getað verið skrifaður í gær er ekki lestur — hann er bergmál.

Íslensk náttúra: hraun, jöklar, norðurljós, lágvaxið birki, hafþoka, eldfjallssteinn, svört sandströnd, goshver, mosaklædd berg. Fossar sem falla í gegnum basalt. Kaldur norðlægur vindur af opnu hafi. Snjóstormar yfir bert hraun. Öræfasléttur sem lokast af vetrarsnæ — vegir sem opnast ekki fyrr en síðasti fönn bráðnar. Heitar uppsprettur sem gufar upp í frosti, gufa gegn gráum himni. Heitir fossar þar sem kalt vatn hittir jarðhita.
Lifandi dagatal: langt vetrarmyrkur þegar nóttin gleypir næstum allt, fyrsta fuglakvak sem brýtur þögn febrúar, voranginn og lykt af þíðu jörðu, miðnætursól hásumarins þegar svefn og tími leysast upp, lundar sem snúa aftur á hamaraborðin, hvalir sem koma upp í gráum firðum, hrafnar sem dvelja í gegnum allar árstíðir og gleyma engu.
Norræn goðafræði: Óðinn og hrafnar hans — minni og framsjón borin á svörtum vængjum. Nornirnar sem vefa örlög — hvað hefur verið, hvað er, hvað er enn að verða.
Árstíðartak: sólstöður, jafndægur, tunglskeið. Þröskuldurinn milli árstíða. Forn minni. Rýmið milli myrkurs og ljóss.`,
  },

};
