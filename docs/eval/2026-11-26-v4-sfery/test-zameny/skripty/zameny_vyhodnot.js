// Vyhodnotí odpovědi čtyř slepých soudců: projde (oba soudci sady 1. volbou správně) / neprojde (oba jinou runou) / sporná.
const fs = require('fs'), path = require('path');
const REPO = 'C:/Users/zkuku/Downloads/Runar-admin';
const S = path.join(__dirname, 'soudci');
const vety = JSON.parse(fs.readFileSync(REPO + '/docs/eval/2026-11-26-v4-sfery/test-zameny/vety.json', 'utf8')).vety;
const podleId = Object.fromEntries(vety.map(v => [v.id, v]));
const vysl = {}; // id -> { G: [...], L: [...] }
const radkyRaw = [];
for (const j of ['G-A', 'G-B', 'L-A', 'L-B']) {
  const mapa = JSON.parse(fs.readFileSync(path.join(S, 'mapa_' + j + '.json'), 'utf8'));
  const odp = JSON.parse(fs.readFileSync(path.join(S, 'odpoved_' + j + '.json'), 'utf8'));
  if (odp.length !== Object.keys(mapa).length) throw new Error(j + ': ' + odp.length + ' odpovědí, čekáno ' + Object.keys(mapa).length);
  for (const o of odp) {
    const id = mapa[o.id]; if (!id) throw new Error(j + ': neznámé číslo ' + o.id);
    const sada = j[0];
    ((vysl[id] = vysl[id] || {})[sada] = vysl[id][sada] || []).push({ soudce: j, ...o });
    radkyRaw.push({ soudce: j, maska: o.id, id, runa: podleId[id].runa, ...o });
  }
}
fs.writeFileSync(path.join(S, 'vsechny_odpovedi.json'), JSON.stringify(radkyRaw, null, 1));
let shodaSoudcu = { G: [0, 0], L: [0, 0] };
const tab = [];
for (const v of vety) {
  for (const sada of ['G', 'L']) {
    const o = (vysl[v.id] || {})[sada]; if (!o) continue;
    const ok = o.map(x => x.prvni === v.runa);
    const stav = ok.every(Boolean) ? 'projde' : ok.some(Boolean) ? 'sporná' : 'neprojde';
    shodaSoudcu[sada][1]++; if (o[0].prvni === o[1].prvni) shodaSoudcu[sada][0]++;
    tab.push({ id: v.id, runa: v.runa, sfera: v.sfera, zdroj: v.zdroj, sada, stav,
      volby: o.map(x => x.prvni + '/' + x.druha + ' (' + x.jistota + ')').join(' · ') });
  }
}
for (const sada of ['G', 'L']) {
  const t = tab.filter(r => r.sada === sada);
  const c = s => t.filter(r => r.stav === s).length;
  console.log('\n== sada ' + sada + ': projde ' + c('projde') + ' · sporná ' + c('sporná') + ' · neprojde ' + c('neprojde') + ' z ' + t.length +
    ' · soudci se shodli na 1. volbě ' + shodaSoudcu[sada][0] + '/' + shodaSoudcu[sada][1]);
  for (const r of t) console.log('| ' + r.id + ' | ' + r.runa + ' | ' + r.sfera + ' | ' + r.zdroj + ' | ' + r.stav + ' | ' + r.volby + ' |');
}
// správná runa aspoň na 2. místě
const top2 = radkyRaw.filter(r => r.prvni === r.runa || r.druha === r.runa).length;
console.log('\nsprávná runa v 1. nebo 2. volbě: ' + top2 + '/' + radkyRaw.length + ' · v 1. volbě: ' + radkyRaw.filter(r => r.prvni === r.runa).length + '/' + radkyRaw.length);
fs.writeFileSync(path.join(S, 'tabulka.json'), JSON.stringify(tab, null, 1));
