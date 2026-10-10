// ═══════════════════════════════════════════════════════
// RÚNAR · READING
// Core reading flow: prompt builder, generate, stream, reader UI,
// main audio player (cap), voice generation.
// Depends on globals: lang, currentUser, userTier, readerUser,
//   readerRune, readerTexts, activeChar, corrections, sb,
//   RUNAR_MODES, READING_ANGLES, FREE_TRIAL_LIMIT, FREE_REGISTERED_LIMIT,
//   DELAY_TRIAL_END, DELAY_SCROLL, DELAY_ERROR_RESET
// Depends on functions: t(), callProxy(), buildSysPrompt(),
//   getCorrPrompt(), stream(),
//   shouldUseCredit(), canUseVoice(), syncFreeBalance(),
//   loadJournal(), updateAuthUI(), setSt(), showToast(), incTrialCount(),
//   getTrialCount(), EL_PROXY
// (2026-10-09: checkStaticAudio, elVoiceId, elModel, EL_VOICE_SETTINGS ze seznamu pryč — tenhle soubor je nevolá; hlas a model
//  volí server, elevenlabs-proxy.)
// ═══════════════════════════════════════════════════════

// ─── READING CORE ────────────────────────────────────────

// ─── PURE PROMPT BUILDER ─────────────────────────────────────
// Receives everything as parameters — no globals read.
// Returns the full prompt string for _generateReading().
// Fáze A — segmentovaný výstup: parse JSON [{rune,text}]. Fallback: když to není JSON, ber celý text jako jedno čtení.
// 2026-09-28: `_lastDeeper` pryč — `deeper_meaning` žádný prompt nežádá a hodnota se nikde nečetla.
var _lastSegs = [];  // Fáze B1: per-rune [{rune,text}] segments of the last reading (tap highlight)
// Runove OBJEKTY posledniho cteni (single i spread). Napoveda i Ask prompt potrebuji vedet,
// KTERE runy padly — a to `_lastSegs` neumi: jeho jmena psal model do JSON, takze porovnani
// se zivotni runou by viselo na jeho pravopisu. Plni se tam, kde `_lastSegs` (2026-09-10).
var _lastDrawn = [];

// ─── GPT-6 SOL: ROZBOR ČTENÍ (jen admin, KUKY 2026-09-23) ─────────────────────────────
// Owner dosud kopíroval čtení a Ask ručně do chatu s GPT a nechal si ho rozebrat. Tlačítko pošle totéž
// jedním klikem: PŘESNÝ systémový prompt a PŘESNÉ zadání, se kterým čtení vzniklo (_lastGen — bez nich
// GPT nevidí, jaký obraz a úhel Rúnar dostal, a nepozná opsanou větu ze zadání), hotový text a výměny v Asku.
// Jen vlastní čtení v adminově session: cizí čtení k OpenAI nejdou (RUNAR_PRIVACY.md — OpenAI není uvedený
// zpracovatel). Odpověď je česky, protože ji čte owner.
// 2026-09-27 (BACKLOG „Obraz se může zopakovat napříč zařízeními“): obraz z POSLEDNÍHO čtení téže runy z deníku → _imgServerLast
// (character.js), _seasonalImagery ho vyřadí z losu. Sáček a „poslední obraz“ jsou dál v localStorage (per zařízení) — tohle je
// jen pojistka napříč zařízeními. Nikdy nezdrží čtení: při chybě nebo po 1,5 s se jede bez ní (jako dřív).
async function _loadServerLastImage(drawn) {
  _imgServerLast = {};
  if (!currentUser || typeof sb === 'undefined' || !sb || !drawn || !drawn.n) return;
  try {
    var dotaz = sb.from('readings').select('prompt_draws').eq('user_id', currentUser.id).eq('rune_name', drawn.n)
      .order('drawn_at', { ascending: false }).limit(1);
    var res = await Promise.race([dotaz, new Promise(function (ok) { setTimeout(function () { ok(null); }, 1500); })]);
    var row = res && !res.error && res.data && res.data[0];
    var img = row && row.prompt_draws && row.prompt_draws.image;
    if (img) _imgServerLast[drawn.n] = _imgNorm(img);
  } catch (e) {}
}
var _lastGen = null;   // { sys, prompt, lang, kind } posledního vygenerovaného čtení
var _askLog = [];      // [{ q, a, lang }] výměny v Asku k tomuto čtení — od 2026-10-04 předchozí výměna pro další Ask (_askBuild)
// 2026-10-09: rozbor čtení modelem GPT (tlačítko „GPT-6 luna“, edge fn gpt-review) ZRUŠEN 2026-10-09 (KUKY „Lunu už nepoužívám… zrušit úplně“). Rubrika, payload a tlačítko
// žijí v gitu (naposledy commit 893a622), návrat jen očištěný (§26).
// ─── Opus 5 jako čtecí engine (jen admin) — od 2026-10-09 čtou všichni přes GPT-6 sol ─────────────
// 2026-09-24 – 2026-10-08 opačně: přepínač zapínal sol (test, DECISIONS 2026-09-24 (17)). Od 2026-10-09 (KUKY „začínáme
// používat výhradně GPT sol 6 pro čtení. Opus 5 bude přepínač pro adminy“, DECISIONS 2026-10-09 (13)) čte sol každý a
// přepínač vrací adminovi Opus 5 — u všech čtení i Asku, životní runy a rozboru jména.
// Volba žije v localStorage (jen tenhle prohlížeč); READ_ENGINE čtou buildery i callProxy. Ne-admin = vždy sol,
// i kdyby v localStorage něco zůstalo. Server Opus stejně pustí jen adminovi — tohle je pohodlí, ne brána.
// Klíč 'runar_engine' zůstal; hodnota 'sol' z doby testu teď znamená totéž co prázdná (sol).
function _paintOpusToggle() {
  var box = document.getElementById('opus-toggle'), cb = document.getElementById('opus-toggle-cb');
  var admin = !!(currentUser && isAdmin(currentUser.email));
  var on = false;
  if (admin) { try { on = localStorage.getItem('runar_engine') === 'opus'; } catch (e) {} }
  READ_ENGINE = on ? 'opus' : 'sol';
  if (box) box.style.display = admin ? 'flex' : 'none';
  if (cb) cb.checked = on;
}
function toggleOpus(on) {
  if (!(currentUser && isAdmin(currentUser.email))) return;
  try { localStorage.setItem('runar_engine', on ? 'opus' : ''); } catch (e) {}
  _paintOpusToggle();
}
// ─── Výběr obrazu pro admina (2026-10-06, KUKY „přidej výběr obrazu pro admina“) ────────────────────
// Proč a jak se volba použije: komentář u IMG_PIN v runar-character.js. Volba je per runa v localStorage ('runar_img_pin')
// a platí, dokud ji admin nevrátí na „náhodně“ — i ve spreadech, kde ta runa padne. Ne-admin = vždy los (IMG_PIN null).
function _imgPinMapa() { try { return JSON.parse(localStorage.getItem('runar_img_pin') || '{}') || {}; } catch (e) { return {}; } }
function _paintImgPin() {
  var box = document.getElementById('img-pin'), si = document.getElementById('img-pin-img'), sv = document.getElementById('img-pin-vyz');
  var admin = !!(currentUser && isAdmin(currentUser.email));
  IMG_PIN = admin ? _imgPinMapa() : null;
  if (!box) return;
  if (!admin || !readerRune) { box.style.display = 'none'; return; }
  var runa = readerRune.n, isIs = lang === 'is';
  var rows = RUNE_IMAGES.filter(function (row) { return row[0] === runa; });
  var p = IMG_PIN[runa] || {}, row = null;
  for (var i = 0; i < rows.length; i++) if (_imgId(rows[i]) === p.img) row = rows[i];
  var zkr = function (s) { s = String(s || ''); return s.length > 64 ? s.slice(0, 64) + '…' : s; };
  // Ve výběru jsou VŠECHNY obrazy runy, i mimo sezónu (volba sezónu přeskočí). 2026-10-06 (KUKY „chtěl bych tam mít i ty mimo
  // sezónní obrazy“): byly tam, ale jen s kódem „cold/bright“ → čitelná sezóna a značka, který obraz teď los nenabídne.
  var ted = _seasonBucket(new Date().getMonth() + 1);
  var sezona = function (x) {
    var lbl = x[1] === 'cold' ? t('img_pin_cold') : x[1] === 'bright' ? t('img_pin_bright') : '';
    var mimo = (RUNE_IMG_SEASONS[x[1]] || RUNE_IMG_SEASONS.any).indexOf(ted) === -1;
    return (lbl ? ' · ' + lbl : '') + (mimo ? ' · ' + t('img_pin_offseason') : '');
  };
  if (si) {
    si.innerHTML = '<option value="">— ' + escapeHtml(t('img_pin_random')) + ' —</option>' + rows.map(function (x) {
      var id = _imgId(x);
      return '<option value="' + escapeHtml(id) + '"' + (row && _imgId(row) === id ? ' selected' : '') + '>' +
        escapeHtml(zkr(isIs ? x[2] : x[3]) + sezona(x)) + '</option>';
    }).join('');
  }
  var alt = row ? String(row[isIs ? 4 : 5] || '').split('|') : [];
  if (sv) {
    sv.style.display = alt.length > 1 ? '' : 'none';
    sv.innerHTML = '<option value="">' + escapeHtml(t('img_pin_vyz_auto')) + '</option>' + alt.map(function (a, i) {
      return '<option value="' + i + '"' + (String(p.vyz) === String(i) ? ' selected' : '') + '>' + escapeHtml(a.trim()) + '</option>';
    }).join('');
  }
  box.style.display = 'flex';
}
function setImgPin() {
  if (!(currentUser && isAdmin(currentUser.email)) || !readerRune) return;
  var si = document.getElementById('img-pin-img'), sv = document.getElementById('img-pin-vyz');
  var m = _imgPinMapa(), img = si ? si.value : '';
  if (img) m[readerRune.n] = { img: img, vyz: (m[readerRune.n] && m[readerRune.n].img === img && sv) ? sv.value : '' };
  else delete m[readerRune.n];
  try { localStorage.setItem('runar_img_pin', JSON.stringify(m)); } catch (e) {}
  _paintImgPin();
}
// Co si prompt vylosoval + značka, že obraz zvolil admin (los to nebyl — databáze čtení ho označí 📌).
function _drawsSPinem(prompt, lang) {
  var d = _promptDraws(prompt, lang);
  if (d && typeof _imgPinPouzit !== 'undefined' && _imgPinPouzit) d.pin = 1;
  return d;
}
// ─── Složení čtení pro report (jen admin, 2026-09-25) ───────────────────────────────────
// KUKY (report 08:41): „líbilo by se mi vidět v reportu jen pro adminy, z čeho se to čtení složilo“. Čte se zpětně
// z hotového promptu (_promptDraws — tentýž zápis, který jde do DB), takže je to přesně to, co model dostal.
// Štítky anglicky: čtou ho oba admini (owner i Sigrún); je to meta, ne text pro uživatele.
function _slozeniCteni() {
  if (!_lastGen || !(currentUser && isAdmin(currentUser.email))) return '';
  var L = _lastGen.lang, isIs = L === 'is', d = _promptDraws(_lastGen.prompt, L) || {};
  var out = ['[READING COMPOSITION — admin]',
    'model: ' + (_lastGen.model || '?') + ' · prompt ' + RUNAR_PROMPT_VERSION + ' · ' + _lastGen.kind + ' · ' + L];
  if (_lastGen.usage && costLabel(_lastGen.usage)) out.push('cost: ' + costLabel(_lastGen.usage));   // 2026-09-29
  // id čtení = spojka report ↔ čtení v DB, 2026-09-25 (do 2026-10-09 i ↔ rozbor GPT v tabulce gpt_reviews — rozbor zrušen, data zůstala)
  if (_lastReadingId) out.push('reading id: ' + _lastReadingId);
  var ang = isIs ? READING_ANGLES_IS : READING_ANGLES;
  if (typeof d.angle === 'number') out.push('angle: ' + ang[d.angle]);
  if (d.image) out.push('image: ' + d.image + (d.place ? ' (place: ' + d.place + ')' : ''));
  var ai = (typeof _areaIdx === 'function' && readerUser) ? _areaIdx(readerUser.area) : -1;
  if (typeof d.area_face === 'number' && ai >= 0) out.push('area face: ' + AREA_FACES[ai][d.area_face][isIs ? 'is' : 'en'][0]);
  if (d.ending) {
    var tvar = ['one line', 'two possibilities', 'a question', 'tension (both at once)', 'return to their question'][Number(String(d.ending).slice(-1))] || d.ending;
    out.push('ending: ' + tvar + (String(d.ending).indexOf('heavy') === 0 ? ' (heavy — no comfort)' : ''));
  }
  if (d.essence !== undefined) out.push('essence line: ' + (d.essence === 'blank' ? 'Blank' : ['what the rune does', 'the rune named by the meaning in the picture'][d.essence]));
  if (d.kws) out.push('keywords: ' + d.kws);
  out.push('life-rune lens: ' + (d.lens ? 'yes' : 'no'));
  if (_lastGen.kind === 'single') out.push('rune question under the ending: ' + (/grow out of the rune|eiga rót í spurningu/.test(_lastGen.prompt) ? 'yes' : 'no'));
  return out.join('\n');
}
// ─── HLAVIČKA ČTENÍ: tažená runa + volby čtení (2026-09-23) ─────────────────────────────
// KUKY 2026-09-23: „vedle vybrané runy by se mělo zobrazit, co si uživatel vybere — AREA, SEEKING,
// INTENTION“ (poprvé v reportu 2026-09-21). Volby se berou jako INDEXY v okamžiku čtení: pilulky
// si člověk mezitím může přepnout pro další čtení, a řádek má říkat, s čím vzniklo TOHLE čtení.
// Popisek se skládá až při kreslení, v aktuálním jazyce — proto přežije přepnutí jazyka.
// Hlavičku kreslí JEN _paintReadingHeader(). Do 2026-09-23 ji updateUIText() při přepnutí jazyka
// přepsal na „✦ RÚNAR SPEAKS“ (single) nebo na jméno výkladu (Kriz/Horseshoe/Yggdrasil) a glyf tažené
// runy zmizel — porušení §14 (updateUIText smí jen statické texty), nalezeno při této práci.
var _hdr = null;   // null = žádné hotové čtení · {lblId, runes, single, cast:{area,seeking,intention}}
var _SPREAD_LBL = { norns: 's3-norns-lbl', kriz: 's5-kriz-lbl', horseshoe: 's7-horseshoe-lbl', yggdrasil: 's9-yggdrasil-lbl' };
function _castIdx(u) {
  var c = {};
  [['area', typeof AREAS === 'undefined' ? null : AREAS],
   ['seeking', typeof SEEKS === 'undefined' ? null : SEEKS],
   ['intention', typeof INTENTIONS === 'undefined' ? null : INTENTIONS]].forEach(function (p) {
    var v = u && u[p[0]], D = p[1];
    if (!v || !D) return;
    var i = (D.en || []).indexOf(v);
    if (i === -1) i = (D.is || []).indexOf(v);
    c[p[0]] = i >= 0 ? i : v;   // mimo seznam (volný text) zůstává, jak je
  });
  return c;
}
function _castLineHtml(cast) {
  if (!cast) return '';
  var casti = [['area', typeof AREAS === 'undefined' ? null : AREAS],
               ['seeking', typeof SEEKS === 'undefined' ? null : SEEKS],
               ['intention', typeof INTENTIONS === 'undefined' ? null : INTENTIONS]].map(function (p) {
    var v = cast[p[0]], D = p[1];
    if (v === undefined || v === null || v === '') return '';
    if (typeof v === 'number') return (D && (D[lang] || D.en || [])[v]) || '';
    return String(v);
  }).filter(Boolean);
  if (!casti.length) return '';
  return '<span class="rlbl-cast">' + casti.map(escapeHtml).join(' · ') + '</span>';
}
function _paintReadingHeader() {
  var l1 = document.getElementById('layer1-lbl');
  // Odznak životní runy nese jméno v jazyce UI → po přepnutí jazyka překreslit (dřív zůstalo v tom starém).
  var _bd = document.getElementById('reader-badge');
  if (_bd && _bd.style.display !== 'none' && typeof readerUser !== 'undefined' && readerUser && readerUser.lifeRune) _renderLifeBadge(readerUser.lifeRune);
  Object.keys(_SPREAD_LBL).forEach(function (m) {
    var el = document.getElementById(_SPREAD_LBL[m]);
    if (el && !(_hdr && _hdr.lblId === _SPREAD_LBL[m]) && m !== 'norns') el.textContent = '✦ ' + t('spread_mode_' + m);
  });
  if (!_hdr) { if (l1) l1.textContent = t('layer1_lbl'); return; }
  var el = document.getElementById(_hdr.lblId);
  if (!el) return;
  var runy = _hdr.runes.map(function (r, i) {
    return '<span class="rlbl-glyph" data-rune="' + rn(r) + '" data-kw="' + rk(r) + '" data-seg="' + i + '">' + runeSvg(r, { frame: true, cls: 'rlbl-stone' }) + '</span>';
  });
  el.innerHTML = _hdr.single
    ? runy[0] + '<span class="rlbl-name">' + rn(_hdr.runes[0]).toUpperCase() + '</span>' + _castLineHtml(_hdr.cast)
    : runy.join('<span class="rlbl-sep">·</span>') + _castLineHtml(_hdr.cast);
  el.classList.remove('pulsing');
  if (!_hdr.single && l1) l1.textContent = t('layer1_lbl');
}
// _parseSegments lives in runar-character.js now (shared reader+shrine, §18/§20 —
// same reason the reading-prompt builders do). character.js loads before this file,
// so callers below still see it as a global.

