// CODE-read 2026-10-06 — úkol E (handoff CODE-tune proti 8d25148): tvar definiční věty „<Runa> names/is/speaks of <aspekt>".
// Hypotéza: holé slovo aspektu v hlavičce („DRAWN RUNE: X — focus on: <aspekt>") zve definiční vzorec. Tady jen levné měření
// na ownerových EN single čteních z DB (export lokálně, NIKDY do repa): podíl vzorce podle tvaru aspektu (1 slovo × fráze),
// podle modelu a esenčního rámce. Útok §27: půlka proti půlce (sudá × lichá čtení v čase).
//   node mereni_db.js            (čte C:/Users/zkuku/runar-eval/oblast/moje2.json)
'use strict';
const fs = require('fs');
const t = fs.readFileSync('C:/Users/zkuku/runar-eval/oblast/moje2.json', 'utf8');
const rows = JSON.parse(t.slice(t.indexOf('{'))).rows.filter(r => r.short_text && r.prompt_draws && r.prompt_draws.kws);
const VERB = '(names|is|speaks of|means|marks|stands for)';
const vety = s => s.replace(/([.?!])\s+(?=[A-Z"“])/g, '$1\n').split('\n').map(x => x.trim()).filter(Boolean);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function rozbor(r) {
  const asp = String(r.prompt_draws.kws).toLowerCase().trim();
  const slova = asp.split(/\s+/).filter(Boolean);
  const hlava = slova[slova.length - 1];                       // poslední slovo fráze (the hidden coming to light → light)
  const runa = r.rune_name;
  const v = vety(r.short_text);
  // PŘÍSNĚ: <Runa> <sloveso> [the|a|an] <aspekt — celá fráze> (handoffová definice)
  const prisne = new RegExp('\\b' + esc(runa) + '\\s+' + VERB + '\\s+(?:the |a |an )?' + esc(asp) + '\\b', 'i');
  // VOLNĚ: věta, kde je <Runa> <sloveso> a kdekoli v ní hlava aspektu
  const volne = new RegExp('\\b' + esc(runa) + '\\s+' + VERB + '\\b', 'i');
  const veta = v.find(x => volne.test(x)) || '';
  return {
    asp, nslov: slova.length, runa, model: r.model || '?', ess: String(r.prompt_draws.essence),
    prisne: v.some(x => prisne.test(x)),
    volne: !!veta && new RegExp('\\b' + esc(hlava) + '\\b', 'i').test(veta),
    names: v.some(x => new RegExp('\\b' + esc(runa) + '\\s+names\\b', 'i').test(x)),
    aspVTextu: new RegExp('\\b' + esc(asp) + '\\b', 'i').test(r.short_text),
    veta,
  };
}
const X = rows.map(rozbor);
const pct = (a, n) => n ? a + '/' + n + ' (' + Math.round(a / n * 100) + ' %)' : '—';
function tab(nazev, klic) {
  const g = {};
  for (const x of X) { const k = klic(x); (g[k] = g[k] || []).push(x); }
  console.log('\n' + nazev);
  for (const k of Object.keys(g).sort()) {
    const xs = g[k];
    console.log('  ' + String(k).padEnd(22) + ' n=' + String(xs.length).padStart(3) + ' | přísně ' + pct(xs.filter(x => x.prisne).length, xs.length)
      + ' | volně ' + pct(xs.filter(x => x.volne).length, xs.length) + ' | „names" ' + pct(xs.filter(x => x.names).length, xs.length)
      + ' | aspekt v textu ' + pct(xs.filter(x => x.aspVTextu).length, xs.length));
  }
}
console.log('Ownerova EN single čtení s prompt_draws.kws: n=' + X.length);
tab('Podle tvaru aspektu', x => x.nslov === 1 ? '1 slovo' : x.nslov === 2 ? '2 slova' : '3+ slov');
tab('Podle modelu', x => x.model);
tab('Podle esenčního rámce', x => 'essence ' + x.ess);
tab('Půlka proti půlce (sudá × lichá v čase)', x => (X.indexOf(x) % 2 ? 'lichá' : 'sudá'));
// po aspektech (jen ty s n >= 3)
const pa = {};
for (const x of X) (pa[x.asp] = pa[x.asp] || []).push(x);
console.log('\nPo aspektech (n ≥ 3), seřazeno podle přísného vzorce:');
Object.entries(pa).filter(([, xs]) => xs.length >= 3)
  .sort((a, b) => b[1].filter(x => x.prisne).length / b[1].length - a[1].filter(x => x.prisne).length / a[1].length)
  .forEach(([k, xs]) => console.log('  ' + k.padEnd(28) + ' n=' + String(xs.length).padStart(2) + ' přísně ' + pct(xs.filter(x => x.prisne).length, xs.length) + ' · v textu ' + pct(xs.filter(x => x.aspVTextu).length, xs.length)));
// Rozklad model × tvar aspektu a model × runa (2026-10-06: vzorec se ukázal jako věc modelu — oddělit od tvaru a runy)
tab('Model × tvar aspektu', x => x.model.replace('claude-', '') + ' · ' + (x.nslov === 1 ? '1 slovo' : 'fráze'));
tab('Model × Hagalaz/ostatní', x => x.model.replace('claude-', '') + ' · ' + (x.runa === 'Hagalaz' ? 'Hagalaz' : 'ostatní'));
tab('Jen sol 6 × runa × tvar aspektu', x => x.model === 'gpt-6-sol' ? (x.runa === 'Hagalaz' ? 'Hagalaz' : 'ostatní') + ' · ' + (x.nslov === 1 ? '1 slovo' : 'fráze') : 'ne-sol');
// 2026-10-06: u solu se „names" objevuje až v nejnovějších čteních → rozklad podle verze promptu (časový zlom?)
X.forEach((x, i) => { x.ver = rows[i].prompt_version || '?'; x.datum = rows[i].drawn_at.slice(0, 10); });
tab('Jen sol 6 podle verze promptu', x => x.model === 'gpt-6-sol' ? x.ver : 'ne-sol');
tab('Opus 5 podle verze promptu', x => x.model === 'claude-opus-5' ? x.ver : 'ne-opus5');
console.log('\nUkázky přísného vzorce:');
X.filter(x => x.prisne).slice(0, 12).forEach(x => console.log('  [' + x.asp + '] ' + x.veta));
