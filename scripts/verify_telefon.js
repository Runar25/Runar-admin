// verify_telefon.js — appka na telefonu (375 × 812, dotyk): nic nepřetéká přes okraj obrazovky a stránka se nedá posouvat do strany.
//
// Proč (owner 2026-10-22 „5. 1 a 2, udělej to“, rozbor CODE-read „co nikdo nehlídá“, bod 5): kontroly v prohlížeči jedou v okně počítače;
// owner appku používá hlavně na telefonu a posunuté nebo přetékající prvky dnes najde jen on (DECISIONS 2026-10-13 — fotka a formulář
// zmizely, stránka zůstala posunutá; owner to poslal snímkem). Kontrola základu (㉼) mobilní rozložení výslovně neumí.
// Jak: Chrome bez okna s emulací telefonu (šířka 375, dotyk), appka z pracovního stromu, Supabase blokovaná (pojistky). Stavy: návštěvník —
// každá záložka, tah runy, okno cesty, menu; přihlášený Rune Seeker (podvržený jen v prohlížeči) — Spá s pruhem zůstatku, hotové čtení
// (proxy podvržená). V každém stavu: (a) šířka dokumentu ≤ šířka okna (žádné posouvání do strany); (b) žádný viditelný prvek s textem nebo
// tlačítko nesahá přes levý / pravý okraj — kromě prvků uvnitř kontejneru, který posouvání do strany dovoluje (overflow-x auto/scroll; oříznutí hidden/clip je vada).
// Prvek celý mimo obrazovku (zavřené boční menu čeká za pravým okrajem) se nepočítá — vada je přečuhování přes okraj.
// Neumí: překryv dvou prvků přes sebe, velikost písma, výšku (posouvání dolů je v pořádku).
// Přehrávač-svíčka (2026-10-29): stejné viditelné mezery nota → čas → svíčka → délka, svíčka přes většinu řádku, posun po svíčce
// (události ukazatele) přesune zvuk i svíčku tam a zpět a vosk za místem zmizí; malá svíčka rituálu se v IS vejde vedle nadpisu.
//   node scripts/verify_telefon.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const SIRKA = 375, VYSKA = 812;
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const typ = TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', vel = fs.statSync(f).size;
  // Range jako GitHub Pages / Supabase (2026-10-29): bez něj prohlížeč v nenačteném MP3 neskočí a posun po svíčce by nešel ověřit.
  const rg = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (rg) { const od = rg[1] ? +rg[1] : vel - +rg[2], po = rg[1] && rg[2] ? Math.min(+rg[2], vel - 1) : vel - 1;
    res.writeHead(206, { 'Content-Type': typ, 'Content-Range': 'bytes ' + od + '-' + po + '/' + vel, 'Content-Length': po - od + 1, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
    fs.createReadStream(f, { start: od, end: po }).pipe(res); return; }
  res.writeHead(200, { 'Content-Type': typ, 'Content-Length': vel, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

// W = šířka telefonu, ne window.innerWidth: mobilní prohlížeč při širším obsahu stránku oddálí a innerWidth naroste (2026-10-22, útok).
const MERENI = `(() => {
  const W = ${SIRKA}, out = [];
  const docW = document.documentElement.scrollWidth;
  const vid = (e) => { if (!e.getClientRects().length) return false; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; } return true; };
  const vScroll = (e) => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return true; /* oříznuté (hidden/clip) se nevynechává — useknuté tlačítko je vada */ } return false; };
  document.querySelectorAll('body *').forEach((e) => {
    if (e.closest('svg') || /^(SCRIPT|STYLE|AUDIO)$/.test(e.tagName)) return;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').trim();
    if (!own && !/^(BUTTON|INPUT|SELECT|TEXTAREA|A|IMG)$/.test(e.tagName)) return;
    if (!vid(e) || vScroll(e)) return;
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    // celý mimo obrazovku = schovaný záměrně (zavřené boční menu za pravým okrajem); vada je jen přečuhování přes okraj
    if ((r.left < W - 1 && r.right > W + 1) || (r.right > 1 && r.left < -1)) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')) + ' [' + Math.round(r.left) + '–' + Math.round(r.right) + ' px] „' + own.slice(0, 40) + '“');
  });
  return { W, docW, mimo: out.slice(0, 6), pocet: out.length };
})()`;

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const URL = 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html';
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, 'prohlížeč (Chrome/Edge) nenalezen'); srv.close(); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tel-'));
  // --autoplay-policy (2026-10-29): ťuknutí na notu tu nepřijde od člověka → bez přepínače bezhlavý Chrome play() odmítne a dohrání rituálu
  // nejde ověřit. Člověk na notu ťukne, gesto má.
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {}; const exc = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } else if (d.method === 'Runtime.exceptionThrown') exc.push(d.params.exceptionDetails); };
    poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'appka na telefonu', limitS: 240 });
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); const x = r.result || {}; return x.exceptionDetails ? null : (x.result || {}).value; };
    await cmd('Page.enable'); await cmd('Runtime.enable');
    await cmd('Emulation.setDeviceMetricsOverride', { width: SIRKA, height: VYSKA, deviceScaleFactor: 2, mobile: true });
    await cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    const nacti = async () => { await cmd('Page.navigate', { url: URL }); for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof showAppTab === 'function' && document.readyState === 'complete'`)) break; } await sleep(900);
      await ev(`(function(){ document.querySelectorAll('.modal-overlay.open').forEach(function (m) { m.classList.remove('open'); }); setLang('en'); return 1; })()`); };
    const RS = "currentUser = { id: 'tel-rs', email: 'rs@example.invalid' }; userTier = 'rune_seeker'; userCredits = 3; userFreeBalance = 0; profileLoaded = true; updateAuthUI(); updateBanners();";
    const PROXY = "callProxy = async function () { return { text: 'The cattle stand in the byre, breath rising in the cold. Fehu is the rune of what you keep and tend. What would you count first?', reading_id: 'tel' }; }; syncFreeBalance = async function () {}; loadJournal = async function () {}; _loadServerLastImage = async function () {}; fetchUserProfile = async function () {}; if (typeof stream === 'function') stream = async function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };";
    const STAVY = [
      ['návštěvník: Spá', null, "showAppTab('reading'); resetReader();"],
      ['návštěvník: tah runy', null, "startReading(); readerRune = RUNES[0]; readRune();"],
      ['návštěvník: Lestrar', null, "showAppTab('journal');"],
      ['návštěvník: Lífsrúnin', null, "showAppTab('tree');"],
      ['návštěvník: Safn rúna', null, "showAppTab('collection');"],
      ['návštěvník: okno cesty', null, "showAppTab('reading'); openJourney();"],
      ['přihlášený: Spá s pruhem zůstatku', 'nove', RS + " showAppTab('reading'); resetReader();"],
      ['přihlášený: hotové čtení', null, PROXY + " startReading(); readerRune = RUNES[0]; await readRune();"],
    ];
    await nacti();
    const vady = [];
    for (const [jm, novaStranka, akce] of STAVY) {
      if (novaStranka) await nacti();
      const r0 = await ev(`(async function(){ try { ${akce} return 'ok'; } catch (e) { return 'ERR ' + e.message; } })()`);
      await sleep(700);
      const m = await ev(MERENI);
      if (r0 !== 'ok' || !m) { vady.push(jm + ': stav se nepodařilo navodit (' + r0 + ')'); continue; }
      if (m.docW > m.W + 1) vady.push(jm + ': stránka je širší než telefon (' + m.docW + ' > ' + m.W + ' px) — posouvá se do strany');
      if (m.pocet) vady.push(jm + ': ' + m.pocet + ' prvků přes okraj — ' + m.mimo.join(' · '));
    }
    // 2026-10-28 (owner: „nezapomeň, že jméno může být jakékoli délky, ne jen Kuky“): lišta přihlášeného s krátkým i dlouhým jménem —
    // po pozdravu (skutečná cesta showTopbarGreeting) i s otevřenou nabídkou (tužka) se nic viditelného nesmí překrývat. Do té doby se
    // dlouhé jméno měřilo jen ručně a pozdrav se u něj na telefonu smrskl na „G…“ nalepené na RÚNAR.
    const LISTA_PREKRYV = `(async function(jmeno, vnutPozdrav){ ${RS} userName = jmeno; updateAuthUI(); updateDropdown();
      var dd = document.getElementById('auth-dropdown'), g = document.getElementById('topbar-greeting'); dd.classList.remove('open'); g.classList.remove('show');
      greetingShown = false; showTopbarGreeting(); await new Promise(function(r){ setTimeout(r, DELAY_TOAST_IN + 150); }); if (vnutPozdrav) { g.style.transition = 'none'; g.classList.add('show'); }
      var mer = function(){ var b = [], orez = []; document.querySelectorAll('.topbar *').forEach(function(e){ if (dd.contains(e) || (e.closest('svg') && e.closest('svg') !== e) || (e.closest('#topbar-tuzka') && e.id !== 'topbar-tuzka')) return;
        if (e.id !== 'topbar-tuzka' && e.children.length && !(e.tagName === 'svg' || e.tagName === 'SVG')) return; if (!e.getClientRects().length) return; var r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        if (r.width < 1 || cs.opacity === '0' || cs.visibility === 'hidden') return; var k = e.id || e.className.baseVal || e.className || e.tagName; b.push([k, r]);
        if (e.id !== 'auth-user-label' && e.scrollWidth > e.clientWidth + 1) orez.push(k + ' useknutý (' + e.clientWidth + ' z ' + e.scrollWidth + ' px)'); });   // jméno se zkracuje výpustkou záměrně (max-width 160 px)

        var v = []; for (var i = 0; i < b.length; i++) for (var j = i + 1; j < b.length; j++) { var x = b[i][1], y = b[j][1];
          if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1) v.push(b[i][0] + ' × ' + b[j][0]); } return v.concat(orez); };
      var v = mer(); toggleDropdown(); await new Promise(function(r){ setTimeout(r, 50); }); var v2 = mer().map(function(x){ return x + ' (nabídka otevřená)'; }); dd.classList.remove('open'); g.classList.remove('show'); g.style.transition = '';
      return v.concat(v2); })`;
    for (const jmeno of ['Jón', 'Kuky', 'Guðmundur', 'Aðalheiður Sigurðardóttir', 'Bartholomew-Alexander Þorsteinsson']) {
      const v = await ev(LISTA_PREKRYV + '(' + JSON.stringify(jmeno) + ', false)');
      if (!v) vady.push('lišta se jménem „' + jmeno + '“: nešlo změřit'); else if (v.length) vady.push('lišta se jménem „' + jmeno + '“: překryv nebo useknutí ' + v.join(' · '));
    }
    const vSab = await ev(LISTA_PREKRYV + '(' + JSON.stringify('Aðalheiður Sigurðardóttir') + ', true)');   // samotest: pozdrav vnucený i u dlouhého jména
    if (!vSab || !vSab.some((x) => /topbar-greeting/.test(x))) vady.push('SAMOTEST: vnucený pozdrav u dlouhého jména (useknutý „G…“ u RÚNAR) kontrola nepoznala — ' + JSON.stringify(vSab));
    // 2026-10-29 večer (owner: „mám nastavenou appku na EN, ale dostanu IS rituál?“): nahrávka rituálu = jazyk appky. Dvě cesty, kde se
    // rozešly: přepnutí jazyka u hotového čtení se zrušeným oknem „Speak again in …?“ (appka zůstane v EN) a start s uloženou volbou.
    const RIT_OKNO = await ev(`(function(){ setLang(lang === 'en' ? 'is' : 'en'); var m = document.getElementById('lang-switch-modal');
      var r = { lang: lang, src: (document.getElementById('rit-a') || { getAttribute: function(){ return null; } }).getAttribute('src'), nav: (document.getElementById('nav-a') || { getAttribute: function(){ return null; } }).getAttribute('src'), okno: !!(m && m.classList.contains('open')) };
      if (m) m.classList.remove('open'); pendingLang = null; applyLangToggle(lang); return r; })()`);
    if (!RIT_OKNO || !RIT_OKNO.okno) vady.push('rituál × okno přepnutí jazyka: okno se neotevřelo, větev neověřena — ' + JSON.stringify(RIT_OKNO));
    else if (!new RegExp('ritual_' + RIT_OKNO.lang + '\\.mp3').test(RIT_OKNO.src || '')) vady.push('rituál po zrušeném přepnutí jazyka u čtení: appka ' + RIT_OKNO.lang + ', nahrávka ' + RIT_OKNO.src);
    else if (!new RegExp('navod_' + RIT_OKNO.lang + '\\.mp3').test(RIT_OKNO.nav || '')) vady.push('návod po zrušeném přepnutí jazyka u čtení: appka ' + RIT_OKNO.lang + ', nahrávka ' + RIT_OKNO.nav);
    // obyčejné přepnutí jazyka (owner: „když přepnu na jiný, tak se musí i rituál nastavit… všechno má být v té jazykové mutaci“)
    await nacti();
    for (const jaz of ['is', 'en']) {
      const r = await ev(`(function(){ setLang('${jaz}'); return { lang: lang, src: (document.getElementById('rit-a') || { getAttribute: function(){ return null; } }).getAttribute('src'), nav: (document.getElementById('nav-a') || { getAttribute: function(){ return null; } }).getAttribute('src') }; })()`);
      if (!r || r.lang !== jaz || !new RegExp('ritual_' + jaz + '\\.mp3').test(r.src || '')) vady.push('rituál po přepnutí jazyka na ' + jaz + ': ' + JSON.stringify(r));
      if (!r || !new RegExp('navod_' + jaz + '\\.mp3').test(r.nav || '')) vady.push('návod po přepnutí jazyka na ' + jaz + ': ' + JSON.stringify(r));
    }
    for (const jaz of ['en', 'is']) {
      await ev(`localStorage.setItem('runar_lang', '${jaz}'); 1`);
      await cmd('Page.navigate', { url: URL });
      for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof showAppTab === 'function' && document.readyState === 'complete'`)) break; }
      await sleep(900);
      const r = await ev(`({ lang: lang, src: (document.getElementById('rit-a') || { getAttribute: function(){ return null; } }).getAttribute('src'), nav: (document.getElementById('nav-a') || { getAttribute: function(){ return null; } }).getAttribute('src'), host: (document.getElementById('ritual-voice') || {}).outerHTML })`);
      if (!r || r.lang !== jaz || !new RegExp('ritual_' + jaz + '\\.mp3').test(r.src || '')) vady.push('rituál po startu s uloženým jazykem ' + jaz + ': ' + JSON.stringify(r));
      if (!r || !new RegExp('navod_' + jaz + '\\.mp3').test(r.nav || '')) vady.push('návod po startu s uloženým jazykem ' + jaz + ': ' + JSON.stringify(r));
    }
    await nacti();
    // 2026-10-29 (owner: „přehrávač na mobilu má zbytečně velké mezery mezi play, časovou osou… pruh stopy je tím asymetricky menší“;
    // „když posunu na nějaké místo svíčky, tak by se tam měl vrátit i přehrávač“): přehrávač-svíčka (runar-svicka.js) na telefonu.
    // Mezery = od konce viditelné věci k začátku další (glyf noty, text času, kresba svíčky); dřív pruh .cap-seek 20 / 36 / 21 px.
    const PREHRAVAC = `(async function(vnut){ var v = [], sl = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
      showAppTab('reading'); document.getElementById('reader-output').style.display = 'block';
      var ap = document.getElementById('audio-player'); ap.classList.add('visible');
      // čekání na hlas (owner 2026-10-30 „10. ok“): svíčka se tvoří, sama se nedotvoří, bez vosku; po příchodu zvuku se dotvoří
      _capStop('cap'); svickaTvor('cap'); await sl(1500); var t1 = _SVICKY.cap._stav(); await sl(1500); var t2 = _SVICKY.cap._stav();
      if (t1.stav !== 'tvori' || !(t1.p < 0.95 && t2.p < t1.p && t2.p > 0.3)) v.push('svíčka při čekání na hlas se netvoří (' + t1.stav + ' ' + t1.p.toFixed(2) + ' → ' + t2.p.toFixed(2) + ')');
      if (t2.vosk) v.push('svíčka při čekání na hlas má vosk (' + t2.vosk + ' rampouchů)');
      var a = document.getElementById('cap-a'); a.muted = true; a.src = 'audio/ritual_en.mp3'; svickaHotovo('cap');
      for (var k = 0; k < 50 && !(isFinite(a.duration) && a.duration > 0); k++) await sl(100);
      await sl(2200); var t3 = _SVICKY.cap._stav();
      if (t3.stav !== 'klid' || t3.p > 0.001) v.push('svíčka se po příchodu hlasu nedotvořila (' + t3.stav + ' ' + t3.p.toFixed(2) + ')');
      if (!(isFinite(a.duration) && a.duration > 0)) return ['zvuk se nenačetl (délka ' + a.duration + ')'];
      var sv = document.getElementById('cap-sv'); if (vnut) sv.style.marginLeft = '26px'; await sl(150);
      var txt = function(e){ var r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect(); };
      var kr = function(s){ var l = 1e9, p = -1e9; s.querySelectorAll('path').forEach(function(x){ if (!x.getAttribute('d') || x.closest('[opacity="0"]') || getComputedStyle(x).opacity === '0') return;
        var b = x.getBoundingClientRect(); if (b.width || b.height) { l = Math.min(l, b.left); p = Math.max(p, b.right); } }); return { left: l, right: p }; };
      var ng = document.querySelector('#cap-pb svg').getBoundingClientRect(), c1 = txt(document.getElementById('cap-ct')), k1 = kr(sv), c2 = txt(document.getElementById('cap-dr'));
      var m = [c1.left - ng.right, k1.left - c1.right, c2.left - k1.right].map(Math.round), cs = getComputedStyle(ap);
      var vnitr = ap.getBoundingClientRect().width - 2 * (parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth)), podil = (k1.right - k1.left) / vnitr;
      if (Math.max.apply(null, m) - Math.min.apply(null, m) > 3 || Math.min.apply(null, m) < 6 || Math.max.apply(null, m) > 16)
        v.push('mezery nota → čas · čas → svíčka · svíčka → délka ' + m.join(' · ') + ' px (mají být stejné ±3 px a 6–16 px)');
      if (podil < 0.55) v.push('svíčka zabírá jen ' + Math.round(podil * 100) + ' % řádku');
      if (vnut) { sv.style.marginLeft = ''; return v; }
      var bod = function(q){ var r = sv.getBoundingClientRect(), st = _SVICKY.cap._stav(); return r.left + (st.x0 + (st.x1 - st.x0) * q) * r.width / st.W; };
      var tah = function(q, typ){ sv.dispatchEvent(new PointerEvent(typ, { clientX: bod(q), clientY: sv.getBoundingClientRect().top + 10, pointerId: 1, bubbles: true })); };
      var poloha = function(){ var b = function(id){ return Math.round(document.getElementById(id).getBoundingClientRect().left * 10) / 10; };
        return [b('cap-ct'), b('cap-sv'), b('cap-dr'), document.getElementById('cap-ct').textContent]; }, p0 = poloha();
      tah(0.7, 'pointerdown'); tah(0.7, 'pointerup'); await sl(150); var s1 = _SVICKY.cap._stav(), q1 = a.currentTime / a.duration, p1 = poloha();
      // owner 2026-10-29: „čas stopy stále posouvá i sfouknutí a svíčku“ — jiné číslice nesmí pohnout svíčkou ani časem vpravo
      if (p0[3] === p1[3]) v.push('posun nezměnil čas (' + p0[3] + ') — pohyb se nedá ověřit');
      else if (Math.abs(p0[1] - p1[1]) > 0.5 || Math.abs(p0[2] - p1[2]) > 0.5) v.push('čas ' + p0[3] + ' → ' + p1[3] + ' posunul svíčku o ' + (p1[1] - p0[1]).toFixed(1) + ' px a délku o ' + (p1[2] - p0[2]).toFixed(1) + ' px');
      tah(0.2, 'pointerdown'); tah(0.2, 'pointerup'); await sl(150); var s2 = _SVICKY.cap._stav(), q2 = a.currentTime / a.duration;
      if (Math.abs(q1 - 0.7) > 0.03 || Math.abs(s1.p - 0.7) > 0.03) v.push('posun na 70 %: zvuk ' + q1.toFixed(2) + ', svíčka ' + s1.p.toFixed(2));
      if (Math.abs(q2 - 0.2) > 0.03 || Math.abs(s2.p - 0.2) > 0.03) v.push('posun zpět na 20 %: zvuk ' + q2.toFixed(2) + ', svíčka ' + s2.p.toFixed(2));
      if (!(s1.vosk > s2.vosk)) v.push('vosk za místem po posunu zpět nezmizel (' + s1.vosk + ' → ' + s2.vosk + ' rampouchů)');
      // owner 2026-10-29: ovládání na zamčené obrazovce („zamčený ok“) a hlas se při přepnutí záložky zastaví („má se zastavit“)
      // owner 2026-10-30 „6. ok“: u jedné runy je na zamčené obrazovce tažená runa naší kresbou (PNG z runeSvg), ne ikona appky
      readerRune = RUNES[0]; _spreadMode = 'single'; svickaNazev('cap', 'Fehu', function () { return _spreadMode === 'single' ? readerRune : null; });
      _capPlay('cap'); await sl(1000);
      if (a.paused) v.push('hlas se po notě nerozehrál');
      var md = ('mediaSession' in navigator) ? navigator.mediaSession.metadata : undefined;
      if (md === undefined) v.push('prohlížeč kontroly nemá mediaSession — zamčená obrazovka neověřena');
      else if (!md || !md.title) v.push('zamčená obrazovka: hlas hraje bez názvu');
      else { var obrRuny = function () { return (((navigator.mediaSession.metadata || {}).artwork || [{}])[0].src || ''); };   // bez regexu: lomítko by šablona PREHRAVAC snědla
        for (var k4 = 0; k4 < 30 && obrRuny().indexOf('data:image/png') !== 0; k4++) await sl(100);
        var art = obrRuny();
        if (art.indexOf('data:image/png') !== 0 || art.length < 5000) v.push('zamčená obrazovka u jedné runy bez kresby runy (' + art.slice(0, 40) + ')'); }
      readerRune = null;
      showAppTab('journal'); await sl(150); if (!a.paused) v.push('hlas hraje dál po přepnutí záložky'); showAppTab('reading');
      _capStop('cap'); ap.classList.remove('visible');
      setLang('is'); await sl(300); var rs = document.getElementById('rit-sv'), rr = rs && rs.getBoundingClientRect();
      if (!rs) v.push('malá svíčka rituálu chybí'); else if (rr.right > ${SIRKA} - 1 || rr.width < 20) v.push('malá svíčka rituálu (IS) ' + Math.round(rr.left) + '–' + Math.round(rr.right) + ' px');
      // rituál (owner 2026-10-29): svíčka až po ťuknutí na notu, po dohrání zmizí; místo v řádku drží
      if (rs) { var vidi = function(){ return getComputedStyle(rs).opacity !== '0' && !rs.classList.contains('svp-skryta'); }, ra = document.getElementById('rit-a');
        if (vidi()) v.push('malá svíčka rituálu je vidět před ťuknutím na notu');
        ra.muted = true; for (var k2 = 0; k2 < 50 && !(isFinite(ra.duration) && ra.duration > 0); k2++) await sl(100);
        document.getElementById('rit-pb').click(); await sl(900);
        if (!vidi()) v.push('malá svíčka rituálu se po ťuknutí na notu neukázala');
        ra.currentTime = Math.max(0, ra.duration - 0.3);   // délku nenačtené MP3 prohlížeč jen odhadne → čekat na skutečný konec
        for (var k3 = 0; k3 < 120 && !ra.ended; k3++) await sl(100);
        if (!ra.ended) v.push('rituál nedohrál (zvuk ' + ra.currentTime.toFixed(1) + ' z ' + ra.duration.toFixed(1) + ' s; paused ' + ra.paused + ', readyState ' + ra.readyState + ', network ' + ra.networkState + ', chyba ' + (ra.error && ra.error.code) + ')'); else await sl(4000);
        if (!rs.classList.contains('svp-skryta')) v.push('malá svíčka rituálu po dohrání nezmizela');
        if (Math.abs(rs.getBoundingClientRect().width - rr.width) > 0.5) v.push('skrytá svíčka rituálu nedrží místo v řádku'); }
      // svitek před návodem (owner 2026-10-30 „N3 — svitek, který se rozbalí“): zavřený návod = svinutý, otevřený = rozvinutý
      var svl = document.querySelector('#read-guide-lbl .sv-list'), gb = document.getElementById('read-guide');
      if (!svl) v.push('svitek před „How a reading works“ chybí'); else {
        var rozvin = function () { var m = new DOMMatrix(getComputedStyle(svl).transform); return m.d; };
        if (gb.style.display !== 'none') toggleGuide();
        await sl(900); var z1 = rozvin(); toggleGuide(); await sl(900); var z2 = rozvin(); toggleGuide();
        if (!(z1 < 0.5 && z2 > 0.95)) v.push('svitek se s návodem nerozvine (zavřený ' + z1.toFixed(2) + ', otevřený ' + z2.toFixed(2) + ')'); }
      // návod (owner 2026-10-30 „How a reading works … chci taky s hlasem“): nadpis a svíčka se vejdou (IS má delší nadpis), svíčka až po notě
      var ns = document.getElementById('nav-sv'), nl = document.getElementById('read-guide-lbl');
      if (!ns) v.push('malá svíčka návodu chybí'); else { var nr = ns.getBoundingClientRect(), lr = nl.getBoundingClientRect();
        if (nr.right > ${SIRKA} - 1 || nr.width < 20 || lr.left < 0 || lr.right > nr.left) v.push('návod (IS): nadpis ' + Math.round(lr.left) + '–' + Math.round(lr.right) + ' px, svíčka ' + Math.round(nr.left) + '–' + Math.round(nr.right) + ' px');
        if (!ns.classList.contains('svp-skryta')) v.push('malá svíčka návodu je vidět před ťuknutím na notu');
        var na = document.getElementById('nav-a'); na.muted = true; document.getElementById('nav-pb').click(); await sl(900);
        if (ns.classList.contains('svp-skryta')) v.push('malá svíčka návodu se po ťuknutí na notu neukázala');
        if (na.paused) v.push('hlas návodu se po notě nerozehrál'); svickaStop('nav'); }
      setLang('en'); return v; })`;
    const vPs = await ev(PREHRAVAC + '(true)');   // samotest: svíčka odsunutá o 26 px (vyhrazené místo vlevo, jako náhled 2) se musí poznat
    if (!vPs || !vPs.some((x) => /mezery/.test(x))) vady.push('SAMOTEST: odsunutou svíčku (nesouměrné mezery) kontrola nepoznala — ' + JSON.stringify(vPs));
    const vP = await ev(PREHRAVAC + '(false)');
    if (!vP) vady.push('přehrávač: nešlo změřit'); else vP.forEach((x) => vady.push('přehrávač: ' + x));
    // 2026-10-28 (hlášení 8a6f3ff6): statické stránky — zásady a nápověda (EN i IS), týž telefon a táž měření.
    const STRANKY = ['runar-privacy.html', 'runar-help.html'];
    for (const st of STRANKY) for (const jaz of ['en', 'is']) {
      await ev(`localStorage.setItem('runar_lang', '${jaz}'); 1`);   // stránka je v jazyce appky (přepínač na ní od 2026-10-28 není)
      await cmd('Page.navigate', { url: URL.replace('runar-reader.html', st) });
      for (let k = 0; k < 60; k++) { await sleep(150); if (await ev(`document.readyState === 'complete'`)) break; }
      await sleep(500);
      const m = await ev(MERENI);
      const jm = st + ' (' + jaz + ')';
      if (!m) { vady.push(jm + ': nešlo změřit'); continue; }
      if (m.docW > m.W + 1) vady.push(jm + ': stránka je širší než telefon (' + m.docW + ' > ' + m.W + ' px) — posouvá se do strany');
      if (m.pocet) vady.push(jm + ': ' + m.pocet + ' prvků přes okraj — ' + m.mimo.join(' · '));
      if (process.env.RUNAR_TEL_SNIMEK) { const sn = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); fs.writeFileSync(path.join(process.env.RUNAR_TEL_SNIMEK, st.replace('.html', '') + '_' + jaz + '.png'), Buffer.from(sn.result.data, 'base64')); }
    }
    vady.forEach((v) => console.log('        ' + v));
    rekni(!vady.length, 'telefon ' + SIRKA + ' px: v ' + STAVY.length + ' stavech appky a na zásadách i nápovědě (EN, IS) nic nepřetéká přes okraj a stránka se neposouvá do strany; lišta s krátkým i dlouhým jménem bez překryvu; přehrávač se stejnými mezerami a posunem po svíčce', vady.length + ' vad(a)');
    rekni(!exc.length, 'bez chyb JS', exc.map((x) => (x.exception && x.exception.description || x.text || '').split('\n')[0]).join(' | ').slice(0, 300));
  } catch (e) { rekni(false, 'prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  const dialogy = poj ? poj.hotovo() : [];
  if (dialogy.length) rekni(false, 'stránka otevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', dialogy.join(' · '));
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    console.log(fail ? 'FAIL  appka na telefonu: ' + fail + ' selhalo' : 'OK    appka na telefonu: nic nepřetéká, nic se neposouvá do strany');
    process.exit(fail ? 1 : 0);
  }, 300);
})();