// Fáze B1: re-render the reading as per-rune spans so a tap can gild one segment.
// innerText is unchanged (spans add no text) -> voice + displayed text identical.
// Only for spreads (2+ segments); a single rune stays plain.
function _renderSegments(elId, segs) {
  var el = document.getElementById(elId);
  if (!el || !segs || segs.length < 2) return;
  el.innerHTML = '';
  segs.forEach(function (sg, i) {
    if (i) el.appendChild(document.createTextNode(' '));
    var span = document.createElement('span');
    span.className = 'rseg';
    span.setAttribute('data-seg', String(i));
    span.textContent = sg.text;
    el.appendChild(span);
  });
}

// One source for reading-flow error copy (§18). claude-proxy vrací víc kódů (too_long, unauthorized, overloaded, empty,
// unavailable, ask_limit…); vlastní text mají jen tři níž, zbytek dostane err_generic. ⚠️ Patří sem i `unauthorized` —
// návštěvník po tahu runy čte „Rúnar odpočívá, zkus to znovu“, ačkoli mu čtení nepřijde nikdy (RUNAR_BACKLOG.md
// „Kontrola architektury“, část 1 bod 3). Do 2026-10-09 tu stálo „claude-proxy returns only rate_limited | no_credits“.
function _readingErrMsg(errorType) {
  if (errorType === 'rate_limited')  return t('err_rate_limited');
  if (errorType === 'no_credits')    return tp('err_no_credits', { card: vl('card', lang) });
  if (errorType === 'monthly_limit') return t('err_monthly_limit');
  return t('err_generic');
}

