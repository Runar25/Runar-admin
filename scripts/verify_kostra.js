// Kostra čtení + rejstřík pokusů (docs/kostra/) — kontrola a generátor přehledu.
// Owner 2026-11-23: „jakmile sáhneš na kostru, tak to musíš zjistit, ať tam nezapisuješ znovu … ze tam máš něco napsat a kam. jde to udělat
// nějak jinak a lépe, tak aby se to stále vylepšovalo?“ · „zkouška by měla mít jméno nebo verzi či číslo pro lepší orientaci“.
// Owner 2026-11-24: „záleží na tom, co se měnilo … občas se jen něco doplní a to nemá žádný vliv na to, co zrovna testujeme“ → stáří pokusu
// se neposuzuje podle čísla verze, ale podle toho, které KUSY zadání (_kus v runar-character.js) se od té verze opravdu změnily.
// Proto: kostra a pokusy jsou DATA (kostra.json, pokusy.json); čitelný přehled KOSTRA.md se z nich generuje a ručně needituje.
// Kostra je napojená na kód: každý kus produkčního zadání jedné runy (EN i IS, s otázkou i bez) musí mít v kostře místo (část nebo
// ostatni_kusy) — když CODE-tune přidá do promptu nový kus, commit kostry ho nepustí bez zápisu.
// Životní cyklus (memory guard-test-the-lifecycle): čte soubory a git; složka kostry ještě není (čistá kopie před prvním commitem) → OK;
// git nebo stará verze nedostupná → POZOR „nelze ověřit“ (žádné tiché zelené, §19.2).
//   node scripts/verify_kostra.js            kontrola (FAIL = vada, zastaví commit přes rychle_kontroly.py)
//   node scripts/verify_kostra.js --zapis    přegeneruje docs/kostra/KOSTRA.md
//   node scripts/verify_kostra.js --hledej "slova"   najde pokusy, pravidla a vady se stejnými slovy (nápad už tu může být)
//   node scripts/verify_kostra.js --vznik    doplní do kostra.json, odkdy je který kus v kódu (první commit se znakem kusu)
//   node scripts/verify_kostra.js --test     útoky na kontrolu (musí padnout)
// Owner 2026-11-24: „v kostře bych chtěl také vidět, kdy která část vznikla“ → u kusu „v kódu od“ (git), u části nejstarší kus,
// u pokusu pole datum. Chybí-li datum, commit kostry neprojde.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = (process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const D = ROOT + '/docs/kostra/';
const STAVY = ['nápad', 'připraveno', 'běží', 'čeká na ownera', 'přijato', 'v produkci', 'vyřazeno', 'odloženo', 'poučení'];
const ZDROJE = ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'];
const nacti = () => ({ k: JSON.parse(fs.readFileSync(D + 'kostra.json', 'utf8')), p: JSON.parse(fs.readFileSync(D + 'pokusy.json', 'utf8')) });
// Slova se známým účinkem (docs/kostra/slova.json) a záznamy běhů pokusů (docs/kostra/behy/*.json píše hlídač API při každém puštěném
// volání; behy-zpetne.json = dohledáno zpětně z přepisů a logu). Owner 2026-11-25: „pokud něco uděláme a pak se k tomu vrátíme později,
// tak nevíš, kdy a jak jsi to dělal“. Chybí-li soubor (čistá kopie před prvním commitem), bere se prázdný.
const slovaData = () => { try { return JSON.parse(fs.readFileSync(D + 'slova.json', 'utf8')).slova || []; } catch (e) { return []; } };
const behyData = () => {
  const out = [];
  try { for (const f of fs.readdirSync(D + 'behy')) if (f.endsWith('.json')) { try { out.push(JSON.parse(fs.readFileSync(D + 'behy/' + f, 'utf8'))); } catch (e) {} } } catch (e) {}
  try { for (const b of JSON.parse(fs.readFileSync(D + 'behy-zpetne.json', 'utf8')).behy || []) out.push(Object.assign({ zpetne: true }, b)); } catch (e) {}
  return out;
};
const verzePromptu = () => { const m = fs.readFileSync(ROOT + '/v2/runar-config.js', 'utf8').match(/RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'/); return m ? m[1] : '?'; };

// ── kusy produkčního zadání jedné runy (texty podle kusu, přes 25 run × 3 semínka × EN/IS × s otázkou i bez) ──
function kusy(cti) {
  const out = {};
  for (const lang of ['en', 'is']) for (const seed of [3, 7, 11]) {
    const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
    S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
    S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
    vm.createContext(S);
    vm.runInContext('var __s = ' + seed + '; Math.random = function () { __s = (__s * 16807) % 2147483647; return (__s - 1) / 2147483646; };', S);
    for (const f of ZDROJE) vm.runInContext(cti(f) + '\n;\n', S);
    vm.runInContext('var currentUser = null, userTier = "", userGender = "hk", lang = "' + lang + '";', S);
    const G = (x) => vm.runInContext(x, S);
    if (typeof G('typeof _skladba === "function" ? _skladba : null') !== 'function') return null;   // starý kód bez kusů
    const A = G('AREAS'), SK = G('SEEKS'), I = G('INTENTIONS');
    G('RUNES').forEach((r, i) => {
      const u = { name: 'Kuky', area: A[lang][i % A[lang].length], seeking: SK[lang][i % SK[lang].length], intention: I[lang][i % I[lang].length], question: i % 2 ? 'x' : '' };
      for (const x of G('_skladba')(G('buildReadingPrompt'), [u, r, lang, []]).kusy.concat(G('_skladba')(G('_promptKonec'), ['SINGLE', [r], lang, true]).kusy))
        (out[x.kus] = out[x.kus] || new Set()).add(lang + '|' + x.text);
    });
  }
  return out;
}
const kusyTed = () => kusy((f) => fs.readFileSync(ROOT + '/v2/' + f, 'utf8'));
// Stav zdrojů v okamžiku, kdy platila verze promptu v (poslední commit s ní) → kusy té doby. null = nelze zjistit.
const _cache = {};
const _ulozene = () => { try { const g = cp.execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  return path.resolve(ROOT, g, 'runar-kostra-kusy.json'); } catch (e) { return null; } };
function kusyVerze(v) {
  if (v in _cache) return _cache[v];
  const soubor = _ulozene(); let mez = {};
  try { mez = JSON.parse(fs.readFileSync(soubor, 'utf8')); } catch (e) { mez = {}; }
  if (mez[v]) { const o = {}; for (const n of Object.keys(mez[v])) o[n] = new Set(mez[v][n]); return (_cache[v] = o); }
  try {
    const g = (a) => cp.execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const commity = g(['log', '-S', "RUNAR_PROMPT_VERSION = '" + v, '--format=%H', '--', 'v2/runar-config.js']).trim().split('\n').filter(Boolean);
    if (!commity.length) return (_cache[v] = null);
    const odchod = commity[0], obsah = g(['show', odchod + ':v2/runar-config.js']);
    const ref = obsah.includes("RUNAR_PROMPT_VERSION = '" + v) ? odchod : odchod + '^';   // verze pořád platí → ten commit, jinak stav před odchodem
    const vysl = kusy((f) => g(['show', ref + ':v2/' + f]));
    if (vysl && soubor) { const o = {}; for (const n of Object.keys(vysl)) o[n] = [...vysl[n]]; mez[v] = o; try { fs.writeFileSync(soubor, JSON.stringify(mez)); } catch (e) { /* jen mezipaměť */ } }
    return (_cache[v] = vysl);
  } catch (e) { return (_cache[v] = null); }
}
function zmeneneKusy(stare, nove) {
  const z = [];
  for (const n of new Set(Object.keys(stare).concat(Object.keys(nove)))) {
    const a = stare[n] || new Set(), b = nove[n] || new Set();
    if (a.size !== b.size || [...a].some((x) => !b.has(x))) z.push(n);
  }
  return z;
}

function kontrola(k, p, md, exist, kusyNyni, kusyStare) {
  const vady = [], varov = [];
  const ids = new Map(); const reg = (id, kde) => { if (ids.has(id)) vady.push('docs/kostra/' + kde + ': id ' + id + ' je dvakrát (i v ' + ids.get(id) + ')'); else ids.set(id, kde); };
  for (const j of k.jadro) reg(j.id, 'kostra.json');
  for (const s of k.sloty) { reg(s.id, 'kostra.json');
    for (const r of s.pravidla) { reg(r.id, 'kostra.json'); if (!r.zdroj || !r.od) vady.push('docs/kostra/kostra.json: pravidlo ' + r.id + ' bez zdroje nebo data'); }
    for (const m of s.meritka) reg(m.id, 'kostra.json');
    for (const v of s.varianty || []) { reg(v.id, 'kostra.json'); if (v.pokus && !p.pokusy.find((x) => x.id === v.pokus)) vady.push('docs/kostra/kostra.json: varianta ' + v.id + ' odkazuje na neznámý pokus ' + v.pokus); }
    for (const v of s.vstupy) if (!k.vstupy.find((x) => x.id === v)) vady.push('docs/kostra/kostra.json: ' + s.id + ' odkazuje na neznámý vstup ' + v);
    for (const v of s.vady) if (!v.pricina || !v.doklad) vady.push('docs/kostra/kostra.json: vada „' + v.t + '“ u ' + s.id + ' bez příčiny nebo dokladu'); }
  for (const v of k.vstupy) reg(v.id, 'kostra.json');
  for (const z of k.zavislosti) reg(z.id, 'kostra.json');
  for (const r of k.otevrene) { reg(r.id, 'kostra.json'); if (r.pokus && !p.pokusy.find((x) => x.id === r.pokus)) vady.push('docs/kostra/kostra.json: otevřené ' + r.id + ' odkazuje na neznámý pokus ' + r.pokus); }
  // každý kus produkčního zadání má v kostře místo
  const kusSlot = {};
  for (const s of k.sloty) for (const n of s.kusy) kusSlot[n] = [s.id];
  for (const o of k.ostatni_kusy || []) kusSlot[o.kus] = o.dotyka;
  if (kusyNyni) for (const n of Object.keys(kusyNyni)) if (!kusSlot[n]) vady.push('docs/kostra/kostra.json: kus zadání ' + n + ' (v2/runar-character.js) nemá v kostře místo — přidej ho k části nebo do ostatni_kusy');
  if (!kusyNyni) varov.push('kusy produkčního zadání nešly sestavit — pokrytí kostry neověřeno');
  for (const n of Object.keys(kusSlot)) if (!(k.vznik || {})[n]) vady.push('docs/kostra/kostra.json: kus ' + n + ' nemá datum vzniku — pusť node scripts/verify_kostra.js --vznik' + ((k.znaky || {})[n] ? '' : ' (napřed mu dej znak v „znaky“)'));
  const sloty = new Set(k.sloty.map((s) => s.id)), aktual = verzePromptu();
  for (const x of p.pokusy) { reg(x.id, 'pokusy.json');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x.datum || '')) vady.push('docs/kostra/pokusy.json: ' + x.id + ' nemá datum (RRRR-MM-DD), kdy vznikl');
    if (!STAVY.includes(x.stav)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' má neznámý stav „' + x.stav + '“ (povolené: ' + STAVY.join(', ') + ')');
    for (const s of x.sloty) if (!sloty.has(s)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' sahá na neznámou část ' + s);
    for (const s of x.souvisi || []) if (!p.pokusy.find((y) => y.id === s)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' souvisí s neznámým ' + s);
    if (['přijato', 'v produkci', 'vyřazeno'].includes(x.stav) && !x.owner && !/bez API/.test(x.prompt || '')) vady.push('docs/kostra/pokusy.json: ' + x.id + ' je „' + x.stav + '“ bez ownerova slova (pole owner)');
    if (x.slozka && !exist(ROOT + '/' + x.slozka)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' odkazuje na neexistující složku ' + x.slozka);
    if (['čeká na ownera', 'běží'].includes(x.stav) && /^v\d/.test(x.prompt || '') && !aktual.startsWith(x.prompt)) {
      const st = kusyStare ? kusyStare(x.prompt) : null;
      if (!st || !kusyNyni) { varov.push(x.id + ' měřeno na promptu ' + x.prompt + ', dnes ' + aktual + ' — změny nelze ověřit (git/stará verze nedostupná)'); continue; }
      const z = zmeneneKusy(st, kusyNyni).filter((n) => (kusSlot[n] || []).some((s) => x.sloty.includes(s)));
      if (z.length) varov.push(x.id + ' (' + x.sloty.join(' ') + ') měřeno na ' + x.prompt + '; od té doby se změnily kusy, kterých se týká: ' + z.join(', ') + ' — výsledek ověřit');
    } }
  // slova se známým účinkem: vzor se musí dát přeložit, záznam má doklad, datum a stav
  for (const w of slovaData()) { reg(w.id, 'slova.json');
    try { new RegExp(w.vzor, 'i'); } catch (e) { vady.push('docs/kostra/slova.json: ' + w.id + ' — vzor se nedá přeložit'); }
    if (!w.doklad || !/^\d{4}-\d{2}-\d{2}$/.test(w.datum || '') || !['platí', 'starší'].includes(w.stav)) vady.push('docs/kostra/slova.json: ' + w.id + ' bez dokladu, data nebo se stavem mimo platí/starší'); }
  // zdroje obsahu: stav vlastní kostra.json „zdroje_stav“; pokus od 2026-11-25 je musí vyjmenovat (P20 vzal neověřenou tabulku, owner 2026-11-25)
  const zst = {}; for (const z of k.zdroje_stav || []) { zst[z.cesta] = z.stav; if (!['ověřeno', 'neověřeno'].includes(z.stav)) vady.push('docs/kostra/kostra.json: zdroj ' + z.cesta + ' má stav mimo ověřeno/neověřeno'); if (!exist(ROOT + '/' + z.cesta)) vady.push('docs/kostra/kostra.json: zdroj ' + z.cesta + ' neexistuje'); }
  for (const x of p.pokusy) {
    if ((x.datum || '') >= '2026-11-25' && !Array.isArray(x.zdroje)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' nemá pole zdroje (od 2026-11-25 povinné; [] = jen produkce)');
    for (const z of x.zdroje || []) {
      if (!(z in zst)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' bere ze zdroje ' + z + ', který v kostra.json „zdroje_stav“ není — zapiš jeho stav');
      else if (zst[z] === 'neověřeno' && ['přijato', 'v produkci'].includes(x.stav)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' je „' + x.stav + '“, ale bere z neověřeného zdroje ' + z);
    } }
  if (md !== null && md.replace(/\r\n/g, '\n') !== generuj(k, p)) vady.push('docs/kostra/KOSTRA.md: neodpovídá datům — needituj ručně, pusť node scripts/verify_kostra.js --zapis');
  return { vady, varov };
}

