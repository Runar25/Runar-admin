// verify_citelnost.js — smoke ㊽: co člověk na obrazovce opravdu přečte (CODE-tune 2026-10-11).
//
// Proč: CODE-read při procházce appky jako návštěvník (2026-10-11) našel upozornění „not professional advice“ s kontrastem 2,41 : 1 —
// --muted přes průhlednost 0,45 dalo barvu ≈ --dim, kterou §5 na text zakazuje (KUKY 2026-09-24). Pravidlo stálo jen v CLAUDE.md
// a nic ho nehlídalo, porušení se našlo až okem (§30).
// Co dělá (skutečný prohlížeč bez okna; reader jako návštěvník — s oknem „Where to start“ i bez, EN i IS —, nápověda a zásady EN i IS):
//  (A) kontrast: každý viditelný text — jeho barva × průhlednost předků proti prvnímu barevnému pozadí předků — má aspoň 3 : 1, tedy
//      viditelně nad --dim (2,2 : 1). Neaktivní ovládání (zamčené pilulky a runy, „coming“, disabled) je výjimka: vybledlé je záměrně
//      a WCAG ho nepočítá. Texty mezi 3 a 4,5 : 1 (doporučení WCAG pro malé písmo) jen vypíše — to je rozhodnutí o vzhledu, ne §5.
//  (B) zaseklá angličtina: viditelný text, který je na stránce v EN i v IS stejný, je chyba (§2, §10). Výjimky: přepínač EN/IS, značky
//      (RÚNAR, AGNDOFA…), jména run a služeb, adresy webů a e-mailů, název firmy, ceny v kr. Jména Rúnar/Agndofa/Óðinn se z textu napřed vyjmou, ať anglickou větu
//      s „Rúnar“ nepustí jeho „ú“ (scripts/i18n-diff.js, ze kterého logika je, takovou větu přeskočí). Od 2026-10-12 i zástupné texty polí
//      a otevřené přihlašovací okno („your@email.com“ tam stálo natvrdo i v IS, nález CODE-read). Do 2026-10-11 to nehlídalo nic
//      a islandská nápověda ukazovala VISITOR, RUNE SEEKER, „+ READING CARD“ a „soon“ anglicky (procházka CODE-read).
//  (C) okno „mluvit znovu v jiném jazyce“ po single čtení (přihlášený podvržený, čtení na obrazovce, setLang): mluví jazykem, ve kterém
//      člověk čte, cenu bere z SPREAD_COSTS jednotkou VOCAB a zrušení jazyk nezmění. Do 2026-10-11 bylo natvrdo anglicky i v IS a slibovalo
//      „uses one credit“ (předplatitel platí jednotkou čtení). Anglický text natvrdo v JS readeru obecně hlídá ráčna ㊾.
//  (D) Deník po přepnutí jazyka přímo na záložce (přihlášený podvržený, dvě ukázková čtení, otevřená karta): žádný text rozhraní nezůstane
//      stejný — oba směry naráz, i islandština v anglické appce — a otevřená karta zůstane otevřená. Obsah čtení (jméno runy, text, otázka,
//      myšlenka) zůstává v jazyce čtení, proto se nepočítá. Aktivní filtr po přepnutí zůstane. Do 2026-10-11 Deník překresloval updateUIText
//      celý — bez filtru a se zaklapnutými kartami (§14); nález procházky přihlášené appky, CODE-read.
//  (E) Rúnakort islandsky ve správném pádu: po vyčerpání volného čtení „með“ + 3. pád (VOCAB.card.is_dat) a popisek zadání kódu „sláðu
//      inn kóðann á …“ s určitým 3. pádem (is_dat_def), ne kalk „SLÁÐU INN RÚNAKORT KÓÐA“ (nález CODE-read 2026-10-11).
//  (F) selhané načtení profilu (databáze zablokovaná, oba pokusy fetchUserProfile selžou): Životní runa ukáže hlášku a „zkusit znovu“,
//      ne „When were you born?“; pruh nad formulářem nehlásí vyčerpané volné čtení a nevyskočí výzva ke jménu (nález CODE-read, 2026-10-12).
//  (G) nápovědy pod „+“ ve formuláři čtení: každé tlačítko rozbalí větu z UI_TEXT v jazyce appky, ne holý klíč ani prázdno. Od 2026-10-10
//      ukazovaly „area_hint“, „seek_hint“, „intention_hint“ — úklid mrtvých klíčů je smazal (kód je skládá `k + '_hint'`), CODE-tune 2026-10-12.
// Neumí: text přes obrázek (bere barvu pozadí předků), stavy přihlášeného (čtení, menu), stín a obrys písma.
// Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_citelnost.js            · --slabe vypíše i texty mezi 3 a 4,5 : 1 (podklad pro rozhodnutí o vzhledu)
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const PRAH = 3, WCAG = 4.5;
const NEAKTIVNI = ':disabled, [aria-disabled="true"], [aria-hidden="true"], .pill-locked, .pills-locked, .locked, .coming';
let fail = 0;
const rekni = (ok, popis, info) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis + (info ? ' — ' + info : '')); } };

