// ═══════════════════════════════════════════════════════
// RÚNAR · UTILS
// Shared utility functions used by both runar-reader and runar-shrine.
// Load order: after runar-character.js, before runar-svgs.js.
//
// Contents:
//   READING_ANGLES / READING_ANGLES_IS / _randomAngle(lang)
//   rk(), rn(), rworld(), relements()  — rune data helpers (read global lang)
//   setText(), setPH(), setSt()        — DOM helpers
//   showToast()                        — toast notification
//   stream(id, text)                   — word-by-word streaming display
// ═══════════════════════════════════════════════════════

function isAdmin(email) {
  return !!(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

// Translation helper — reads from UI_TEXT[lang] (runar-translations.js)
function t(key) {
  return (UI_TEXT[lang] && UI_TEXT[lang][key]) || UI_TEXT.en[key] || key;
}

// Vocabulary helpers — read from VOCAB (runar-config.js)
// vn('unit', 9, 'en')  =>  '9 rune stones'
// vn('cast', 1, 'is')  =>  '1 sp\u00e1'
function vn(key, n, lang) {
  var v = VOCAB && VOCAB[key];
  if (!v) return n + ' ' + key;
  if (lang === 'is') return n + '\u00a0' + (n === 1 ? v.is : v.is_pl);
  return n + '\u00a0' + (n === 1 ? v.en : v.en_pl);
}
// vl('card', 'en')  =>  'Rune Reading Card'
// vl('card', 'is')  =>  'R\u00fanakort'
function vl(key, lang) {
  var v = VOCAB && VOCAB[key];
  if (!v) return key;
  return lang === 'is' ? (v.is || v.en) : v.en;
}
// vlp('card', 'en')  =>  'Rune Reading Cards' (plural label, bez cisla)
function vlp(key, lang) {
  var v = VOCAB && VOCAB[key];
  if (!v) return key;
  return lang === 'is' ? (v.is_pl || v.is || v.en_pl) : (v.en_pl || v.en);
}

// Template helper — substitutes {placeholder} in a translation string
// tp('rs_banner_desc', { casts_month: vn('cast', 1, 'en'), card: vl('card', 'en') })
// Rule: ALL user-visible strings live in UI_TEXT (translations.js).
// Adding a language = add new block to UI_TEXT + VOCAB. Zero other files change.
function tp(key, vars) {
  var s = t(key);
  if (!s || !vars) return s || key;
  Object.keys(vars).forEach(function(k) {
    s = s.split('{' + k + '}').join(String(vars[k]));
  });
  return s;
}


// ─── Reading angles EN ─────────────────────────────────────────
const READING_ANGLES = [
  'Lead with the shadow of this rune — what it quietly demands, not what it offers.',
  'Lead with the gift — what this rune is already giving before the seeker has noticed.',
  'Lead with timing — what specific moment in their life does this rune mark.',
  'Lead with the body — where does this rune live as a physical sensation right now.',
  'Lead with the land — open with a single Icelandic image that mirrors this situation exactly.',
  'Lead with what is already in motion — name what has already begun that this rune makes visible.',
  'Lead with the threshold — what is the seeker standing between right now.',
  'Let the life rune speak first — the drawn rune answers it.',
];

// ─── Reading angles IS ─────────────────────────────────────────
const READING_ANGLES_IS = [
  'Byrjaðu á skugga þessarar rúnar — hvað hún krefst hljóðlægt, ekki hvað hún gefur.',
  'Byrjaðu á gjöfinni — hvað þessi rúna er þegar að gefa áður en leitandinn hefur tekið eftir því.',
  'Byrjaðu á tímasetningunni — hvaða sérstaka augnablik í lífi þeirra merkir þessi rúna.',
  'Byrjaðu á líkamanum — hvar býr þessi rúna sem líkamleg tilfinning núna.',
  'Byrjaðu á landinu — opnaðu með einni íslenskri mynd sem speglar þessa stöðu nákvæmlega.',
  'Byrjaðu á því sem er þegar á hreyfingu — nefndu það sem hefur þegar hafist sem þessi rúna gerir sýnilegt.',
  'Byrjaðu á þröskuldinum — á milli hvers stendur leitandinn núna.',
  'Láttu lífsrúnina tala fyrst — dregna rúnan svarar henni.',
];

// ─── _randomAngle(lang) ─────────────────────────────────────────
function _randomAngle(lang) {
  var _pool = lang === 'is' ? READING_ANGLES_IS : READING_ANGLES;
  return _pool[Math.floor(Math.random() * _pool.length)];
}

// ─── VARIABILITY POOLS (V2) ──────────────────────────────────────
// Which dimension of the rune leads the reading.
const READING_ASPECTS = [
  'shadow — what this rune quietly demands, not what it offers; the cost beneath the gift',
  'gift — what this rune is already giving before the seeker has noticed',
  'timing — what specific moment or threshold in this person\'s life this rune marks',
  'challenge — what this rune asks the person to face, move through, or stop avoiding',
  'the body — where this rune lives right now as a physical sensation or held tension',
  'relationship — how this rune shapes how this person connects to or separates from others',
  'the land — this rune\'s elemental, earthly quality; let the landscape carry the meaning',
];

// Where the central image comes from.
const IMAGERY_SOURCES = [
  'the sea — Icelandic ocean; depth, tidal pull, what surfaces and what stays below',
  'volcanic ground — lava fields, geothermal heat rising through stone that was once fire',
  'the sky — aurora borealis, midnight sun, winter dark, storm light, the open emptiness above',
  'an animal — raven, arctic fox, puffin, whale, or horse; let one animal carry the whole reading',
  'the season — the specific quality of this Icelandic moment; what it asks of the land and the person',
  'a threshold — shoreline, cliff edge, doorway, the breath before a step is taken',
  'sound or silence — wind across bare rock, the creak of ice, the particular silence after snowfall',
  'ancient stone — glacier-carved, basalt columns, a standing stone; what endures when everything else changes',
];

// Emotional register and tone of delivery.
const READING_REGISTERS = [
  'fierce and direct — no softening; cut to the bone with care but without cushioning',
  'soft and still — speak as beside a fire in deep winter; close, unhurried, low',
  'quietly playful — dry Icelandic wit beneath the gravity; a flicker of warmth, never sentimental',
  'ancient and heavy — the weight of old stone; slow, measured, carrying long memory',
  'tender — speak as if only this one person will ever hear these words',
];

function _randomAspect()  { return READING_ASPECTS[Math.floor(Math.random() * READING_ASPECTS.length)]; }
function _randomImagery() { return IMAGERY_SOURCES[Math.floor(Math.random() * IMAGERY_SOURCES.length)]; }
function _randomRegister(){ return READING_REGISTERS[Math.floor(Math.random() * READING_REGISTERS.length)]; }

// Where the rune's proper name appears in the reading.
const RUNE_PLACEMENTS = [
  'early — name the rune in the first or second sentence; let it anchor everything that follows',
  'middle — build the image for 2 to 3 sentences first; name the rune as a recognition, not an introduction',
  'late — withhold the rune name until the final third of the reading; by the time it arrives, it lands as confirmation',
];

function _randomPlacement(){ return RUNE_PLACEMENTS[Math.floor(Math.random() * RUNE_PLACEMENTS.length)]; }

// ─── rk() ─────────────────────────────────────────
function rk(r)  { return lang === 'is' ? r.k_is : r.k; }

// ─── rn() ─────────────────────────────────────────
function rn(r)  { return lang === 'is' ? r.is_n : r.n; }

// ─── rworld() ─────────────────────────────────────────
function rworld(r) {
  const labels = {
    Hel:      'the roots, what lies beneath',
    Midgard:  'the living moment, what is active now',
    Asgard:   'the higher pattern, what reaches toward wider sky',
    Vanaheim: 'the quiet work of nature, what grows slowly',
    Jotunheim:'the untamed, what resists form',
  };
  return r.world ? (labels[r.world] || '') : '';
}

// ─── relements() ─────────────────────────────────────────
function relements(r) { return r.elements ? r.elements.join(', ') : ''; }

// ─── setText() ─────────────────────────────────────────
function setText(id, v)   { const el = document.getElementById(id); if (el && v !== undefined) el.textContent = v; }

// ─── setPH() ─────────────────────────────────────────
function setPH(id, v)     { const el = document.getElementById(id); if (el && v) el.placeholder = v; }

// ─── setSt() ─────────────────────────────────────────
function setSt(id, msg, type) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = msg || ''; el.className = 'status' + (type ? ' '+type : '');
}

// ─── showToast() ─────────────────────────────────────────
function showToast(msg, dur = 3000) {
  const el = document.getElementById('toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

// ─── stream() ─────────────────────────────────────────
function stream(id, text) {
  return new Promise(resolve => {
    const el = document.getElementById(id); if (!el) { resolve(); return; }
    el.innerHTML = '';
    const words = text.split(' ');
    let i = 0;
    const tick = setInterval(() => {
      if (i >= words.length) { clearInterval(tick); resolve(); return; }
      const span = document.createElement('span'); span.textContent = (i > 0 ? ' ' : '') + words[i++];
      el.appendChild(span);
    }, APP.stream_delay_ms);
  });
}

