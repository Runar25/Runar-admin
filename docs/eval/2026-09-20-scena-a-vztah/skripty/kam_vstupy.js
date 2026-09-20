// CODE-read 2026-09-20 — ownerova otázka: „kde se projevují jednotlivé vstupy, kam jdou, do jaké věty — a jestli
// v nějaké větě není příliš velký přetlak vstupů." Bez nových čtení: bere hotová testovací čtení z archivu,
// ke každému dohledá JEHO prompt a značkuje, ve které větě který vstup dosedl.
'use strict';
const fs = require('fs'), path = require('path');
const E = 'C:/Users/zkuku/Downloads/Runar-admin/docs/eval/';
const DAVKY = [
  ['2026-09-20-scena-a-vztah/delky-a-cocka', 'api.json'], ['2026-09-20-scena-a-vztah/delky-a-cocka', 'api_isa.json'],
  ['2026-09-20-scena-a-vztah/most-a-tvar', 'api_most.json'], ['2026-09-20-scena-a-vztah/most-a-tvar', 'api_most_c.json'],
  ['2026-09-20-scena-a-vztah/most-a-tvar', 'api_4v.json'], ['2026-09-20-scena-a-vztah/most-a-tvar', 'api_tvary.json'],
  ['2026-09-20-scena-a-vztah/most-a-tvar', 'api_two.json'], ['2026-09-20-scena-a-vztah/most-a-tvar', 'api_esence.json'],
  ['2026-09-19-produkcni-model/v430-nasazeno', 'api.json'], ['2026-09-20-scena-a-vztah', 'api2.json'],
];
const STOP = new Set('the a an of in on at and or to it its this that with from by for is are was were as into over under across while where when each one two not no do does did you your yours their his her them they he she we us our i me my be been being have has had may might can could shall should will would'.split(' '));
function obsahova(fr) { return [...new Set(String(fr).toLowerCase().replace(/[^a-zá-ž' -]/gi, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w)))]; }
function vety(t) { return (String(t).match(/[^.?!]+[.?!]+/g) || [String(t)]).map(s => s.trim()); }
const radky = {};
function prompt(dir, id) {
  const base = id.replace(/-\d+$/, '');
  for (const kand of [base, base.replace(/-\d+$/, '')]) {
    const f = path.join(E, dir, kand + '.txt');
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  }
  return null;
}
const stat = {};     // vstup -> pole indexů vět (1-based, z konce -1 = poslední)
const pretlak = {};  // počet vstupů ve větě -> kolikrát
let celkem = 0;
for (const [dir, soubor] of DAVKY) {
  let api; try { api = JSON.parse(fs.readFileSync(path.join(E, dir, soubor), 'utf8')); } catch (e) { continue; }
  for (const [id, v] of Object.entries(api)) {
    const text = v.text || v; const p = prompt(dir, id);
    if (!p || typeof text !== 'string') continue;
    const imgLine = (p.match(/^IMAGE[^\n]*/m) || [''])[0];
    const jadro = imgLine.replace(/^IMAGE[^:]*: /, '').replace(/ Where: .*/, '').replace(/ Let it become.*/, '');
    const misto = (imgLine.match(/ Where: ([^.]*)\./) || [, ''])[1];
    const aspekt = (p.match(/focus on: ([^·\n]*)/) || [, ''])[1].trim();
    const runa = (p.match(/DRAWN RUNE: (\w+)/) || [, ''])[1];
    const jmeno = (p.match(/^PERSON: (\w+)/m) || [, ''])[1];
    const maSezonu = /^SEASON/m.test(p);
    const vs = vety(text); const n = vs.length; celkem++;
    const zdroje = {
      'jádro obrazu': obsahova(jadro), 'místo': obsahova(misto), 'aspekt': obsahova(aspekt),
      'jméno runy': runa ? [runa.toLowerCase()] : [], 'jméno člověka': jmeno ? [jmeno.toLowerCase()] : [],
      'období': maSezonu ? ['summer', 'autumn', 'winter', 'spring'] : [],
      'most (možnost)': ['may be', 'could be', 'might be'],
      'poloha člověka': ['you stand', 'you are', 'you walk', 'you sit', 'you see'],
    };
    const poVetach = vs.map(() => []);
    for (const [vstup, slova] of Object.entries(zdroje)) {
      if (!slova.length) continue;
      vs.forEach((veta, i) => {
        const low = veta.toLowerCase();
        if (slova.some(w => low.includes(w))) {
          (stat[vstup] = stat[vstup] || []).push(i === n - 1 ? 'poslední' : 'věta ' + (i + 1));
          poVetach[i].push(vstup);
        }
      });
    }
    poVetach.forEach(l => { pretlak[l.length] = (pretlak[l.length] || 0) + 1; });
  }
}
console.log('čtení v analýze: ' + celkem + '\n');
console.log('VSTUP              kam dosedne (podíl výskytů)');
for (const [vstup, kam] of Object.entries(stat)) {
  const c = {}; kam.forEach(k => c[k] = (c[k] || 0) + 1);
  const total = kam.length;
  const radek = Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(100 * v / total) + ' %').join(' · ');
  console.log(vstup.padEnd(18) + radek + '   [' + total + ' výskytů]');
}
console.log('\nPŘETLAK — kolik vstupů dosedne do jedné věty:');
const celkemVet = Object.values(pretlak).reduce((a, b) => a + b, 0);
Object.keys(pretlak).sort().forEach(k => console.log('  ' + k + ' vstupů: ' + pretlak[k] + ' vět (' + Math.round(100 * pretlak[k] / celkemVet) + ' %)'));
