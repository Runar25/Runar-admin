// ═══════════════════════════════════════════════════════
// SNAPSHOT 2026-05-30 — Life Rune Prompt Builder
// Zdrojový soubor: v2/runar-character.js (řádky ~289–480)
// Stav: produkce ✅
// ═══════════════════════════════════════════════════════

// Přidáno do runar-config.js:
// life_rune_standard: { label: 'Life Rune Reading', max_tokens: 1200, voice: false, active: true }
// life_rune_premium:  { label: 'Life Rune Reading — Premium', max_tokens: 2000, voice: false, active: true }

// DB: user_profiles — přidáno SQL migrací 2026-05-30:
// ALTER TABLE user_profiles
//   ADD COLUMN IF NOT EXISTS life_rune_number int,
//   ADD COLUMN IF NOT EXISTS life_rune_text   text,
//   ADD COLUMN IF NOT EXISTS life_rune_lang   text;

function buildLifeRuneContext(rune) {
  if (!rune) return '';
  var elements = Array.isArray(rune.elements) ? rune.elements.join(' / ') : (rune.elements || '');
  return [
    '',
    'USER LIFE RUNE',
    'This user\'s life rune is ' + rune.n + ' ' + rune.g + '.',
    'Core energy: ' + rune.k + '.',
    'Element: ' + elements + '.  World: ' + rune.world + '.',
    'Let this rune quietly shape how you read every rune that falls for this person.',
    'Do not announce or explain it. Let it colour the reading from underneath.',
    'In Layer 2, you may draw a natural connection between the drawn rune and the life rune — but only when it arises organically, never as a formula.',
    ''
  ].join('\n');
}

function getBirthMonthIS(m) {
  var months = {
    1:  'Morsugur — midvetur, thogn og bid, timinn a milli gamla og nyja',
    2:  'Thorri — hardasti veturinn, Thorrablot, thol yfir osigur, eldar i myrki',
    3:  'Goi — ljosid er ad koma aftur, fyrsta fuglasonngurinn brytur thognina',
    4:  'Harpa — Sumardagurinn fyrsti, vorid opnar sig, orka er ad safnast',
    5:  'Skerpla — sumar er komid, dagurinn er langur, natturan er i fullum gangi',
    6:  'Solmanudur — midnight sun, blaer milli heimsins, huldufolk a ferd',
    7:  'Heyannir — langur dagur, lundar, opinn himinn, uppskera er i gangi',
    8:  'Haustmanudur — ljosid er ad hverfa, uppskera, hlyt og gult',
    9:  'Haustmanudur — Rettir, saudfe kemur heim, hlyt og takkargjort',
    10: 'Gormanudur — myrk er ad koma aftur, fyrsti vetrardagurinn, nordurljós',
    11: 'Ylir — veturinn er kominn i fullnustu, nordurljós, himillinn talar',
    12: 'Jol — solstodur, frae ljossins i myrkinu, Jolasveinar'
  };
  return months[m] || 'othekkt';
}

function getBirthMonthEN(m) {
  var months = {
    1:  'Morsugur — deep midwinter, silence and stillness between the old year and the new',
    2:  'Thorri — the harshest month, Thorrablot, endurance over defeat, fires in the dark',
    3:  'Goi — light beginning to return, the first birdsong breaking the silence of February',
    4:  'Harpa — Sumardagurinn fyrsti, the first day of summer, spring opening',
    5:  'Skerpla — summer arrived, long days, the land in full motion',
    6:  'Solmanudur — midnight sun, the veil thins, hidden people most active',
    7:  'Heyannir — the long light, puffins, hay season, open sky',
    8:  'Haustmanudur — light beginning to leave, harvest, warm and golden',
    9:  'Haustmanudur — Rettir, the sheep roundup, return and gratitude, warm and golden',
    10: 'Gormanudur — darkness returning, first winter day, aurora season begins',
    11: 'Ylir — winter in full darkness, aurora, the sky speaks',
    12: 'Jol — winter solstice, the seed of returning light in the darkest night'
  };
  return months[m] || 'unknown month';
}

// POZOR: IS prompt psát přímo v islandštině (ne instrukce "translate to IS")
// Při generování přes Python script: apostrofy v rune.n/rune.is_n nejsou problém
// (jsou uvnitř string concatenation, ne jako string delimiter)
function buildLifeRunePromptIS(name, rune, day, month, year, isPremium) {
  // Viz runar-character.js ř. 354–416 pro plný IS text
  // Sekce: HLUTI 1 — DAGSETNINGIN + HLUTI 2 — RUNAN
  // Premium: přidá sekci o etymologii jména
  // Žádné hlavičky v outputu (Skrifadu i tveimur hlutum — engar fyrirsagnir i uttakinu)
}

function buildLifeRunePromptEN(name, rune, day, month, year, isPremium) {
  // Viz runar-character.js ř. 419–474 pro plný EN text
  // Sekce: SECTION 1 — THE DATE + SECTION 2 — THE RUNE
  // Premium: přidá sekci o etymologii jména
}

function buildLifeRunePrompt(name, rune, day, month, year, lang, isPremium) {
  if (lang === 'is') return buildLifeRunePromptIS(name, rune, day, month, year, isPremium);
  return buildLifeRunePromptEN(name, rune, day, month, year, isPremium);
}

// POZNÁMKA: Při úpravě promptů VŽDY použít Python skript (ne Edit tool)
// Apostrofy uvnitř IS/EN textu jsou bezpečné pokud string je uzavřen v '...'
// a concatenated — problém nastane jen pokud apostrof je uvnitř '...' stringu přímo
