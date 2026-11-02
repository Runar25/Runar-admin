// verify_prompt_stin.js — stín skládání promptu: co appka v prohlížeči zapíše (`stin`), z toho server složí TENTÝŽ prompt.
//
// Proč (2026-10-21, krok 1 plánu infrastruktury „prompt na server“, F2; owner „ok začni“): claude-proxy porovnává prompt z appky
// s promptem složeným ze záznamu (`_shared/prompt_stin.mjs`). Kdyby záznamník v appce něco vynechal (stav, náhodu, sáček obrazů,
// místní měsíc), stín by hlásil neshodu u každého čtení — a F3 (server na vlastní prompt) by pak čtení tiše změnilo. Tady se to ověří
// skutečnou appkou v prohlížeči bez okna, ne kopií: obalené buildery, sáček obrazů v localStorage, EN i IS, single, výklady, Ask,
// životní runa, rozbor jména, Opus i sol. Každý vzorek musí dát shodu systému i promptu a spotřebovat přesně tolik náhody, kolik appka.
// 2026-11-02 (F3a, server skládá prompt sám — _shared/prompt_server.mjs): navíc CELÝ prompt, jak ho appka posílá modelu (builder + myšlenka ✦
// + připomínka délky, _promptKonec), musí být bajt po bajtu = slozPromptServer ze zápisu, i s cenou a stropem odpovědi z configu.
// A útoky na hranici: korekce a postava od prohlížeče se nesmí dostat do promptu, cizí builder pro mode neprojde, Opus a myšlenka ✦
// ne-adminovi / bez tarifu ne. Každý útok má i kontrolu naopak (bez ochrany by se projevil), jinak by „neprojde“ nic nedokazovalo.
//   node scripts/verify_prompt_stin.js
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const { pathToFileURL } = require('url');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});

