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
  'Byrjaðu á skugga þessarar rúnu — hvað hún krefst hljóðlægt, ekki hvað hún gefur.',
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