function generuj(k, p) {
  // Owner 2026-11-25: „uděláme pořádek v kostře, ať můžeme oddělit, co je pro nás na použití, a co je starší verze, která je pro kontrolu“.
  // Proto tři oddíly: A platí (k použití) · B rozpracované (čeká na rozhodnutí) · C starší verze a poučení (jen pro kontrolu).
  const L = [], slova = slovaData(), behy = behyData();
  const vyreseno = (v) => /^vyřešeno/.test(v.stav || '');
  const beh = (id) => { const b = behy.filter((x) => x.pokus === id).sort((x, y) => (x.cas || '').localeCompare(y.cas || ''));
    return b.length ? b.length + '× (posl. ' + String(b[b.length - 1].cas || '').slice(0, 10) + (b.some((x) => x.zpetne) ? ', část zpětně' : '') + ')' : '—'; };
  const tabPokusy = (po) => { L.push('| id | od | pokus | části | běhy | výsledek | owner | dál |', '|---|---|---|---|---|---|---|---|');
    for (const x of po) L.push('| ' + x.id + ' | ' + (x.datum || '—') + ' | ' + x.nazev + ' | ' + x.sloty.join(' ') + ' | ' + beh(x.id) + ' | ' + (x.vysledek || '—') + ' | ' + (x.owner || '—') + ' | ' + (x.dalsi || '—') + ' |');
    L.push(''); };
  L.push('# Kostra čtení — přehled (GENEROVANÉ z kostra.json, pokusy.json, slova.json a behy/, needitovat; `node scripts/verify_kostra.js --zapis`)', '');
  L.push('Verze kostry: **' + k.verze + '** · prompt v produkci: viz `RUNAR_PROMPT_VERSION` (v2/runar-config.js). Značky: J = jádro · K = část čtení · '
    + 'V = vstup · M = měřítko · Z = závislost · R = otevřená otázka · P = pokus · S = slovo se známým účinkem · K2-A = varianta části.', '');
  L.push('Oddíly: **A. Platí — k použití** · **B. Rozpracované — čeká na rozhodnutí** · **C. Starší verze a poučení — jen pro kontrolu**.', '');
  L.push('# A. Platí — k použití', '');
  L.push('## Jádro (nemění se bez datovaného rozhodnutí)', '');
  for (const j of k.jadro) L.push('- **' + j.id + '** ' + j.t + ' — *' + j.zdroj + '*');
  L.push('', '## Části čtení', '');
  for (const s of k.sloty) {
    const od = s.kusy.map((n) => ((k.vznik || {})[n] || {}).od).filter(Boolean).sort()[0];
    L.push('### ' + s.id + ' ' + s.nazev + ' (věta ' + s.veta + ')', '', (od ? '**V kódu od:** ' + od + ' (nejstarší kus části)  \n' : '') + '**Práce:** ' + s.funkce + '  ');
    if (s.ucinek.length) L.push('**Co má v člověku vyvolat:** ' + s.ucinek.map((u) => u.t + ' (' + u.typ + ': ' + u.dukaz + ')').join(' · ') + '  ');
    const kv = (n) => n + ((k.vznik || {})[n] ? ' (od ' + k.vznik[n].od + ')' : '');
    L.push('**Z čeho vzniká:** ' + (s.vstupy.map((v) => v + ' ' + k.vstupy.find((x) => x.id === v).nazev).join(', ') || '—') + (s.kusy.length ? ' · kusy zadání: ' + s.kusy.map(kv).join(', ') : ''), '');
    if ((s.varianty || []).length) { L.push('Varianty:'); for (const v of s.varianty) L.push('- **' + v.id + '** ' + v.t + ' · ' + v.stav + (v.pokus ? ' (' + v.pokus + ')' : '')); L.push(''); }
    L.push('Pravidla:');
    for (const r of s.pravidla) L.push('- **' + r.id + '** ' + r.t + ' — *' + r.zdroj + ', od ' + r.od + '*');
    if (s.meritka.length) { L.push('', 'Měření:'); for (const m of s.meritka) L.push('- **' + m.id + '** ' + m.t + ' — ' + m.nastroj + ' · ' + m.stav); }
    const ot = s.vady.filter((v) => !vyreseno(v));
    if (ot.length) { L.push('', 'Známé vady a jejich příčina (otevřené a poučení; vyřešené v oddílu C):'); for (const v of ot) L.push('- ' + v.t + ' ← ' + v.pricina + ' (' + v.doklad + ') · ' + v.stav); }
    const po = p.pokusy.filter((x) => x.sloty.includes(s.id));
    if (po.length) L.push('', 'Pokusy na této části: ' + po.map((x) => x.id + ' (' + x.stav + ')').join(' · '));
    L.push('');
  }
  const sp = slova.filter((w) => w.stav === 'platí');
  if (sp.length) {
    L.push('## Slova a obraty se známým účinkem (hlídač API je ukáže před voláním; výklad: RUNAR_DESIGN.md „Slova, která dáváme modelu“)', '',
      '| id | vzor | kde | model | co dělá | n | doklad | od |', '|---|---|---|---|---|---|---|---|');
    for (const w of sp) L.push('| ' + w.id + ' | `' + w.vzor.replace(/\|/g, '\\|') + '` | ' + w.kde + ' | ' + w.model + ' | ' + w.co_dela + ' | ' + w.n + ' | ' + w.doklad + ' | ' + w.datum + ' |');
    L.push('');
  }
  if ((k.zdroje_stav || []).length) {
    L.push('## Zdroje obsahu pro pokusy a jejich stav (neověřený zdroj hlídač API nepustí bez RUNAR_ZDROJ_OK)', '');
    for (const z of k.zdroje_stav) L.push('- **' + z.stav + '** · ' + z.cesta + ' — ' + z.co + ' (' + z.proc + ')');
    L.push('');
  }
  if (k.vyznamy) {
    L.push('## Významy run: odkud je bere produkce', '');
    for (const v of k.vyznamy.produkce) L.push('- produkce: **' + v.zdroj + '** — ' + v.kam);
    L.push('');
  }
  if ((k.ostatni_kusy || []).length) {
    L.push('## Ostatní kusy zadání (nepatří jedné větě)', '');
    for (const o of k.ostatni_kusy) L.push('- **' + o.kus + '** ' + o.co + (o.dotyka.length ? ' → ' + o.dotyka.join(' ') : '') + ((k.vznik || {})[o.kus] ? ' · od ' + k.vznik[o.kus].od : ''));
    L.push('');
  }
  L.push('## Vstupy', '', 'Jak s kterým vstupem model pracuje (kolik převezme, do které věty, co si v obraze přidá podle úhlu): `docs/kostra/VSTUPY.md` '
    + '(generuje `node scripts/kostra_vstupy.js --zapis` ze skutečných čtení).', '', '| id | vstup | odkud v kódu | kdo ho dává | míří do |', '|---|---|---|---|---|');
  for (const v of k.vstupy) L.push('| ' + v.id + ' | ' + v.nazev + ' | ' + v.kod + ' | ' + v.kdo + ' | ' + v.do.join(', ') + ' |');
  L.push('', '## Co s čím souvisí (když měním X, musím zkontrolovat Y)', '');
  for (const z of k.zavislosti) L.push('- **' + z.id + '** ' + z.kdyz + ' → ' + z.tak.join(' · '));
  L.push('');
  const st = (a) => p.pokusy.filter((x) => a.includes(x.stav));
  if (st(['v produkci', 'přijato']).length) { L.push('## Pokusy přijaté a v produkci', ''); tabPokusy(st(['v produkci', 'přijato'])); }
  L.push('# B. Rozpracované — čeká na rozhodnutí nebo běh', '');
  for (const s of ['čeká na ownera', 'běží', 'připraveno', 'nápad']) { const po = st([s]); if (!po.length) continue; L.push('## Pokusy: ' + s, ''); tabPokusy(po); }
  L.push('## Otevřené otázky pro ownera', '');
  for (const r of k.otevrene) L.push('- **' + r.id + '** ' + r.t + (r.pokus ? ' (' + r.pokus + ')' : ''));
  L.push('', '# C. Starší verze a poučení — jen pro kontrolu', '');
  for (const s of ['poučení', 'odloženo', 'vyřazeno']) { const po = st([s]); if (!po.length) continue; L.push('## Pokusy: ' + s, ''); tabPokusy(po); }
  const vy = []; for (const s of k.sloty) for (const v of s.vady) if (vyreseno(v)) vy.push('- ' + s.id + ': ' + v.t + ' ← ' + v.pricina + ' (' + v.doklad + ') · ' + v.stav);
  if (vy.length) L.push('## Vyřešené vady', '', ...vy, '');
  if (k.vyznamy && k.vyznamy.zkouseno.length) { L.push('## Zkoušené zdroje významů', ''); for (const v of k.vyznamy.zkouseno) L.push('- ' + v.co + ' — ' + v.kde + ' · ' + v.stav); L.push(''); }
  const ss = slova.filter((w) => w.stav === 'starší');
  if (ss.length) { L.push('## Slova — starší zjištění (vyvrácená nebo nahrazená)', ''); for (const w of ss) L.push('- **' + w.id + '** `' + w.vzor + '` — ' + w.co_dela + ' (' + w.doklad + ', ' + w.datum + ')'); L.push(''); }
  return L.join('\n').replace(/\n+$/, '') + '\n';
}