// Life rune badge = quiet lens line. Shared by single + spread render (fixes the
// spread stale-rune bug: badge shows the user-level life rune, not a leftover drawn rune).
function _renderLifeBadge(life) {
  var badge = document.getElementById('reader-badge');
  if (!badge) return;
  if (life) {
    var g = document.getElementById('badge-life-g');
    var n = document.getElementById('badge-life-name');
    var note = document.getElementById('badge-life-note');
    // KÁMEN (KUKY 2026-09-23: „změnit glyf životních run na naše glyfy“) — dřív holá linka podle §5 z 2026-07-14.
    if (g) {
      // 2026-10-07 (hlášení e9897395, Android Chrome: „když kliknu na glyf runy, problikne i celý text vedle… normálně reaguje jen
      // glyf“): do té doby byl klepací (rlbl-glyph) sám #badge-life-g — prvek flex řádku. Teď je klepací glyf VNOŘENÝ inline span
      // jako v hlavičce čtení (_paintReadingHeader výš) a řádek má vypnuté zvýraznění klepnutí (runar-reader.css .badge-life).
      g.classList.remove('rlbl-glyph'); g.removeAttribute('data-rune'); g.removeAttribute('data-kw');
      var gl = document.createElement('span');
      gl.className = 'rlbl-glyph';
      gl.setAttribute('data-rune', rn(life));
      gl.setAttribute('data-kw', rk(life));
      gl.innerHTML = runeSvg(life, { frame: true, cls: 'badge-stone' });
      g.textContent = '';
      g.appendChild(gl);
      // 2026-09-25 (reporty KUKY: okno s významem po klepnutí + „stejné vlastnosti jako ty ostatní“): TÁŽ třída
      // `rlbl-glyph` jako glyfy v textu čtení (a jako životní runa ve stromě, runar-tree.js) — dá okno s významem
      // (runar-rune-popup.js), kurzor i jemné ztmavnutí při najetí (runar-reader.css). Bez data-seg: životní runa
      // v textu čtení segment nemá, zvýraznění textu se přeskočí.
    }
    if (n) n.textContent = rn(life);
    if (note) note.textContent = t('badge_life_note');
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

async function _generateReading() {
  if (!readerRune) return;
  if (!currentUser) { _showVisitorJoin(); return; }   // návštěvník: výzva k registraci, ne volání proxy (2026-10-10, viz _showVisitorJoin)
  _hideAllSpreadOutputs();  // isolate: no stale spread pane lingers over a single reading
  const vBtn = document.getElementById('btn-generate-voice');
  vBtn.disabled = true; vBtn.textContent = t('voice_btn');
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = ''; setSt('st-voice', '');
  document.getElementById('out-short').innerHTML = '';
  document.getElementById('out-deep').innerHTML  = '';
  _clearThought();
  const _rdLoadEl = document.getElementById('reading-loading');
  const _rdLoadTxt = document.getElementById('reading-loading-txt');
  if (_rdLoadTxt) _rdLoadTxt.textContent = t('reading_loading');
  // Heslo zrcadla pod labelem — losuje se pri KAZDEM startu cteni (reporty #5/#6 2026-09-21:
  // "rict mu, ze cteni je obraz, zrcadlo… nejlepe pred tim nez runar vytvori cteni").
  _paintLoadingMotto();
  if (_rdLoadEl) _rdLoadEl.style.display = 'block';
  var _aqS = document.getElementById('ask-runar'); if (_aqS) _aqS.style.display = 'none';
  var _pL1 = document.getElementById('layer1-lbl');
  var _pL2 = document.getElementById('layer2-lbl');
  // Unified: hide layer2 + clear label before API call
  var _preL2 = document.getElementById('single-layer2');
  if (_preL2) _preL2.style.display = 'none';
  _hdr = null;
  if (_pL1) { _pL1.textContent = ''; _pL1.classList.add('pulsing'); }
  if (_pL2) _pL2.classList.add('pulsing');

  const u = readerUser, drawn = readerRune;
  var _castNow = _castIdx(u);
  const sys = buildSysPrompt(activeChar, lang);
  await _loadServerLastImage(drawn);   // 2026-09-27: obraz z posledního čtení téže runy (jakékoli zařízení) → los ho vyřadí
  var prompt = buildReadingPrompt(u, drawn, lang, corrections);
  var _thL = _thoughtFor('SINGLE', [drawn], lang); if (_thL) prompt += '\n' + _thL;   // 2026-09-30: myšlenka ✦ (Standard/Premium)
  // 2026-10-04 (audit promptu bod 2): připomínka délky s číslem ÚPLNĚ na konci — za ✦ (Anthropic k Opusu 5, viz _lengthReminder).
  var _dR = _lengthReminder(lang); if (_dR) prompt += '\n' + _dR;
  _lastGen = { sys: sys, prompt: prompt, lang: lang, kind: 'single' };   // pro rozbor GPT-6 sol (jen admin)

  // Journal meta for the SERVER-SIDE save (proxy saves it right after the deduction; two writes, not atomic).
  // Only for a logged-in user saving their own reading; null = do not save.
  // 'someone' readings are stored only for TESTERS (test data for the shrine) — a normal user's
  // third-party reading is never stored (that person never consented). Journal filters them out.
  var _journal = (currentUser && (_readingMode === 'mine' || isTester)) ? {
    kind: 'single', id: _uuid(), rune_name: drawn.n, rune_glyph: drawn.g, lang: lang,
    area: u.area || null, aol: u.area || null, seeking: u.seeking || null, intention: u.intention || null,
    question: u.question || null, life_rune: (u.lifeRune && u.lifeRune.n) || null,
    prompt_version: RUNAR_PROMPT_VERSION, address: userGender, reading_mode: _readingMode,
    // Co si prompt vylosoval (úhel · obraz · tvar konce · umístění jména). Bez toho
    // nejde u reálného čtení říct, která páka za výsledek může — viz _promptDraws.
    draws: _drawsSPinem(prompt, lang)
  } : null;
  _lastReadingId = null;
  const res = await callProxy(sys, prompt, RUNAR_MODES.quick_reading.max_tokens, shouldUseCredit(), SPREAD_COSTS.single.credits, _journal);
  if (_lastGen && res && res.model) _lastGen.model = res.model;
  if (_lastGen && res && res.usage) _lastGen.usage = res.usage;   // 2026-09-29: cena čtení do reportu (costLabel)   // skutečný model (sol může spadnout na Opus) — složení v reportu
  _lastReadingId = (res && res.reading_id) || (_journal ? _journal.id : null);
  if (_journal && res && !res.error && res.text && !res.reading_id) _pendAdd('pendingReadings', { id: _journal.id, journal: _journal, model_text: res.text });
  _flushPending();
  if (res.error === 'rate_limited') {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    setSt('st-reader', _readingErrMsg('rate_limited'), 'err');
    return;
  }
  if (res.error === 'no_credits') {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    document.getElementById('out-short').innerHTML = '';
    document.getElementById('out-deep').innerHTML  = '';
    setSt('st-reader', _readingErrMsg('no_credits'), 'err');
    if (currentUser) { syncFreeBalance(currentUser.id); await fetchUserProfile(currentUser.id); }
    return;
  }
  if (res.error) {
    if (_rdLoadEl) _rdLoadEl.style.display = 'none';
    if (_pL1) _pL1.classList.remove('pulsing');
    if (_pL2) _pL2.classList.remove('pulsing');
    console.error('reading failed:', res.error, res.status || '');
    setSt('st-reader', _readingErrMsg(res.error), 'err');
    if (currentUser) { syncFreeBalance(currentUser.id); await fetchUserProfile(currentUser.id); }
    return;
  }

  // Unified reading — single block, no split
  var _seg = _parseSegments(res.text);
  var _th = _splitThought(_seg.reading.trim(), _seg.segs);   // 2026-09-30: řádek ✦ zvlášť — ne do textu čtení ani do hlasu
  const reading = _th.reading;
  _lastSegs = _th.segs;
  _lastDrawn = [readerRune];
  readerTexts[lang] = { short: reading, deep: '' };

  // Count reading — anonymous trial or logged-in free tier
  if (!currentUser) {
    incTrialCount();
    updateAuthUI();
  } else {
    // Journal is saved SERVER-SIDE by the proxy (right after the credit deduction) so a
    // charged reading is always journaled — even if the app is backgrounded before this
    // point. Here we only refresh local views: tree log (localStorage) + journal + balance.
    if (_readingMode === 'mine') {
      recordTreeReading('single', [readerRune], readerUser.area, readerUser.intention);
      loadJournal();
    }
    await syncFreeBalance(currentUser.id);
  }

  if (_rdLoadEl) _rdLoadEl.style.display = 'none';
  if (_pL1) _pL1.classList.remove('pulsing');
  if (_pL2) _pL2.classList.remove('pulsing');
  // Show drawn rune as label, stream unified text
  var _ul2 = document.getElementById('single-layer2');
  var _ul1lbl = document.getElementById('layer1-lbl');
  if (_ul2) _ul2.style.display = 'none';
  _hdr = { lblId: 'layer1-lbl', runes: [drawn], single: true, cast: _castNow };
  if (_ul1lbl) _paintReadingHeader();
  await stream('out-short', reading);
  _renderSegments('out-short', _lastSegs);
  _paintThought('out-short', _th.thought);
  _showAsk();
  document.getElementById('out-deep').innerHTML = '';

  // Hlas — povol jen pokud tier dovoluje (viz canUseVoice() + runar-config.js TIERS)
  if (canUseVoice()) {
    vBtn.disabled = false;
    vBtn.style.display = '';
  } else {
    vBtn.disabled = true;
    vBtn.style.display = 'none'; // skrýt úplně — žádný "disabled" button
  }
}

// ─── READER FLOW ─────────────────────────────────────────
// Návštěvník po tahu runy (2026-10-10, DECISIONS 2026-10-10 (1) bod 1 — KUKY „návštěvník po tahu uvidí výzvu k registraci“).
// Proxy nepřihlášeného odmítá od 2026-08-02 (401) a appka mu do té doby po tahu ukázala „Rúnar odpočívá“. Teď runu vidí v hlavičce
// (glyf + jméno; ťuknutím na glyf se otevře její význam, runar-rune-popup.js) a místo čtení kartu trial-end s výzvou stát se
// Rune Seekerem (texty visitor_join_* v _updateTrialTexts). Zkušební počítadlo (getTrialCount) už nic nehradí — návštěvník
// může tahat kolikrát chce, čtení nedostane nikdy.
function _showVisitorJoin() {
  var ld = document.getElementById('reading-loading'); if (ld) ld.style.display = 'none';
  var os = document.getElementById('out-short'); if (os) os.innerHTML = '';
  var vb = document.getElementById('btn-generate-voice'); if (vb) vb.style.display = 'none';
  _hdr = { lblId: 'layer1-lbl', runes: [readerRune], single: true, cast: _castIdx(readerUser) };
  _paintReadingHeader();
  _showTrialEnd();
}
function _showTrialEnd() {
  updateAuthUI();
  const el = document.getElementById('trial-end');
  if (!el) return;
  el.style.display = 'block';
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), DELAY_SCROLL);
}

function startReading() {
  // Rune Seeker without enough for THIS reading is stopped here, before the draw. Single: free reading or ≥ 1 credit.
  // Spread: credits ≥ its price — 2026-10-09 the free reading stopped covering spreads (lacksCredits / shouldUseCredit in
  // runar-app.js, same rule in claude-proxy); until then a spread without credits got through to a 402 after the runes were drawn.
  // Rune Walker / Rune Wanderer / Admin are never blocked here.
  if (lacksCredits((SPREAD_COSTS[_SPREAD_COST_KEY[_spreadMode] || 'single'] || {}).credits)) {
    updateAuthUI();
    setSt('st-setup', _readingErrMsg('no_credits'));
    return;
  }
  var isMine = (_readingMode === 'mine');
  var knownUser = isMine && userName && _lifeRuneNum;
  // Use stored name if own reading and name is known
  var name = knownUser ? userName : document.getElementById('r-name').value.trim();
  if (!name) name = t('name_you');   // §12; 2026-10-10 z UI_TEXT
  // Life rune from DB (own reading) or null (reading for someone else)
  var lifeRune = (isMine && _lifeRuneNum) ? RUNES[_lifeRuneNum - 1] : null;
  readerUser = { name, d: null, m: null, y: null, lifeRune,
    area: readerUser.area || '', seeking: readerUser.seeking || '',
    intention: readerUser.intention || '',
    question: document.getElementById('r-question').value.trim() };
  document.getElementById('reader-hero').classList.add('hidden');
  document.getElementById('reader-setup').style.display = 'none';
  document.getElementById('reader-rune-card').style.display = 'block';
  document.getElementById('reader-output').style.display = 'none';
  buildGrid(); setSt('st-setup', ''); setSt('st-reader', '');
}



var _readingMode  = 'mine';   // 'mine' = personal reading, 'someone' = for another person
var _spreadMode   = 'single';
var _spread3Runes = [];
var _spread5Runes = [];
var _spread7Runes = [];   // Horseshoe (7 runes)
var _spread9Runes = [];   // Yggdrasil (9 worlds)
// ─── SPREAD MODE ─────────────────────────────────────────
function _setSpreadMode(mode) {
  _clearThought();   // 2026-09-30 (§13)
  _spreadMode   = mode;
  _spread3Runes = [];
  _spread5Runes = [];
  _spread7Runes = [];
  _spread9Runes = [];
  readerRune    = null;
  // Toggle mode buttons
  var btnSingle  = document.getElementById('mode-btn-single');
  if (btnSingle)  btnSingle.classList.toggle('active', mode === 'single');
  var btnKriz  = document.getElementById('mode-btn-kriz');
  var btnNorns = document.getElementById('mode-btn-norns');
  if (btnKriz)  btnKriz.classList.toggle('active', mode === 'kriz');
  if (btnNorns) btnNorns.classList.toggle('active', mode === 'norns');
  var btnHorseshoe = document.getElementById('mode-btn-horseshoe');
  var btnYggdrasil = document.getElementById('mode-btn-yggdrasil');
  if (btnHorseshoe) btnHorseshoe.classList.toggle('active', mode === 'horseshoe');
  if (btnYggdrasil) btnYggdrasil.classList.toggle('active', mode === 'yggdrasil');
  // Reset output
  _hideAllSpreadOutputs();
  document.getElementById('reader-rune-card').style.display = 'block';
  document.getElementById('reader-output').style.display    = 'none';
  _updateSpread3Slots();
  _updateSpread5Slots();
  _updateSpread7Slots();
  _updateSpread9Slots();
  _paintSpreadCost();
  // Spread mode: reset btn-speak to 'DRAW YOUR RUNES'
  if (mode !== 'single') {
    var _sb = document.getElementById('btn-speak');
    if (_sb) { _sb.textContent = t('speak_btn_draw'); _sb.disabled = true; }
  }
}

// Cena tohoto typu čtení (2026-09-29, reporty KUKY 13:01/13:06/13:09: „chybová hláška říká, že nemám dost kreditu, ale nikde
// nevidím, kolik to stojí“). Číslo z SPREAD_COSTS (§8), jednotka z VOCAB (§15). Návštěvník ho nevidí — single má zdarma a spready
// jsou pro něj zamčené. Volá _setSpreadMode a _updateReadingForm (přepnutí jazyka, načtení profilu).
var _SPREAD_COST_KEY = { single: 'single', norns: 'norns', kriz: 'cross', horseshoe: 'horseshoe', yggdrasil: 'yggdrasil' };
function _paintSpreadCost() {
  var el = document.getElementById('spread-cost');
  if (!el) return;
  var c = SPREAD_COSTS[_SPREAD_COST_KEY[_spreadMode] || 'single'];
  var navstevnik = !currentUser || userTier === 'free_trial';
  if (navstevnik || !c) { el.style.display = 'none'; return; }
  el.textContent = tp('spread_cost', { casts: vn('cast', c.credits, lang) });
  el.style.display = '';
}

// Runy aktuálního spreadu (multi-rune) → zabránit duplicitnímu výběru
function _spreadRunesNow() {
  if (_spreadMode === 'norns')     return _spread3Runes;
  if (_spreadMode === 'kriz')      return _spread5Runes;
  if (_spreadMode === 'horseshoe') return _spread7Runes;
  if (_spreadMode === 'yggdrasil') return _spread9Runes;
  return [];
}
// Positional spread model: fixed slots, holes = null. Removing a slot leaves a
// hole (no shift); a re-draw fills the first empty position.
function _spreadCount(arr) {
  var c = 0; for (var i = 0; i < arr.length; i++) { if (arr[i]) c++; } return c;
}
function _spreadAdd(arr, n, rune) {
  for (var i = 0; i < n; i++) { if (!arr[i]) { arr[i] = rune; return true; } }
  return false;
}
// Označí grid tlačítka už vybraných run jako disabled (a uvolní ostatní)
function _syncGridUsed() {
  var names = _spreadRunesNow().filter(Boolean).map(function(x){ return x.n; });
  document.querySelectorAll('#reader-grid .rb').forEach(function(b){
    var used = names.indexOf(b.dataset.rune) !== -1;
    b.classList.toggle('used', used);
    b.disabled = used;
  });
}
// ─── Spread slot renderer (§18: one body, per-mode config) ───────────────
var _SPREAD_SLOT_CFG = {
  norns:     { slotsId: 'spread3-slots', mode: 'norns',     get: function() { return _spread3Runes; }, id: function(i) { return 'slot' + (i + 1); },   n: 3 },
  kriz:      { slotsId: 'spread5-slots', mode: 'kriz',      get: function() { return _spread5Runes; }, id: function(i) { return 's5slot' + (i + 1); }, n: 5 },
  horseshoe: { slotsId: 'spread7-slots', mode: 'horseshoe', get: function() { return _spread7Runes; }, id: function(i) { return 's7slot' + (i + 1); }, n: 7 },
  yggdrasil: { slotsId: 'spread9-slots', mode: 'yggdrasil', get: function() { return _spread9Runes; }, id: function(i) { return 's9slot' + (i + 1); }, n: 9 },
};
var _SLOT_GLYPHS = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨'];

