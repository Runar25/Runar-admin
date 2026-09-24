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
  // [0] 2026-09-23 (KUKY „ok. opravit“): „celý obraz najednou“ nutil celou scénu do 1. věty a model
  // k ní dokresloval okolí, které v obrazu není („the whole yard still grey“). Změřeno, stejné losy,
  // 12 čtení: 1. věta 25,0 -> 20,9 slov, nejdelší 33 -> 24, kratší v 9/12 párů, drží v obou půlkách;
  // starý pokyn model u Jery doslova opsal, nový ne. „Nech vše odpadnout kromě jedné věci“ zůstává —
  // z něj vzniklo ownerem chválené „jedno zlomené stéblo“ (Hagalaz, 2026-09-23).
  'Open with one quick glance at the whole image, then let everything fall away but one.',
  'Open on the smallest detail in the image, the part someone would walk past.',
  'Open with the motion already underway in the image. If nothing moves, open with the stillness itself.',
  'Open with the one thing in the image that stays fixed while the rest gives way.',
  // 2026-08-21: 7/8 studenych cteni proti prumeru poolu 5,1. „Hides beneath its surface"
  // model cetl jako pozvanku mluvit o skrytem V CLOVEKU. Skryte ted zustava v obraze.
  // Islandsky protejsek se nemeni — viz hlavicka patche.
  // 2026-09-24 (owner 2026-09-23, DECISIONS 2026-09-23 (17), handoff CODE-read): u zvukového obrazu (Isa „Under the ice
  // the stream can still be heard“) Opus 4.8 zvuk v prvních dvou větách ztratil 4/4; s výjimkou 3/3 (EVAL_LOG 2026-09-23 (8)).
  // Výjimka ve větě úhlu, ne výluka — stejný vzor jako [2] „If nothing moves…“. Mez: 1 obraz × 3 čtení, jen EN.
  'Open with the part of the image that is out of sight — under it, behind it, or not yet arrived. If the image lives in sound, open with what is heard but not seen.',
  'Open at the edge of the image, where one thing turns into another.',
  'Open by setting the seeker inside the image, at the spot where it is happening.',
];