// Běží ve stránce: viditelné texty a jejich kontrast (WCAG 2: relativní jas, (L1 + 0,05) / (L2 + 0,05)).
const MER = `((NEAKTIVNI) => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const jas = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const rgba = (s) => { const m = String(s).match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const pozadi = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c.a > 0.5) return c; }
    return rgba(getComputedStyle(document.body).backgroundColor) || { r: 10, g: 12, b: 18, a: 1 }; };
  const vysl = [], videno = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const txt = n.nodeValue.trim(); if (txt.length < 2) continue;
    const el = n.parentElement; if (!el || videno.has(el) || el.closest('script, style, noscript')) continue; videno.add(el);
    const box = el.getBoundingClientRect(); if (!box.width || !box.height) continue;
    let op = 1, skryte = false;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') { skryte = true; break; } op *= parseFloat(cs.opacity); }
    if (skryte || op < 0.05 || el.closest(NEAKTIVNI)) continue;
    const cs = getComputedStyle(el), c = rgba(cs.color); if (!c) continue;
    const bg = pozadi(el), a = c.a * op;
    const k = (() => { const l1 = jas(c.r * a + bg.r * (1 - a), c.g * a + bg.g * (1 - a), c.b * a + bg.b * (1 - a)), l2 = jas(bg.r, bg.g, bg.b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); })();
    const px = parseFloat(cs.fontSize), velky = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    vysl.push({ k: Math.round(k * 100) / 100, velky, kde: el.tagName + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''),
                txt: txt.slice(0, 40), px: Math.round(px * 10) / 10, op: Math.round(op * 100) / 100 });
  }
  return vysl;
})(${JSON.stringify(NEAKTIVNI)})`;

