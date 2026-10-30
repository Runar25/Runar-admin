// ═══════════════════════════════════════════════════════
// RÚNAR · JOURNAL
// DB load, render, filter, audio playback for reading journal
// Depends on globals: lang, currentUser, userTier, sb
// Depends on functions: t(), _makeCapPlayer(), _capWire()
// ═══════════════════════════════════════════════════════

// ─── DB: JOURNAL ─────────────────────────────────────────
// Limit podle tieru: TIERS.*.journal (číslo = posledních N, null = celý deník) — jediné místo (§10; 2026-10-22 bez TIER_LIMITS).
function journalLimit() {
  var j = (TIERS[normalizeTier(userTier)] || TIERS.rune_seeker).journal;
  return (typeof j === 'number' && j > 0) ? j : null;
}

async function loadJournal() {
  if (!currentUser) { hideJournal(); return; }
  try {
    let q = sb.from('readings')
      .select('id, rune_name, rune_glyph, lang, short_text, deep_text, area, aol, seeking, intention, question, life_rune, credits_used, drawn_at, follow_up, usage')
      .eq('user_id', currentUser.id)
      // 'someone' readings (tester test data) never appear in the user's own journal
      .or('reading_mode.is.null,reading_mode.eq.mine')
      .order('drawn_at', { ascending: false });
    const lim = journalLimit();
    if (lim) q = q.limit(lim);
    const { data, error } = await q;
    if (error) throw error;   // klient chybu nevyhazuje — bez tohohle by chyba vypadala jako prázdný deník (2026-10-10)
    _journalCache = data || [];
    renderJournal(_journalCache);
    if (userTier === 'standard' || userTier === 'premium') {
      populateJournalFilters(_journalCache);
    } else {
      updateJournalTeaser();
    }
  } catch(e) { _journalLoadFailed(); }
}

// Chyba načtení u přihlášeného (2026-10-10, BACKLOG „Kontrola návštěvníka“ bod 2): do té doby se ukázala brána návštěvníka
// („…It opens when you become a Rune Seeker“) i Rune Seekerovi, kterému jen spadlo spojení. Už načtená čtení nechat — přepsat je
// hláškou by bylo horší než starý seznam; prázdný deník dostane hlášku místo „zatím žádná čtení“.
function _journalLoadFailed() {
  if (_journalCache.length) return;
  const gate    = document.getElementById('journal-gate');
  const content = document.getElementById('journal-content');
  const list    = document.getElementById('journal-list');
  const countEl = document.getElementById('journal-pane-count');
  if (gate)    gate.style.display    = 'none';
  if (content) content.style.display = 'block';
  if (countEl) countEl.textContent   = '';
  if (list)    list.innerHTML = `<div class="journal-empty">${t('journal_load_err')}</div>`;
}

function hideJournal() {
  const gate    = document.getElementById('journal-gate');
  const content = document.getElementById('journal-content');
  if (gate)    gate.style.display    = 'block';
  if (content) content.style.display = 'none';
}

