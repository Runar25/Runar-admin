// Tap a drawn-rune glyph in a reading -> small popup with the rune's name + meaning.
// Main value: spreads show glyphs only (◇ · H · B); tapping identifies each rune.
// Mobile-friendly (click, not hover). Loaded by runar-reader.html. Classic script.
// Glyph spans carry data-rune (name) + data-kw (keywords), set in runar-reading.js.
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

  document.addEventListener('click', function (e) {
    var g = e.target && e.target.closest ? e.target.closest('.rlbl-glyph') : null;
    if (!g || !g.getAttribute('data-rune')) { hide(); return; }

    var p = ensure();
    var kw = g.getAttribute('data-kw');
    // Build empty structure, then set text via textContent (no injection from data).
    p.innerHTML = '<span class="rune-pop-g"></span><span class="rune-pop-n"></span>' +
                  (kw ? '<span class="rune-pop-kw"></span>' : '');
    p.querySelector('.rune-pop-g').textContent = g.textContent;
    p.querySelector('.rune-pop-n').textContent = g.getAttribute('data-rune');
    if (kw) p.querySelector('.rune-pop-kw').textContent = kw;
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
  });

  window.addEventListener('scroll', hide, true);
})();