// Běží ve stránce: viditelné texty, které by mohly být anglické (zaseklá angličtina) — bez islandských, značek, run, adres a cen.
const JAZYK = `(() => {
  const POVOLENO = [/^(EN|IS)$/, /^(R[ÚU]NAR|AGNDOFA|THE GATHERING|YGGDRASIL)$/i, /^(Supabase|OpenAI|Anthropic|ElevenLabs|Google|GitHub|Slack|Brevo)$/,
    /^(Fehu|Uruz|Thurisaz|Ansuz|Raidho|Kenaz|Gebo|Wunjo|Hagalaz|Nauthiz|Isa|Jera|Eihwaz|Perth|Algiz|Sowilo|Tiwaz|Berkana|Ehwaz|Mannaz|Laguz|Ingwaz|Othila|Dagaz|Blank)$/i,
    /^[\\w.-]+\\.(com|io|is|org|net|app)(\\/\\S*)?$/i, /^[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}$/i, /^Agndofa ehf\\.?$/, /^ISK$/, /^[\\d.,\\s]+kr\\.?$/];
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.nodeValue.trim().replace(/\\s+/g, ' ');
    const bezJmen = t.replace(/R[úu]nar|R[ÚU]NAR|Agndofa|AGNDOFA|[ÓO]ðin/g, '');
    if (t.length < 2 || !/[A-Za-z]{2,}/.test(bezJmen) || /[þðæöáíóúýéÞÐÆÖÁÍÓÚÝÉ]/.test(bezJmen) || POVOLENO.some((r) => r.test(t))) continue;
    const el = n.parentElement; if (!el || el.closest('script, style, noscript')) continue;
    let skryte = false;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') { skryte = true; break; } }
    const box = el.getBoundingClientRect(); if (skryte || !box.width || !box.height) continue;
    out.push(t.slice(0, 80));
  }
  // zástupné texty viditelných polí (2026-10-12: „your@email.com“ v přihlášení stál natvrdo i v IS a text v prvcích ho neviděl). Bez výjimky
  // pro e-mail: ta je pro skutečné adresy v nápovědě a zásadách, příkladová adresa v poli se překládá (s ní útok „setPH pryč“ prošel).
  const POVOLENO_POLE = POVOLENO.filter((r) => r.source.indexOf('@') === -1);
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
    const t = (el.getAttribute('placeholder') || '').trim();
    if (t.length < 2 || !/[A-Za-z]{2,}/.test(t) || /[þðæöáíóúýéÞÐÆÖÁÍÓÚÝÉ]/.test(t) || POVOLENO_POLE.some((r) => r.test(t))) return;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return; }
    out.push('[pole] ' + t.slice(0, 74));
  });
  return out;
})()`;