function _updateSpreadSlots(cfg) {
  var slotEl = document.getElementById(cfg.slotsId);
  if (!slotEl) return;
  slotEl.style.display = (_spreadMode === cfg.mode) ? 'flex' : 'none';
  var runes = cfg.get();
  for (var i = 0; i < cfg.n; i++) {
    var el = document.getElementById(cfg.id(i));
    if (!el) continue;
    var rune = runes[i];
    el.innerHTML = rune ? runeSvg(rune, { frame: true, cls: 'slot-stone' }) : _SLOT_GLYPHS[i];
    el.classList.toggle('filled', !!rune);
    if (rune) {
      el.title = rn(rune) + ' — ' + t('slot_remove_hint');
      el.style.cursor = 'pointer';
      el.onclick = (function(idx) {
        return function() {
          cfg.get()[idx] = null;
          _updateSpreadSlots(cfg);
          var speakBtn = document.getElementById('btn-speak');
          if (speakBtn) speakBtn.disabled = true;
        };
      })(i);
    } else {
      el.title = '';
      el.style.cursor = 'default';
      el.onclick = null;
    }
  }
  _syncGridUsed();
}

function _updateSpread3Slots() { _updateSpreadSlots(_SPREAD_SLOT_CFG.norns); }

function _hideAllSpreadOutputs() {

  ['spread3-output','spread5-output','spread7-output','spread9-output'].forEach(function(id) {
    var out = document.getElementById(id);
    if (out) out.style.display = 'none';
  });
  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = '';
  if (s2) s2.style.display = '';
}
function _updateSpread5Slots() { _updateSpreadSlots(_SPREAD_SLOT_CFG.kriz); }

// ─── HORSESHOE (7 rune) helpers ──────────────────────────────────────────
function _updateSpread7Slots() { _updateSpreadSlots(_SPREAD_SLOT_CFG.horseshoe); }

// ─── YGGDRASIL (9 rune) helpers ──────────────────────────────────────────
function _updateSpread9Slots() { _updateSpreadSlots(_SPREAD_SLOT_CFG.yggdrasil); }

async function readRune() {
  if (_spreadMode === 'kriz') {
    // Tier check — block Visitor (anonymous) only
    if (!currentUser) {
      showToast(t('signin_spread_kriz'));   // 2026-10-10: texty toastů z UI_TEXT (ráčna ㉸)
      _setSpreadMode('single'); return;
    }
    if (_spreadCount(_spread5Runes) === 5 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateSpread5Reading();
      return;
    }
    if (!readerRune) return;
    _spreadAdd(_spread5Runes, 5, readerRune);
    readerRune = null;
    _updateSpread5Slots();
    var speakBtn5 = document.getElementById('btn-speak');
    if (speakBtn5) {
      speakBtn5.disabled = (_spreadCount(_spread5Runes) < 5);
      if (_spreadCount(_spread5Runes) >= 5) speakBtn5.textContent = t('speak_btn');
    }
    return;
  }
  if (_spreadMode === 'horseshoe') {
    // Tier check — block Visitor (anonymous) only; rune_seeker can use with rune readings
    if (!currentUser) {
      showToast(t('signin_spread_horseshoe'));
      _setSpreadMode('single'); return;
    }
    if (_spreadCount(_spread7Runes) === 7 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateHorseshoeReading();
      return;
    }
    if (!readerRune) return;
    _spreadAdd(_spread7Runes, 7, readerRune);
    readerRune = null;
    _updateSpread7Slots();
    var speakBtn7 = document.getElementById('btn-speak');
    if (speakBtn7) {
      speakBtn7.disabled = (_spreadCount(_spread7Runes) < 7);
      if (_spreadCount(_spread7Runes) >= 7) speakBtn7.textContent = t('speak_btn');
    }
    return;
  }
  if (_spreadMode === 'yggdrasil') {
    // Visitor gate — block anonymous only; all signed-in tiers can access (RS via credits)
    if (!currentUser) {
      showToast(t('signin_spread_yggdrasil'));
      _setSpreadMode('single'); return;
    }
    // Seasonal info: full power Dec 14–28, reading available year-round
    var _ygNow = new Date();
    var _ygM = _ygNow.getMonth() + 1;
    var _ygD = _ygNow.getDate();
    if (!(_ygM === 12 && _ygD >= 14 && _ygD <= 28) && !isAdmin(currentUser.email)) {
      showToast(t('yggdrasil_power_toast'));
    }
    if (_spreadCount(_spread9Runes) === 9 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateYggdrasilReading();
      return;
    }
    if (!readerRune) return;
    _spreadAdd(_spread9Runes, 9, readerRune);
    readerRune = null;
    _updateSpread9Slots();
    var speakBtn9 = document.getElementById('btn-speak');
    if (speakBtn9) {
      speakBtn9.disabled = (_spreadCount(_spread9Runes) < 9);
      if (_spreadCount(_spread9Runes) >= 9) speakBtn9.textContent = t('speak_btn');
    }
    return;
  }
  if (_spreadMode === 'norns') {
    // Visitor gate — block anonymous users
    if (!currentUser) {
      showToast(t('signin_spread_norns'));
      _setSpreadMode('single'); return;
    }
    if (_spreadCount(_spread3Runes) === 3 && !readerRune) {
      document.getElementById('reader-rune-card').style.display = 'none';
      document.getElementById('reader-output').style.display = 'block';
      readerTexts = {}; voiceGenerated = {};
      await _generateNornsReading();
      return;
    }
    if (!readerRune) return;
    _spreadAdd(_spread3Runes, 3, readerRune);
    readerRune = null;
    _updateSpread3Slots();
    var speakBtnN = document.getElementById('btn-speak');
    if (speakBtnN) {
      speakBtnN.disabled = (_spreadCount(_spread3Runes) < 3);
      if (_spreadCount(_spread3Runes) >= 3) speakBtnN.textContent = t('speak_btn');
    }
    return;
  }
  // Single rune mode (original)
  if (!readerRune) return;
  document.getElementById('reader-rune-card').style.display = 'none';
  document.getElementById('reader-output').style.display = 'block';
  const u = readerUser, drawn = readerRune, life = u.lifeRune;
  _renderLifeBadge(life);
  readerTexts = {}; voiceGenerated = {};
  await _generateReading();
}