// 2026-09-25: co člověk zadal (oblast · hledání · záměr) do řádku s datem; u spreadu nese oblast `aol` (area = 'spread').
function _jVolby(e, isSpread) {
  const v = [isSpread ? e.aol : e.area, e.seeking, e.intention].filter(Boolean).map(escapeHtml);
  return v.length ? ' · ' + v.join(' · ') : '';
}
// Situace, výměny Asku (otázka + odpověď) a pro adminy model, který čtení napsal (readings.usage.model).
function _jDetail(e) {
  // 2026-09-29 (KUKY „ať přesně vidíme každé čtení“): admin vidí u modelu i cenu a čas — u čtení i u každé výměny Asku.
  const adm = !!(currentUser && isAdmin(currentUser.email));
  const meta = function (us) { const l = costLabel(us); return `<div class="jcard-life-rune">Model: ${escapeHtml(_jModel(us.model))}${l ? ' · ' + escapeHtml(l) : ''}</div>`; };
  let h = e.question ? `<div class="jcard-question">❝ ${escapeHtml(e.question)} ❞</div>` : '';
  const asks = Array.isArray(e.follow_up) ? e.follow_up.filter(function (f) { return f && f.a; }) : [];
  if (asks.length) h += `<div class="jcard-layer-lbl" style="margin-top:18px;">${t('ask_lbl')}</div>` + asks.map(function (f) {
    return (f.q ? `<div class="jcard-question">❝ ${escapeHtml(f.q)} ❞</div>` : '') + `<div class="jcard-text">${escapeHtml(f.a)}</div>`
      + (adm && f.usage && f.usage.model ? meta(f.usage) : '');
  }).join('');
  if (e.life_rune) h += `<div class="jcard-life-rune">${t('life_rune_short')}: ${escapeHtml(e.life_rune)}</div>`;
  if (adm && e.usage && e.usage.model) h += meta(e.usage);
  return h;
}
// „claude-opus-4-8“ → „Opus 4.8“, „gpt-6-sol“ → „GPT-6 sol“ (jen popisek pro admina).
function _jModel(m) {
  m = String(m);
  if (m.indexOf('claude-') === 0) { const p = m.slice(7).split('-'); return p[0].charAt(0).toUpperCase() + p[0].slice(1) + ' ' + p.slice(1).join('.'); }
  if (m.indexOf('gpt-') === 0) return 'GPT-' + m.slice(4).replace('-', ' ');
  return m;
}

// 2026-10-03 (KUKY „11 udělej zlatý řádek ✦ i v deníku“): myšlenka ✦ je v uloženém textu čtení uvnitř (server ukládá celý výstup,
// DECISIONS 2026-09-30 (12)). Deník ji odtrhne TOUŽ funkcí jako čtení (_splitThought, runar-character.js — §18) a ukáže zlatým
// řádkem pod textem; zabalený záznam ukazuje jen začátek čtení (řádek se odkryje s rozbalením, runar-reader.css .jcard-thought).
function _jThought(txt) {
  const s = String(txt || '');
  if (typeof _splitThought !== 'function' || s.indexOf('\u2726') === -1) return { text: s, thought: '' };
  const sp = _splitThought(s, []);
  return { text: sp.reading, thought: sp.thought };
}
function _jThoughtHtml(th) { return th ? `<div class="jcard-thought">${myslenkaSvg()}${escapeHtml(th)}</div>` : ''; }   // pírko Huginna (2026-10-30)

