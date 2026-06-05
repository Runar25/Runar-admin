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
const TREE_UPDATE = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/tree-update';
// Future proxies go here:
// const NOTIFY_PROXY = '...functions/v1/notify';
// const LUNAR_PROXY  = '...functions/v1/lunar-context';

// ─── ELEVENLABS ─────────────────────────────────────────
const EL_VOICE_ID_EN = '2UI8v2ibbwQTijaYAte1'; // English — Rúnar EN
const EL_VOICE_ID_IS = '2UI8v2ibbwQTijaYAte1'; // IS — stejný voice, eleven_v3 auto-detekuje islandštinu z textu

const EL_MODEL_EN = 'eleven_multilingual_v2'; // EN model
const EL_MODEL_IS = 'eleven_v3';              // IS model — detekuje islandštinu automaticky

// Helpers — vrátí správný voice ID / model podle jazyka
function elVoiceId(lang) { return lang === 'is' ? EL_VOICE_ID_IS : EL_VOICE_ID_EN; }
function elModel(lang)   { return lang === 'is' ? EL_MODEL_IS    : EL_MODEL_EN; }

const EL_VOICE_SETTINGS = {
  stability:        0.75,
  similarity_boost: 0.85,
  style:            0.35,
  use_speaker_boost: true,
};

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
  spread_3: {
    label:      '3 Readings',
    max_tokens: 900,
    voice:      true,
    layers:     3,
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
  life_rune_standard: {
    label:      'Life Rune Reading',
    max_tokens: 1200,
    voice:      false,
    layers:     null,
    active:     true,
  },
  life_rune_premium: {
    label:      'Life Rune Reading — Premium',
    max_tokens: 2000,
    voice:      false,
    layers:     null,
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
    readings:         1,          // total, no account needed — CHANGED 2026-05-29
    // ↓ VOICE FLAGS — flip here to enable/disable without touching logic
    // voice_monthly: true = Visitor slyší hlas při svých 3 čteních
    // Až budeme limitovat: flip na false → Visitor dostane jen text
    voice_monthly:    true,       // ← aktuálně otevřeno; připraveno pro gating
    voice_credits:    false,      // n/a pro Visitor (nemůže mít kredity)
    voice_static:     true,       // pre-generované audio v Collection
    journal:          false,
    ceremonial:       false,
    languages:        ['en'],
  },
  rune_seeker: {
    label:            'Rune Seeker',
    label_is:         'Vegfarandi',
    monthly_readings: null,        // legacy — RS uses free_balance (1 onboarding), no monthly reset
    // ↓ VOICE FLAGS — flip here to enable/disable without touching logic
    // voice_monthly: true = hlas pro všech 5 free čtení/měsíc
    // Až budeme limitovat: flip na false → hlas jen při kreditech
    voice_monthly:    true,       // ← aktuálně otevřeno; připraveno pro gating
    voice_credits:    true,       // hlas při kreditním čtení — vždy
    voice_static:     true,       // pre-generované audio v Collection
    journal:          5,          // last N readings
    ceremonial:       false,
    languages:        ['en', 'is'],
  },
  standard: {
    label:            'Standard',
    label_is:         'Standard',
    monthly_readings: 50,          // Standard: 50/month
    voice_monthly:    true,
    voice_credits:    true,
    voice_static:     true,
    journal:          null,
    ceremonial:       false,
    languages:        ['en', 'is'],
  },
  premium: {
    label:            'Premium',
    label_is:         'Premium',
    monthly_readings: 75,          // Premium: 75/month — matches TIER_LIMITS.premium.monthly_limit
    voice_monthly:    true,
    voice_credits:    true,
    voice_static:     true,
    journal:          null,
    ceremonial:       true,
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
// ─── APP SETTINGS ───────────────────────────────────────
const APP = {
  default_lang:    'en',
  supported_langs: ['en', 'is'],
  stream_delay_ms: 25,        // word-by-word stream speed
  version:         '0.1.0',  // increment on significant changes
};

// ─── PATTERN WINDOW ─────────────────────────────────────
// Determines intensity of pattern reactions on the tree.
// Does NOT gate whether a pattern triggers — only how strongly.
// Adjust after first 50 users based on real data.
// Used by: detectPatterns() in runar-gathering.js / runar-tree.js
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
    { runes: ['Berkano', 'Isa'],     desc_en: 'growth frozen, but roots hold'                },
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
  // When any value changes, update here only. panel_props labels must match.
  free_trial: {
    onboarding:   1,     // lifetime readings for Visitor
    weekly_drip:  0,
    free_spreads: ['single'],
    panel_props: {
      en: ['Your first reading is a gift.', 'No account, no payment.', 'Step further when you are ready.'],
      is: ['Fyrsti lesturinn er gjöf.', 'Enginn reikningur, engin greiðsla.', 'Farðu lengra þegar þú ert tilbúinn.'],
    },
  },
  rune_seeker: {
    onboarding:   1,     // 1 free reading at registration
    weekly_drip:  null,  // no weekly drip
    free_spreads: ['single', 'trojice', 'norns', 'gathering', 'cross', 'horseshoe', 'yggdrasil'],
    journal_entries: 5,
    onboarding_label_en: 'one free reading',
    onboarding_label_is: 'einn frjáls lestur',
    journal_label_en:    'last 5 readings',
    journal_label_is:    'síðustu 5 lestrar',
    panel_props: {
      en: ['One free reading to start, then credits.', 'Reading Gift Card unveils all features.', 'Limited journal (last 5 readings).'],
      is: ['Einn frjáls lestur til að byrja, síðan kreditar.', 'Reading Gift Card opnar allar aðgerðir.', 'Takmörkuð dagbók (síðustu 5 lestrar).'],
    },
  },
  standard: {
    onboarding:    null,
    weekly_drip:   null,
    monthly_limit: 50,   // readings per month — change here, UI updates automatically
    free_spreads:  ['single', 'trojice', 'cross', 'horseshoe', 'norns', 'yggdrasil'],
    journal_entries: null,
    panel_props: {
      en: ['50 readings / month.', 'Voice on every reading.', 'Full journal + filters.', 'The Gathering.'],
      is: ['50 lestrar / mánuð.', 'Rödd á hverjum lestri.', 'Full dagbók + síur.', 'The Gathering.'],
    },
  },
  premium: {
    onboarding:    null,
    weekly_drip:   null,
    monthly_limit: 75,   // readings per month
    free_spreads:  ['single', 'trojice', 'cross', 'horseshoe', 'norns', 'yggdrasil'],
    journal_entries: null,
    panel_props: {
      en: ['75 readings / month.', 'Everything in Standard.', 'Yggdrasil — all nine worlds.', 'Ceremonial mode.'],
      is: ['75 lestrar / mánuð.', 'Allt í Standard.', 'Yggdrasil — níu heimar.', 'Ceremonial mode.'],
    },
  },
};

// ─── SPREAD COSTS ────────────────────────────────────────
// cost = number of runes in spread.
// free: cost from free_balance (null = not available with free balance — credits only).
// credits: cost in credits from Reading Gift Card.
const SPREAD_COSTS = {
  single:    { free: 1,    credits: 1  },
  trojice:   { free: null, credits: 3  },
  cross:     { free: null, credits: 5  },
  gathering: { free: null, credits: 3  },  // flat: 3 credits per Gathering reading
  horseshoe: { free: null, credits: 7  },
  norns:     { free: null, credits: 3  },
  yggdrasil: { free: null, credits: 9  },
  life_rune: { free: null, credits: 10 },  // deep life rune reading — implementation later
};
// ─── SPREAD CONFIG — single source of truth ──────────────
// rune_count: how many runes to draw
// positions.en / positions.is: position labels (null = single rune, no positions)
// credits: cost in credits (mirrors SPREAD_COSTS)
// tokens: max_tokens for Claude
const SPREAD_CONFIG = {
  single: {
    rune_count: 1,
    positions:  null,
    credits:    1,
    tokens:     700,
  },
  trojice: {
    rune_count: 3,
    positions: {
      en: ['Past / Foundation', 'Present / Core', 'Direction / Outlook'],
      is: ['Úrslitir / Grótur', 'Nútíð / Kjarni', 'Stefna / Útlit'],
    },
    credits: 3,
    tokens:  900,
  },
  cross: {
    rune_count: 5,
    positions: {
      en: ['Centre / Core', 'Above / Aspiration', 'Below / Root', 'Behind / Past', 'Ahead / Direction'],
      is: ['Miðja / Kjarni', 'Of an / Á leit', 'Undir / Rót', 'Að baki / Fortíð', 'Framar / Stefna'],
    },
    credits: 5,
    tokens:  1100,
  },
  norns: {
    rune_count: 3,
    positions: {
      en: ['Urður / Past', 'Verðandi / Present', 'Skuld / Future'],
      is: ['Urður / Fortíð', 'Verðandi / Nútíð', 'Skuld / Framtíð'],
    },
    credits: 3,
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
    credits: 7,
    tokens:  1300,
  },
  yggdrasil: {
    rune_count: 9,
    seasonal:  { month_start: 12, day_start: 14, day_end: 28 }, // Dec 14-28 only
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
        'Asgardr — Haesta sjalf',
        'Vanaheimr — Samhljomur',
        'Alfheimr — Skapaningur',
        'Midgardr — Dagleg reind',
        'Jotunheimr — Hindrun',
        'Svartalfaheimr — Dulinn list',
        'Nidavellir — Djupur uppspretta',
        'Niflheimr — Uppruninn',
        'Hel — Lokid',
      ],
    },
    // Norns axis per position: skuld=1-3, verdandi=4-5, urd=6-9
    norns_axis: ['skuld','skuld','skuld','verdandi','verdandi','urd','urd','urd','urd'],
    credits: 9,
    tokens:  1800,
  },
};