// ─── Ask Rúnar — follow-up Q&A (Premium, one question per reading) ───────────
var _askCount = 0;   // kolik Asků už k tomuto čtení padlo (dřív boolean _askUsed = jen jeden)
// Kolik Asků smí tenhle člověk k jednomu čtení (2026-09-24, KUKY: premium 2, standard 1, vše zdarma). Jediný zdroj =
// TIERS.*.asks_per_reading (2026-09-26: náhradní větev přes TIERS.*.ask a vypínač ASK_MULTI_LIVE odebrány — neběžely).
// Admin = premium (server dělá totéž, claude-proxy isAdmin → userTier 'premium').
// Myšlenka ✦ (2026-09-30, KUKY „nasaď to“): jen tarif s TIERS.*.reading_thought (admin = premium, jako Ask), jen single / Kříž /
// Norny — otestované (EVAL_LOG 2026-09-30 (4)(6)). 2026-10-03 (KUKY „myšlenku ✦ i pro Podkovu a Yggdrasil“): i Horseshoe a Yggdrasil.
// Zdrojová runa: single = tažená, Kříž = střed (runes[0]), Norny = Skuld (runes[2] — závěr patří jí), Horseshoe = runa 7 Výsledek
// (runes[6] — týž důvod jako Skuld), Yggdrasil = runa 4 Midgard (runes[3] — svět člověka, střed kmene; jako střed u Kříže).
var _THOUGHT_SOURCE = { SINGLE: 0, KRIZ: 0, NORNS: 2, HORSESHOE: 6, YGGDRASIL: 3 };
function _thoughtAllowed() {
  if (!currentUser) return false;
  return !!(TIERS[isAdmin(currentUser.email) ? 'premium' : userTier] || {}).reading_thought;
}
function _thoughtFor(kind, runes, lng) {
  if (!_thoughtAllowed() || !Object.prototype.hasOwnProperty.call(_THOUGHT_SOURCE, kind)) return '';
  var r = (runes || [])[_THOUGHT_SOURCE[kind]];
  return r ? _thoughtLine(lng, r) : '';
}
// Řádek ✦ jako SOUSED výstupu čtení, ne uvnitř: generateVoice čte innerText výstupu → myšlenka zůstane bez hlasu (KUKY).
function _paintThought(afterId, thought) {
  var el = document.getElementById('reading-thought');
  if (!el) { el = document.createElement('p'); el.id = 'reading-thought'; el.className = 'reading-thought'; }
  var kotva = document.getElementById(afterId);
  if (!thought || !kotva) { el.textContent = ''; el.style.display = 'none'; return; }
  kotva.after(el);
  el.textContent = '\u2726 ' + thought;
  el.style.display = '';
}
function _clearThought() { var el = document.getElementById('reading-thought'); if (el) { el.textContent = ''; el.style.display = 'none'; } }
function _askLimit() {
  if (!currentUser) return 0;
  return (TIERS[isAdmin(currentUser.email) ? 'premium' : userTier] || {}).asks_per_reading || 0;
}
// Další výměny (2., 3.…) se přidávají POD předchozí odpověď a pole se posune pod ně, ať to čte jako
// rozhovor. První výměna zůstává v původních #ask-question/#ask-answer (reporter, styly).
function _askResetThread() {
  document.querySelectorAll('#ask-runar .ask-extra').forEach(function (e) { e.remove(); });
  var wrap = document.getElementById('ask-input-wrap'), teaser = document.getElementById('ask-teaser');
  // 2026-09-30: teaser mohl odejít pod poslední odpověď (_showAskMoreTeaser) — vrátit pořadí pole · teaser · první otázka.
  var q1 = document.getElementById('ask-question');
  if (q1 && q1.parentNode) { if (wrap) q1.parentNode.insertBefore(wrap, q1); if (teaser) q1.parentNode.insertBefore(teaser, q1); }
  else if (wrap && teaser && teaser.parentNode) teaser.parentNode.insertBefore(wrap, teaser);
}
var _lastReadingId = null;   // id of the last saved reading — links an Ask Runar follow-up to it
var _askPhIdx = -1;
// ── ROTACE UKAZEK FORMULACE (KUKY 8.9.) ───────────────────────────────────────
// Cyklus 5 s: 1 s prichod · 3 s stani · 1 s odchod. Prolinani jde pres `::placeholder`
// (trida `ph-out` v runar-reader.css), NE pres prekryvny prvek — prekryv by se musel
// trefit do paddingu a fontu pole a pri kazde zmene stylu by se tise rozesel.
// Kde prohlizec ::placeholder neanimuje, text se jen prostrida; nic se nerozbije.
// Jeden rotator slouzi obema polim (ask-input i r-question) — dve skoro stejne funkce
// je presne to, co §18 zakazuje.
var _phTimers = {};
function _phStop(id) {
  var t = _phTimers[id];
  if (!t) return;
  clearInterval(t.cyklus); clearTimeout(t.odchod);
  var el = document.getElementById(id);
  if (el && el.classList) el.classList.remove('ph-out');
  delete _phTimers[id];
}
// `seznam` je FUNKCE, ne pole: pri prepnuti jazyka se tim vezme nova sada sama,
// bez restartu zvenci (§14 — dynamicky obsah nepatri do updateUIText).
function _phRotate(id, seznam, idx0) {
  _phStop(id);
  var el0 = document.getElementById(id);
  if (!el0 || el0.disabled) return;          // teaser / zamcene pole: nerotovat
  var i = (typeof idx0 === 'number') ? idx0 : 0;
  var t = { cyklus: null, odchod: null };
  _phTimers[id] = t;
  // Zastavi se, jakmile by prekazela: pole zmizelo, ma fokus, nebo se do nej pise.
  // Menici se text pod rukama je ruseni, ne napoveda.
  function zivy(el) {
    return el && !el.disabled && !el.value && el.offsetParent !== null
      && document.activeElement !== el;
  }
  function krok() {
    var el = document.getElementById(id);
    if (!zivy(el)) { _phStop(id); return; }
    var s = seznam() || [];
    if (!s.length) { _phStop(id); return; }
    el.placeholder = s[i % s.length];
    i++;
    el.classList.remove('ph-out');                       // 1 s prichod
    t.odchod = setTimeout(function () {                  // 3 s stani, pak 1 s odchod
      var e2 = document.getElementById(id);
      if (zivy(e2)) e2.classList.add('ph-out');
    }, 4000);
  }
  // Casovac se zaklada PRED prvnim krokem: kdyby krok() rovnou zjistil, ze pole neni
  // videt, zavolal by _phStop() nad jeste neexistujicim handlem — a interval zalozeny
  // az potom by uz nemel kdo uklidit a bezel by donekonecna nad skrytym polem.
  // Nasel to seed-and-assert s falesnymi hodinami, ne cteni kodu.
  t.cyklus = setInterval(krok, 5000);
  krok();
}
// Napoveda „na co se muzu zeptat" (KUKY 2026-09-10) — a od te doby se STAVI, neopisuje.
// Duvod je meritelny: klik na hotovou vetu ukotvi cteni +2,7 b., vlastnimi slovy +8,8 b.
// (2026-08-16). Napoveda ma tedy ucit TVAR otazky; tip, do ktereho je uz dosazene jmeno
// runy z tohohle cteni, je z poloviny otazka toho cloveka a ten rozdil stira.
// Druhy duvod: konstantni seznam nabizel i to, co pro dane cteni neplati — spojeni mezi
// runami u jedne runy, „jak to souvisi s tim, na co jsem se ptal" u cteni bez otazky,
// zivotni runu tomu, kdo zadnou nema. Napoveda, ktera lze, uci spatne ptani.
// Tenhle seznam je ZAROVEN sada rotujicich placeholderu (§18) — jedno misto, dve podoby.
// Zamer se do tipu nedosazuje jako POPISEK — kazda ze tri hodnot ma vlastni celou vetu.
// Duvod je islandsky: nazvy zameru („Akvordun framundan") by se musely sklonovat podle
// vazby ve vete, a to sablona neumi. Cela veta ten problem odstranuje, ne obchazi.
// Index hledani v SEEKS. 0 = „Almenn leiðsögn / General Guidance" — vedome BEZ tipu.
function _seekIdx(v) {
  if (!v || typeof SEEKS === 'undefined') return -1;
  var i = (SEEKS.en || []).indexOf(v);
  if (i === -1) i = (SEEKS.is || []).indexOf(v);
  return i;
}
function _intentIdx(v) {
  if (!v || typeof INTENTIONS === 'undefined') return -1;
  var i = (INTENTIONS.en || []).indexOf(v);
  if (i === -1) i = (INTENTIONS.is || []).indexOf(v);
  return i;
}
// Co Runar o ZADANI ctenia vi, kdyz clovek pouzije Ask. Ma vlastni funkci ze dvou duvodu:
// (1) je to jedno misto (§18) — az pribude dalsi pole, pribude tady a nikde jinde;
// (2) `askRunar()` potrebuje DOM, takze se z kontroly zavolat neda. Bez tehle funkce by
//     kontrola musela sber faktu OPSAT — a opsana hranice neni otestovana hranice (§19.1).
// Presne tuhle diru mel `ask_h_asked`: nabizel „jak to souvisi s tim, na co jsem se ptal",
// ale puvodni otazka se do promptu nikdy neposilala a nic to nehlidalo.
// Pozice ve spreadu — vlastni funkce vedle `_askCast`, a zamerne NE v nem: `_askCast` vlastni
// to, co clovek VYPLNIL (ownerovo pravidlo 2026-09-11), kdezto pozice jsou struktura ctení.
// Michat je do jednoho objektu by rozmazalo smysl kontroly, ktera `_askCast` hlida.
// Jmena z `_lastDrawn` (kanonicka), ne z `_lastSegs` — ta psal model.
// JEDNO misto, kde se Ask prompt sklada. Kontrola musi projit TUDY, jinak testuje builder
// a ne zapojeni — a dira ve volani ji neproskoci (stalo se 2026-09-11 u pozic).
function _askBuild(reading, q, runes) {
  var _lf = (readerUser && readerUser.lifeRune) || null;
  if (_lf && (_lastDrawn || []).some(function (r) { return r && r.n === _lf.n; })) _lf = null;
  // 2026-10-04 krok 2: předchozí výměna jen ve STEJNÉM jazyce — po přepnutí jazyka by stála v cizí řeči vedle čtení.
  var _pred = (_askLog || []).filter(function (x) { return x && x.lang === lang; });
  return buildAskPrompt(reading, q, runes, lang, corrections, _lf, _askCast(), _askSpread(), _askAspect(), _pred);
}
// Význam runy, ze kterého single čtení vzniklo (2026-09-26, viz buildAskPrompt). Čte se z promptu TOHO čtení (`_lastGen`) —
// stejný zdroj, jaký zapisuje prompt_draws.kws, žádná druhá kopie. Prázdné, když: nejde o single; Ask je v jiném jazyce než
// čtení (aspekt by byl v cizím jazyce); nebo `_lastGen` patří jiné runě (neúspěšné nové čtení nechá starý `_lastGen`).
function _askAspect() {
  if (!_lastGen || _lastGen.kind !== 'single' || _lastGen.lang !== lang) return '';
  var d = (_lastDrawn || []).filter(Boolean);
  if (d.length !== 1 || _lastGen.prompt.indexOf(': ' + rnPrompt(d[0]) + ' — ') === -1) return '';
  return (_promptDraws(_lastGen.prompt, _lastGen.lang) || {}).kws || '';
}
function _askSpread() {
  return { mode: _spreadMode,
           runy: (_lastDrawn || []).filter(Boolean).map(function (r) { return rnPrompt(r); }) };   // do promptu bez glosy (2026-09-24)
}
function _askCast() {
  var u = readerUser || {};
  return { area: u.area, intention: u.intention, seeking: u.seeking, question: u.question };
}
function _askHints() {
  var out = [], u = readerUser || {}, dr = (_lastDrawn || []).filter(Boolean);
  var many = dr.length > 1, life = u.lifeRune;
  var lifeDrawn = !!(life && dr.some(function (r) { return r.n === life.n; }));
  // ZIVOTNI RUNA PRVNI — jediny tip, ktery zna obe jmena, a otazka, kterou si owner polozil
  // sam (2026-09-10). Odpada, kdyz byla tazena: pak je predmetem cteni a „jak ovlivnuje
  // sebe" nedava smysl (tentyz test, ktery v promptu dela `_lifeWasDrawn`).
  // 2026-09-25 (KUKY: „aby se to nevztahovalo přesně na runu, ale čtení“) — jedna věta pro single i spread.
  // 2026-10-06 (KUKY: „how my life rune Isa affect this rune (místo run jméno té runy) in this reading“): u single se tip ptá na
  // TAŽENOU RUNU jménem; spread dál na čtení. Sol (API, docs/eval/2026-10-06-ask-zivotni-runa): ozvěna „drawn“ 0/6, led 0/6, vazba
  // na obraz 5/6. „Where is my life rune Isa in this picture?“ vyvolávala „Isa is not among the runes drawn“ 5/6 → nepoužito.
  if (life && dr.length && !lifeDrawn) out.push(!many ? tp('ask_h_life_rune', { life: rnSplit(life).name, rune: rnSplit(dr[0]).name })
                                                      : tp('ask_h_life_all', { life: rnSplit(life).name }));
  // 2026-09-25 (KUKY): výklad runy bez obrazu — owner tak Asku dává otázku sám a odpověď „perfektně vysvětluje význam runy“.
  // 2026-10-06 (KUKY report 14:32 „posunout na první místo… uživatel by měl v nabídce vidět prvně ty, co mají nejlepší odpověď“
  // + „životní bude pořád první“): hned za životní runu, před „What does X mean in this reading?“.
  out.push(!many && dr[0] ? tp('ask_h_explain', { rune: rnSplit(dr[0]).name }) : t('ask_h_explain_all'));
  // Třetí řádek: význam tažené runy. 2026-10-06 večer (KUKY nad nabídkou: „proč je tak otázka na life rune 2×? jedna tam nemá co
  // dělat.“): se životní runou (netaženou) se VYNECHÁ — na životní runu se ptá už první tip a „What does X mean in this reading?“ by
  // zdvojil druhý („Explain X without the image“). Do té doby tu stál druhý tip na životní runu („…show itself in this reading?“).
  if (many) out.push(t('ask_h_runes'));
  else if (dr[0] && !(life && !lifeDrawn)) out.push(tp('ask_h_rune', { rune: rnSplit(dr[0]).name }));
  // Obraz nese KAZDE cteni (150/150 dvojic) — a kdyz si clovek vybral oblast, tentyz radek
  // ji rovnou pojmenuje. Prompt oblast zna, ale ma zakazane ji vyslovit; tady se na ni
  // smi zeptat nahlas. Popisek uz je v aktualnim jazyce (_syncPillLang v runar-app.js).
  var _obl = (u.area && typeof AREAS !== 'undefined'
    && ((AREAS.en || []).indexOf(u.area) !== -1 || (AREAS.is || []).indexOf(u.area) !== -1))
    ? u.area : '';
  out.push(_obl ? tp('ask_h_image_area', { area: _obl }) : t('ask_h_image'));
  // OSOBNÍ SLOT (2026-09-25, KUKY „přidáváme další větu… nepůjdeme přes 7“): s vlastní otázkou „jak to souvisí s tím, na co jsem
  // se ptal“, bez ní „How does this reading affect me?“ — týž vzor jako časový slot níž (přesnější věta přebírá místo).
  out.push(u.question ? t('ask_h_asked') : t('ask_h_me'));
  // CASOVY SLOT: jen kdyz si clovek zvolil zamer — pak veta k nemu.
  // 2026-10-06 (KUKY „odstranit“): bez záměru už žádný tip. „Why is this showing up now?“ se ptal po PŘÍČINĚ (znamení), kterou
  // NO COLD READING zakazuje — sol začal odpověď odmítnutím 9/9 („Algiz does not say why this appears now“), náhrady „Why does this
  // matter now?“ 8/9 a „What in this belongs to now?“ 8/9 ozvěna (docs/eval/2026-10-06-ask-otazky, pokus B).
  var _zi = _intentIdx(u.intention);
  if (_zi >= 0) out.push(t(['ask_h_when_now', 'ask_h_when_ahead', 'ask_h_when_past'][_zi]));
  var _hi = _seekIdx(u.seeking);
  // 2026-10-06 (KUKY „pryč“): „Does this confirm what I already feel?“ úplně pryč. Rúnar ho z podstaty odmítá (zrcadlo
  // nepotvrzuje, DECISIONS 2026-09-25); do té doby se ukazoval jen při méně než 6 tipech a po odebrání „Why now“ by naskakoval
  // častěji. U hledání Confirmation se řádek vynechá a nic ho nenahrazuje — týž vzor, jaký dřív platil při plném seznamu.
  if (_hi !== 2)
    out.push(_hi > 0 ? t(['', 'ask_h_seek_clarity', '', 'ask_h_seek_challenge', 'ask_h_seek_reflect'][_hi])
                     : t('ask_h_unseen'));
  // 2026-09-25 (KUKY: „při druhém asku mi nabízí stejnou možnost, kterou jsem použil při prvním“): položené otázky pryč.
  var polozene = (_askLog || []).map(function (x) { return String(x.q || '').trim().toLowerCase(); });
  return out.filter(Boolean).filter(function (x) { return polozene.indexOf(x.trim().toLowerCase()) === -1; });
}
// Jedno ze tri hesel zrcadla do #reading-loading-motto (prazdne = prvek chybi, nic nespadne).
function _paintLoadingMotto() {
  var el = document.getElementById('reading-loading-motto');
  if (!el) return;
  var kl = ['motto_image', 'motto_mirror', 'motto_paths'];
  el.textContent = t(kl[Math.floor(Math.random() * kl.length)]);
}
function toggleAskHints() {
  var btn = document.getElementById('ask-lbl'), box = document.getElementById('ask-hints');
  if (!btn || !box) return;
  var otevrit = box.style.display === 'none';
  btn.setAttribute('aria-expanded', otevrit ? 'true' : 'false');
  box.style.display = otevrit ? '' : 'none';
  if (!otevrit) { box.innerHTML = ''; return; }
  _paintAskHints();
}
function _paintAskHints() {
  var box = document.getElementById('ask-hints');
  if (!box || box.style.display === 'none') return;
  box.innerHTML = '';
  _askHints().forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ask-hint'; b.textContent = t;
    // VLOZI, NEODESLE — volny text ukotvi cteni 3x lepe nez vyber z nabidky (2026-08-16),
    // takze uzivatel musi mit posledni slovo. Kurzor zustava v poli.
    b.onclick = function () {
      var inp = document.getElementById('ask-input');
      if (!inp || inp.disabled) return;
      _askPhStop();                       // rotace placeholderu uz nema co delat
      inp.value = t; inp.focus();
      try { inp.setSelectionRange(t.length, t.length); } catch (e) {}
      toggleAskHints();
    };
    box.appendChild(b);
  });
}