// Hlas čtení v deníku (2026-10-11, owner: „vytvoří se čtení, uloží do databáze a může přehrát znova v deníku ne?“; DECISIONS (61)).
// Rúnar čtení přečte jednou a server hlas uloží — další přehrání (tady i ve čtení) je zdarma. Zakládací Norny hlas nemají (textový
// rituál, runar-reading.js; server je odmítne taky). Popisek vlastní (jcard_voice_btn — owner: „hear the reading by znělo líp“), stavy
// a hláška chyby jako u čtení (_voiceErrMsg, runar-reading.js). Tlačítko s Rúnarovými slovy o RUNĚ z Kolekce (jcard_audio_btn,
// playJournalAudio) z deníku pryč 2026-10-11 — owner: „z kolekce? to je určitě špatně. ty mají být jen v kolekci“.
var _jEntries = [];
function _jHlas(e, i) {
  if (!e || !e.id || (typeof _foundingReadingId !== 'undefined' && e.id === _foundingReadingId)) return '';
  // popisek začíná runou (ᚢ) → do tlačítka ho dá setRuneText v renderJournal (naše SVG, ne písmo — §5, smoke ㉻)
  return '<button class="jcard-audio-btn jvoice-btn" id="jvoice-btn-' + i + '" onclick="playReadingVoice(' + i + ')"></button>' +
         '<div class="jcard-audio-player" id="jvoice-' + i + '"></div>';
}
async function playReadingVoice(i) {
  const e = _jEntries[i];
  const btn = document.getElementById('jvoice-btn-' + i), player = document.getElementById('jvoice-' + i);
  if (!e || !btn || !player || !currentUser) return;
  btn.disabled = true; setRuneText(btn, t('voice_btn_loading'));
  try {
    const { data: { session } } = await sb.auth.getSession();
    const h = { 'Content-Type': 'application/json' };
    if (session && session.access_token) h['Authorization'] = 'Bearer ' + session.access_token;
    // `text` jen pro starou verzi serveru (do nasazení); nová si text vezme z deníku podle reading_id.
    const txt = _jThought(e.area === 'spread' ? e.deep_text : e.short_text).text;
    const res = await fetch(EL_PROXY, { method: 'POST', headers: h, body: JSON.stringify({ reading_id: e.id, lang: e.lang, text: txt }) });
    let data = {};
    try { data = await res.json(); } catch (_e) {}
    if (!res.ok || !data.audio_url) {
      console.error('journal voice failed:', res.status, (data && data.error) || '');
      if (data && data.error === 'voice_used') { setRuneText(btn, t('voice_btn_done')); return; }
      setRuneText(btn, t('jcard_voice_btn')); btn.disabled = false;
      if (typeof showToast === 'function') showToast(_voiceErrMsg(data, res.status));
      return;
    }
    const blob = await fetch(data.audio_url).then(function (r) { return r.blob(); });
    player.innerHTML = _makeCapPlayer('jv' + i, URL.createObjectURL(blob), true);
    _capWire('jv' + i, true);
    // název a runy na zamčené obrazovce: výklad nese runy v short_text „ᛈ PERTH · ᛇ EIHWAZ“ (jako _jSpreadRunes), jedna runa v rune_name
    const _jRuny = typeof RUNES === 'undefined' ? [] : (e.area === 'spread'
      ? String(e.short_text || '').split(' · ').map(function (kus) { const g = kus.trim().split(' ')[0]; return RUNES.find(function (x) { return x.g === g; }); })
      : [RUNES.find(function (x) { return x.n === e.rune_name; })]).filter(Boolean);
    svickaNazev('jv' + i, e.rune_name || '', _jRuny.length ? _jRuny : null);
    setRuneText(btn, t('voice_btn_done'));
    if (!data.stored && typeof syncFreeBalance === 'function') syncFreeBalance(currentUser.id);   // menu testera: počet hlasů
  } catch (err) {
    console.error('journal voice error:', err && err.message);
    setRuneText(btn, t('jcard_voice_btn')); btn.disabled = false;
  }
}

