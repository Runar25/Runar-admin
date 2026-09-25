// Tap a drawn-rune glyph in a reading -> small popup with the rune's name + meaning.
// Main value: spreads show glyphs only (◇ · H · B); tapping identifies each rune.
// Mobile-friendly (click, not hover). Loaded by runar-reader.html. Classic script.
// Glyph spans carry data-rune (name) + data-kw (keywords), set in runar-reading.js.
//
// Meaning-tap (2026-09-14, KUKY 2026-09-13): glyf s data-lore="<id prvku se ctenim>" dostane
// vyznamy jako KLIKACI stitky — klik na vyznam zvyrazni misto ve cteni, klik kamkoli jinam
// zvyrazneni zrusi. data-lore ma dnes JEN zivotni runa (runar-tree.js); cteni ho nemaji,
// takze jejich popup je beze zmeny (single/spready → vlastni rozhodnuti, RUNAR_BACKLOG.md).
(function () {
  var pop = null;

  function ensure() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'rune-pop';
    pop.style.display = 'none';
    document.body.appendChild(pop);
    return pop;
  }
  function hide() { if (pop) pop.style.display = 'none'; }

  // ── Meaning-tap ───────────────────────────────────────────────────────────
  var _hl = null; // { el, html } — puvodni obsah prvku pred zvyraznenim

  // Kandidatni tvary hledani, od nejpresnejsiho: cela fraze → fraze s oriznutym koncem
  // (islandske ohybani: kyrrstaða → kyrrstöðu) → jednotliva plnovyznamova slova, delsi
  // napred, tez s orezy (ze „skýrleiki í kulda" se hleda skýrleiki, ne predlozka).
  // Orez max o 3 znaky a kmen aspon 3 znaky, aby se nechytalo kdeco.
  var _STOP = { and: 1, the: 1, of: 1, to: 1, through: 1, og: 1, 'i': 1, 'ad': 1, 'an': 1, 'a': 1 };
  // Skladani ZNAK ZA ZNAK (1:1, delka se nemeni → indexy zvyrazneni sedi na puvodni text).
  // Duvod: islandske ohybani meni i souhlasky — bíða → rozkaz „bíddu" (ð→dd), podst. „bið"
  // (dlouhe í → kratke i). Bez slozeni je klic „að bíða" v textu nenajitelny (✗ v ㉣ 2026-09-14).
  var _FOLDMAP = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ý': 'y', 'ð': 'd', 'þ': 't', 'ö': 'o', 'æ': 'e' };
  function _fold1(str) {
    var r = '';
    for (var i = 0; i < str.length; i++) { var ch = str[i]; r += _FOLDMAP[ch] || ch; }
    return r;
  }
  function _kwStems(phrase) {
    var p = _fold1(String(phrase || '').trim().toLowerCase());
    if (!p) return [];
    var out = [], seen = {};
    function pridej(s) { if (s && s.length >= 3 && !seen[s]) { seen[s] = 1; out.push(s); } }
    function sOrezy(s) { pridej(s); for (var c = 1; c <= 3 && s.length - c >= 3; c++) pridej(s.slice(0, s.length - c)); }
    sOrezy(p);
    var slova = p.split(/\s+/).filter(function (w) { return !_STOP[w] && w.length >= 3; });
    slova.sort(function (a, b) { return b.length - a.length; });
    slova.forEach(sOrezy);
    return out;
  }
  // Prvni tvar, ktery v textu je → { stem }. null = vyznam v textu nestoji (stara cteni
  // vznikla pred pozadavkem na viditelna klicova slova) — pak se nezvyrazni nic.
  function _kwFindIn(text, phrase) {
    var low = _fold1(String(text || '').toLowerCase());
    var stems = _kwStems(phrase);
    for (var i = 0; i < stems.length; i++) if (low.indexOf(stems[i]) !== -1) return { stem: stems[i] };
    return null;
  }

  // Nalezeny kmen roztahni na cele slovo („bíd" → „bíddu") — zvyraznuje se slovo, ne kmen.
  function _kwExpand(txt, od, kon) {
    var pis = function (ch) { return !!ch && /[\p{L}]/u.test(ch); };
    while (od > 0 && pis(txt[od - 1])) od--;
    while (kon < txt.length && pis(txt[kon])) kon++;
    return [od, kon];
  }

  // Hranice VETY kolem nalezeneho slova: od posledniho [.!?…] pred nim (bez uvodnich mezer)
  // po prvni [.!?…] za nim vcetne. KUKY 2026-09-14: „ma se oznacit to, co reprezentuje ten
  // vyznam ve vete… veta, souveti nebo cast vety" — uzivatel ma videt, KTERA veta vyznam nese.
  function _kwSentence(txt, od, kon) {
    var stopka = /[.!?…]/;
    var zac = 0;
    for (var i = od - 1; i >= 0; i--) if (stopka.test(txt[i])) { zac = i + 1; break; }
    while (zac < od && /\s/.test(txt[zac])) zac++;
    var end = txt.length;
    for (var j = kon; j < txt.length; j++) if (stopka.test(txt[j])) { end = j + 1; break; }
    return [zac, end];
  }

  // Ciste rozlozeni: pro dany kmen vrati vety [{s,e,slova:[[s,e],…]}] — bez DOM, takze ho
  // kontrola ㉣ protlaci primo (mutace „veta = jen slovo" 2026-09-14 prosla, kdyz test miril
  // jen na _kwSentence a ne na tohle slozeni; §19.3).
  function _kwMarkup(txt, stem) {
    var low = _fold1(txt.toLowerCase());
    var slova = [], od = 0, na;
    while ((na = low.indexOf(stem, od)) !== -1) {
      var ex = _kwExpand(txt, na, na + stem.length);
      slova.push(ex);
      od = ex[1];
    }
    var vety = [];
    slova.forEach(function (w) {
      var v = _kwSentence(txt, w[0], w[1]);
      if (vety.length && v[0] <= vety[vety.length - 1].e) {
        vety[vety.length - 1].e = Math.max(vety[vety.length - 1].e, v[1]);
      } else vety.push({ s: v[0], e: v[1] });
    });
    vety.forEach(function (v) { v.slova = slova.filter(function (w) { return w[0] >= v.s && w[1] <= v.e; }); });
    return vety;
  }

  function clearKwHl() {
    // Obnovit jen kdyz zvyrazneni v prvku OPRAVDU je — jinak by stary snapshot prepsal text,
    // ktery mezitim prekreslilo neco jineho (prepnuti jazyka, nove cteni).
    if (_hl && _hl.el && _hl.el.querySelector && _hl.el.querySelector('.kw-hl')) _hl.el.innerHTML = _hl.html;
    _hl = null;
  }
  function applyKwHl(chip) {
    clearKwHl();
    var el = document.getElementById(chip.getAttribute('data-lore') || '');
    if (!el) return;
    var found = _kwFindIn(String(el.textContent || ''), chip.textContent);
    if (!found) return;
    _hl = { el: el, html: el.innerHTML };
    var stem = found.stem;
    // Jen textove uzly prvni urovne — text cteni je „text + <br>", nic hlubsiho tam neni.
    // Zvyraznuje se VETA (kw-hl-sent), nalezene slovo v ni silneji (kw-hl).
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var txt = n.nodeValue, low = _fold1(txt.toLowerCase());
      if (low.indexOf(stem) === -1) return;
      var vety = _kwMarkup(txt, stem);
      if (!vety.length) return;
      var frag = document.createDocumentFragment(), poz = 0;
      vety.forEach(function (v) {
        frag.appendChild(document.createTextNode(txt.slice(poz, v.s)));
        var sent = document.createElement('span');
        sent.className = 'kw-hl-sent';
        var p2 = v.s;
        v.slova.forEach(function (w) {
          sent.appendChild(document.createTextNode(txt.slice(p2, w[0])));
          var sp = document.createElement('span');
          sp.className = 'kw-hl';
          sp.textContent = txt.slice(w[0], w[1]);
          sent.appendChild(sp);
          p2 = w[1];
        });
        sent.appendChild(document.createTextNode(txt.slice(p2, v.e)));
        frag.appendChild(sent);
        poz = v.e;
      });
      frag.appendChild(document.createTextNode(txt.slice(poz)));
      el.replaceChild(frag, n);
    });
  }

  // Fáze B1: gild the tapped rune's text segment (gold-only, others unchanged).
  function clearSeg() {
    document.querySelectorAll('.rseg.on').forEach(function (s) { s.classList.remove('on'); });
    document.querySelectorAll('.rlbl-glyph.seg-active').forEach(function (x) { x.classList.remove('seg-active'); });
  }
  function toggleSeg(g) {
    var idx = g.getAttribute('data-seg');
    if (idx === null) return;
    var alreadyOn = false;
    document.querySelectorAll('.rseg[data-seg="' + idx + '"].on').forEach(function () { alreadyOn = true; });
    clearSeg();
    if (!alreadyOn) {
      document.querySelectorAll('.rseg[data-seg="' + idx + '"]').forEach(function (s) { s.classList.add('on'); });
      g.classList.add('seg-active');
    }
  }

  document.addEventListener('click', function (e) {
    // Stitek vyznamu ma prednost pred vsim: zvyrazni a popup zavri.
    var chip = e.target && e.target.closest ? e.target.closest('.rune-pop-kw-item') : null;
    if (chip) { applyKwHl(chip); hide(); clearSeg(); return; }
    // 2026-09-25: i glyf životní runy v hlavičce (data-rune-pop, _renderLifeBadge) — report KUKY 08:28.
    var g = e.target && e.target.closest ? e.target.closest('.rlbl-glyph, [data-rune-pop]') : null;
    if (!g || !g.getAttribute('data-rune')) { hide(); clearSeg(); clearKwHl(); return; }

    var p = ensure();
    var kw = g.getAttribute('data-kw');
    // Build empty structure, then set text via textContent (no injection from data).
    p.innerHTML = '<span class="rune-pop-g"></span><span class="rune-pop-n"></span>' +
                  (kw ? '<span class="rune-pop-kw"></span>' : '');
    p.querySelector('.rune-pop-g').innerHTML = g.innerHTML;   // g holds a runeSvg SVG (trusted), not text
    p.querySelector('.rune-pop-n').textContent = g.getAttribute('data-rune');
    var lore = g.getAttribute('data-lore');
    // Zakladni .rune-pop ma pointer-events:none — klikaci je jen popup s vyznamy.
    pop.classList[lore ? 'add' : 'remove']('rune-pop--tap');
    if (kw) {
      var kwEl = p.querySelector('.rune-pop-kw');
      if (lore) {
        kw.split(',').forEach(function (jeden) {
          var t2 = jeden.trim();
          if (!t2) return;
          var it = document.createElement('span');
          it.className = 'rune-pop-kw-item';
          it.textContent = t2;
          it.setAttribute('data-lore', lore);
          kwEl.appendChild(it);
        });
      } else kwEl.textContent = kw;
    }
    p.style.display = 'block';

    // Position above the glyph, centred, clamped to the viewport (flip below if no room).
    var r = g.getBoundingClientRect();
    var pw = p.offsetWidth, ph = p.offsetHeight;
    var vw = document.documentElement.clientWidth;
    var left = window.scrollX + r.left + r.width / 2 - pw / 2;
    var top = window.scrollY + r.top - ph - 8;
    if (r.top - ph - 8 < 4) top = window.scrollY + r.bottom + 8;
    left = Math.max(window.scrollX + 6, Math.min(left, window.scrollX + vw - pw - 6));
    p.style.left = left + 'px';
    p.style.top = top + 'px';
    toggleSeg(g);
  });

  // Testovaci prusvit (kontrola ㉣): ciste funkce hledani, bez DOM.
  window._runePopKw = { stems: _kwStems, findIn: _kwFindIn, expand: _kwExpand, sentence: _kwSentence, markup: _kwMarkup };

  window.addEventListener('scroll', hide, true);
})();
