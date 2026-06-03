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
    monthly_readings: 5,          // free readings per month, resets monthly
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
    monthly_readings: null,       // unlimited
    voice_monthly:    true,
    voice_credits:    true,
    voice_static:     true,
    journal:          null,       // unlimited
    ceremonial:       false,
    languages:        ['en', 'is'],
  },
  premium: {
    label:            'Premium',
    label_is:         'Premium',
    monthly_readings: null,
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

// ─── TIER LIMITS — single source of truth ───────────────
// Edit here only. All frontend constants read from this.
// Backend (claude-proxy) uses parallel values — sync manually when changing.
// Last updated: 2026-05-29
const TIER_LIMITS = {
  free_trial: {
    onboarding:   1,     // lifetime readings for Visitor (was 3)
    weekly_drip:  0,     // no drip for anonymous
    free_spreads: ['single'],
  },
  rune_seeker: {
    onboarding:   1,     // 1 free reading at registration
    weekly_drip:  null,  // no weekly drip — credits only after onboarding
    free_spreads: ['single'],  // free balance covers ONLY single rune
    journal_entries: 5,
    // Text labels for UI — update when numbers change
    onboarding_label_en: 'one free reading',
    onboarding_label_is: 'einn frjáls lestur',
    journal_label_en:    'last 5 readings',
    journal_label_is:    'síðustu 5 lestrar',
  },
  standard: {
    onboarding:   null,  // unlimited
    weekly_drip:  null,
    free_spreads: ['single', 'trojice', 'cross', 'horseshoe', 'norns', 'yggdrasil'],
    journal_entries: null,
  },
  premium: {
    onboarding:   null,
    weekly_drip:  null,
    free_spreads: ['single', 'trojice', 'cross', 'horseshoe', 'norns', 'yggdrasil'],
    journal_entries: null,
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
  gathering: { free: null, credits: -1 },  // -1 = variable (number of runes selected)
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
      is: ['Urður / Fortíð', 'Verðandi / Nútíð', 'Skuld / Framtið'],
    },
    credits: 3,
    tokens:  900,
  },
};