function renderJournal(entries) {
  const list = document.getElementById('journal-list');
  if (!list) return;

  const gate    = document.getElementById('journal-gate');
  const content = document.getElementById('journal-content');

  if (!currentUser) { hideJournal(); return; }
  if (gate)    gate.style.display    = 'none';
  if (content) content.style.display = 'block';

  const isStandard = userTier === 'standard' || userTier === 'premium';
  const isIs = lang === 'is';

  // Header counts
  const titleEl = document.getElementById('journal-pane-title');
  const countEl = document.getElementById('journal-pane-count');
  // 2026-10-20 (owner „symbol na začátku by mohla být otevřená kniha“): ikona knihy místo ✦, tenká linka jako ikony záložek (.atab-ikona)
  // kniha s řádky, do kterých píše pero (_peroVDeniku); kreslí jen při změně, ať běžící pero nepřijde o svou knihu
  if (titleEl && titleEl._knihaTxt !== String(t('journal_title'))) {
    titleEl.innerHTML = _knihaSvg() + String(t('journal_title')).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    titleEl._knihaTxt = String(t('journal_title'));
  }
  // Počet: Standard vidí všechna čtení („5 lestrar“), ostatní jen posledních pár („síðustu 5“). Jedno čtení = „1 lestur“ v obou
  // (2026-10-10: dřív „1 lestrar“ / „1 readings“ a islandský štítek posledních čtení jako kalk z „last N“ — zakázaný tvar
  // je v check-is.py; tvar podle čísla dělá vn, VOCAB.reading).
  var n = entries.length;
  if (countEl) countEl.textContent = n === 0 ? '' : (isStandard || n === 1) ? vn('reading', n, lang) : tp('journal_count_recent', { n: n });

  // Filter bar
  const filterBar = document.getElementById('journal-filter-bar');
  if (filterBar) filterBar.style.display = isStandard ? 'flex' : 'none';

  // Empty state
  if (entries.length === 0) {
    list.innerHTML = `<div class="journal-empty">${t('journal_empty')}</div>`;
    return;
  }

  // Řádek run spreadu („ᛃ JERA · ᛖ EHWAZ · ○ BLANK“, uložený rune_display) → kámen z runeSvg + jméno (2026-09-27, §5).
  // Runa se hledá podle GLYFU (jednoznačný v obou jazycích; jméno je v jazyce čtení). Co se nepozná (Gathering, starý formát),
  // zůstane textem jako dřív — nic se neztratí.
  const _jSpreadRunes = function (txt) {
    const s = String(txt || '');
    if (!s || typeof RUNES === 'undefined' || typeof runeSvg !== 'function') return escapeHtml(s);
    let poznano = 0;
    const html = s.split(' · ').map(function (kus) {
      const k = kus.trim(), mez = k.indexOf(' ');
      const g = mez > 0 ? k.slice(0, mez) : '', jm = mez > 0 ? k.slice(mez + 1) : k;
      const r = g ? RUNES.find(function (x) { return x.g === g; }) : null;
      if (!r) return escapeHtml(k);
      poznano++;
      return '<span class="jcard-srune">' + runeSvg(r, { frame: true, cls: 'badge-stone' }) + ' ' + escapeHtml(jm) + '</span>';
    }).join(' · ');
    return poznano ? html : escapeHtml(s);
  };
  _jEntries = entries;   // playReadingVoice(i) — hlas čtení podle pořadí karty
  list.innerHTML = entries.map((e, i) => {
    // datumUI (runar-utils.js): islandsky i v prohlížeči bez islandských dat — do 2026-10-11 tu Chrome psal „May 21, 2026“.
    const dateStr = datumUI(e.drawn_at, isIs ? 'is' : 'en');
    const isSpread = e.area === 'spread';

    // Every field below is user free text (question/area) or model text — escape before it
    // goes into innerHTML (self-XSS hardening; also renders any literal < in a reading right).
    const nameU  = escapeHtml((e.rune_name || '').toUpperCase());
    const langU  = escapeHtml((e.lang || '').toUpperCase());
    const glyph  = escapeHtml(e.rune_glyph || '◻');
    const _jr = (typeof RUNES !== 'undefined') ? RUNES.find(function(x){ return x.n === e.rune_name; }) : null;
    const glyphHtml = _jr ? runeSvg(_jr, { frame: true, cls: 'jcard-stone' }) : glyph;
    const shortT = escapeHtml(e.short_text || '');
    const deepT  = escapeHtml(e.deep_text || '');
    // Text čtení stojí u spreadu v deep_text, u single v short_text — odtud se odtrhne myšlenka ✦ (_jThought výš).
    const _jt = _jThought(isSpread ? e.deep_text : e.short_text);

    if (isSpread) {
      // ── Multi-rune spread card (Norns / Kríž / Horseshoe / Yggdrasil / Gathering) ──
      const spreadNm = escapeHtml(spreadLabel(e.rune_name, e.lang));
      return `<div class="jcard" id="jcard-${i}">
        <div class="jcard-header" id="jhead-${i}" role="button" tabindex="0" aria-expanded="false" aria-controls="jbody-${i}" onclick="toggleJournalEntry(${i})">
          <div class="jcard-left">
            <div class="jcard-glyph" style="opacity:0.7;">✦</div>
            <div class="jcard-info">
              <div class="jcard-name">✦ ${spreadNm} · ${langU}</div>
              <div class="jcard-date">${dateStr}${_jVolby(e, true)}</div>
              <div class="jcard-gathering-runes">${_jSpreadRunes(e.short_text)}</div>
              <div class="jcard-excerpt" id="jex-${i}">${escapeHtml(_jt.text)}</div>${_jThoughtHtml(_jt.thought)}
            </div>
          </div>
          <span class="xp-plus" id="jarr-${i}" aria-hidden="true">+</span>
        </div>
        <div class="jcard-body" id="jbody-${i}" style="display:none;">${_jDetail(e)}${_jHlas(e, i)}</div>
      </div>`;
    }

    // ── Regular reading card ──
    return `<div class="jcard" id="jcard-${i}">
      <div class="jcard-header" id="jhead-${i}" role="button" tabindex="0" aria-expanded="false" aria-controls="jbody-${i}" onclick="toggleJournalEntry(${i})">
        <div class="jcard-left">
          <div class="jcard-glyph">${glyphHtml}</div>
          <div class="jcard-info">
            <div class="jcard-name">${nameU} · ${langU}</div>
            <div class="jcard-date">${dateStr}${_jVolby(e, false)}</div>
            <div class="jcard-excerpt" id="jex-${i}">${escapeHtml(_jt.text)}</div>${_jThoughtHtml(_jt.thought)}
          </div>
        </div>
        <span class="xp-plus" id="jarr-${i}" aria-hidden="true">+</span>
      </div>
      <div class="jcard-body" id="jbody-${i}" style="display:none;">
        ${e.deep_text ? `
        <div class="jcard-layer-lbl">${t('layer2_lbl')}</div>
        <div class="jcard-text">${deepT}</div>` : ''}
        ${_jDetail(e)}
        ${_jHlas(e, i)}
      </div>
    </div>`;
  }).join('');
  // runa popisku = naše SVG (§5); kontroly ㉭ ㉮ ㉱ pouštějí deník ve zjednodušeném DOM bez querySelectorAll
  if (typeof list.querySelectorAll === 'function') list.querySelectorAll('.jvoice-btn').forEach(function (b) { setRuneText(b, t('jcard_voice_btn')); });

}