function hledej(k, p, dotaz) {
  const slova = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const q = new Set(slova(dotaz)); const nalez = [];
  const zkus = (id, t) => { const s = slova(t); const n = s.filter((w) => q.has(w) || [...q].some((x) => w.startsWith(x.slice(0, 5)))).length; if (n) nalez.push([n, id, t]); };
  for (const x of p.pokusy) zkus(x.id, x.nazev + ' — ' + x.hypoteza + ' [' + x.stav + ']');
  for (const s of k.sloty) { for (const r of s.pravidla) zkus(r.id, r.t); for (const v of s.vady) zkus(s.id + ' vada', v.t + ' ← ' + v.pricina);
    for (const v of s.varianty || []) zkus(v.id, v.t + ' [' + v.stav + ']'); }
  for (const r of k.otevrene) zkus(r.id, r.t);
  nalez.sort((a, b) => b[0] - a[0]);
  return nalez.slice(0, 10);
}

function test() {
  const { k, p } = nacti(); const exist = () => true; const sel = []; const ted = kusyTed();
  const kopie = () => JSON.parse(JSON.stringify({ k, p }));
  const utok = (jm, fn, ocek) => { const c = kopie(); const kn = fn(c) || ted;
    const r = kontrola(c.k, c.p, ocek === 'md' ? 'ručně upraveno' : null, ocek === 'slozka' ? (f) => fs.existsSync(f) : exist, kn, null);
    if (!r.vady.length) sel.push(jm); };
  utok('dvakrát stejné id pokusu', (c) => { c.p.pokusy.push(Object.assign({}, c.p.pokusy[0])); });
  utok('pokus na neznámé části', (c) => { c.p.pokusy[0].sloty = ['K9']; });
  utok('neznámý stav', (c) => { c.p.pokusy[0].stav = 'hotovo'; });
  utok('přijato bez ownera', (c) => { const x = c.p.pokusy.find((y) => y.id === 'P02'); x.stav = 'přijato'; x.owner = ''; });
  utok('pravidlo bez zdroje', (c) => { c.k.sloty[0].pravidla[0].zdroj = ''; });
  utok('vada bez příčiny', (c) => { c.k.sloty[0].vady[0].pricina = ''; });
  utok('ručně upravený přehled', () => {}, 'md');
  utok('složka pokusu neexistuje', (c) => { c.p.pokusy[0].slozka = 'docs/eval/neexistuje-protipriklad'; }, 'slozka');
  utok('nový kus zadání bez místa v kostře', () => Object.assign({}, ted, { NOVY_KUS: new Set(['en|x']) }));
  utok('varianta s neznámým pokusem', (c) => { c.k.sloty[1].varianty[0].pokus = 'P99'; });
  utok('kus bez data vzniku', (c) => { delete c.k.vznik.ANGLE; });
  utok('pokus bez data', (c) => { c.p.pokusy[0].datum = ''; });
  // 2026-11-25 (owner: P20 vzal neověřenou tabulku): nový pokus bez zdrojů · zdroj mimo rejstřík · přijatý pokus z neověřeného zdroje
  utok('nový pokus bez pole zdroje', (c) => { c.p.pokusy[0].datum = '2026-11-26'; delete c.p.pokusy[0].zdroje; });
  utok('zdroj pokusu mimo rejstřík stavu', (c) => { c.p.pokusy[0].zdroje = ['docs/neznamy-zdroj.md']; });
  utok('přijatý pokus z neověřeného zdroje', (c) => { const x = c.p.pokusy.find((y) => y.id === 'P20'); x.stav = 'přijato'; x.owner = 'test'; });
  // změna kusu, kterého se pokus týká, se musí ohlásit; změna kusu jiné části ne
  const c = kopie(), x = c.p.pokusy.find((y) => y.stav === 'čeká na ownera' && y.sloty.includes('K2'));
  x.prompt = 'v0.test';
  const stareK2 = Object.assign({}, ted, { ESSENCE: new Set(['en|stará esence']) }), stareJine = Object.assign({}, ted, { FORMAT: new Set(['en|jiný formát']) });
  const r1 = kontrola(c.k, c.p, null, exist, ted, () => stareK2), r2 = kontrola(c.k, c.p, null, exist, ted, () => stareJine);
  if (!r1.varov.some((v) => v.startsWith(x.id) && v.includes('ESSENCE'))) sel.push('změna kusu ESSENCE u pokusu na K2 neohlášena');
  if (r2.varov.some((v) => v.startsWith(x.id))) sel.push('změna nesouvisejícího kusu FORMAT ohlášena jako relevantní');
  if (sel.length) { console.log('FAIL scripts/verify_kostra.js --test: útok neprošel: ' + sel.join(' · ')); process.exit(1); }
  const r = kontrola(k, p, null, (f) => fs.existsSync(f), ted, kusyVerze);
  console.log('OK  verify_kostra --test: 17 útoků chyceno; skutečná data ' + (r.vady.length ? r.vady.length + ' vad' : 'čistá'));
}