function _askPhStop() { _phStop('ask-input'); }
function _askPhStart() {
  _askPhIdx++;   // kazde otevreni Ask zacina jinde v sade, at to neni porad tataz prvni
  _phRotate('ask-input', _askHints, _askPhIdx);
}
function _askPlaceholder() {
  var phs = _askHints();
  if (!phs.length) return t('ask_placeholder');
  var i = _askPhIdx < 0 ? 0 : _askPhIdx;
  return phs[i % phs.length] || '';
}
// Teaser radka nese jmeno tieru + jazyk, takze se musi prekreslit i pri prepnuti
// jazyka (§13 full-path) — vola ji `_showAsk` i `updateUIText` (runar-app.js).
// Jmeno tieru VZDY z configu, nikdy natvrdo (§8/§15); jazykova varianta je domaci
// inline ternar (vzor runar-app.js:789/798, sdileny helper neexistuje).
// Tarif, který dá víc otázek než můj limit — nejnižší takový (§8: počty z TIERS.*.asks_per_reading, jména z configu).
function _askVyssiTarif(lim) {
  return ['standard', 'premium'].filter(function (k) { return ((TIERS[k] || {}).asks_per_reading || 0) > lim; })[0] || null;
}
function _refreshAskTeaser() {
  var tEl = document.getElementById('ask-teaser');
  if (!tEl || tEl.style.display === 'none') return;
  var lim = _askLimit();
  // 2026-09-30 (KUKY: „u Standard má druhou, kterou Premium odemyká“): vyčerpaný limit → další otázku otevírá vyšší tarif.
  if (lim > 0) {
    var vt = _askVyssiTarif(lim);
    if (!vt) { tEl.style.display = 'none'; return; }
    tEl.textContent = tp('ask_teaser_more', { tier: tierLabel(vt, lang, 'dat') });
    return;
  }
  // 2026-09-25: nejnižší tarif, který Ask má (dnes Standard) — ne natvrdo Premium (§8).
  tEl.textContent = tp('ask_teaser', { tier: tierLabel(_askVyssiTarif(0) || 'premium', lang, 'dat') });
}
// Po poslední povolené otázce: řádek „další otázku otevírá <tarif>“ pod poslední odpovědí (jen když vyšší tarif dá víc).
function _showAskMoreTeaser(pod) {
  var tEl = document.getElementById('ask-teaser');
  var lim = _askLimit();
  if (!tEl || !lim || !_askVyssiTarif(lim)) return;
  if (pod && pod.after) pod.after(tEl);
  tEl.style.display = '';
  _refreshAskTeaser();
}

