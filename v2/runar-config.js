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
  ceremonial: {
    label:      'Ceremonial — Cacao Ritual',
    max_tokens: 1200,
    voice:      true,
    layers:     null,     // step-based, not layer-based
    steps:      [],       // populated when ceremonial mode is built (Layer 4)
    active:     false,    // not live yet
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
    label:          'Free Trial',
    readings:       3,          // total, no account needed
    voice_dynamic:  false,      // real-time ElevenLabs generation
    voice_static:   true,       // pre-generated rune audio
    journal:        false,
    ceremonial:     false,
    languages:      ['en'],
  },
  free: {
    label:          'Free',
    readings:       5,          // per month, requires account
    voice_dynamic:  false,
    voice_static:   true,
    journal:        5,          // last N readings
    ceremonial:     false,
    languages:      ['en', 'is'],
  },
  credits: {
    label:          'Credits',
    readings:       null,       // consumed per reading (never expire)
    voice_dynamic:  true,
    voice_static:   true,
    journal:        null,       // unlimited
    ceremonial:     false,
    languages:      ['en', 'is'],
  },
  standard: {
    label:          'Standard',
    readings:       null,       // unlimited
    voice_dynamic:  true,
    voice_static:   true,
    journal:        null,
    ceremonial:     false,
    languages:      ['en', 'is'],
  },
  premium: {
    label:          'Premium',
    readings:       null,
    voice_dynamic:  true,
    voice_static:   true,
    journal:        null,
    ceremonial:     true,
    languages:      ['en', 'is'],
    physical_unlock: true,      // QR/NFC product linking
    seasonal_content: true,     // solstices, equinoxes, lunar events
  },
};

// ─── ADMIN ACCESS ───────────────────────────────────────
// Only these emails can access the Knowledge Shrine and Yggdrasil.
const ADMIN_EMAILS = ['kukula@agndofa.is', 'info@agndofa.is'];
function isAdmin(email) {
  return !!(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

// ─── APP SETTINGS ───────────────────────────────────────
const APP = {
  default_lang:    'en',
  supported_langs: ['en', 'is'],
  stream_delay_ms: 25,        // word-by-word stream speed
  version:         '0.1.0',  // increment on significant changes
};