const a = process.argv.slice(2);
// Životní cyklus: v čisté kopii před prvním commitem složka docs/kostra/ není → nic ke kontrole (ne pád).
if (!fs.existsSync(D + 'kostra.json') || !fs.existsSync(D + 'pokusy.json')) { console.log('OK  kostra: docs/kostra/ zatím neexistuje'); process.exit(0); }
if (a[0] === '--test') test();
else if (a[0] === '--zapis') { const { k, p } = nacti(); fs.writeFileSync(D + 'KOSTRA.md', generuj(k, p)); console.log('zapsáno docs/kostra/KOSTRA.md'); }
else if (a[0] === '--vznik') {
  const { k } = nacti(); k.vznik = k.vznik || {}; let n = 0;
  for (const [kus, znak] of Object.entries(k.znaky || {})) { if (k.vznik[kus]) continue;
    const r = cp.execFileSync('git', ['log', '--reverse', '-S', znak, '--format=%ad %h', '--date=short', '--', 'v2/'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n')[0];
    if (r) { const [od, commit] = r.split(' '); k.vznik[kus] = { od, commit, znak }; n++; } else console.log('POZOR znak „' + znak + '“ (' + kus + ') v historii v2/ nenalezen'); }
  fs.writeFileSync(D + 'kostra.json', JSON.stringify(k, null, 1) + '\n'); console.log('doplněno ' + n + ' dat vzniku');
}
else if (a[0] === '--hledej') { const { k, p } = nacti(); const n = hledej(k, p, a.slice(1).join(' ')); if (!n.length) console.log('nic podobného'); for (const [s, id, t] of n) console.log(id + '  (' + s + ')  ' + t); }
else {
  const { k, p } = nacti(); const md = fs.existsSync(D + 'KOSTRA.md') ? fs.readFileSync(D + 'KOSTRA.md', 'utf8') : '';
  let ted = null; try { ted = kusyTed(); } catch (e) { ted = null; }
  const r = kontrola(k, p, md, (f) => fs.existsSync(f), ted, kusyVerze);
  for (const v of r.varov) console.log('POZOR ' + v);
  if (r.vady.length) { for (const v of r.vady) console.log('FAIL ' + v); process.exit(1); }
  console.log('OK  kostra: ' + k.sloty.length + ' částí, ' + k.vstupy.length + ' vstupů, ' + p.pokusy.length + ' pokusů, ' + Object.keys(ted || {}).length + ' kusů zadání v kostře');
}
