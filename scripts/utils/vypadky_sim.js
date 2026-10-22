// Nástroj (2026-10-22, CODE-read; pro CODE-tune k DECISIONS 2026-10-22 (9)): co člověk uvidí při výpadku služby — pouštět před a po opravě.
//   node scripts/utils/vypadky_sim.js
// Kolo (c): co člověk uvidí při výpadku služby. Odpovědi serveru podvržené v prohlížeči testu (fetch / sb.auth), Supabase blokovaná. CODE-read.
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = (process.env.RUNAR_ROOT || path.resolve(__dirname, '..', '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
// odpověď: 'sit' = síť spadla · [status, tělo, typ]
const OK_CTENI = [200, JSON.stringify({ text: 'The cattle stand in the byre. Fehu is the rune of what you keep. What would you count first?', reading_id: 'x1' }), 'application/json'];
const CTENI = {
  'čtení: síť nedostupná': 'sit',
  'čtení: 500 server': [500, JSON.stringify({ error: 'internal' }), 'application/json'],
  'čtení: 503 brána (HTML)': [503, '<html>Service Unavailable</html>', 'text/html'],
  'čtení: 429 limit': [429, JSON.stringify({ error: 'rate_limited', message: 'Too many requests.' }), 'application/json'],
  'čtení: 401 relace vypršela': [401, JSON.stringify({ error: 'unauthorized' }), 'application/json'],
  'čtení: model nedostupný (403 unavailable)': [403, JSON.stringify({ error: 'unavailable', message: 'The runes are quiet. Try again shortly.' }), 'application/json'],
};
const HLAS = {
  'hlas: síť nedostupná': 'sit',
  'hlas: 500 ElevenLabs': [500, JSON.stringify({ error: 'ElevenLabs error' }), 'application/json'],
  'hlas: 429 kvóta (voice_quota_rest)': [429, JSON.stringify({ error: 'voice_quota_rest' }), 'application/json'],
  'hlas: 503 brána (HTML)': [503, '<html>Service Unavailable</html>', 'text/html'],
};
const PODVRH = (proxy, el) => `(function(){
  var P = ${JSON.stringify(proxy)}, E = ${JSON.stringify(el)};
  var odp = function (o) { if (o === 'sit') return Promise.reject(new TypeError('Failed to fetch')); return Promise.resolve(new Response(o[1], { status: o[0], headers: { 'Content-Type': o[2] } })); };
  var puv = window.fetch;
  window.fetch = function (u, opt) { u = String(u && u.url || u);
    if (/claude-proxy/.test(u)) return odp(P); if (/elevenlabs-proxy/.test(u)) return odp(E); return puv.apply(this, arguments); };
  sb.auth.getSession = async function () { return { data: { session: { access_token: 't' } } }; };
  currentUser = { id: 'a-rs', email: 'rs@example.invalid' }; userTier = 'rune_seeker'; userCredits = 5; userFreeBalance = 0; profileLoaded = true;
  syncFreeBalance = async function () {}; loadJournal = async function () {}; _loadServerLastImage = async function () {}; fetchUserProfile = async function () {};
  if (typeof stream === 'function') stream = async function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };
  window.__t = []; var o = showToast; showToast = function (m) { window.__t.push(String(m)); return o.apply(this, arguments); };
  setLang('en'); updateAuthUI(); updateBanners(); showAppTab('reading'); resetReader(); return 1; })()`;
const VID = `(function(){ var t = function (id) { var e = document.getElementById(id); return e && e.offsetParent ? (e.textContent || '').trim() : ''; };
  return { reader: t('st-reader'), setup: t('st-setup'), hlas: t('st-voice'), toast: (window.__t || []).join(' | '), cteni: t('out-short').slice(0, 40), kredity: userCredits }; })()`;
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-'));
  const proc = cp.spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--window-size=420,2400', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok) => { ws.onopen = ok; });
  let id = 0; const wait = {}; ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
  const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); const x = r.result || {}; return x.exceptionDetails ? 'ERR ' + ((x.exceptionDetails.exception || {}).description || '').split('\n')[0] : (x.result || {}).value; };
  await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable'); await cmd('Network.setBlockedURLs', { urls: ['*supabase.co*'] });
  const nacti = async () => { await cmd('Page.navigate', { url: 'http://127.0.0.1:' + srv.address().port + '/v2/runar-reader.html' });
    for (let k = 0; k < 100; k++) { await sleep(150); if (await ev(`typeof showAppTab === 'function' && document.readyState === 'complete'`)) break; } await sleep(1000); };
  for (const [jm, o] of Object.entries(CTENI)) {
    await nacti(); await ev(PODVRH(o, OK_CTENI));
    await ev(`(async function(){ startReading(); readerRune = RUNES[0]; await readRune(); return 1; })()`); await sleep(800);
    console.log(jm.padEnd(42), JSON.stringify(await ev(VID)));
  }
  for (const [jm, o] of Object.entries(HLAS)) {
    await nacti(); await ev(PODVRH(OK_CTENI, o));
    await ev(`(async function(){ startReading(); readerRune = RUNES[0]; await readRune(); await generateVoice(); return 1; })()`); await sleep(800);
    console.log(jm.padEnd(42), JSON.stringify(await ev(VID)));
  }
  // přihlášení: Brevo / SMTP nedoručí kód
  await nacti();
  const auth = await ev(`(async function(){ sb.auth.signInWithOtp = async function () { return { error: { message: 'Error sending magic link email', status: 500 } }; };
    openAuthModal(); document.getElementById('auth-email').value = 'nekdo@example.com'; await sendLoginCode(); return (document.getElementById('st-auth') || {}).textContent; })()`);
  console.log('přihlášení: e-mail s kódem neodešel'.padEnd(42), JSON.stringify(auth));
  const auth2 = await ev(`(async function(){ sb.auth.signInWithOtp = async function () { throw new TypeError('Failed to fetch'); };
    await sendLoginCode().catch(function (e) { window.__authErr = String(e); }); return { st: (document.getElementById('st-auth') || {}).textContent, chyba: window.__authErr || '' }; })()`);
  console.log('přihlášení: síť nedostupná'.padEnd(42), JSON.stringify(auth2));
  proc.kill(); srv.close(); process.exit(0);
})();
