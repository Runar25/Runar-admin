// Odkud voda: v kolika čteních je voda, a kolikrát ji model PŘIDAL (v obraze/místě/jádru promptu voda nebyla).
// Produkce ownera (EN od 2026-08-01) po verzích: před v4.0 (bez vzoru "exchange between the sea and the shore") a od v4.0.
// Testy (docs/eval 2026-09-15 až 19): všechny mají vzor sea/shore v promptu.
const fs = require('fs'), path = require('path');
const WATER = /\b(water|waters|sea|seas|river|rivers|stream|streams|brook|fjord|fjords|lake|lagoon|pond|pool|pools|tide|tides|wave|waves|shore|shores|beach|surf|rain|drip|drips|puddle|marsh|current|flood|glacial river|ebb|ebbing|spray|harbour|harbor|wet)\b/i;
const slova = t => [...new Set(((t || '').match(new RegExp(WATER.source, 'gi')) || []).map(s => s.toLowerCase()))];

// ── produkce
let t = fs.readFileSync(path.join(__dirname, 'prod_cteni.txt'), 'utf8'); t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows.filter(r => r.lang !== 'is');
const verNum = v => { const m = String(v || '').match(/^v(\d+)\.(\d+)/); return m ? +m[1] + (+m[2]) / 100 : 0; };
const skup = { 'produkce PŘED v4.0 (bez vzoru sea/shore)': [], 'produkce OD v4.0 (se vzorem)': [] };
for (const r of rows) {
  let d = {}; try { d = JSON.parse(r.draws || '{}'); } catch (e) {}
  const img = String(d.image || '');
  (verNum(r.prompt_version) >= 4 ? skup['produkce OD v4.0 (se vzorem)'] : skup['produkce PŘED v4.0 (bez vzoru sea/shore)']).push({ id: r.rune_name, text: r.txt, img, spread: /NORNS|KRIZ|HORSE|YGG/.test(r.rune_name || '') });
}
// ── testy
const E = 'C:/Users/zkuku/Downloads/Runar-admin/docs/eval/';
const zdroje = [
  ['2026-09-15-kratke-obrazy-esence/prompty-t15', id => id.replace(/\d$/, '')],
  ['2026-09-15-kratke-obrazy-esence/prompty-t16', () => 'T16-bezvzoru'],
  ['2026-09-18-po-uklidu-raidho', () => 'CTENI-v426'],
  ['2026-09-18-jadro-a-misto', id => id.split('-')[0]],
  ['2026-09-18-krok2-rytmus', id => id.split('-')[0]],
  ['2026-09-19-odkud-grey', id => id.split('-')[0]],
  ['2026-09-19-identita-runa-x-misto', id => id],
  ['2026-09-19-kratka-jadra', id => id],
];
const testy = [];
for (const [dir, map] of zdroje) {
  const tx = JSON.parse(fs.readFileSync(E + dir + '/texty.json', 'utf8'));
  for (const [id, v] of Object.entries(tx)) {
    if (id.startsWith('_') || /^ASK/.test(id)) continue;
    const text = typeof v === 'string' ? v : v.text;
    const f = E + dir + '/' + map(id) + '.txt';
    if (!fs.existsSync(f)) { console.log('chybí prompt: ' + f); continue; }
    const p = fs.readFileSync(f, 'utf8');
    const img = (p.match(/^IMAGE — [^\n]*/m) || [''])[0].replace(/Let it become your own seeing in the text\./, '');
    testy.push({ id: dir.slice(11) + ':' + id, text, img });
  }
}
skup['testy 09-15 až 09-19 (všechny se vzorem)'] = testy;

for (const [k, a] of Object.entries(skup)) {
  const s = a.filter(x => !x.spread);
  const w = s.filter(x => WATER.test(x.text));
  const pridal = s.filter(x => WATER.test(x.text) && !WATER.test(x.img));
  console.log('\n' + k + ': čtení ' + s.length + ' · voda v textu ' + w.length + ' (' + Math.round(100 * w.length / s.length) + ' %) · voda PŘIDANÁ (v obraze nebyla) ' + pridal.length + '/' + s.filter(x => !WATER.test(x.img)).length + ' čtení s obrazem bez vody (' + Math.round(100 * pridal.length / Math.max(1, s.filter(x => !WATER.test(x.img)).length)) + ' %)');
  const cet = {}; pridal.forEach(x => slova(x.text).forEach(w => cet[w] = (cet[w] || 0) + 1));
  console.log('   přidaná slova: ' + Object.entries(cet).sort((a, b) => b[1] - a[1]).map(([w, n]) => w + ' ' + n).join(', '));
  if (/testy/.test(k)) pridal.forEach(x => console.log('   » ' + x.id.padEnd(40) + ' obraz: ' + x.img.slice(53, 140) + ' | voda: ' + slova(x.text).join(',')));
}