const TYPY = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function konec() {
  console.log(fail ? '\nFAIL  čitelnost: ' + fail + ' selhalo' : '\nOK    čitelnost: kontrast každého viditelného textu aspoň 3 : 1 (nad --dim, §5), v IS žádná zaseklá angličtina, okno přepnutí jazyka v jazyce čtenáře, Deník po přepnutí v novém jazyce, Rúnakort ve správném pádu, selhaný profil se nevydává za nový' + (konec.info || ''));
  process.exit(fail ? 1 : 0);
}
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(path.normalize(ROOT)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPY[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const EXE = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  if (!EXE) { rekni(false, 'prohlížeč (Chrome/Edge) nenalezen'); srv.close(); return konec(); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'citel-'));
  const proc = cp.spawn(EXE, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
  let poj = null;   // pojistky prohlížeče (scripts/utils/prohlizec_pojistky.js) — do 2026-10-11 tu byl vlastní hlídač 120 s bez dialogů
  try {
    let dp = null; for (let i = 0; i < 100 && !dp; i++) { await sleep(100); try { dp = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; } catch (e) {} }
    const pg = (await (await fetch('http://127.0.0.1:' + dp + '/json/list')).json()).find((x) => x.type === 'page');
    const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise((ok, err) => { ws.onopen = ok; ws.onerror = err; });
    let id = 0; const wait = {};
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
    poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'čitelnost (㊽)', limitS: 180 });
    const cmd = (method, params) => new Promise((ok) => { const i = ++id; wait[i] = ok; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
    const ev = async (e) => { const r = await cmd('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
      return r.result && r.result.result && !r.result.exceptionDetails ? r.result.result.value : null; };
    const cekej = async (podm, ms) => { for (let k = 0; k < (ms || 10000) / 150; k++) { if (await ev(podm)) return true; await sleep(150); } return false; };
    await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Network.enable');
    await cmd('Network.setBlockedURLs', { urls: ['*supabase.co*'] });   // databáze: nic se neodesílá ani nečte
    const BASE = 'http://127.0.0.1:' + srv.address().port + '/v2/';
    const stavy = [];
    const zmer = async (jm) => { const v = await ev(MER); stavy.push({ jm, v: Array.isArray(v) ? v : null }); };
    const jazyk = {};   // stránka → { en: [...], is: [...] } viditelných textů pro (B)
    const sber = async (str, l) => { const v = await ev(JAZYK); (jazyk[str] = jazyk[str] || {})[l] = Array.isArray(v) ? v : null; };
    const nacti = async (str, pripraven) => { await cmd('Page.navigate', { url: BASE + str }); await cekej(`document.readyState === 'complete' && (${pripraven})`); await sleep(600); };

    // reader: první návštěva (okno „Where to start“ naskočí samo, výchozí jazyk IS), pak bez okna EN a IS
    await nacti('runar-reader.html', `typeof setLang === 'function'`);
    await cekej(`(document.getElementById('wts-modal') || {}).classList && document.getElementById('wts-modal').classList.contains('open')`, 6000);
    await zmer('reader · první návštěva (okno Where to start)');
    await ev(`localStorage.setItem('runar_wts_seen', '1')`);
    await nacti('runar-reader.html', `typeof setLang === 'function'`);
    await ev(`setLang('en')`); await sleep(400); await zmer('reader · návštěvník EN'); await sber('reader', 'en');
    await ev(`openAuthModal()`); await sleep(300); await sber('reader · přihlášení', 'en');
    await ev(`setLang('is')`); await sleep(400); await sber('reader · přihlášení', 'is'); await ev(`closeAuthModal()`); await sleep(200);
    await zmer('reader · návštěvník IS'); await sber('reader', 'is');

    // (C) okno přepnutí jazyka po single čtení: přihlášený (podvržený), čtení na obrazovce, bez textu v cílovém jazyce → setLang otevře okno
    const okno = (cil) => ev(`(() => {
      currentUser = { id: 'u1', email: 'tester@example.com' }; userTier = 'premium';
      showAppTab('reading'); readerRune = RUNES[0]; readerTexts = {};
      document.getElementById('reader-output').style.display = 'block';
      setLang(${JSON.stringify(cil)});
      const m = document.getElementById('lang-switch-modal'), g = (id) => (document.getElementById(id) || {}).textContent || '';
      const v = { otevreno: m.classList.contains('open'), jazyk: lang, title: g('lsm-title'), body: g('lsm-body'), ok: g('lsm-confirm'),
                  zpet: g('lsm-cancel'), cena: g('lsm-cost'), cekana: vn('cast', SPREAD_COSTS.single.credits, lang) };
      cancelLangSwitch();
      v.zavreno = !m.classList.contains('open'); v.jazykPo = lang;
      readerRune = null; document.getElementById('reader-output').style.display = 'none';
      return v;
    })()`);
    const o1 = await okno('en');                                   // appka v IS → okno islandsky
    await ev(`setLang('en')`); await sleep(300);
    const o2 = await okno('is');                                   // appka v EN → okno anglicky
    await ev(`(() => { currentUser = null; setLang('is'); return true; })()`);

    // (D) Deník: přihlášený (podvržený), dvě ukázková čtení (IS a EN), první karta otevřená, přepnutí IS → EN přímo na záložce
    const DENIK = `[...(function () {
      const OBSAH = '.jcard-name, .jcard-excerpt, .jcard-text, .jcard-question, .jcard-thought, .jcard-gathering-runes, .jcard-srune, .jcard-glyph';
      const pane = document.getElementById('apane-journal'), out = new Set();
      if (!pane) return out;
      const w = document.createTreeWalker(pane, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n.nodeValue.trim().replace(/\\s+/g, ' ');
        if (t.length < 2 || !/[A-Za-zÁÉÍÓÚÝÞÆÖÐáéíóúýþæöð]{2,}/.test(t)) continue;
        const el = n.parentElement; if (!el || el.closest(OBSAH)) continue;
        let skryte = false;
        for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') { skryte = true; break; } }
        if (!skryte) out.add(t.slice(0, 80));
      }
      return out;
    })()]`;
    // druhé čtení v EN: filtr jazykem ho pak skryje (filtr runou výklady záměrně nefiltruje — filterJournal)
    const ukazka = [
      { id: 'd1', rune_name: 'Fehu', rune_glyph: 'ᚠ', lang: 'is', short_text: 'Fehu ber með sér gróður.', deep_text: 'Dýpri lestur rúnarinnar.', area: null,
        seeking: null, intention: null, question: null, life_rune: 'Uruz', drawn_at: '2026-05-21T12:00:00Z', follow_up: [] },
      { id: 'd2', rune_name: 'NORNS', rune_glyph: '', lang: 'en', short_text: 'ᚠ FEHU · ᚢ URUZ · ᚦ THURISAZ', deep_text: 'The Norns reading.', area: 'spread',
        aol: null, seeking: null, intention: null, question: null, drawn_at: '2026-05-20T12:00:00Z', follow_up: [] }];
    await ev(`(() => { currentUser = { id: 'u1', email: 'tester@example.com' }; userTier = 'premium'; showAppTab('journal'); return true; })()`);
    await sleep(800);   // načtení z databáze spadne (zablokovaná) — ukázková čtení až potom
    const d1 = await ev(`(() => { _journalCache = ${JSON.stringify(ukazka)}; renderJournal(_journalCache); toggleJournalEntry(0); return ${DENIK}; })()`);
    await ev(`setLang('en')`); await sleep(400);
    const d2 = await ev(`(() => { const o = document.getElementById('jex-0'); return { texty: ${DENIK}, otevrena: !!(o && o.classList.contains('jcard-excerpt--open')) }; })()`);
    const df = await ev(`(() => { setLang('is'); populateJournalFilters(_journalCache); const sel = document.getElementById('jf-lang'); sel.value = 'is'; filterJournal();
      const pred = document.querySelectorAll('#journal-list .jcard').length; setLang('en'); const po = document.querySelectorAll('#journal-list .jcard').length;
      sel.value = ''; return { pred: pred, po: po, hodnota: sel.value }; })()`);
    await ev(`(() => { setLang('is'); currentUser = null; _journalCache = []; showAppTab('reading'); return true; })()`);
    const stejne = (Array.isArray(d1) && d2 && Array.isArray(d2.texty))
      ? d1.filter((t) => d2.texty.indexOf(t) !== -1 && !/^(EN|IS)( \+ (EN|IS))?$/.test(t) && !/^(Fehu|Uruz|Thurisaz|NORNS)$/i.test(t)) : null;
    rekni(!!stejne && !stejne.length && d1.length > 3 && d2.otevrena,
      '(D) Deník po přepnutí IS → EN na záložce: rozhraní anglicky (' + (Array.isArray(d1) ? d1.length : 0) + ' textů), otevřená karta zůstala otevřená',
      stejne ? 'v EN zůstalo: ' + stejne.map((t) => '„' + t + '“').join(', ') + (d2 && !d2.otevrena ? ' · karta zaklapla' : '') : JSON.stringify({ d1, d2 }).slice(0, 300));
    rekni(!!df && df.pred === 1 && df.po === 1, '(D) Deník po přepnutí jazyka drží filtr (jazyk IS: 1 čtení ze 2)', JSON.stringify(df));

    // (E) Rúnakort v pádu: Rune Seeker po vyčerpání volného čtení (updateBanners) a popisek zadání kódu karty (updateUIText), islandsky
    const k = await ev(`(() => {
      currentUser = { id: 'u1', email: 'tester@example.com' }; userTier = 'rune_seeker'; userFreeBalance = 0; userCredits = 0; profileLoaded = true;
      setLang('is'); updateBanners(); updateUIText();
      const v = { volne: (document.getElementById('free-user-text') || {}).textContent || '', kod: (document.getElementById('redeem-lbl') || {}).textContent || '',
                  nom: VOCAB.card.is, dat: VOCAB.card.is_dat, datDef: VOCAB.card.is_dat_def };
      currentUser = null; userTier = 'free'; profileLoaded = false; updateBanners(); updateUIText();
      return v;
    })()`);
    rekni(!!k && k.volne.indexOf('með ' + k.dat) !== -1 && !new RegExp('með ' + k.nom + '(?![a-záéíóúýþæöð])', 'i').test(k.volne),
      '(E) po vyčerpání volného čtení „með ' + (k && k.dat) + '“ (3. pád), ne „með ' + (k && k.nom) + '“', JSON.stringify(k && k.volne));
    rekni(!!k && k.datDef && k.kod.indexOf('KÓÐANN Á ' + k.datDef.toUpperCase()) !== -1 && k.kod.indexOf(k.nom.toUpperCase() + ' KÓÐA') === -1,
      '(E) popisek kódu karty „SLÁÐU INN KÓÐANN Á ' + (k && k.datDef ? k.datDef.toUpperCase() : '?') + '“, ne kalk', JSON.stringify(k && k.kod));

    // (F) selhané načtení profilu: přihlášený (podvržený) bez data narození v appce, databáze zablokovaná → oba pokusy selžou
    const pf = await ev(`(async () => {
      currentUser = { id: 'u1', email: 'tester@example.com' }; userTier = 'free'; readerUser = {}; _lifeRuneText = null;
      showAppTab('liferune');
      await fetchUserProfile('u1');
      const vis = (id) => { const el = document.getElementById(id); if (!el) return false;
        for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).display === 'none') return false; return true; };
      const r = { selhal: profileLoadFailed, nacteno: profileLoaded, chyba: vis('tree-loading') ? (document.getElementById('tree-loading-text') || {}).textContent : null,
                  ocekavana: t('profile_load_err'), znovu: vis('tree-loading-retry'), noDob: vis('tree-no-dob'),
                  // pruh: zobrazila ho appka? (vlastní display — záložka Čtení je při testu skrytá, viditelnost by platila vždy; chyceno útokem)
                  pruh: (document.getElementById('free-user-banner') || { style: {} }).style.display === 'block' };
      await new Promise((ok) => setTimeout(ok, 1600));   // výzva ke jménu by vyskočila 1,2 s po načtení profilu
      r.jmeno = vis('name-overlay');
      profileLoadFailed = false; currentUser = null; showAppTab('reading'); updateAuthUI();
      return r;
    })()`);
    rekni(!!pf && pf.selhal && !pf.nacteno && pf.chyba === pf.ocekavana && pf.znovu && !pf.noDob && !pf.pruh && !pf.jmeno,
      '(F) selhané načtení profilu: Životní runa hlásí chybu se „zkusit znovu“, ne „kdy ses narodil?“; bez pruhu a bez výzvy ke jménu', JSON.stringify(pf));

    // (G) nápovědy pod „+“: rozbalit každou v EN i IS (i v sekci, která je návštěvníkovi skrytá) a vrátit, jak byla
    const napovedy = (jz) => ev(`(() => {
      setLang(${JSON.stringify(jz)});
      return [...document.querySelectorAll('.hint-tgl')].map((b) => {
        const id = b.getAttribute('aria-controls'), box = id && document.getElementById(id);
        if (!box) return { id, text: null };
        const bylo = box.style.display; b.click();
        const v = { id, text: (box.textContent || '').trim(), otevreno: box.style.display !== 'none' };
        if (bylo === 'none' && box.style.display !== 'none') b.click();
        return v;
      });
    })()`);
    const hEn = await napovedy('en'), hIs = await napovedy('is');
    const klic = /^[a-z][a-z0-9_]*$/, vadne = [];
    for (const [jz, sada] of [['en', hEn], ['is', hIs]])
      for (const h of (sada || [])) if (!h.text || klic.test(h.text) || !h.otevreno) vadne.push(jz + ' ' + h.id + ': „' + h.text + '“');
    (hEn || []).forEach((h, i) => { if (hIs && hIs[i] && h.text && h.text === hIs[i].text) vadne.push('stejné v EN i IS ' + h.id + ': „' + h.text + '“'); });
    rekni(!!hEn && hEn.length >= 3 && !vadne.length,
      '(G) nápovědy pod „+“ ve formuláři (' + ((hEn && hEn.length) || 0) + '): věta z UI_TEXT v jazyce appky, ne holý klíč', vadne.join(' · '));
    const anglicky = /\b(SPEAK|AGAIN|STAY|YES|credits?)\b/i;
    rekni(!!o1 && o1.otevreno && o1.jazyk === 'is' && o1.zavreno && o1.jazykPo === 'is' && /ENSKU/.test(o1.title) && /ÍSLENSKU/.test(o1.zpet)
          && ![o1.title, o1.body, o1.ok, o1.zpet, o1.cena].some((x) => anglicky.test(x)) && o1.cena === o1.cekana.toUpperCase()
          && o1.body.indexOf(o1.cekana) !== -1,
      '(C) okno po čtení v IS: islandsky, cena „' + (o1 && o1.cena) + '“ ze SPREAD_COSTS, zrušení jazyk nechá', JSON.stringify(o1));
    rekni(!!o2 && o2.otevreno && o2.jazyk === 'en' && o2.zavreno && o2.jazykPo === 'en' && /ICELANDIC/.test(o2.title) && /ENGLISH/.test(o2.zpet)
          && o2.cena === o2.cekana.toUpperCase() && o2.body.indexOf(o2.cekana) !== -1 && !!o1 && ['title', 'body', 'ok', 'zpet'].every((k) => o1[k] !== o2[k]),
      '(C) okno po čtení v EN: anglicky, cena „' + (o2 && o2.cena) + '“ ze SPREAD_COSTS, texty jiné než v IS', JSON.stringify(o2));
    for (const str of ['runar-help.html', 'runar-privacy.html']) {
      await nacti(str, `typeof setLang === 'function'`);
      await ev(`setLang('en')`); await sleep(300); await zmer(str + ' EN'); await sber(str, 'en');
      await ev(`setLang('is')`); await sleep(300); await zmer(str + ' IS'); await sber(str, 'is');
    }

    // (A) kontrast
    let textu = 0; const pod = [], slabe = new Map();
    for (const s of stavy) {
      if (!s.v) { rekni(false, '(A) ' + s.jm + ': měření ve stránce selhalo'); continue; }
      textu += s.v.length;
      for (const x of s.v) {
        if (x.k < PRAH) pod.push(s.jm + ': ' + x.k + ' : 1  ' + x.kde + ' „' + x.txt + '“ (' + x.px + ' px, průhlednost ' + x.op + ')');
        else if (x.k < (x.velky ? 3 : WCAG)) {
          slabe.set(x.kde + ' ' + x.k, s.jm.split(' ')[0]);
          if (process.argv.includes('--slabe')) console.log('  slabé  ' + s.jm + ': ' + x.k + ' : 1  ' + x.kde + ' „' + x.txt + '“ (' + x.px + ' px, průhlednost ' + x.op + ')');
        }
      }
    }
    pod.forEach((p) => console.log('  ' + p));
    rekni(!pod.length && textu > 50, '(A) kontrast aspoň 3 : 1 — ' + textu + ' textů v ' + stavy.length + ' stavech', pod.length + ' textů pod 3 : 1 (§5: --dim nikdy pro text)');
    if (slabe.size) konec.info = ' · slabší než 4,5 : 1 (doporučení WCAG, rozhodnutí o vzhledu): ' + slabe.size + ' — ' +
      [...new Set(slabe.values())].join(', ');

    // (B) zaseklá angličtina
    const zasekle = []; let porovnano = 0;
    for (const str of Object.keys(jazyk)) {
      const { en, is } = jazyk[str];
      if (!en || !is) { rekni(false, '(B) ' + str + ': sběr textů selhal'); continue; }
      const enS = new Set(en); porovnano += en.length;
      [...new Set(is)].filter((t) => enS.has(t)).forEach((t) => zasekle.push(str + ': „' + t + '“'));
    }
    zasekle.forEach((p) => console.log('  ' + p));
    rekni(!zasekle.length && porovnano > 50, '(B) islandská verze bez zaseklé angličtiny — reader, nápověda, zásady (' + porovnano + ' anglických textů)',
      zasekle.length + ' textů je v IS stejných jako v EN (§2, §10)');
  } catch (e) { rekni(false, 'prohlížeč spadl', String(e && e.message || e).slice(0, 200)); }
  const dialogy = poj ? poj.hotovo() : [];
  if (dialogy.length) rekni(false, 'stránka otevřela dialog (sám potvrzen, jinak by kontrolu zablokoval)', dialogy.join(' · '));
  try { proc.kill(); } catch (e) {}
  srv.close();
  setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} konec(); }, 300);
})();
