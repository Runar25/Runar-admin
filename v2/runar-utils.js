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

// ─── DURABLE JOURNAL QUEUE — a reading survives a DB outage ───────────────────────
// If the server-side save does not confirm (no reading_id / ask_saved — e.g. the DB was down),
// stash the reading/ask (text + meta are both known here) in localStorage and re-send it,
// idempotent on a client-generated id, once things recover. See claude-proxy mode:'resave'.
// Loss window: the user clears storage / never returns before recovery.
function _uuid() {
  try { if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function _pendGet(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }
function _pendSet(key, arr) { try { localStorage.setItem(key, JSON.stringify(arr.slice(-50))); } catch (e) {} }
function _pendAdd(key, item) { var a = _pendGet(key); if (!a.some(function (x) { return x.id === item.id; })) { a.push(item); _pendSet(key, a); } }
function _pendRemove(key, id) { _pendSet(key, _pendGet(key).filter(function (x) { return x.id !== id; })); }

// Re-send anything the server never confirmed. Readings first (so an Ask can attach to its parent
// row), then Asks. Idempotent server-side; a still-failing item just stays queued for next time.
var _flushing = false;
async function _flushPending() {
  if (_flushing || typeof currentUser === 'undefined' || !currentUser || typeof callProxy !== 'function') return;
  _flushing = true;
  try {
    var reads = _pendGet('pendingReadings');
    for (var i = 0; i < reads.length; i++) {
      var r = reads[i];
      var meta = Object.assign({}, r.journal, { model_text: r.model_text });
      var res = await callProxy('', '', 0, false, 0, meta, 'resave');
      if (res && !res.error && res.saved) _pendRemove('pendingReadings', r.id);
    }
    var asks = _pendGet('pendingAsks');
    for (var j = 0; j < asks.length; j++) {
      var a = asks[j];
      var meta2 = { kind: 'ask', reading_id: a.reading_id, ask_entry_id: a.id, question: a.question, answer: a.answer };
      var res2 = await callProxy('', '', 0, false, 0, meta2, 'resave');
      if (res2 && !res2.error && res2.saved) _pendRemove('pendingAsks', a.id);
    }
  } catch (e) { console.warn('_flushPending:', e && e.message); }
  _flushing = false;
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
function spreadLabel(kind, lang) {
  // Spread cteni ukladaji rune_name = interni kind (KRIZ/NORNS/HORSESHOE/YGGDRASIL).
  // User-facing jmeno zije v spread_mode_* (per lang) -> ukaz ho v jazyce CTENI.
  // Fallback = syrovy kind. Jeden zdroj mapovani pro journal + admin viewer (par20).
  var k = 'spread_mode_' + String(kind || '').toLowerCase();
  var v = (typeof UI_TEXT !== 'undefined')
    ? ((UI_TEXT[lang] && UI_TEXT[lang][k]) || (UI_TEXT.en && UI_TEXT.en[k]))
    : null;
  return v || String(kind || '').toUpperCase();
}

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
// ⭐ PREPSANO 2026-08-16: uhel uz nenese DOMENU, nese VSTUP DO OBRAZU.
// Stare uhly pojmenovavaly oblast ("the body", "what is stirring") a model si z nich
// bral SLOVNIK celeho cteni — u "the body" vyskocilo feel na 33 % proti 3 % jinde.
// Sedm domen = sedm slovnikovych kotcu, a dvojice cteni teze runy se stejnym uhlem
// mely prekryv 13,8 % proti 10,5 % s ruznym (p = 0,004).
// Ted je to sedm STRUKTURNICH cocek na TYZ obraz (celek->jedno · detail · pohyb ·
// pevny bod · pod povrchem · hrana · dovnitr). Cocka nema synonymicke pole, takze
// neni co opisovat. Vsech sedm miri na OBRAZ, ne na hledajiciho — tim padaji i uhly,
// ktere prikazovaly nárok na nitro (stare 3 a 5, 15 % proti 3 %).
// Uhel [2] ma vestaveny unik na kyrrd, aby sedl i runam zastaveni (Isa, Blank):
// kanon KUKY 2026-08-16 — uhel musi pasovat KAZDE rune, jinak se nesmi pouzit.
// Detail a cisla -> RUNAR_EVAL_LOG.md 2026-08-16.
// Pozn.: uhel "zivotni runa mluvi prvni" byl odsud VYRAZEN 2026-08-09 — odporoval si
// s pravidlem cocky (_lensContext: "never name or explain it") a u ctenaru bez zivotni
// runy odkazoval na neco, co v promptu neni. Kdo ho vraci, vraci i ten rozpor.
const READING_ANGLES = [
  'Open with the whole image at once, then let everything fall away but one.',
  'Open on the smallest detail in the image, the part someone would walk past.',
  'Open with the motion already underway in the image. If nothing moves, open with the stillness itself.',
  'Open with the one thing in the image that stays fixed while the rest gives way.',
  // 2026-08-21: 7/8 studenych cteni proti prumeru poolu 5,1. „Hides beneath its surface"
  // model cetl jako pozvanku mluvit o skrytem V CLOVEKU. Skryte ted zustava v obraze.
  // Islandsky protejsek se nemeni — viz hlavicka patche.
  'Open with the part of the image that is out of sight — under it, behind it, or not yet arrived.',
  'Open at the edge of the image, where one thing turns into another.',
  'Open by setting the seeker inside the image, at the spot where it is happening.',
];

// ─── Reading angles IS ─────────────────────────────────────────
const READING_ANGLES_IS = [
  'Byrjaðu á allri myndinni í einu, láttu svo allt hverfa nema eitt.',
  'Byrjaðu á minnsta hlutnum í myndinni, þeim sem flestir gengju fram hjá.',
  'Byrjaðu á hreyfingunni sem er þegar hafin í myndinni. Ef ekkert hreyfist, byrjaðu þá á kyrrðinni sjálfri.',
  'Byrjaðu á því eina í myndinni sem stendur fast meðan allt annað lætur undan.',
  'Byrjaðu á því sem myndin felur undir yfirborðinu, óséð enn.',
  'Byrjaðu á jaðri myndarinnar, þar sem eitt verður að öðru.',
  'Byrjaðu á því að setja leitandann inn í myndina, á staðinn þar sem hún gerist.',
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
  // No real name: reading.js:238 fills the §12 fallback ('you' / 'þú') when the name field is blank
  // (Visitor, for-someone, no saved name). Emit NO name instruction — there is nothing to place or
  // omit, and "do not use the name þú" would fight the mandated second-person voice.
  if (!name || name === 'you' || name === 'þú') return '';
  var pool = lang === 'is' ? NAME_PLACEMENTS_IS : NAME_PLACEMENTS;
  // KUKY (via Cowork relay): a name in every reading grates -> omit it in at least half (~55%).
  // INVARIANT: the "do not use the name" variant must stay LAST in both pools — this picks it by
  // position. Reordering a pool without moving it silently breaks the ratio.
  if (Math.random() < 0.55) return pool[pool.length - 1].split('{name}').join(name);
  var placed = pool.slice(0, pool.length - 1); // early / middle / late
  return placed[Math.floor(Math.random() * placed.length)].split('{name}').join(name);
}

// ─── _promptDraws(prompt, lang) ──────────────────────────────────
// Co si prompt pro TOHLE čtení vylosoval — čte se ZPĚTNĚ z hotového promptu.
// Buildery se tím nemění, takže výstup modelu zůstává bit po bitu stejný.
//
// Proč existuje: `readings` do 2026-08-09 los nepersistovala, takže u reálného
// čtení nešlo říct, kterým úhlem přišlo ani který obraz dostalo. Měřit se má na
// reálných čteních (KUKY 2026-08-09) — a to bez tohohle záznamu nejde.
//
// ⚠️ NESMÍ vyhodit výjimku ani nic zdržet: visí na cestě generování čtení.
// Nezjištěná položka prostě chybí — nikdy se nedosazuje 0 ani '' (§19.2: mlčky
// vytištěná nula je horší než přiznané „nevím").
function _promptDraws(prompt, lang) {
  try {
    var p = String(prompt || '');
    if (!p) return null;
    var isIs = lang === 'is';
    var out = { v: 1 };

    var angles = isIs ? READING_ANGLES_IS : READING_ANGLES;
    for (var i = 0; i < angles.length; i++)
      if (p.indexOf(angles[i]) !== -1) { out.angle = i; break; }

    // Obraz je od 2026-08-13 POSLEDNÍ věc na své řádce, za poslední dvojtečkou.
    // (Dřív se kotvilo na závěrečnou větu o sezóně — ta zmizela; ověřeno, že žádný
    // z 81 obrazů „: " neobsahuje, takže poslední dvojtečka je jednoznačná.)
    // Obraz stojí MEZI dvojtečkou a ocasem věty. Kotvit jen na dvojtečku nestačí:
    // od 2026-08-14 je za obrazem ještě pokyn, a ten by se do obrazu započítal
    // (fráze pak vyšla 19 slov místo 10 a měření hlásilo falešnou nulu).
    var mark = isIs ? 'MYND — ' : 'IMAGE — ';
    var tail = isIs ? ' Láttu hana verða' : ' Let it become';
    var line = p.split('\n').filter(function (l) { return l.indexOf(mark) === 0; })[0];
    if (line) {
      var c = line.indexOf(': ');
      var e = line.indexOf(tail, c);
      if (c > 0) out.image = line.slice(c + 2, e > c ? e : undefined).replace(/\.\s*$/, '').trim();
    }

    var heavy = isIs ? ENDING_HEAVY_IS : ENDING_HEAVY;
    var open  = isIs ? ENDING_OPEN_IS  : ENDING_OPEN;
    for (var j = 0; j < heavy.length; j++)
      if (p.indexOf(heavy[j]) !== -1) { out.ending = 'heavy' + j; break; }
    if (out.ending === undefined)
      for (var k = 0; k < open.length; k++)
        if (p.indexOf(open[k]) !== -1) { out.ending = 'open' + k; break; }

    // Klíčová slova: z pěti až šesti se losují tři (pickedKws) — fasety runy položené
    // modelu před oči. Řádka vypadá takto:
    //   DRAWN RUNE: Fehu — focus on: wealth, material prosperity, cattle · World: …
    // Bere se, co stojí mezi značkou a prvním „ · ".
    var kwMark = isIs ? 'áhersla: ' : 'focus on: ';
    var ki = p.indexOf(kwMark);
    if (ki >= 0) {
      var rest = p.slice(ki + kwMark.length);
      var cut = rest.indexOf(' · ');
      var kws = (cut > 0 ? rest.slice(0, cut) : rest.slice(0, 120)).trim();
      if (kws) out.kws = kws;
    }

    // Jméno: {name} je už dosazené, takže se hledá část ZA ním — ta je u všech
    // čtyř variant jednoznačná. Poslední = „jméno nepoužívej" (viz _namePlacement).
    var npool = isIs ? NAME_PLACEMENTS_IS : NAME_PLACEMENTS;
    for (var n = 0; n < npool.length; n++) {
      var after = npool[n].split('{name}')[1];
      if (after && p.indexOf(after) !== -1) { out.name = n; break; }
    }
    return out;
  } catch (e) { return null; }
}

// ─── ENDING SHAPE (anti-slot) ────────────────────────────────────
// How a reading closes varies per reading AND follows the rune's valence (HEAVY_RUNES):
// a heavy rune must not be softened into comfort; the rest may rest instead of asking.
const ENDING_HEAVY = [
  'End on a line that stays standing — no soft question, no comfort; let it stand.',
  // 2026-08-21: nejhorsi jednotliva paka z dvaceti — 8/8 studenych cteni (prumer poolu 7,0).
  // „Asks for honesty" je pozvanka rict ctenari, co v sobe skryva. Tvrdost zustava,
  // ale drzi se obrazu a nezada priznani.
  'End with one hard question that stays with the image and asks for nothing to be admitted — no comfort, no softening.',
];
const ENDING_OPEN = [
  // 2026-08-21: „turns the seeker inward" vyrabelo predpoklad zabaleny do otazky —
  // ctenar na ni nemohl odpovedet, aniz by tvrzeni prijal.
  'End with one open question the seeker could honestly answer "neither" to — it must not assume what is true in them.',
  // 2026-08-21: puvodne „name where the seeker stands" — doslova pokyn tvrdit o ctenari,
  // osm radek od zakazu `_noColdRead`. Ted se pojmenovava jeho misto V OBRAZE.
  'End on a plain, steady line — name where the seeker stands in the image, not what is true inside them; not a question.',
  'End on a quiet line that rests — not a question this time.',
];
const ENDING_HEAVY_IS = [
  'Endaðu á línu sem stendur — engin mjúk spurning, engin huggun; láttu það standa.',
  'Endaðu á einni harðri spurningu sem heldur sig við myndina og krefst engrar játningar — engin huggun, ekkert mildað.',
];
const ENDING_OPEN_IS = [
  'Endaðu á einni opinni spurningu sem leitandinn gæti með sanni svarað neitandi — hún má ekki gefa sér hvað er satt innra með honum.',
  'Endaðu á staðfastri línu — nefndu hvar leitandinn stendur í myndinni, ekki hvað er satt innra með honum; ekki spurningu.',
  'Endaðu á hljóðlátri línu sem hvílir — ekki spurningu í þetta sinn.',
];
// ─── Rozpocet delky (single) ──────────────────────────────────
// Dve delky, losuje se per cteni. Neni to jen o poctu slov: pri jinem rozpoctu musi model
// stavet vetu jinak, takze tataz runa zni podruhe jinak — pestrost skoro zadarmo.
// Mereno 2026-08-20: tri-vetny rozpocet dal 3 vety ve 4 ze 4 (45-52 slov), ctyr-vetny
// 4 vety v 7 z 8 (56-66 slov). Zadny prekryv — paka drzi ostre.
// Cas nahlas je duvod, proc jsou rozpocty prave dva a ne rozsah: 20-25 s proti 28-33 s.
const LENGTH_BUDGETS = [
  'One flowing reading — 3 short sentences, 38 to 45 words total. It will be read aloud, so keep every sentence lean — about 20 to 25 seconds spoken. No sections, no labels, no line breaks between thoughts.',
  'One flowing reading — 4 short sentences, 50 to 58 words total. It will be read aloud, so keep every sentence lean — about 28 to 33 seconds spoken. No sections, no labels, no line breaks between thoughts.',
];
const LENGTH_BUDGETS_IS = [
  'Gefðu einn samfelldan lestur — 3 stuttar setningar, 38 til 45 orð alls. Hann verður lesinn upphátt, svo hafðu hverja setningu létta — um 20 til 25 sekúndur. Engar fyrirsagnir, engar hlutaskiptingar.',
  'Gefðu einn samfelldan lestur — 4 stuttar setningar, 50 til 58 orð alls. Hann verður lesinn upphátt, svo hafðu hverja setningu létta — um 28 til 33 sekúndur. Engar fyrirsagnir, engar hlutaskiptingar.',
];
function _lengthBudget(lang) {
  var pool = lang === "is" ? LENGTH_BUDGETS_IS : LENGTH_BUDGETS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function _endingShape(drawn, lang) {
  function _isHeavy(r) { return !!(r && r.n && typeof HEAVY_RUNES !== 'undefined' && HEAVY_RUNES.names.indexOf(r.n) !== -1); }
  var heavy = Array.isArray(drawn) ? drawn.some(_isHeavy) : _isHeavy(drawn);
  var pool = heavy ? (lang === 'is' ? ENDING_HEAVY_IS : ENDING_HEAVY)
                   : (lang === 'is' ? ENDING_OPEN_IS : ENDING_OPEN);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── VARIABILITY POOLS (V2) ──────────────────────────────────────
// DEAD CODE (kept for history, NOT wired). WHY / WHO / WHEN:
//   Shrine-only variability pools (aspect / imagery / register / placement),
//   created in ef31d1c (2026-06-06, "reading variability pools -- shrine only").
//   Their ONLY caller was the "V2 LAB" reader-preview, removed in c6eb89c
//   (2026-07-10, "-971 lines, drift surface"). The defs below are NEVER called.
//   Do NOT wire into production without a decision -- reviving them brings back
//   the drift layer that was deliberately removed. Production imagery lives in
//   SEASON_POOLS (runar-character.js), injected per-reading by _seasonalImagery
//   (user-prompt path, which the model obeys).
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
// Popis světa — obě řeči. Do 2026-08-13 tu byly JEN anglické, takže každý islandský
// prompt nesl anglickou frázi (nalezl `scripts/utils/lint_prompts.js --lang`, 25 řádek).
// Jsou to FRÁZE, ne věty „X er Y" — plná věta by vrátila přesně ten opis, kvůli kterému
// odešla rúnaþula. E001 u fragmentu je proto inherentní, ne vada (táž třída jako `k_is`).
// IS obsah Cowork; `liggja + undir` a `á móti` + þágufall doloženo v is-vazba.
function rworld(r) {
  const labels = {
    en: {
      Hel:      'the roots, what lies beneath',
      Midgard:  'the living moment, what is active now',
      Asgard:   'the higher pattern, what reaches toward wider sky',
      Vanaheim: 'the quiet work of nature, what grows slowly',
      Jotunheim:'the untamed, what resists form',
    },
    is: {
      Hel:      'ræturnar, það sem liggur undir',
      Midgard:  'líðandi stund, það sem er virkt núna',
      Asgard:   'æðra mynstur, það sem teygir sig til víðari himins',
      Vanaheim: 'hljóðlát vinna náttúrunnar, það sem vex hægt',
      Jotunheim:'hið ótamda, það sem streitist á móti forminu',
    },
  };
  const set = labels[lang === 'is' ? 'is' : 'en'];
  return r.world ? (set[r.world] || '') : '';
}

// ─── relements() ─────────────────────────────────────────
// v4.6 (2026-08-23): islandsky prompt nesl anglicke nazvy elementu (Frumefni: Air) —
// tyz druh vady jako rworld pred opravou (lint_prompts 13.8.). Data v runes.js
// zustavaji EN (sdilena vrstva s TREE); preklada se jen popisek, jako u rworld.
function relements(r) {
  const isMap = { Fire: 'eldur', Earth: 'jörð', Air: 'loft', Water: 'vatn', Shadow: 'skuggi' };
  if (!r.elements) return '';
  return r.elements.map(function (e) { return lang === 'is' ? (isMap[e] || e) : e; }).join(', ');
}

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