function _showAsk() {
  _askLog = [];
  var el = document.getElementById('ask-runar');
  if (!el) return;
  // Who gets the follow-up = TIERS.<tier>.asks_per_reading (§8), not a tier name spelled out here.
  var canAsk = _askLimit() > 0;
  _askResetThread();
  // Kdo NEMA opravneni, ale JE prihlaseny, dostane teaser: featura je videt cela,
  // jen se s ni neda hnout (KUKY 2026-08-09). Neprihlaseny nevidi nic — jeho dalsi
  // krok je registrace, ne Premium.
  var teaser = !canAsk && !!currentUser;
  if (!canAsk && !teaser) { el.style.display = 'none'; return; }
  _askCount = 0;   // teaser neprojde: _askLimit() je u nej 0
  var tEl = document.getElementById('ask-teaser');
  if (tEl) { tEl.style.display = teaser ? '' : 'none'; if (!teaser) tEl.textContent = ''; }
  _refreshAskTeaser();
  _askPhIdx++;  // rotate the placeholder each time the ask opens
  var inp = document.getElementById('ask-input');
  if (inp) { inp.value = ''; inp.placeholder = _askPlaceholder(); inp.disabled = teaser; }
  _askPhStart();
  var hb = document.getElementById('ask-hints');
  if (hb) { hb.innerHTML = ''; hb.style.display = 'none'; }
  var hl = document.getElementById('ask-lbl'); if (hl) hl.setAttribute('aria-expanded', 'false');
  var wrap = document.getElementById('ask-input-wrap'); if (wrap) wrap.style.display = '';
  var qEl2 = document.getElementById('ask-question'); if (qEl2) { qEl2.textContent = ''; qEl2.style.display = 'none'; }
  var ans = document.getElementById('ask-answer'); if (ans) { ans.textContent = ''; ans.style.display = 'none'; }
  var btn = document.getElementById('ask-btn'); if (btn) { btn.disabled = teaser; btn.textContent = t('ask_btn'); }
  setSt('ask-status', '');
  el.style.display = 'block';
}
// Pojistka proti useknutemu follow-upu: kdyz text nekonci terminalni interpunkci,
// orizni ho k posledni cele vete. Radsi kratsi cela myslenka nez fragment bez tecky.
// Nema-li zadnou celou vetu, nech ho byt (fragment > prazdno).
function _trimToSentence(t) {
  if (!t) return t;
  if (/[.!?\u2026]["\u201d\u00bb)]?\s*$/.test(t)) return t;
  var i = Math.max(t.lastIndexOf('.'), t.lastIndexOf('!'), t.lastIndexOf('?'), t.lastIndexOf('\u2026'));
  return i > 0 ? t.slice(0, i + 1).trim() : t;
}

async function askRunar() {
  if (_askCount >= _askLimit()) return;
  // Skutecnou branu ma proxy (mode:'ask' + tier != premium -> 403); tohle jen setri roundtrip.
  var inp = document.getElementById('ask-input');
  var q = inp ? inp.value.trim() : '';
  if (!q) return;
  var reading = (readerTexts[lang] && readerTexts[lang].short) || '';
  if (!reading) return;
  var runes = (_lastSegs && _lastSegs.length)
    ? _lastSegs.map(function (s) { return s.rune; }).filter(Boolean).join(', ')
    : (readerRune ? rnPrompt(readerRune) : '');   // do promptu bez glosy (2026-09-24)
  var btn = document.getElementById('ask-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('ask_thinking'); }
  if (inp) inp.disabled = true;   // 2026-09-24: Enter v poli posílal během dotazu druhý Ask (průzkum 2026-09-23)
  setSt('ask-status', '');
  // 2026-09-28 (KUKY k pomalému Asku: „ať je to pro uživatele vizuálně zřetelné“): otázka a „Rúnar listens…“ se ukážou HNED,
  // ne až s odpovědí. Dřív se během čekání změnil jen nápis tlačítka — netrpělivý člověk nevěděl, jestli se něco děje.
  // Vizuál = týž dech jako načítání čtení (.whispers-loading-*), text = existující ask_thinking; nic nového.
  var cislo = _askCount + 1;
  var wrap = document.getElementById('ask-input-wrap');
  var qEl, ans, ansId;
  if (cislo === 1) {
    qEl = document.getElementById('ask-question'); ans = document.getElementById('ask-answer'); ansId = 'ask-answer';
  } else {
    // další výměna pod poslední odpověď (od 2026-10-04 krok 2: Rúnar dostane i poslední výměnu, viz _askBuild)
    var posledni = document.querySelectorAll('#ask-runar .ask-answer');
    posledni = posledni[posledni.length - 1];
    qEl = document.createElement('div'); qEl.className = 'ask-question ask-extra';
    ans = document.createElement('div'); ans.className = 'out-txt ask-answer ask-extra'; ansId = 'ask-answer-' + cislo; ans.id = ansId;
    posledni.after(qEl); qEl.after(ans);
  }
  if (qEl) { qEl.textContent = q; qEl.style.display = 'block'; }
  if (ans) {
    ans.innerHTML = '<div class="whispers-loading-inner"><span class="whispers-loading-star">&#x16b1;</span>'
      + '<div class="whispers-loading-label">' + escapeHtml(t('ask_thinking')) + '</div></div>';
    ans.style.display = 'block';
  }
  if (wrap) wrap.style.display = 'none';   // pole se vrátí pod odpověď, až přijde
  var sys = buildSysPrompt(activeChar, lang);
  var prompt = _askBuild(reading, q, runes);
  // Attach the follow-up whenever the reading was actually stored — _lastReadingId is set
  // only then, so it is the single gate (never re-check the save conditions here: that is how
  // 'someone' readings silently lost their Ask). Identical for mine + someone.
  var _askEntryId = _uuid();
  var _askJournal = (currentUser && _lastReadingId)
    ? { kind: 'ask', reading_id: _lastReadingId, ask_entry_id: _askEntryId, question: q } : null;
  // mode 'ask' = not a cast: it must not draw down the monthly cap (see claude-proxy).
  // Follow-up ma byt KRATKY (odpoved na jednu otazku, ne cteni). Strop 140 (KUKY: cost
  // + dlouhy FU nedava smysl). Puvodni 120 usekaval IS uprostred vety — IS je ~1,5-2x
  // hustsi na tokeny, takze ~40 slov IS = ~120 tok. 140 da mirnou rezervu; EN se stropu
  // stejne nedotkne (prompt ho drzi na ~40 slov). Fix B (_trimToSentence) zaridi, ze se
  // nikdy nezobrazi useknuty fragment — IS FU u horni hranice delky prijde o posledni
  // vetu, coz je pri zamerne kratke odpovedi v poradku. Delku primarne drzi PROMPT.
  // 2026-09-06: 140 -> 320. Prompt povoluje ~90 slov (zmereno jako optimum, TEST DILY),
  // a 140 tokenu by IS odpoved useklo uprostred — IS je ~1,5-2x hustsi na tokeny.
  var askCap = 320;
  var res = await callProxy(sys, prompt, askCap, shouldUseCredit(), SPREAD_COSTS.single.credits, _askJournal, 'ask'); // FU: lang-aware cap
  if (res.error) {
    // chyba: výměna zmizí, jako by se Ask nestal (otázka zůstává v poli k novému pokusu)
    if (cislo === 1) { if (qEl) qEl.style.display = 'none'; if (ans) { ans.innerHTML = ''; ans.style.display = 'none'; } }
    else { if (qEl) qEl.remove(); if (ans) ans.remove(); }
    if (wrap) wrap.style.display = '';
    if (btn) { btn.disabled = false; btn.textContent = t('ask_btn'); }
    if (inp) inp.disabled = false;
    setSt('ask-status', _readingErrMsg(res.error), 'err');
    return;
  }
  var answer = _parseSegments(res.text || '').reading || (res.text || '').trim(); // defensive: unwrap if model returns JSON
  answer = _trimToSentence(answer);  // FU pojistka: nikdy useknuty fragment
  if (_askJournal && res && !res.error && !res.ask_saved) { _pendAdd('pendingAsks', { id: _askEntryId, reading_id: _lastReadingId, question: q, answer: answer }); _flushPending(); }
  _askCount++;
  _askLog.push({ q: q, a: answer, lang: lang });   // rozbor GPT-6 sol + předchozí výměna pro další Ask (krok 2, _askBuild)
  var dalsi = _askCount < _askLimit();
  if (!dalsi) _askPhStop();   // limit vyčerpán -> pole mizí, timer nemá co dělat
  if (!dalsi) _showAskMoreTeaser(ans);   // 2026-09-30: Standard po své otázce uvidí, že další otevírá Premium
  if (ans) ans.textContent = '';   // pryč „Rúnar listens…“, přichází odpověď
  if (wrap) {
    if (dalsi && ans) { ans.after(wrap); wrap.style.display = ''; } else wrap.style.display = 'none';
  }
  await stream(ansId, answer);
  if (dalsi) {
    if (inp) { inp.value = ''; inp.disabled = false; }
    if (btn) { btn.disabled = false; btn.textContent = t('ask_btn'); }
  }
}

function drawAnother() {
  _clearThought();   // 2026-09-30: myšlenka ✦ patří jen k čtení, které ji neslo (§13)
  // Restore layer2 + reset layer1 label for next reading
  var _daL2 = document.getElementById('single-layer2');
  var _daLbl = document.getElementById('layer1-lbl');
  if (_daL2) _daL2.style.display = '';
  _hdr = null;
  if (_daLbl) _daLbl.textContent = t('layer1_lbl');
  if (_spreadMode === 'norns') { _spread3Runes = []; _updateSpread3Slots(); }
  if (_spreadMode === 'kriz') { _spread5Runes = []; _updateSpread5Slots(); }
  if (_spreadMode === 'horseshoe') { _spread7Runes = []; _updateSpread7Slots(); }
  if (_spreadMode === 'yggdrasil') { _spread9Runes = []; _updateSpread9Slots(); }
  readerRune = null; readerTexts = {}; voiceGenerated = {};
  document.getElementById('reader-output').style.display = 'none';
  document.getElementById('trial-end').style.display = 'none';
  if (currentUser && userTier === 'rune_seeker' && userFreeBalance <= 0 && userCredits <= 0) { updateAuthUI(); return; }
  document.getElementById('reader-rune-card').style.display = 'block';
  document.querySelectorAll('#reader-grid .rb').forEach(b => b.classList.remove('on'));
  document.getElementById('reader-rune-info').textContent = '';
  document.getElementById('btn-speak').disabled = true;
}

// Owner request: on (re)entering the Rune Reading tab, clear any STALE spread output /
// label / mode from a previous reading, so a spread result never lingers over a new single.
function _resetReadingTab() {
  _spreadMode = 'single';
  _spread3Runes = []; _spread5Runes = []; _spread7Runes = []; _spread9Runes = [];
  readerRune = null; readerTexts = {}; voiceGenerated = {};
  _hdr = null;
  _hideAllSpreadOutputs();
  var _ro = document.getElementById('reader-output'); if (_ro) _ro.style.display = 'none';
  ['single','kriz','norns','horseshoe','yggdrasil'].forEach(function(m){
    var _b = document.getElementById('mode-btn-' + m); if (_b) _b.classList.toggle('active', m === 'single');
  });
  _hdr = null;
  var _l1 = document.getElementById('layer1-lbl'); if (_l1) { _l1.textContent = t('layer1_lbl'); _l1.classList.remove('pulsing'); }
  _updateSpread3Slots(); _updateSpread5Slots(); _updateSpread7Slots(); _updateSpread9Slots();
  _syncNornsGate();
}

function resetReader() {
  _clearThought();   // 2026-09-30 (§13)
  _spreadMode = 'single';
  _spread3Runes = []; _spread5Runes = []; _spread7Runes = []; _spread9Runes = [];
  _updateSpread3Slots(); _updateSpread5Slots(); _updateSpread7Slots(); _updateSpread9Slots();
  _hideAllSpreadOutputs();
  ['single','kriz','norns','horseshoe','yggdrasil'].forEach(function(m){ var _b = document.getElementById('mode-btn-' + m); if (_b) _b.classList.toggle('active', m === 'single'); });
  readerUser = {}; readerRune = null; readerTexts = {}; voiceGenerated = {};
  document.getElementById('reader-hero').classList.remove('hidden');
  document.getElementById('reader-output').style.display = 'none';
  document.getElementById('reader-rune-card').style.display = 'none';
  document.getElementById('trial-end').style.display = 'none';
  if (currentUser && userTier === 'rune_seeker' && userFreeBalance <= 0 && userCredits <= 0) {
    updateAuthUI(); return;
  }
  document.getElementById('reader-setup').style.display = 'block';
  ['r-name','r-question'].forEach(id => {   // r-day/r-month/r-year v HTML nejsou (2026-10-09)
    const el = document.getElementById(id); if (el) el.value = '';
  });
  readerUser.intention = '';
  buildPills();
}

// ─── CUSTOM AUDIO PLAYER (main reading voice) ────────────
function _capTrack(pct) {
  const seek = document.getElementById('cap-seek');
  if (seek) seek.style.setProperty('--pct', pct.toFixed(1) + '%');
}
function capToggle() {
  const a = document.getElementById('runar-audio');
  const btn = document.getElementById('cap-play');
  if (!a || !btn) return;
  if (a.paused) { a.play(); btn.textContent = '⏸'; }
  else          { a.pause(); btn.textContent = '▶'; }
}
function capSeek(v) {
  const a = document.getElementById('runar-audio');
  if (!a || !a.duration) return;
  a.currentTime = a.duration * (v / 100);
  _capTrack(+v);
}
const _SVG_VOL_ON  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06C16.89 6.15 19 8.83 19 12c0 3.17-2.11 5.84-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/></svg>`;
const _SVG_VOL_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
function capMute() {
  const a = document.getElementById('runar-audio');
  const btn = document.getElementById('cap-mute');
  if (!a || !btn) return;
  a.muted = !a.muted;
  btn.innerHTML = a.muted ? _SVG_VOL_OFF : _SVG_VOL_ON;
}
function _capReset() {
  const btn = document.getElementById('cap-play');
  const seek = document.getElementById('cap-seek');
  const cur  = document.getElementById('cap-current');
  if (btn)  btn.textContent  = '▶';
  if (seek) { seek.value = 0; _capTrack(0); }
  if (cur)  cur.textContent  = '0:00';
}

// ─── VOICE ───────────────────────────────────────────────
async function generateVoice() {
  var voiceText;
  if (_spreadMode === 'kriz') {
    var s5el = document.getElementById('s5-out');
    voiceText = s5el ? s5el.innerText.trim() : '';
  } else if (_spreadMode === 'norns') {
    var s3nEl = document.getElementById('s3-out');
    voiceText = s3nEl ? s3nEl.innerText.trim() : '';
  } else if (_spreadMode === 'horseshoe') {
    var s7el = document.getElementById('s7-out');
    voiceText = s7el ? s7el.innerText.trim() : '';
  } else if (_spreadMode === 'yggdrasil') {
    var s9el = document.getElementById('s9-out');
    voiceText = s9el ? s9el.innerText.trim() : '';
  } else {
    voiceText = document.getElementById('out-short').innerText.trim();
  }
  if (!voiceText) return;
  const deepText = voiceText;
  const btn = document.getElementById('btn-generate-voice');
  btn.disabled = true; btn.textContent = t('voice_btn_loading');
  setSt('st-voice', '');
  document.getElementById('audio-player').classList.remove('visible');
  try {
    const { data: { session: elSession } } = await sb.auth.getSession();
    const elHeaders = { 'Content-Type': 'application/json' };
    if (elSession?.access_token) elHeaders['Authorization'] = 'Bearer ' + elSession.access_token;
    const res = await fetch(EL_PROXY, {
      method: 'POST',
      headers: elHeaders,
      body: JSON.stringify({ text: deepText, lang })
    });
    if (!res.ok) {
      let data = {};
      try { data = await res.json(); } catch (_e) {}
      console.error('voice failed:', res.status, (data && data.error) || '');
      // Mesicni strop a minutovy rate limit chodi oba jako 429 — rozlisuje je kod chyby.
      // Bez toho by clovek, kterému doslo pet hlasu, cetl „pockej chvili" a cekal marne.
      const msg = (data && data.error === 'voice_monthly_limit')
        ? tp('err_voice_month', { n: (typeof VOICE_MONTHLY_LIMIT !== 'undefined' ? VOICE_MONTHLY_LIMIT : 5) })
        : res.status === 429
        ? t('err_rate_limited')
        : t('voice_resting');
      setSt('st-voice', msg, 'err');
      btn.textContent = t('voice_btn'); btn.disabled = false; return;
    }
    const data = await res.json();
    if (data.error) {
      setSt('st-voice', data.error, 'err');
      btn.textContent = t('voice_btn'); btn.disabled = false; return;
    }
    if (!data.audio_url) throw new Error('No audio_url');
    const blob = await fetch(data.audio_url).then(r => r.blob());
    const audio = document.getElementById('runar-audio');
    audio.src = URL.createObjectURL(blob);
    _capReset();
    document.getElementById('audio-player').classList.add('visible');
    voiceGenerated[lang] = true;
    btn.textContent = t('voice_btn_done');
    btn.disabled = true;
    setSt('st-voice', '');
  } catch (err) {
    setSt('st-voice', `Voice error: ${err.message}`, 'err');
    btn.textContent = t('voice_btn'); btn.disabled = false;
  }
}


// ─── MULTI-RUNE SPREAD GENERATE (shared) ────────────────
// One reading flow for all multi-rune spreads. The 4 wrappers below differ
// only in: rune array, min count, prompt builder, tokens, credits, the
// output/label element ids, and the journal kind.
async function _generateSpreadReading(o) {
  _hideAllSpreadOutputs();  // isolate: clear any other spread's pane before this one
  if (o.runes.length < o.min) return;

  var vBtn = document.getElementById('btn-generate-voice');
  if (vBtn) { vBtn.disabled = true; vBtn.textContent = t('voice_btn'); }
  document.getElementById('audio-player').classList.remove('visible');
  document.getElementById('runar-audio').src = '';
  setSt('st-voice', '');

  var s1 = document.getElementById('single-layer1');
  var s2 = document.getElementById('single-layer2');
  if (s1) s1.style.display = 'none';
  if (s2) s2.style.display = 'none';
  var out = document.getElementById(o.outputId);
  if (out) out.style.display = 'block';
  // Vymaz THIS spread strip (o.lblId) + text (o.outId) PRED renderem, jinak zustanou
  // glyfy z predesleho cteni (single _generateReading uz maze; spready ne = bug).
  // Sdilene telo => pokryva norns/kriz/horseshoe/yggdrasil + founding najednou (§13).
  var _lbl0 = document.getElementById(o.lblId); if (_lbl0) _lbl0.innerHTML = '';
  var _out0 = document.getElementById(o.outId); if (_out0) _out0.innerHTML = '';
  _clearThought();
  _renderLifeBadge(readerUser.lifeRune);

  var rdLoad = document.getElementById('reading-loading');
  var rdLoadTxt = document.getElementById('reading-loading-txt');
  if (rdLoadTxt) rdLoadTxt.textContent = t('reading_loading');
  _paintLoadingMotto(); // tyz duvod jako u prvniho mista (reporty #5/#6)
  if (rdLoad) rdLoad.style.display = 'block';
  var _aqP = document.getElementById('ask-runar'); if (_aqP) _aqP.style.display = 'none';
  _hdr = null;
  var pL1 = document.getElementById('layer1-lbl');
  var pL2 = document.getElementById('layer2-lbl');
  if (pL1) pL1.classList.add('pulsing');
  if (pL2) pL2.classList.add('pulsing');

  var u = readerUser;
  var _castNowS = _castIdx(u);
  var sys = buildSysPrompt(activeChar, lang);
  var prompt = o.buildPrompt(u, o.runes, lang, corrections);
  var _thS = _thoughtFor(o.kind, o.runes, lang); if (_thS) prompt += '\n' + _thS;   // 2026-09-30: myšlenka ✦ (Kříž, Norny; od 2026-10-03 i Horseshoe a Yggdrasil)
  _lastGen = { sys: sys, prompt: prompt, lang: lang, kind: o.kind };   // pro rozbor GPT-6 sol (jen admin)

  // Journal meta for the SERVER-SIDE save (proxy saves it right after the deduction; two writes, not atomic).
  var _runeDisplay = o.runes.map(function (r) { return ((r.g || '') + ' ' + (rn(r) || '').toUpperCase()).trim(); }).join(' · ');
  var _journalS = (currentUser && (_readingMode === 'mine' || isTester)) ? {
    kind: 'spread', id: _uuid(), rune_name: o.kind, rune_glyph: '✦', lang: lang,
    area: 'spread', aol: u.area || null, seeking: u.seeking || null, intention: u.intention || null,
    question: u.question || null, life_rune: (u.lifeRune && u.lifeRune.n) || null,
    rune_display: _runeDisplay, prompt_version: RUNAR_PROMPT_VERSION, address: userGender,
    reading_mode: _readingMode, draws: _drawsSPinem(prompt, lang)
  } : null;
  _lastReadingId = null;
  // Zakladaci Norny: zdarma a BEZ HLASU (hlas = 95 % ceny cteni, proto se nekona).
  // Cenu vynucuje proxy podle mode='founding', ne tahle dve cisla.
  // `o.kind` je to, co _generateNornsReading() skutecne posila ('NORNS').
  // Do 2026-07-19 tu stalo `o.mode`, coz na predavanem objektu NEEXISTUJE —
  // vyraz byl vzdy false a zakladani se nespustilo ani jednou.
  var _isFounding = (o.kind === 'NORNS' && typeof _foundingPending !== 'undefined' && _foundingPending);
  var res = await callProxy(sys, prompt, o.tokens,
                            _isFounding ? false : shouldUseCredit(o.credits),   // cena spreadu: volné čtení jen na single (2026-10-09)
                            _isFounding ? 0 : o.credits,
                            _journalS, _isFounding ? 'founding' : '');
  if (_lastGen && res && res.model) _lastGen.model = res.model;
  if (_lastGen && res && res.usage) _lastGen.usage = res.usage;   // 2026-09-29: cena čtení do reportu (costLabel)
  _lastReadingId = (res && res.reading_id) || (_journalS ? _journalS.id : null);
  if (_journalS && res && !res.error && res.text && !res.reading_id) _pendAdd('pendingReadings', { id: _journalS.id, journal: _journalS, model_text: res.text });
  _flushPending();

  if (rdLoad) rdLoad.style.display = 'none';
  if (pL1) pL1.classList.remove('pulsing');
  if (pL2) pL2.classList.remove('pulsing');

  if (res.error === 'rate_limited') {
    setSt('st-reader', _readingErrMsg('rate_limited'), 'err');
    return;
  }
  if (res.error === 'no_credits') {
    setSt('st-reader', _readingErrMsg('no_credits'), 'err');
    if (currentUser) { syncFreeBalance(currentUser.id); await fetchUserProfile(currentUser.id); }
    return;
  }
  if (res.error) {
    console.error('spread reading failed:', res.error, res.status || '');
    setSt('st-reader', _readingErrMsg(res.error), 'err');
    if (currentUser) { syncFreeBalance(currentUser.id); await fetchUserProfile(currentUser.id); }
    return;
  }

  var _seg = _parseSegments(res.text || '');
  var _thX = _splitThought(_seg.reading, _seg.segs);   // 2026-09-30: řádek ✦ zvlášť (viz single)
  var text = _thX.reading;
  _lastSegs = _thX.segs;
  _lastDrawn = (o.runes || []).slice();
  readerTexts[lang] = { short: text, deep: '' };

  var lbl = document.getElementById(o.lblId);
  _hdr = { lblId: o.lblId, outId: o.outId, runes: o.runes.slice(), single: false, cast: _castNowS };
  if (lbl) _paintReadingHeader();

  if (currentUser) {
    // Journal saved SERVER-SIDE by the proxy (right after the deduction). Refresh local views.
    if (_readingMode === 'mine') { recordTreeReading(o.kind, o.runes, readerUser.area, readerUser.intention); loadJournal(); }
    await syncFreeBalance(currentUser.id);
  } else { incTrialCount(); updateAuthUI(); }

  await stream(o.outId, text);
  _renderSegments(o.outId, _lastSegs);
  _paintThought(o.outId, _thX.thought);
  _showAsk();

  // U zalozeni se hlas NENABIZI — je to textovy ritual a jeho bezplatnost stoji
  // prave na tom, ze se TTS nekona. (Skryte tlacitko neni ochrana, jen dusledna
  // nabidka; EL proxy o typu cteni nevi — zapsano v RUNAR_DECISIONS.)
  if (canUseVoice(o.credits) && !_isFounding) {
    if (vBtn) { vBtn.disabled = false; vBtn.style.display = ''; }
  } else {
    if (vBtn) { vBtn.disabled = true; vBtn.style.display = 'none'; }
  }
  if (_isFounding && !res.error) {
    _foundingPending = false;
    userTreeFounded  = true;
    _syncFoundingLock();          // odemknout ostatni spready
    // Vyusteni ritualu patri do STROMU, ne do ctecky (KUKY 2026-07-19: „kdyz na to
    // koukam, tak by se to tam neveslo"). Ctecka uz nese vyklad, hlas a dve tlacitka;
    // treti potvrzovaci blok se tam necpe. Ve strome na uzivatele ceka text
    // zakladacich Norn, ktery tam zustane naporad — to je to potvrzeni.
    if (currentUser && typeof _loadFoundingReading === 'function' && res.reading_id) {
      await _loadFoundingReading(res.reading_id);
    }
    setTimeout(function () {
      if (typeof showAppTab === 'function') showAppTab('tree');
    }, DELAY_FOUNDING_TO_TREE);
  }
}

function _spreadTokens(key, fallback) {
  return (SPREAD_CONFIG && SPREAD_CONFIG[key]) ? SPREAD_CONFIG[key].tokens : fallback;
}

// Kříž — 5-rune cross
function _generateSpread5Reading() {
  return _generateSpreadReading({ runes: _spread5Runes.filter(Boolean), min: 5, buildPrompt: buildKrizPrompt,
    tokens: _spreadTokens('cross', 1100), credits: SPREAD_COSTS.cross.credits,
    outputId: 'spread5-output', outId: 's5-out', lblId: 's5-kriz-lbl', kind: 'KRIZ' });
}

// Horseshoe — 7 runes
function _generateHorseshoeReading() {
  return _generateSpreadReading({ runes: _spread7Runes.filter(Boolean), min: 7, buildPrompt: buildHorseshoePrompt,
    tokens: _spreadTokens('horseshoe', 1300), credits: SPREAD_COSTS.horseshoe.credits,
    outputId: 'spread7-output', outId: 's7-out', lblId: 's7-horseshoe-lbl', kind: 'HORSESHOE' });
}

// Yggdrasil — 9 worlds
function _generateYggdrasilReading() {
  return _generateSpreadReading({ runes: _spread9Runes.filter(Boolean), min: 9, buildPrompt: buildYggdrasilPrompt,
    tokens: _spreadTokens('yggdrasil', 1800), credits: SPREAD_COSTS.yggdrasil.credits,
    outputId: 'spread9-output', outId: 's9-out', lblId: 's9-yggdrasil-lbl', kind: 'YGGDRASIL' });
}

// Norns — 3-rune fate axis (norns_axis: [0]=urd [1]=verdandi [2]=skuld)
function _generateNornsReading() {
  return _generateSpreadReading({ runes: _spread3Runes.filter(Boolean), min: 3, buildPrompt: buildNornsPrompt,
    tokens: _spreadTokens('norns', 900), credits: SPREAD_COSTS.norns.credits,
    outputId: 'spread3-output', outId: 's3-out', lblId: 's3-norns-lbl', kind: 'NORNS' });
}

// ─── READING MODE ─────────────────────────────────────────────────────────────

// Switch between 'mine' (personal) and 'someone' (for another person, no save).
function switchReadingMode(mode) {
  _readingMode = mode;
  var nameInp = document.getElementById('r-name');
  if (nameInp) nameInp.value = '';
  setSt('st-setup', '');
  _updateReadingForm();
}

// Update Reading setup form based on mode + user state.
// Called on: showAppTab('reading'), lang change, login, name save.
function _updateReadingForm() {
  _paintSpreadCost();   // 2026-09-29: cena čtení se mění s jazykem a s přihlášením
  var isMine    = (_readingMode === 'mine');
  var isRS      = currentUser && (userTier === 'rune_seeker' || userTier === 'standard'
                  || userTier === 'premium' || isAdmin(currentUser.email));
  // Known = mine mode + name known + life rune revealed in ToL
  var knownUser = isMine && !!userName && !!_lifeRuneNum;

  // Mode toggle visibility — RS+ only
  var modeRow = document.getElementById('reading-mode-row');
  if (modeRow) modeRow.style.display = isRS ? 'flex' : 'none';

  // Mode button labels + active state
  var btnMine = document.getElementById('rmode-btn-mine');
  var btnSom  = document.getElementById('rmode-btn-someone');
  if (btnMine) { btnMine.classList.toggle('active', isMine); btnMine.textContent = t('reading_mode_mine'); }
  if (btnSom)  { btnSom.classList.toggle('active', !isMine); btnSom.textContent = t('reading_mode_someone'); }

  // Card title — always BEFORE WE BEGIN; append name when user is fully known (MY READING mode)
  var titleEl = document.getElementById('reader-card1-lbl');
  if (knownUser && userName && isMine) {
    if (titleEl) titleEl.textContent = t('reader_card1_lbl') + ', ' + userName.toUpperCase();
  } else {
    if (titleEl) titleEl.textContent = t('reader_card1_lbl');
  }

  // Note text — same message for both known and unknown (MY READING); different for FOR SOMEONE
  var noteEl = document.getElementById('reader-note');
  if (noteEl) {
    if (!isMine) noteEl.textContent = t('setup_someone_note');
    else         noteEl.textContent = t('reader_note');
  }

  // Name row — hidden when own reading and user is fully known
  var nameRow = document.getElementById('setup-name-row');
  if (nameRow) nameRow.style.display = knownUser ? 'none' : 'block';

  // Name label + placeholder
  var nameLbl = document.getElementById('name-lbl');
  var nameInp = document.getElementById('r-name');
  if (nameLbl) nameLbl.textContent = isMine ? t('name_lbl') : t('setup_for_name_lbl');
  if (nameInp) nameInp.placeholder = isMine ? t('name_ph') : t('setup_for_name_ph');
}

// Norns = NORMALNI placeny spread (2 kredity) pro KAZDEHO prihlaseneho (KUKY 2026-08-03,
// oprava regrese: founding gate driv skryl Norns i jako normalni spread). Nize je o FOUNDINGU:
// Duvod je rituálni i prakticky: Norny jsou zakladani stromu a to je KROK 2 —
// server je bez zivotni runy stejne odmitne (claude-proxy, mode 'founding').
// Tohle je jen dusledna nabidka, ne ochrana; branou je proxy.
// Behem zakladani jsou ostatni spready NEDOSTUPNE. Zalozeni je ritual s jednim
// krokem, ne nabidka — a kdyby uzivatel odesel do jineho spreadu, priznak
// _foundingPending by mu zdarma zaplatil neco jineho, nez si vybral.
function _syncFoundingLock() {
  var lock = (typeof _foundingPending !== 'undefined') && _foundingPending;
  // Formular (oblast zivota, co hledas, pro koho) u zakladani nedava smysl —
  // ritual je dany, ne konfigurovatelny. Owner na nej narazil a nevedel, proc tam je.
  var setup = document.getElementById('reader-setup');
  var story = document.getElementById('founding-story');
  if (setup) {
    if (lock) {
      setup.style.display = 'none';
    } else {
      // Neukazovat setup zpet, kdyz uz bezi cteni (rune-card nebo output viditelny).
      // _syncFoundingLock jede i z async fetchUserProfile ~1-2s po startu cteni; bez teto
      // podminky prekryl rozdelane cteni formularem (oprava KUKY 2026-08-03).
      var _rc = document.getElementById('reader-rune-card');
      var _ro = document.getElementById('reader-output');
      var _mid = (_rc && _rc.style.display !== 'none') || (_ro && _ro.style.display !== 'none');
      if (!_mid) setup.style.display = '';
    }
  }
  if (story) {
    story.style.display = lock ? 'block' : 'none';
    if (lock) {
      var sl = document.getElementById('founding-story-lbl');
      var stx = document.getElementById('founding-story-text');
      if (sl)  sl.textContent  = t('founding_story_lbl');
      if (stx) stx.textContent = t('founding_story_text');
    }
  }
  ['single','kriz','horseshoe','yggdrasil'].forEach(function (m) {
    var b = document.getElementById('mode-btn-' + m);
    if (!b) return;
    b.disabled = lock;
    b.style.opacity = lock ? '0.35' : '';
    b.style.pointerEvents = lock ? 'none' : '';
  });
}

function _syncNornsGate() {
  var has = !!currentUser;   // Norns viditelny pro kazdeho prihlaseneho; founding rozlisuje _foundingPending, ne viditelnost
  var btn = document.getElementById('mode-btn-norns');
  var row = document.getElementById('spread-mode-row');
  if (btn) btn.style.display = has ? '' : 'none';
  if (row) row.classList.toggle('no-norns', !has);
  // Kdyby uzivatel v Nornach stal a runu ztratil (odhlaseni, reset), nesmi
  // zustat ve skrytem modu — spadl by do slotu, ktery nevidi.
  if (!has && typeof _spreadMode !== 'undefined' && _spreadMode === 'norns') {
    _setSpreadMode('single');
  }
  _syncFoundingLock();
}