// ─── Reading angles IS ─────────────────────────────────────────
const READING_ANGLES_IS = [
  'Líttu fyrst snöggt yfir alla myndina, láttu svo allt hverfa nema eitt.',
  'Byrjaðu á minnsta hlutnum í myndinni, þeim sem flestir gengju fram hjá.',
  'Byrjaðu á hreyfingunni sem er þegar hafin í myndinni. Ef ekkert hreyfist, byrjaðu þá á kyrrðinni sjálfri.',
  'Byrjaðu á því eina í myndinni sem stendur fast meðan allt annað lætur undan.',
  // [4] 2026-09-24: táž výjimka pro zvukový obraz jako EN. Korpus: berst að eyrum 12, byrjaðu þá á 75, því sem heyrist 53,
  // en sést ekki 111. NE „lifir í hljóði“ — „í hljóði“ = mlčky. is-grammar-qa čisté (W001 u „byrjaðu“ = šum rozkazovacího tvaru).
  'Byrjaðu á því sem myndin felur undir yfirborðinu, óséð enn. Ef myndin berst að eyrum, byrjaðu þá á því sem heyrist en sést ekki.',
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
  'Address {name} once in the middle, as a recognition rather than an introduction.',
  'Let the name {name} arrive late, near the close, as a quiet recognition.',
  'This time do not use the name {name} at all — let the reading stand without it.',
];
const NAME_PLACEMENTS_IS = [
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
      // Misto z jadra (2026-09-19): bez zaznamu by ho rekonstrukce hadala — tyz duvod jako
      // u cocky. Obraz se o segment mista ZKRATI, at mereni obrazu nezacne pocitat mista.
      var pmark = isIs ? '. Þetta á sér stað ' : '. Where: ';
      var pi = out.image ? out.image.indexOf(pmark) : -1;
      if (pi > 0) {
        out.place = out.image.slice(pi + pmark.length).trim();
        out.image = out.image.slice(0, pi).trim();
      }
    }

    // Cocka zivotni runy (2026-09-19, handoff CODE-read): `readings.life_rune` rika jen,
    // jakou runu clovek MA — ne jestli cocka v TOMHLE cteni bezela (prepinac, runa=tazena,
    // pro-nekoho). Rekonstrukce ji pak hada; CODE-read se tak spletl u Isa df160bfb.
    // Kotva = zacatek bloku _lensContext, jednoznacny v obou recich.
    out.lens = p.indexOf(isIs ? 'LOKALINSA — lífsrúnin' : 'CLOSING LENS — the life rune') !== -1 ? 1 : 0;

    var heavyP = isIs ? ENDING_HEAVY_IS : ENDING_HEAVY;
    var openP  = isIs ? ENDING_OPEN_IS  : ENDING_OPEN;
    var najdi = function (pool, znacka) {
      for (var j = 0; j < pool.length; j++) {
        var casti = pool[j].split('{L}');
        var a = p.indexOf(casti[0]);
        if (a === -1) continue;
        if (casti.length < 2 || p.indexOf(casti[1], a + casti[0].length) !== -1) return znacka + j;
      }
      return null;
    };
    out.ending = najdi(heavyP, 'heavy') || najdi(openP, 'open') || undefined;
    // ZDROJ volby tvaru (rejstrik vs los) se sem NEZAPISUJE: `seeking` uz lezi v DB u ctení
    // (claude-proxy uklada journal.seeking), takze se dopocita spojenim s `ending` — druha
    // kopie by se rozesla (§20). Z promptu sameho ho precist nejde: hlavicka „Seeking:" byla
    // odebrana 2026-09-08 a rejstrik se projevuje jen vetou z `_registerContext`.

    // Delka (2026-09-20, KUKY: "delku taky dodelej"): losuje se 3 vs 4 vety, ale v draws
    // NEBYLA — nezaznamenany confounder mereni (kam dosedne konec/most zavisi na vete
    // navic; nalez CODE-tune). Index do LENGTH_BUDGETS(_IS); kotva = cely radek losu.
    var buds = isIs ? LENGTH_BUDGETS_IS : LENGTH_BUDGETS;
    for (var b = 0; b < buds.length; b++)
      if (p.indexOf(buds[b]) !== -1) { out.len = b; break; }

    // Esencni ram (2026-09-20): ktere ze dvou zneni padlo. Tyz vzor jako `ending` a `len`.
    var rams = isIs ? ESSENCE_FRAMES_IS : ESSENCE_FRAMES;
    for (var e2 = 0; e2 < rams.length; e2++)
      if (p.indexOf(rams[e2]) !== -1) { out.essence = e2; break; }
    // Prazdna runa ma ram odvozeny z runy, ne z losu (2026-09-22) — zapis ho, jinak by u Blank
    // chybel vstup a mereni by ho nevidelo (tataz trida vady jako `len` do 2026-09-20).
    if (out.essence === undefined && p.indexOf(isIs ? ESSENCE_BLANK_IS : ESSENCE_BLANK) !== -1) out.essence = 'blank';

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
// MOST K CLOVEKU (2026-09-20, handoff CODE-read; owner schvalil). Do v4.32 drzel konec
// OBRAZ („End on a plain, steady line from the image“) — a ctenar, ktery vstupy nevidi,
// z nej nevedel nic: KUKY nad „care alone cannot settle what remains unspoken“: „je to hodne
// metaforicke, me z toho nic moc na povrch nevystupuje, nejsem schopny rict cemu to patri.“
// Most pojmenuje, co to MUZE byt v jeho zivote — jako STAV k zvazeni, nikdy jako rada.
// Merene CODE-read produkcnim modelem: veta 6/6 moznost a 0/6 rada · dve moznosti 3/3 ·
// tezka verze 3/3 · otazka 6/6, ale 2/6 navadi — to je ZNAMA VADA, hlidat pri prvnim mereni.
// ⚠ Znalost, ktera stala dva pokusy: verze bez „may be“ („…without comfort and without
// softening“) zabila tvar moznosti 2/2 — „may be so“ v kazdem tvaru MUSI zustat.
// Tezke runy (HEAVY_RUNES) sem losuji misto OPEN. Jedine zneni = zatim bez losu; druhy
// tvar smi pribyt, az bude zmereny (owner o tom vi).
// ── MOST K CLOVEKU (2026-09-20, KUKY) ─────────────────────────────────────────
// Konec pojmenuje, co to MUZE byt v zivote leitandy — jako stav k zvazeni, nikdy rada.
// TVAR urcuje rejstrik (SEEK_SHAPE), CIL urcuje oblast ({L} = BRIDGE_AREAS). Oba pooly maji
// tytez TRI tvary ve stejnem poradi, takze tvar = index a tezkost = jen volba poolu:
//   [0] veta · [1] dve moznosti · [2] otazka
// „may be" musi zustat v KAZDEM tvaru — zneni bez nej zabilo tvar moznosti 2/2 (DECISIONS
// 2026-09-20 (4)). Otazkovy tvar navadi 2/6 (CODE-read) — znama vada, hlidat pri mereni.
const ENDING_OPEN = [
  "End on one line that names what this may be {L} \u2014 a state that may be so, offered for them to weigh; it names how things may stand, never what to do about it.",
  "End on one line that holds out two things this may be {L}, each a state that may be so, left for them to weigh.",
  "End on one question that holds out what this may be {L} \u2014 asked as a possibility they can weigh, never as something you know about them.",
];
// Tezke zneni TYCHZ tri tvaru: drzi „may be", ubira jen utechu (RUNAR_DESIGN „Stavba Single
// cteni" bod 3). Bere je tezka runa (HEAVY_RUNES) i rejstrik „Insight into Challenge".
const ENDING_HEAVY = [
  "End on one line that names what this may be {L} \u2014 a state that may be so, said plainly, without comfort or softening.",
  "End on one line that holds out two things this may be {L}, each a state that may be so \u2014 said plainly, without comfort or softening.",
  "End on one question that holds out what this may be {L} \u2014 asked as a possibility they can weigh, said plainly; no comfort, nothing softened.",
];
const ENDING_OPEN_IS = [
  'Endaðu á einni línu sem nefnir hvað þetta gæti verið {L} — ástand sem gæti átt við, honum til umhugsunar; hún nefnir hvernig hlutirnir gætu staðið, aldrei hvað skuli gera.',
  'Endaðu á einni línu sem nefnir tvennt sem þetta gæti verið {L}, hvort um sig ástand sem gæti átt við, honum til umhugsunar.',
  'Endaðu á einni spurningu sem spyr hvað þetta gæti verið {L} — sem möguleika sem hann getur vegið og metið, aldrei sem eitthvað sem þú veist um hann.',
];
const ENDING_HEAVY_IS = [
  'Endaðu á einni línu sem nefnir hvað þetta gæti verið {L} — ástand sem gæti átt við, sagt umbúðalaust; engin huggun, ekkert mildað.',
  'Endaðu á einni línu sem nefnir tvennt sem þetta gæti verið {L}, hvort um sig ástand sem gæti átt við — sagt umbúðalaust, engin huggun, ekkert mildað.',
  'Endaðu á einni spurningu sem spyr hvað þetta gæti verið {L} — sem möguleika sem hann getur vegið og metið, sagt umbúðalaust; engin huggun, ekkert mildað.',
];
// ─── Rozpocet delky (single) ──────────────────────────────────
// Dve delky, losuje se per cteni. Neni to jen o poctu slov: pri jinem rozpoctu musi model
// stavet vetu jinak, takze tataz runa zni podruhe jinak — pestrost skoro zadarmo.
// Mereno 2026-08-20: tri-vetny rozpocet dal 3 vety ve 4 ze 4 (45-52 slov), ctyr-vetny
// 4 vety v 7 z 8 (56-66 slov). Zadny prekryv — paka drzi ostre.
// Cas nahlas je duvod, proc jsou rozpocty prave dva a ne rozsah: 20-25 s proti 28-33 s.
// 2026-09-20 (KUKY: „4 vety"): pool ma JEDNU polozku — trivety rozpocet odesel, protoze
// los 3/4 delal polovinu cteni o vetu kratsi, nez rika stavba ctyr vet (scena · scena o krok
// dal · esence · most). Trivete zneni je v gitu (v4.34) a vraci se pridanim radky.
const LENGTH_BUDGETS = [
  'One flowing reading — 4 short sentences, 50 to 58 words total. It will be read aloud, so keep every sentence lean — about 28 to 33 seconds spoken. No sections, no labels, no line breaks between thoughts.',
];
const LENGTH_BUDGETS_IS = [
  'Gefðu einn samfelldan lestur — 4 stuttar setningar, 50 til 58 orð alls. Hann verður lesinn upphátt, svo hafðu hverja setningu létta — um 28 til 33 sekúndur. Engar fyrirsagnir, engar hlutaskiptingar.',
];
// ── ESENCNI RAM (2026-09-20) — dve zneni teze instrukce, losuje se per cteni.
// [0] = dosavadni produkcni zneni (bylo v VOICE_PROFILES.focused.rules.describe, presunuto
//       sem k ostatnim losovanym pokynum promptu — §18: los patri k losum, ne k profilu hlasu)
// [1] = „runa kona": runa je PODMET slovesa cinnosti a jmenuje se v teze vete
const ESSENCE_FRAMES = [
  'THE ESSENCE LINE: after the picture, one short line that says what the rune DOES through this image — its sense in plain words a stranger to runes can grasp. The familiar word may live inside the doing ("exchange between the sea and the shore"). Never a fixed formula. No invented mechanism, no fate. Never tell the seeker what it means for them.',
  'THE ESSENCE LINE: after the picture, one short line where the rune — named here, once — is the one doing something in that scene: it moves, holds, opens, carries. Plain words a stranger to runes can grasp. No invented mechanism, no fate. Never tell the seeker what it means for them.',
];
const ESSENCE_FRAMES_IS = [
  'KJARNALÍNAN: á eftir myndinni kemur ein stutt lína sem segir hvað rúnin GERIR í gegnum þessa mynd — merking hennar með hversdagslegum orðum sem ókunnugur skilur. Kunnuglega orðið má lifa inni í myndinni. Aldrei föst formúla. Engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.',
  'KJARNALÍNAN: á eftir myndinni kemur ein stutt lína þar sem rúnin — nefnd þar einu sinni — er sú sem gerir eitthvað í myndinni. Hún hreyfir, heldur, opnar eða ber. Hversdagsleg orð sem ókunnugur skilur. Engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.',
];
// PRAZDNA RUNA (2026-09-22, KUKY „udelej" + popis runy v RUNAR_POPISY_RUN.md): oba ramy vyse
// rikaji, co runa DELA — [1] dokonce „runa je ta, ktera v te scene neco dela". U Blank to vyrabi
// presne to, co popis zakazuje: „Nehledej vyznam tam, kde zatim zadny neni." Doklad: cteni
// 2026-09-22 15:13 „Blank holds the line still there". Neni to los — ram plyne z runy, takze
// se nelosuje a v `_promptDraws` se zapise jako essence = 'blank'.
// Jen SINGLE: spready esencni radek nemaji od v4.9 a jmena run v textu nerikaji, takze tam
// ten rozpor nevznika (§13 — cesta zvazena, ne zapomenuta).
const ESSENCE_BLANK = 'THE ESSENCE LINE: after the picture, one short line that names the Blank once — the stone that bears no mark. It has no meaning in itself; the line leaves that empty place open instead of filling it. Plain words a stranger to runes can grasp. No invented mechanism, no fate. Never tell the seeker what it means for them.';
const ESSENCE_BLANK_IS = 'KJARNALÍNAN: á eftir myndinni kemur ein stutt lína sem nefnir auðu rúnina einu sinni — steininn sem ekkert merki ber. Hún hefur enga merkingu í sjálfu sér; línan lætur auða rýmið standa opið í stað þess að fylla það. Hversdagsleg orð sem ókunnugur skilur. Engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.';
function _essenceFrame(lang, rune) {
  if (rune && rune.n === 'Blank') return lang === 'is' ? ESSENCE_BLANK_IS : ESSENCE_BLANK;
  var pool = lang === 'is' ? ESSENCE_FRAMES_IS : ESSENCE_FRAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function _lengthBudget(lang) {
  var pool = lang === "is" ? LENGTH_BUDGETS_IS : LENGTH_BUDGETS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Kam most dosedne — poradi = AREAS.en (runar-config.js). Bez oblasti zustava obecny cil.
// 2026-09-23: rodina a rozcestí tu stály jako MÍSTO, stejně jako v _domainContext — a totéž slovo dvakrát v promptu
// se opisovalo (Thurisaz končil „…than the people in it can bear“). Přepsáno spolu s oblastmi, DECISIONS 2026-09-23 (12).
const BRIDGE_AREAS = [
  'between the seeker and someone',
  'in where the seeker is going',
  'in what the seeker is making',
  "in the seeker's mending and rest",
  "in what is present in the seeker's life but not shown",
  "in the seeker's family ties",
  'in a slow change in the seeker',
  "in a decision the seeker has not yet made",
];
const BRIDGE_AREAS_IS = [
  'milli leitandans og einhvers annars',
  'í því hvert leitandinn stefnir',
  'í því sem leitandinn er að smíða',
  'í gróanda leitandans og hvíld',
  'í því sem er til staðar í lífi leitandans en sést ekki',
  'í fjölskylduböndum leitandans',
  'í hægri breytingu hjá leitandanum',
  'í ákvörðun sem leitandinn hefur ekki enn tekið',
];
const BRIDGE_DEFAULT = { en: "in the seeker's life", is: 'í lífi leitandans' };

// Tvar podle rejstriku — poradi = SEEKS.en: General · Clarity · Confirmation ·
// Insight into Challenge · Reflection. `null` = los ze tri tvaru (tak to bezelo do 2026-09-20).
// `h:true` u „Insight into Challenge" = tezke zneni i u LEHKE runy: kdo si rekne o vhled do
// tezkosti, nema dostat utechu. Tezka runa pak jen vynuti h, tvar nemeni.
const SEEK_SHAPE = [null, { i: 0, h: false }, { i: 1, h: false }, { i: 0, h: true }, { i: 2, h: false }];

function _bridgeTarget(area, lang) {
  var seznam = lang === 'is' ? BRIDGE_AREAS_IS : BRIDGE_AREAS;
  var vsechny = (typeof AREAS !== 'undefined' && AREAS && AREAS[lang]) ? AREAS[lang] : null;
  var i = vsechny ? vsechny.indexOf(area) : -1;
  return (i >= 0 && seznam[i]) ? seznam[i] : BRIDGE_DEFAULT[lang === 'is' ? 'is' : 'en'];
}

function _endingShape(drawn, lang, seeking, area) {
  var list = (Array.isArray(drawn) ? drawn : [drawn]).filter(Boolean);
  var heavy = false;
  if (typeof HEAVY_RUNES !== 'undefined' && HEAVY_RUNES && HEAVY_RUNES.names)
    for (var i = 0; i < list.length; i++)
      if (HEAVY_RUNES.names.indexOf(list[i].n) !== -1) { heavy = true; break; }

  // Tvar: rejstrik rozhoduje, jinak los. „Insight into Challenge" si bere tezke zneni i u
  // lehke runy; tezka runa naopak vynuti tezke zneni, ale TVAR rejstriku nemeni.
  var seeks = (typeof SEEKS !== 'undefined' && SEEKS && SEEKS[lang]) ? SEEKS[lang] : null;
  var si = seeks ? seeks.indexOf(seeking) : -1;
  var volba = (si >= 0 && SEEK_SHAPE[si]) ? SEEK_SHAPE[si] : null;
  var pocet = (lang === 'is' ? ENDING_OPEN_IS : ENDING_OPEN).length;
  var idx = volba ? volba.i : Math.floor(Math.random() * pocet);
  if (volba && volba.h) heavy = true;

  var pool = heavy ? (lang === 'is' ? ENDING_HEAVY_IS : ENDING_HEAVY)
                   : (lang === 'is' ? ENDING_OPEN_IS : ENDING_OPEN);
  return pool[idx].split('{L}').join(_bridgeTarget(area, lang));
}


// ── OTÁZKA RUNY POD POSLEDNÍ VĚTOU (2026-09-24, KUKY „7. zkus to“) ─────────────────
// Každý ownerův popis runy končí otázkou jen té runy. Konec čtení ji dostane jako ZDROJ, ze kterého
// vyroste, ne jako text k vyslovení (memory prompt-directive-makes-model-copy: sloveso zdroje, ne „použij“).
// Důvod: konec občas vyzněl naprázdno (Algiz 2026-09-23 „cesta se váží“ — tautologie, ani jedna strana
// ownerovy otázky). Pilot na produkčním modelu, týž los s otázkou a bez ní, slepý soudce: konec nese
// otázku runy víc ve 12 z 12 dvojic (EN 6/6, IS 6/6), délka beze změny → RUNAR_DECISIONS 2026-09-24.
// „…vlastními slovy“: bez toho islandština opsala 4+ slov z otázky ve 3 ze 6 čtení, s tím v 1 ze 6
// (Laguz „áður en þú átt orð yfir það“); angličtina 0/6 v obou zněních.
// Zdroj = 4. odstavec textu runy v Kolekci (UI_TEXT[lang].coll_rune) — JEDNO místo (§20), ownerem
// schválené v obou jazycích. Uvozovací část před dvojtečkou („Perhaps it asks:“) se odřízne.
// Jen SINGLE a jen bez vlastní otázky tazatele: když se ptá sám, konec patří jeho otázce (§13 — spready
// a čtení životní runy mají jiný konec a sem nevedou).
function _runeQuestion(rune, lang) {
  if (!rune || typeof UI_TEXT === 'undefined') return '';
  var blok = UI_TEXT[lang === 'is' ? 'is' : 'en'];
  var odst = blok && blok.coll_rune && blok.coll_rune[rune.n];
  var p = odst && odst[3];
  if (!p) return '';
  var i = p.indexOf(':');
  var q = (i !== -1 ? p.slice(i + 1) : p).trim();
  if (!q) return '';
  return lang === 'is'
    ? ' Láttu hana eiga rót í spurningu rúnarinnar („' + q + '“) en segðu hana með þínum eigin orðum.'
    : " Let it grow out of the rune's question (\"" + q + "\"), but say it in your own words.";
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

// Glosa v závorce za islandským jménem („Þurs (Hlið)“) — JEDEN regex pro rnSplit i rnPrompt.
var _GLOSA_RE = /^(.*?)\s*\(([^)]*)\)\s*$/;
function _bezGlosy(jmeno) { var m = _GLOSA_RE.exec(jmeno || ''); return m ? m[1] : (jmeno || ''); }

// rnPrompt() — jméno runy DO PROMPTU (2026-09-24, handoff CODE-read, owner „GPT pojď na to“, krok 1).
// Glosa „(Hlið)“ je pro člověka v rozhraní; model ji opisoval do čtení — gpt-6-sol ve 3 z 5 islandských čtení,
// bez glosy 0 z 5 (Opus 5 0/5 v obou; EVAL_LOG 2026-09-24 (4)). Do promptu tedy holé jméno, rozhraní dál rn().
function rnPrompt(r) { return _bezGlosy(rn(r)); }

// rnSplit() -- jmeno + (preklad) do dvou casti
// IS: 'Fehu (Eignir)' -> {name:'Fehu', tr:'Eignir'} · EN: 'Fehu' -> {name:'Fehu', tr:''}
function rnSplit(r) {
  var full = rn(r);
  var m = _GLOSA_RE.exec(full);
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
// Druhy argument je bud DELKA (cislo), nebo TYP ('ok' / 'err'). Do 2026-09-11 se bral
// vzdy jako delka — a pet volajicich posila typ, takze jim `setTimeout(fn, 'err')` delalo
// 0 ms a hlaska zmizela driv, nez ji sel precist.
// ⚠️ A hlavne: v readeru tenhle toast do 2026-09-11 NEEXISTOVAL vubec — prvek `#toast`
// v HTML nebyl, takze funkce na prvnim radku tise skoncila. 22 volajicich, nula hlasek:
// „ulozeno / neulozeno" u prepinacu soukromi, uplatneni karty, brany na spready.
function showToast(msg, opt) {
  const el = document.getElementById('toast'); if (!el) return;
  const dur = (typeof opt === 'number') ? opt : 3000;
  const typ = (typeof opt === 'string') ? opt : '';
  el.className = 'toast' + (typ ? ' ' + typ : '');
  el.textContent = msg;
  // Pretece-li druha hlaska pres prvni, prvni casovac by tu druhou schoval driv.
  if (el._t) clearTimeout(el._t);
  // Trida `show` az v dalsim ramci — jinak prohlizec prechod nespusti, kdyz se prvek
  // ve stejnem ramci zmenil.
  requestAnimationFrame(function () { el.classList.add('show'); });
  el._t = setTimeout(function () { el.classList.remove('show'); }, dur);
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

