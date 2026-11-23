// Kostra čtení + rejstřík pokusů (docs/kostra/) — kontrola a generátor přehledu.
// Owner 2026-11-23: „jakmile sáhneš na kostru, tak to musíš zjistit, ať tam nezapisuješ znovu … ze tam máš něco napsat a kam. jde to udělat
// nějak jinak a lépe, tak aby se to stále vylepšovalo?“ · „zkouška by měla mít jméno nebo verzi či číslo pro lepší orientaci“.
// Proto: kostra a pokusy jsou DATA (kostra.json, pokusy.json); čitelný přehled KOSTRA.md se z nich generuje a ručně needituje.
// Životní cyklus (memory guard-test-the-lifecycle): čte jen soubory, ne git — necommitnutý nový pokus, upravený, přejmenovaná složka
// i smazaný pokus se posuzují stejně; útoky v --test a v scripts/protipriklady.py.
//   node scripts/verify_kostra.js            kontrola (FAIL = vada, zastaví commit přes rychle_kontroly.py)
//   node scripts/verify_kostra.js --zapis    přegeneruje docs/kostra/KOSTRA.md
//   node scripts/verify_kostra.js --hledej "slova"   najde pokusy, pravidla a vady se stejnými slovy (nápad už tu může být)
//   node scripts/verify_kostra.js --test     útoky na kontrolu (musí padnout)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = (process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const D = ROOT + '/docs/kostra/';
const STAVY = ['nápad', 'připraveno', 'běží', 'čeká na ownera', 'přijato', 'v produkci', 'vyřazeno', 'odloženo', 'poučení'];
const nacti = () => ({ k: JSON.parse(fs.readFileSync(D + 'kostra.json', 'utf8')), p: JSON.parse(fs.readFileSync(D + 'pokusy.json', 'utf8')) });
const verzePromptu = () => { const m = fs.readFileSync(ROOT + '/v2/runar-config.js', 'utf8').match(/RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'/); return m ? m[1] : '?'; };

function kontrola(k, p, md, exist) {
  const vady = [], varov = [];
  const ids = new Map(); const reg = (id, kde) => { if (ids.has(id)) vady.push('docs/kostra/' + kde + ': id ' + id + ' je dvakrát (i v ' + ids.get(id) + ')'); else ids.set(id, kde); };
  for (const j of k.jadro) reg(j.id, 'kostra.json');
  for (const s of k.sloty) { reg(s.id, 'kostra.json');
    for (const r of s.pravidla) { reg(r.id, 'kostra.json'); if (!r.zdroj || !r.od) vady.push('docs/kostra/kostra.json: pravidlo ' + r.id + ' bez zdroje nebo data'); }
    for (const m of s.meritka) reg(m.id, 'kostra.json');
    for (const v of s.vstupy) if (!k.vstupy.find((x) => x.id === v)) vady.push('docs/kostra/kostra.json: ' + s.id + ' odkazuje na neznámý vstup ' + v);
    for (const v of s.vady) if (!v.pricina || !v.doklad) vady.push('docs/kostra/kostra.json: vada „' + v.t + '“ u ' + s.id + ' bez příčiny nebo dokladu'); }
  for (const v of k.vstupy) reg(v.id, 'kostra.json');
  for (const z of k.zavislosti) reg(z.id, 'kostra.json');
  for (const r of k.otevrene) { reg(r.id, 'kostra.json'); if (r.pokus && !p.pokusy.find((x) => x.id === r.pokus)) vady.push('docs/kostra/kostra.json: otevřené ' + r.id + ' odkazuje na neznámý pokus ' + r.pokus); }
  const sloty = new Set(k.sloty.map((s) => s.id)), aktual = verzePromptu();
  for (const x of p.pokusy) { reg(x.id, 'pokusy.json');
    if (!STAVY.includes(x.stav)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' má neznámý stav „' + x.stav + '“ (povolené: ' + STAVY.join(', ') + ')');
    for (const s of x.sloty) if (!sloty.has(s)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' sahá na neznámou část ' + s);
    for (const s of x.souvisi || []) if (!p.pokusy.find((y) => y.id === s)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' souvisí s neznámým ' + s);
    if (['přijato', 'v produkci', 'vyřazeno'].includes(x.stav) && !x.owner && !/bez API/.test(x.prompt || '')) vady.push('docs/kostra/pokusy.json: ' + x.id + ' je „' + x.stav + '“ bez ownerova slova (pole owner)');
    if (x.slozka && !exist(ROOT + '/' + x.slozka)) vady.push('docs/kostra/pokusy.json: ' + x.id + ' odkazuje na neexistující složku ' + x.slozka);
    if (['čeká na ownera', 'běží'].includes(x.stav) && /^v\d/.test(x.prompt || '') && x.prompt !== aktual) varov.push(x.id + ' měřeno na promptu ' + x.prompt + ', dnes ' + aktual + ' — výsledek ověřit, než se použije'); }
  if (md !== null && md !== generuj(k, p)) vady.push('docs/kostra/KOSTRA.md: neodpovídá datům — needituj ručně, pusť node scripts/verify_kostra.js --zapis');
  return { vady, varov };
}

function generuj(k, p) {
  const L = [];
  L.push('# Kostra čtení — přehled (GENEROVANÉ z kostra.json a pokusy.json, needitovat; `node scripts/verify_kostra.js --zapis`)', '');
  L.push('Verze kostry: **' + k.verze + '** · prompt v produkci: viz `RUNAR_PROMPT_VERSION` (v2/runar-config.js). Značky: J = jádro · K = část čtení · '
    + 'V = vstup · M = měřítko · Z = závislost · R = otevřená otázka · P = pokus.', '');
  L.push('## Jádro (nemění se bez datovaného rozhodnutí)', '');
  for (const j of k.jadro) L.push('- **' + j.id + '** ' + j.t + ' — *' + j.zdroj + '*');
  L.push('', '## Části čtení', '');
  for (const s of k.sloty) {
    L.push('### ' + s.id + ' ' + s.nazev + ' (věta ' + s.veta + ')', '', '**Práce:** ' + s.funkce + '  ');
    if (s.ucinek.length) L.push('**Co má v člověku vyvolat:** ' + s.ucinek.map((u) => u.t + ' (' + u.typ + ': ' + u.dukaz + ')').join(' · ') + '  ');
    L.push('**Z čeho vzniká:** ' + (s.vstupy.map((v) => v + ' ' + k.vstupy.find((x) => x.id === v).nazev).join(', ') || '—') + (s.kusy.length ? ' · kusy zadání: ' + s.kusy.join(', ') : ''), '');
    for (const r of s.pravidla) L.push('- **' + r.id + '** ' + r.t + ' — *' + r.zdroj + ', od ' + r.od + '*');
    if (s.meritka.length) { L.push('', 'Měření:'); for (const m of s.meritka) L.push('- **' + m.id + '** ' + m.t + ' — ' + m.nastroj + ' · ' + m.stav); }
    if (s.vady.length) { L.push('', 'Známé vady a jejich příčina:'); for (const v of s.vady) L.push('- ' + v.t + ' ← ' + v.pricina + ' (' + v.doklad + ') · ' + v.stav); }
    const po = p.pokusy.filter((x) => x.sloty.includes(s.id));
    if (po.length) L.push('', 'Pokusy na této části: ' + po.map((x) => x.id + ' (' + x.stav + ')').join(' · '));
    L.push('');
  }
  L.push('## Vstupy', '', '| id | vstup | odkud v kódu | kdo ho dává | míří do |', '|---|---|---|---|---|');
  for (const v of k.vstupy) L.push('| ' + v.id + ' | ' + v.nazev + ' | ' + v.kod + ' | ' + v.kdo + ' | ' + v.do.join(', ') + ' |');
  L.push('', '## Co s čím souvisí (když měním X, musím zkontrolovat Y)', '');
  for (const z of k.zavislosti) L.push('- **' + z.id + '** ' + z.kdyz + ' → ' + z.tak.join(' · '));
  L.push('', '## Otevřené otázky pro ownera', '');
  for (const r of k.otevrene) L.push('- **' + r.id + '** ' + r.t + (r.pokus ? ' (' + r.pokus + ')' : ''));
  L.push('', '## Pokusy podle stavu', '');
  for (const st of STAVY) { const po = p.pokusy.filter((x) => x.stav === st); if (!po.length) continue;
    L.push('### ' + st, '', '| id | pokus | části | výsledek | owner | dál |', '|---|---|---|---|---|---|');
    for (const x of po) L.push('| ' + x.id + ' | ' + x.nazev + ' | ' + x.sloty.join(' ') + ' | ' + (x.vysledek || '—') + ' | ' + (x.owner || '—') + ' | ' + (x.dalsi || '—') + ' |');
    L.push(''); }
  return L.join('\n') + '\n';
}

function hledej(k, p, dotaz) {
  const slova = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const q = new Set(slova(dotaz)); const nalez = [];
  const zkus = (id, t) => { const s = slova(t); const n = s.filter((w) => q.has(w) || [...q].some((x) => w.startsWith(x.slice(0, 5)))).length; if (n) nalez.push([n, id, t]); };
  for (const x of p.pokusy) zkus(x.id, x.nazev + ' — ' + x.hypoteza + ' [' + x.stav + ']');
  for (const s of k.sloty) { for (const r of s.pravidla) zkus(r.id, r.t); for (const v of s.vady) zkus(s.id + ' vada', v.t + ' ← ' + v.pricina); }
  for (const r of k.otevrene) zkus(r.id, r.t);
  nalez.sort((a, b) => b[0] - a[0]);
  return nalez.slice(0, 10);
}

function test() {
  const { k, p } = nacti(); const exist = () => true; const sel = [];
  const kopie = () => JSON.parse(JSON.stringify({ k, p }));
  const utok = (jm, fn, ocek) => { const c = kopie(); fn(c); const r = kontrola(c.k, c.p, ocek === 'md' ? 'ručně upraveno' : null, ocek === 'slozka' ? (f) => fs.existsSync(f) : exist); if (!r.vady.length) sel.push(jm); };
  utok('dvakrát stejné id pokusu', (c) => c.p.pokusy.push(Object.assign({}, c.p.pokusy[0])));
  utok('pokus na neznámé části', (c) => { c.p.pokusy[0].sloty = ['K9']; });
  utok('neznámý stav', (c) => { c.p.pokusy[0].stav = 'hotovo'; });
  utok('přijato bez ownera', (c) => { const x = c.p.pokusy.find((y) => y.id === 'P02'); x.stav = 'přijato'; x.owner = ''; });
  utok('pravidlo bez zdroje', (c) => { c.k.sloty[0].pravidla[0].zdroj = ''; });
  utok('vada bez příčiny', (c) => { c.k.sloty[0].vady[0].pricina = ''; });
  utok('ručně upravený přehled', () => {}, 'md');
  utok('složka pokusu neexistuje', (c) => { c.p.pokusy[0].slozka = 'docs/eval/neexistuje-protipriklad'; }, 'slozka');
  if (sel.length) { console.log('FAIL scripts/verify_kostra.js --test: útok neprošel: ' + sel.join(' · ')); process.exit(1); }
  const r = kontrola(k, p, null, (f) => fs.existsSync(f));
  console.log('OK  verify_kostra --test: 8 útoků chyceno; skutečná data ' + (r.vady.length ? r.vady.length + ' vad' : 'čistá'));
}

const a = process.argv.slice(2);
// Životní cyklus: v čisté kopii před prvním commitem složka docs/kostra/ není → nic ke kontrole (ne pád).
if (!fs.existsSync(D + 'kostra.json') || !fs.existsSync(D + 'pokusy.json')) { console.log('OK  kostra: docs/kostra/ zatím neexistuje'); process.exit(0); }
if (a[0] === '--test') test();
else if (a[0] === '--zapis') { const { k, p } = nacti(); fs.writeFileSync(D + 'KOSTRA.md', generuj(k, p)); console.log('zapsáno docs/kostra/KOSTRA.md'); }
else if (a[0] === '--hledej') { const { k, p } = nacti(); const n = hledej(k, p, a.slice(1).join(' ')); if (!n.length) console.log('nic podobného'); for (const [s, id, t] of n) console.log(id + '  (' + s + ')  ' + t); }
else {
  const { k, p } = nacti(); const md = fs.existsSync(D + 'KOSTRA.md') ? fs.readFileSync(D + 'KOSTRA.md', 'utf8') : '';
  const r = kontrola(k, p, md, (f) => fs.existsSync(f));
  for (const v of r.varov) console.log('POZOR ' + v);
  if (r.vady.length) { for (const v of r.vady) console.log('FAIL ' + v); process.exit(1); }
  console.log('OK  kostra: ' + k.sloty.length + ' částí, ' + k.vstupy.length + ' vstupů, ' + p.pokusy.length + ' pokusů');
}