// Teaser pro rune_seeker — kolik čtení celkem mají v DB
// 2026-10-22 (DECISIONS 2026-10-22 (3) bod 5): věta, že vyšší účet má celý deník, VŽDY (do té doby až od 6. čtení) —
// nižší účet má vědět, co vyšší dostane. S počtem, když je čtení víc, než deník ukáže.
async function updateJournalTeaser() {
  var lim = journalLimit();
  if (lim === null) return;
  const teaser = document.getElementById('journal-standard-teaser');
  const txt    = document.getElementById('journal-teaser-txt');
  if (!teaser || !txt || !currentUser) return;
  try {
    const { count } = await sb.from('readings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    // 2026-09-30: text z překladů (dřív natvrdo tady, druhá kopie journal_teaser); IS tarif ve 4. pádě („yfir í Vegfaranda“).
    txt.innerHTML = (count && count > lim)
      ? tp('journal_teaser_count', { count: count, tier: tierLabel('standard', lang, 'acc') })
      : tp('journal_teaser', { tier: tierLabel('standard', lang, 'acc') });
    teaser.style.display = 'block';
  } catch { /* silent */ }
}

// Filter journal (Rune Walker+) — data loaded in memory
let _journalCache = [];
function filterJournal() {
  if (!_journalCache.length) return;
  const rune = document.getElementById('jf-rune')?.value || '';
  const area = document.getElementById('jf-area')?.value || '';
  const jlng = document.getElementById('jf-lang')?.value || '';
  const filtered = _journalCache.filter(e => {
    const isSpread = e.area === 'spread';
    if (e.area === 'gathering') return false; // Gathering no longer shown in journal
    if (isSpread) {
      // Spread entries: filter by spread name OR show all spreads, respect lang
      return (!area || area === 'spread' || e.rune_name === area) && (!jlng || e.lang === jlng);
    }
    // Normal entries: hide if area filter is set to spread
    if (area === 'spread') return false;
    return (!rune || e.rune_name === rune) &&
           (!area || e.area === area) &&
           (!jlng || e.lang === jlng);
  });
  renderJournal(filtered);
}

// Přepnutí jazyka na záložce Deník (setLang v runar-app.js): texty karet kreslí jen renderJournal (§14 — do updateUIText nepatří), a tak
// Deník zůstával v předchozí řeči — „✦ SPÁR ÞÍNAR“, „2 lestrar“, „~ DÝPRI HUGLEIÐING“, „HLUSTA Á LESTURINN“, islandské datum v anglické appce
// (nález CODE-read 2026-10-11 při ukázkových čteních bez _journalCache; v produkci Deník překresloval _updateGateTexts v updateUIText, ale
// celý — bez filtru a se zaklapnutými kartami, a proti §14). Překreslí načtená čtení se stejným filtrem, otevřené karty nechá otevřené
// a obnoví pruh pro Rune Seekera; znovu nic nenačítá. Hlídá smoke ㊽ (D).
function prekresliDenik() {
  if (!currentUser || !_journalCache.length) return;
  var otevrene = [];
  document.querySelectorAll('[id^="jex-"]').forEach(function (el) {
    if (el.classList.contains('jcard-excerpt--open')) otevrene.push(+el.id.slice(4));
  });
  var filtr = ['jf-rune', 'jf-area', 'jf-lang'].some(function (id) { var el = document.getElementById(id); return !!(el && el.value); });
  if (filtr) filterJournal(); else renderJournal(_journalCache);
  otevrene.forEach(function (i) { toggleJournalEntry(i); });
  if (!(userTier === 'standard' || userTier === 'premium')) updateJournalTeaser();
}

// Populate filter selectors from journal data
function populateJournalFilters(entries) {
  const runeEl = document.getElementById('jf-rune');
  const areaEl = document.getElementById('jf-area');
  if (!runeEl || !areaEl) return;
  // Exclude Gathering + Spread entries from the rune dropdown (they have no single rune)
  const normal = entries.filter(e => e.area !== 'gathering' && e.area !== 'spread');
  const runes  = [...new Set(normal.map(e => e.rune_name).filter(Boolean))].sort();
  const areas  = [...new Set(normal.map(e => e.area).filter(Boolean))].sort();
  const hasSpread = entries.some(e => e.area === 'spread');
  runeEl.innerHTML = `<option value="">${t('jf_all_runes')}</option>` + runes.map(r => `<option value="${r}">${r}</option>`).join('');
  areaEl.innerHTML = `<option value="">${t('jf_all_areas')}</option>`
    + (hasSpread ? `<option value="spread">${t('jf_spreads')}</option>` : '')
    + areas.map(a => `<option value="${a}">${a}</option>`).join('');
}

// Pero v deníku (2026-10-20, owner: „knihu udělat animovanou s perem … pero zmizí z journalu, objeví se a zapíše do knihy, zmizí z knihy
// a objeví se zase zpět“ → varianta 3 z náhledu docs/inbox/2026-10-20-kniha-pero-kameny-nahled.html). Při každém otevření záložky:
// pero v záložce pohasne, rozsvítí se u knihy, 3 s píše tři řádky, pohasne a vrátí se do záložky. Bez animací (prefers-reduced-motion)
// nic — kniha zůstane s řádky. Polohu bere každý snímek znovu z obrazovky, takže drží i při posunu stránky.
var _PERO_RADKY = [[13.6, 8.6, 19.2], [13.6, 11.2, 19.4], [13.6, 13.8, 18]];
var _PERO_D = '<path d="M19 3C11 5 6 11 5 21"/><path d="M17 5l-5 1.6M15 8l-5 1.6M13 11l-4.5 1.5M11 14.5l-3.5 1.2"/>';
function _knihaSvg() {
  return '<svg class="atab-ikona kniha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"'
    + ' stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5"/><path d="M12 6.5C14 5 17 4.5 21 5v13c-4-.5-7 0-9 1.5"/>'
    + '<path d="M12 6.5v13"/>' + _PERO_RADKY.map(function (r) { return '<path class="rd" stroke-width="0.9" d="M' + r[0] + ' ' + r[1] + ' L' + r[2] + ' ' + r[1] + '"/>'; }).join('') + '</svg>';
}
var _peroBezi = false;
function _peroVDeniku(pokus) {
  if (_peroBezi || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var kn = document.querySelector('#journal-pane-title svg.kniha'), tp = document.querySelector('#atab-journal svg.atab-ikona');
  if (!kn || !tp || !kn.getBoundingClientRect().width) { if ((pokus || 0) < 15) setTimeout(function () { _peroVDeniku((pokus || 0) + 1); }, 200); return; }
  _peroBezi = true;
  var rd = [].slice.call(kn.querySelectorAll('.rd'));
  var pero = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pero.setAttribute('viewBox', '0 0 24 24'); pero.setAttribute('class', 'pero-let'); pero.setAttribute('aria-hidden', 'true');
  pero.setAttribute('fill', 'none'); pero.setAttribute('stroke', 'currentColor'); pero.setAttribute('stroke-width', '1.3');
  pero.setAttribute('stroke-linecap', 'round'); pero.setAttribute('stroke-linejoin', 'round');
  pero.innerHTML = _PERO_D; pero.style.opacity = 0; document.body.appendChild(pero);
  var poloz = function (x, y, op) {   // hrot pera (5,21 z 24×24) na bod knihy (x, y)
    var r = kn.getBoundingClientRect(), s = r.width / 24, w = r.width * 0.95;
    pero.style.width = w + 'px'; pero.style.height = w + 'px'; pero.style.opacity = op;
    pero.style.transform = 'translate(' + (r.left + x * s - w * 5 / 24) + 'px,' + (r.top + y * s - w * 21 / 24) + 'px) rotate(-8deg)';
  };
  rd.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  var R0 = _PERO_RADKY[0], RN = _PERO_RADKY[_PERO_RADKY.length - 1];
  var useky = [[350, function (t) { tp.style.opacity = 1 - t; }], [350, function (t) { poloz(R0[0], R0[1], t); }]];
  _PERO_RADKY.forEach(function (r, k) {
    useky.push([1000, function (t) {
      poloz(r[0] + (r[2] - r[0]) * t, r[1] - 0.5 * Math.abs(Math.sin(t * Math.PI * 7)), 1);
      var L = rd[k].getTotalLength(); rd[k].style.strokeDashoffset = L * (1 - t);
    }]);
  });
  useky.push([350, function (t) { poloz(RN[2], RN[1], 1 - t); }], [350, function (t) { tp.style.opacity = t; }]);
  var konec = function () {
    pero.remove(); tp.style.opacity = ''; rd.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); _peroBezi = false;
  };
  var i = 0, t0 = null;
  (function krok(ts) {
    if (ts) {
      if (t0 === null) t0 = ts;
      if (!document.body.contains(kn)) { konec(); return; }   // deník se mezitím překreslil nebo zavřel
      var u = useky[i], t = Math.min(1, (ts - t0) / u[0]); u[1](t);
      if (t >= 1) { i++; t0 = ts; if (i >= useky.length) { konec(); return; } }
    }
    requestAnimationFrame(krok);
  })();
}

// 2026-09-25 (KUKY: „jen ho rozbalit… nebude tam 2× začátek“): úryvek v hlavičce se rozbalí na celý text; tělo karty
// už čtení neopakuje (nese jen hlubší vrstvu, otázku, životní runu a hlas). Prázdné tělo (spread) zůstává schované.
function toggleJournalEntry(i) {
  const body  = document.getElementById(`jbody-${i}`);
  const head  = document.getElementById(`jhead-${i}`);
  const ex = document.getElementById(`jex-${i}`);
  if (!body && !ex) return;
  const open = ex ? ex.classList.contains('jcard-excerpt--open') : body.style.display !== 'none';
  if (ex) ex.classList.toggle('jcard-excerpt--open', !open);   // vypne CSS ořez na 2 řádky (runar-reader.css)
  if (body) body.style.display = (open || !body.innerHTML.trim()) ? 'none' : 'block';
  if (head) head.setAttribute('aria-expanded', open ? 'false' : 'true');   // 2026-10-20: „+“ → „×“ (rozbalovač; do té doby „▾“)
}