// Vzorky skládá STRÁNKA (stejné volání jako appka). Každý vrátí { jm, sys, prompt, stin }.
const VZORKY = `(async () => {
  for (let i = 0; i < 60 && (typeof _stinVezmi !== 'function' || typeof RUNES === 'undefined'); i++) await new Promise((r) => setTimeout(r, 100));
  if (typeof _stinVezmi !== 'function') return 'EXC: _stinVezmi chybí (záznamník v runar-app.js?)';
  const R = (n) => RUNES.find((r) => r.n === n);
  const out = [];
  const u = { name: 'Anna', area: AREAS ? (AREAS.en && AREAS.en[1]) || 'work' : 'work', seeking: 'clarity', question: 'What should I focus on?',
              d: 15, m: 6, y: 1990, intention: INTENTIONS.en[0], lifeRune: R('Isa') };
  const pool = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz'].map(R);
  // meta = jak to pošle appka proxy: mode, tarif (myšlenka ✦), admin (Opus), cenový klíč. Prompt = celý text pro model.
  const vzorek = (jm, fn, meta) => { _stinVezmi(); let sys = '', prompt = ''; try { sys = buildSysPrompt(null, lang); prompt = fn(); }
    catch (e) { out.push({ jm, chyba: e.message }); return; } out.push(Object.assign({ jm, sys, prompt, stin: _stinVezmi(), mode: '', tier: '', admin: false }, meta || {})); };
  const K = (kind, runes, L) => _promptKonec(kind, runes, L, _thoughtAllowed());   // tentýž konec promptu jako runar-reading.js
  for (const L of ['en', 'is']) {
    lang = L;
    for (let k = 0; k < 3; k++) { const r = R(['Raidho', 'Fehu', 'Isa'][k]); vzorek('single_' + L + k, () => buildReadingPrompt(u, r, L, corrections) + K('SINGLE', [r], L), { cena: 'single' }); }
    vzorek('single_noq_' + L, () => buildReadingPrompt(Object.assign({}, u, { question: '', intention: '', lifeRune: null }), R('Kenaz'), L, []) + K('SINGLE', [R('Kenaz')], L), { cena: 'single' });
    // Opus volí jen admin — přihlášený admin (= premium, takže i myšlenka ✦ v appce i na serveru, jako v produkci)
    const e0 = READ_ENGINE; READ_ENGINE = 'opus'; currentUser = { id: 'stin-admin', email: ADMIN_EMAILS[0] };
    vzorek('single_opus_' + L, () => buildReadingPrompt(u, R('Gebo'), L, []) + K('SINGLE', [R('Gebo')], L), { cena: 'single', admin: true });
    READ_ENGINE = e0; currentUser = null;
    vzorek('norns_' + L, () => buildNornsPrompt(u, pool.slice(0, 3), L, []) + K('NORNS', pool.slice(0, 3), L), { cena: 'norns' });
    vzorek('kriz_' + L, () => buildKrizPrompt(u, pool.slice(0, 5), L, []) + K('KRIZ', pool.slice(0, 5), L), { cena: 'cross' });
    vzorek('horseshoe_' + L, () => buildHorseshoePrompt(u, pool.slice(0, 7), L, []) + K('HORSESHOE', pool.slice(0, 7), L), { cena: 'horseshoe' });
    vzorek('yggdrasil_' + L, () => buildYggdrasilPrompt(u, pool, L, []) + K('YGGDRASIL', pool, L), { cena: 'yggdrasil' });
    vzorek('founding_' + L, () => buildNornsPrompt(u, pool.slice(3, 6), L, []) + K('NORNS', pool.slice(3, 6), L), { mode: 'founding', cena: 'norns' });
    vzorek('ask_' + L, () => buildAskPrompt('SAMPLE READING', 'what does it mean for me', 'Raidho', L, [], u.lifeRune, null, null), { mode: 'ask' });
    vzorek('liferune_' + L, () => buildLifeRunePrompt('Anna', R('Fehu'), 15, 6, 1990, L, []), { mode: 'life_rune' });
    vzorek('namelore_' + L, () => buildNameLorePrompt('Sigrún', typeof _nameLookup === 'function' ? _nameLookup('Sigrún') : null, L, corrections), { mode: 'name_lore' });
    // myšlenka ✦ podle tarifu: přihlášený Premium (appka _thoughtAllowed) × server s tarifem z JWT
    currentUser = { id: 'stin-test', email: 'stin-test@example.com' }; userTier = 'premium';
    vzorek('single_myslenka_' + L, () => buildReadingPrompt(u, R('Uruz'), L, []) + K('SINGLE', [R('Uruz')], L), { cena: 'single', tier: 'premium' });
    vzorek('yggdrasil_myslenka_' + L, () => buildYggdrasilPrompt(u, pool, L, []) + K('YGGDRASIL', pool, L), { cena: 'yggdrasil', tier: 'premium' });
    currentUser = null; userTier = '';
    // Sáček obrazů musí přejít na server (záznamník čte localStorage). Do 2026-11-02 tu stál klíč 'seasonlast_Raidho', který appka
    // nikdy nečte (správně 'seasonlast_rune_Raidho'), takže stav vznikal jen z předchozích vzorků a útok „záznamník vynechá úložiště“
    // chytal podle náhody — jednou propustil (CODE-web 2026-11-01, BACKLOG). Teď pevně: v sáčku zbývá jen POSLEDNÍ kandidát a náhoda
    // vrací 0. Appka tak vezme poslední obraz, server bez úložiště první — rozdíl je jistý, ne pravděpodobný.
    {
      const bucket = _seasonBucket(new Date().getMonth() + 1);
      const cand = _imgPodleOblasti(_runeImageCandidates(R('Raidho'), bucket), u.area);
      const runeKey = 'rune_' + cand.map((r) => r[0]).filter((x, i, a) => a.indexOf(x) === i).sort().join('-');
      const ids = cand.map(_imgId);
      if (ids.length < 2) out.push({ jm: 'sacek_' + L, chyba: 'Raidho má v téhle části roku ' + ids.length + ' obrazů — sáček nejde vyzkoušet, vyber jinou runu' });
      else {
        try { localStorage.setItem('seasonbag_' + bucket + '_' + runeKey, JSON.stringify([ids[ids.length - 1]]));
              localStorage.removeItem('seasonlast_' + runeKey); localStorage.removeItem('seasonmotif_' + runeKey); } catch (e) {}
        const mr = Math.random; Math.random = () => 0;
        try { vzorek('sacek_' + L, () => buildReadingPrompt(u, R('Raidho'), L, []) + K('SINGLE', [R('Raidho')], L), { cena: 'single' }); } finally { Math.random = mr; }
        // Předpoklad testu ověřen, ne předpokládán: appka opravdu vzala obraz ze sáčku (jinak by shoda nic nedokazovala).
        let vzal = null; try { vzal = localStorage.getItem('seasonlast_' + runeKey); } catch (e) {}
        if (vzal !== ids[ids.length - 1]) out.push({ jm: 'sacek_' + L, chyba: 'appka nevzala obraz ze sáčku (vzala ' + vzal + ') — test sáčku nic nedokazuje' });
      }
    }
  }
  lang = 'en';
  return JSON.stringify({ out, ceny: SPREAD_COSTS, myslenka: (_promptKonec('SINGLE', [R('Uruz')], 'en', true) || '').length });
})()`;

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { console.log('FAIL  prohlížeč (Chrome/Edge) nenalezen'); process.exit(1); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stin-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;
  const konec = (kod) => { if (poj) poj.hotovo(); try { proc.kill(); } catch (e) {} srv.close(); setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} process.exit(kod); }, 300); };
  let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
  const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
  let id = 0; const wait = {};
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
  poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'stín skládání promptu', limitS: 120 });
  const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return 'EXC: ' + ((r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description) || r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Page.navigate', { url: 'http://127.0.0.1:' + port + '/v2/runar-reader.html' });
  await sleep(2500);
  const raw = await ev(VZORKY);
  if (typeof raw !== 'string' || raw.startsWith('EXC')) { console.log('FAIL  appka vzorky nesložila: ' + String(raw).slice(0, 300)); konec(1); return; }
  const { out: vz, ceny, myslenka } = JSON.parse(raw);
  const { porovnejStin } = await import(pathToFileURL(path.join(ROOT, 'supabase', 'functions', '_shared', 'prompt_stin.mjs')).href);
  const { slozPromptServer } = await import(pathToFileURL(path.join(ROOT, 'supabase', 'functions', '_shared', 'prompt_server.mjs')).href);
  const vady = [];
  if (!(myslenka > 0)) vady.push('appka: _promptKonec s myšlenkou dal prázdný text — vzorky myšlenky by nic nedokazovaly');
  for (const v of vz) {
    if (v.chyba) { vady.push(v.jm + ': appka spadla — ' + v.chyba); continue; }
    if (!v.stin || !v.stin.prompt || !v.stin.sys) { vady.push(v.jm + ': záznamník nezapsal ' + (!v.stin ? 'nic' : (!v.stin.prompt ? 'prompt' : 'systém'))); continue; }
    const d = porovnejStin(v.stin, v.sys, v.prompt);
    if (d.chyba) { vady.push(v.jm + ': server — ' + d.chyba); continue; }
    for (const druh of ['sys', 'prompt']) {
      const x = d[druh];
      if (!x || !x.shoda) vady.push(v.jm + ' ' + druh + ': neshoda od znaku ' + (x && x.rozdil) + ' (appka ' + (x && x.delka_klient) + ' zn., server ' + (x && x.delka_server) + ')');
      else if (x.los_zbyl !== 0 || x.los_dosel) vady.push(v.jm + ' ' + druh + ': náhoda nesedí (zbylo ' + x.los_zbyl + ', došla ' + x.los_dosel + ')');
    }
    // F3a: server ze zápisu = celý prompt appky (systém, prompt i s konci), cena z configu
    const sv = slozPromptServer(v.stin, { mode: v.mode, tier: v.tier, admin: v.admin });
    if (sv.chyba) { vady.push(v.jm + ': server odmítl — ' + sv.chyba); continue; }
    if (sv.system !== v.sys) vady.push(v.jm + ': server — systém ≠ appka');
    if (sv.prompt !== v.prompt) { let j = 0; while (j < sv.prompt.length && sv.prompt[j] === v.prompt[j]) j++;
      vady.push(v.jm + ': server — prompt ≠ appka od znaku ' + j + ' (appka ' + v.prompt.length + ', server ' + sv.prompt.length + ')'); }
    if (v.cena && sv.cena !== ceny[v.cena].credits) vady.push(v.jm + ': server — cena ' + sv.cena + ' ≠ SPREAD_COSTS.' + v.cena + ' ' + ceny[v.cena].credits);
    if (!(sv.maxTokens > 0)) vady.push(v.jm + ': server — bez stropu odpovědi');
  }
  // F3a útoky na hranici — každý s kontrolou naopak (bez ochrany se projeví), jinak by „neprojde“ nic nedokazovalo
  const najdi = (jm) => vz.find((v) => v.jm === jm && !v.chyba);
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  const s1 = najdi('single_en0'), op = najdi('single_opus_en'), th = najdi('single_myslenka_en'), avs = najdi('ask_en');
  if (!s1 || !op || !th || !avs) vady.push('útoky: chybí vzorek single_en0 / single_opus_en / single_myslenka_en / ask_en');
  else {
    const zly = kopie(s1.stin); zly.prompt.args[3] = [{ from_word: 'XQZODKUD', to_word: 'XQZKAM', lang: 'both', context: null }];
    const sKor = slozPromptServer(zly, { korekce: [] }), bezKor = slozPromptServer(zly, {});
    if (!bezKor.prompt || bezKor.prompt.indexOf('XQZ') === -1) vady.push('útok korekce: podstrčená korekce se do promptu nedostala ani bez ochrany — útok nic nedokazuje');
    if (!sKor.prompt || sKor.prompt.indexOf('XQZ') !== -1) vady.push('útok korekce: korekce od prohlížeče prošla do promptu (server je má brát z DB)');
    const zlaPostava = kopie(s1.stin); zlaPostava.sys.args[0] = { name: 'XQZPOSTAVA', identity: 'XQZPOSTAVA', voice: 'XQZPOSTAVA', base: 'XQZPOSTAVA' };
    const sPost = slozPromptServer(zlaPostava, {});
    if (sPost.chyba || sPost.system !== s1.sys) vady.push('útok postava: systém od podstrčené postavy ≠ systém appky (' + (sPost.chyba || 'jiný text') + ')');
    const cizi = kopie(avs.stin); cizi.prompt.builder = 'buildYggdrasilPrompt';
    if (!slozPromptServer(cizi, { mode: 'ask' }).chyba) vady.push('útok mode: Ask s builderem Yggdrasilu prošel');
    if (slozPromptServer(avs.stin, { mode: '' }).chyba !== 'builder_not_allowed_for_mode') vady.push('útok mode: Ask jako čtení run prošel');
    // ne-admin se stejným tarifem jako admin (premium → táž myšlenka ✦), takže rozdíl může nést jen engine. Do 2026-11-02 (před commitem)
    // tu byl ne-admin bez tarifu — lišila se myšlenka, a útok „engine od prohlížeče se nevynutí“ v kopii prošel (utok_server.py, 3. útok).
    const opNe = slozPromptServer(op.stin, { admin: false, tier: 'premium' });
    if (opNe.chyba || opNe.prompt === op.prompt) vady.push('útok engine: Opus pro ne-admina dal týž prompt jako adminův — engine od prohlížeče se nevynutil');
    const thNe = slozPromptServer(th.stin, { tier: '' });
    if (thNe.chyba || thNe.prompt === th.prompt || thNe.prompt.length >= th.prompt.length) vady.push('útok myšlenka: bez tarifu server myšlenku ✦ přidal');
  }
  if (vady.length) { vady.slice(0, 12).forEach((v) => console.log('  ' + v)); console.log('FAIL  stín skládání promptu: ' + vady.length + ' vad v ' + vz.length + ' vzorcích z appky'); konec(1); return; }
  console.log('OK    stín skládání promptu: ' + vz.length + ' vzorků z appky (EN+IS, single, výklady, založení, Ask, životní runa, rozbor jména, Opus, myšlenka ✦)'
    + ' — server složil systém i celý prompt bajt po bajtu, cena z configu; korekce a postava od prohlížeče, cizí builder, Opus a ✦ bez nároku neprojdou');
  konec(0);
})().catch((e) => { console.log('FAIL  ' + e.message); process.exit(1); });
