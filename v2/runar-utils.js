// ═══════════════════════════════════════════════════════
// RÚNAR · UTILS
// Shared utility functions used by both runar-reader and runar-shrine.
// Load order: after runar-character.js, before runar-svgs.js.
//
// Contents:
//   READING_ANGLES / READING_ANGLES_IS / _randomAngle(lang)
//   NAME_PLACEMENTS / NAME_PLACEMENTS_IS / _namePlacement(name, lang)
//   ENDING_HEAVY / ENDING_OPEN (+_IS) / _endingShape(drawn, lang)
//   rk(), rn(), rworld(), relements()  — rune data helpers (read global lang)
//   setText(), setPH(), setSt()        — DOM helpers
//   showToast()                        — toast notification
//   stream(id, text)                   — word-by-word streaming display
// ═══════════════════════════════════════════════════════

function isAdmin(email) {
  return !!(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

// ── Rune glyph rendering — ONE source (RUNE_SVGS hand-drawn SVG), role-based framing (§3/§18).
// frame:true (default) = STONE (rune + carved stone frame) — runes AS OBJECTS: grids, detail.
// frame:false          = BARE LINE (rune only, no frame) — rune BESIDE TEXT: strip, inline.
// Split is by fill: the frame path is the only one filled #1e2535; rune strokes are #D6A85C.
// Blank has no rune strokes: framed = empty stone; frameless = bare gold outline (framed void).
// Returns <svg> markup (or a font-glyph span fallback if the rune has no SVG entry).
// RUNE_BARE_KEEP: which gold path indices are the actual rune (vs stone-carving flourishes).
// Default = [0] (main stroke, always first). Jera = two hooks. See RUNAR_DECISIONS 2026-07-14.
var RUNE_BARE_KEEP = { Jera: [0, 1] };
function runeSvg(rune, opts) {
  opts = opts || {};
  var frame = opts.frame !== false;
  var cls   = opts.cls || '';
  var key   = (rune && rune.svg) || opts.key || '';
  var sd    = (typeof RUNE_SVGS !== 'undefined') ? RUNE_SVGS[key] : null;
  if (!sd) {
    var g = (rune && rune.g) || opts.glyph || '';
    return '<span class="rune-svg-fb ' + cls + '">' + g + '</span>';
  }
  var paths = sd.paths;
  if (!frame) {
    // Bare line: keep only the main rune stroke(s); drop the stone frame AND its small #D6A85C
    // flourishes that would otherwise float as stray marks without the carved stone.
    var all = sd.paths.match(new RegExp('<path[^>]*>', 'g')) || [];
    var gold = all.filter(function(p) { return p.indexOf('#1e2535') < 0; });
    if (gold.length) {
      var keep = RUNE_BARE_KEEP[key] || [0];
      paths = keep.map(function(i) { return gold[i]; }).filter(Boolean).join('');
    } else {
      // Blank (frame-only): render the frame as a bare gold outline (framed void)
      paths = sd.paths.replace(new RegExp('fill="#1e2535"', 'g'), 'fill="none"');
    }
  }
  return '<svg class="rune-svg ' + cls + '" viewBox="' + sd.vb + '" fill="none" xmlns="http://www.w3.org/2000/svg">' + paths + '</svg>';
}

// HTML-escape a value before interpolating it into innerHTML. Reading/journal fields carry
// user free text (question, area) + model text, so escaping prevents stored/self-XSS and
// also renders any literal < & " in a reading correctly. ONE helper for reader + shrine (§3/§18).
function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Safe for a JS single-quoted string that itself sits inside a double-quoted HTML attribute
// (e.g. onclick="fn('<here>')"): escape backslash + JS-quote for the string, and HTML-encode
// the double-quote/angle brackets so the attribute cannot be broken out of.
function jsAttr(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    .replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Translation helper — reads from UI_TEXT[lang] (runar-translations.js)
function t(key) {
  return (UI_TEXT[lang] && UI_TEXT[lang][key]) || UI_TEXT.en[key] || key;
}

// Legacy DB tier aliases -> canonical (§18: one place for the free/credits mapping)
function normalizeTier(tier) {
  return (tier === 'free' || tier === 'credits') ? 'rune_seeker' : tier;
}

// Corrections DB rows -> shared {from_word,to_word,lang,context} shape.
// §18/§3: ONE normalizer so reader + shrine can never drift on field names
// (DB columns are original_phrase / replacement_phrase / lang_scope). Drops empty rows.
function normalizeCorrections(rows) {
  return (rows || []).map(function(c) {
    return {
      from_word: c.original_phrase || c.from_word || '',
      to_word:   c.replacement_phrase || c.to_word || '',
      lang:      c.lang_scope || c.lang || 'both',
      context:   c.context || null,
    };
  }).filter(function(c) {
    var ok = c.from_word && c.to_word && c.from_word !== 'undefined' && c.to_word !== 'undefined';
    // §19 CONTRACT: don't silently drop — a dropped row means the DB->code field shape
    // may have drifted (the bug that ran dead for weeks); announce it loudly at runtime.
    if (!ok && typeof console !== 'undefined') {
      try { console.warn('[CONTRACT] normalizeCorrections dropped a row (empty/undefined mapping — DB field drift?):', c); } catch (e) {}
    }
    return ok;
  });
}

// Vocabulary helpers — read from VOCAB (runar-config.js)
// vn('unit', 9, 'en')  =>  '9 rune readings'
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
  'Lead with the gift — what this rune offers, and what it asks in return.',
  'Lead with timing — what specific moment in their life does this rune mark.',
  'Lead with the body — where does this rune live as a physical sensation right now.',
  'Lead with the land — open with a single Icelandic image that mirrors this situation exactly.',
  'Lead with what is stirring — name the movement this rune makes visible.',
  'Lead with the threshold — what is the seeker standing between right now.',
  'Let the life rune speak first — the drawn rune answers it.',
];

// ─── Reading angles IS ─────────────────────────────────────────
const READING_ANGLES_IS = [
  'Byrjaðu á skugga þessarar rúnar — hvað hún krefst hljóðlægt, ekki hvað hún gefur.',
  'Byrjaðu á gjöfinni — hvað þessi rúna gefur og hvað hún biður um í staðinn.',
  'Byrjaðu á tímasetningunni — hvaða sérstaka augnablik í lífi þeirra merkir þessi rúna.',
  'Byrjaðu á líkamanum — hvar býr þessi rúna sem líkamleg tilfinning núna.',
  'Byrjaðu á landinu — opnaðu með einni íslenskri mynd sem speglar þessa stöðu nákvæmlega.',
  'Byrjaðu á því sem hrærist — nefndu hreyfinguna sem þessi rúna gerir sýnilega.',
  'Byrjaðu á þröskuldinum — á milli hvers stendur leitandinn núna.',
  'Láttu lífsrúnina tala fyrst — dregna rúnan svarar henni.',
];

// ─── _randomAngle(lang) ─────────────────────────────────────────
function _randomAngle(lang) {
  var _pool = lang === 'is' ? READING_ANGLES_IS : READING_ANGLES;
  return _pool[Math.floor(Math.random() * _pool.length)];
}

// ─── NAME PLACEMENT (anti-slot) ──────────────────────────────────
// Where the seeker's name lands varies per reading: early / middle / late / not at all.
// Replaces a fixed clause that was copy-pasted 5x per language into the pack closings (§18).
// {name} is substituted; the 'not at all' variant still has the seeker in the PERSON: context.
const NAME_PLACEMENTS = [
  'Address {name} early, woven in — but never as the opening word.',
  'Address {name} once in the middle, as a recognition rather than an introduction.',
  'Let the name {name} arrive late, near the close, as a quiet recognition.',
  'This time do not use the name {name} at all — let the reading stand without it.',
];
const NAME_PLACEMENTS_IS = [
  'Ávarpaðu {name} snemma, fléttað inn — en aldrei sem fyrsta orð.',
  'Ávarpaðu {name} einu sinni í miðjunni, sem viðurkenningu fremur en kynningu.',
  'Láttu nafn {name} koma seint, undir lokin, sem hljóðláta viðurkenningu.',
  'Í þetta sinn skaltu ekki nota nafn {name} — láttu lesturinn standa án þess.',
];
function _namePlacement(name, lang) {
  var pool = lang === 'is' ? NAME_PLACEMENTS_IS : NAME_PLACEMENTS;
  // Owner: a name in every reading grates -> omit it in at least half of them (~55%).
  // INVARIANT: the "do not use the name" variant must stay LAST in both pools — this
  // picks it by position. Reordering a pool without moving it silently breaks the ratio.
  if (Math.random() < 0.55) return pool[pool.length - 1].split('{name}').join(name);
  var placed = pool.slice(0, pool.length - 1); // early / middle / late
  return placed[Math.floor(Math.random() * placed.length)].split('{name}').join(name);
}

// ─── ENDING SHAPE (anti-slot) ────────────────────────────────────
// How a reading closes varies per reading AND follows the rune's valence (HEAVY_RUNES):
// a heavy rune must not be softened into comfort; the rest may rest instead of asking.
const ENDING_HEAVY = [
  'End on a line that stays standing — no soft question, no comfort; let the rune stand.',
  'End with one hard question that asks for honesty, not comfort.',
];
const ENDING_OPEN = [
  'End with one open question that turns the seeker inward.',
  'End with a short open question — only a few words.',
  'End on a quiet line that rests — not a question this time.',
];
const ENDING_HEAVY_IS = [
  'Endaðu á línu sem stendur — engin mjúk spurning, engin huggun; láttu rúnina standa.',
  'Endaðu á einni harðri spurningu sem biður um heiðarleika, ekki huggun.',
];
const ENDING_OPEN_IS = [
  'Endaðu á einni opinni spurningu sem snýr leitandanum inn á við.',
  'Endaðu á stuttri opinni spurningu — aðeins fáein orð.',
  'Endaðu á hljóðlátri línu sem hvílir — ekki spurningu í þetta sinn.',
];
function _endingShape(drawn, lang) {
  var heavy = !!(drawn && drawn.n && typeof HEAVY_RUNES !== 'undefined' && HEAVY_RUNES.names.indexOf(drawn.n) !== -1);
  var pool = heavy ? (lang === 'is' ? ENDING_HEAVY_IS : ENDING_HEAVY)
                   : (lang === 'is' ? ENDING_OPEN_IS : ENDING_OPEN);
  return pool[Math.floor(Math.random() * pool.length)];
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

// rnSplit() -- jmeno + (preklad) do dvou casti
// IS: 'Fehu (Eignir)' -> {name:'Fehu', tr:'Eignir'} · EN: 'Fehu' -> {name:'Fehu', tr:''}
function rnSplit(r) {
  var full = rn(r);
  var m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(full);
  if (m) return { name: m[1], tr: m[2] };
  return { name: full, tr: '' };
}

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

