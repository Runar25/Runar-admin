// CODE-read 2026-09-20 — měření dávky sol vs opus-5 proti NAŠÍ architektuře (jádro = vztah + místo).
// Otázky: (1) co z METADAT runy (World/Elements) proteče do textu · (2) délka proti rozpočtu ·
// (3) most k člověku / tvrzení o nitru · (4) liší se čtení postavená na JÁDRU s místem od plných obrazů?
'use strict';
const p = require('C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-20-sol-vs-opus5/pary.json');
const WORLD = { 'the roots, what lies beneath': /\b(root|roots|beneath|below|under(ground|neath)?|deep)\b/i,
  'the living moment, what is active now': /\b(now|already|moving|motion)\b/i,
  'the higher pattern, what reaches toward wider sky': /\b(sky|above|higher|wider)\b/i };
const ELEM = { Water: /\b(water|surface|flow|flows|current|tide|stream|wet|rain)\b/i, Fire: /\b(fire|flame|burn|heat|ember)\b/i,
  Air: /\b(air|wind|breath|breeze)\b/i, Earth: /\b(earth|soil|ground|stone|rock)\b/i, Shadow: /\b(shadow|dark|darkness|dim)\b/i, Ice: /\b(ice|frost|frozen|cold)\b/i };
const MOST = /\b(you are|some part of you|what you feel|something near you|you feel|neither of you|what sits unsaid|has not (named|said)|you have not)\b/i;
const slov = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const radek = (v, klic) => (v.vstupy.find(x => x.startsWith(klic)) || '');
let tab = [];
for (const par of p) {
  const dr = radek(par, 'DRAWN RUNE');
  const world = (dr.match(/World: ([^·]*)/) || [, ''])[1].trim();
  const elems = (dr.match(/Elements: (.*)$/) || [, ''])[1].trim();
  const img = (radek(par, 'IMAGE') || '').replace(/^IMAGE[^:]*: /, '').replace(/ Let it become.*$/, '');
  const jadro = / Where: /.test(img);
  for (const model of ['sol', 'opus5', 'opus-5']) {
    const txt = par[model];
    if (!txt) continue;
    const wRe = WORLD[world], eRe = ELEM[(elems.split(/[,/ ]/)[0] || '').trim()];
    // únik = slovo ze světa/živlu JE v textu, ale NENÍ v obrazu
    const unikW = wRe && wRe.test(txt) && !wRe.test(img);
    const unikE = eRe && eRe.test(txt) && !eRe.test(img);
    tab.push({ id: par.id, model: model === 'opus-5' ? 'opus5' : model, jadro, lang: par.lang, spread: par.spread,
      slov: slov(txt), unikW: !!unikW, unikE: !!unikE, most: MOST.test(txt),
      ukazkaW: unikW ? (txt.match(new RegExp('[^.]*' + wRe.source + '[^.]*', 'i')) || [''])[0].trim().slice(0, 70) : '',
      ukazkaE: unikE ? (txt.match(new RegExp('[^.]*' + eRe.source + '[^.]*', 'i')) || [''])[0].trim().slice(0, 70) : '' });
  }
}
const grup = {};
for (const r of tab) {
  const k = r.model + ' ' + r.spread + '-' + r.lang;
  grup[k] = grup[k] || { n: 0, w: 0, e: 0, most: 0, slov: [] };
  grup[k].n++; grup[k].w += r.unikW ? 1 : 0; grup[k].e += r.unikE ? 1 : 0; grup[k].most += r.most ? 1 : 0; grup[k].slov.push(r.slov);
}
console.log('skupina           n  únik World  únik Elements  most k člověku  slova (min–max)');
for (const [k, g] of Object.entries(grup).sort())
  console.log(k.padEnd(18) + String(g.n).padEnd(3) + String(g.w + '/' + g.n).padEnd(12) + String(g.e + '/' + g.n).padEnd(15) + String(g.most + '/' + g.n).padEnd(16) + Math.min(...g.slov) + '–' + Math.max(...g.slov));
console.log('\nčtení postavená na JÁDRU s místem: ' + tab.filter(r => r.jadro).map(r => r.id + '/' + r.model).join(', '));
console.log('\nukázky úniků z metadat:');
tab.filter(r => r.unikW || r.unikE).slice(0, 10).forEach(r => console.log('  ' + (r.id + '/' + r.model).padEnd(18) + (r.ukazkaW || r.ukazkaE)));
console.log('\nmost k člověku — věty:');
tab.filter(r => r.most).forEach(r => { const t = p.find(x => x.id === r.id)[r.model] || p.find(x => x.id === r.id)['opus-5'];
  console.log('  ' + (r.id + '/' + r.model).padEnd(18) + (String(t).match(new RegExp('[^.]*' + MOST.source + '[^.]*', 'i')) || [''])[0].trim().slice(0, 90)); });
