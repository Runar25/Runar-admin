// Ctou ownerova cteni z DB — lokalni export (NIKDY do repa): C:/Users/zkuku/runar-eval/oblast/moje.json
'use strict';
const fs = require('fs');
const t = fs.readFileSync('C:/Users/zkuku/runar-eval/oblast/moje.json', 'utf8');
const rows = JSON.parse(t.slice(t.indexOf('{'))).rows.filter(r => r.short_text && r.lang === 'en' && r.prompt_draws.essence !== 'blank');
const vety = s => s.replace(/([.?!])\s+(?=[A-Z"“])/g, '$1\n').split('\n').map(x => x.trim()).filter(Boolean);
const LIST = /^(moves?|holds?|opens?|carr(y|ies))$/i;
const COP = /^(is|was|marks?|means?|names?|stands?)$/i;
function esence(r) {
  const v = vety(r.short_text); const jm = r.rune_name;
  const i = v.findIndex(x => x.includes(jm)); if (i < 0) return null;
  const m = v[i].match(new RegExp(jm + '(?:,[^,]+,)?[ ]+([A-Za-z]+)'));
  return { i, veta: v[i], sloveso: m ? m[1] : '' };
}
// A) esence
const tab = { 0: { n: 0, list: 0, cop: 0, jine: 0, pos: {} }, 1: { n: 0, list: 0, cop: 0, jine: 0, pos: {} } };
const priklady = { 0: [], 1: [] };
for (const r of rows) {
  const e = esence(r); const k = r.prompt_draws.essence; if (!(k in tab) || !e) continue;
  const T = tab[k]; T.n++; T.pos[e.i + 1] = (T.pos[e.i + 1] || 0) + 1;
  if (LIST.test(e.sloveso)) T.list++; else if (COP.test(e.sloveso)) T.cop++; else T.jine++;
  priklady[k].push(e.sloveso);
}
console.log('ESENCE (věta se jménem runy), EN, owner, n=' + rows.length);
for (const k of [0, 1]) { const T = tab[k]; console.log(' rámec [' + k + '] n=' + T.n + ' · sloveso ze seznamu moves/holds/opens/carries ' + T.list + ' · je/značí ' + T.cop + ' · jiné ' + T.jine + ' · pozice ' + JSON.stringify(T.pos)); console.log('   slovesa: ' + priklady[k].join(' ')); }
// B) work
const W = /\bwork(s|ed|ing)?\b/i;
const obl = {};
for (const r of rows) { const a = r.area || '(bez oblasti)'; obl[a] = obl[a] || [0, 0]; obl[a][0]++; if (W.test(r.short_text)) obl[a][1]++; }
console.log('\n„work“ ve čtení podle oblasti (čtení s work / všech):'); for (const a in obl) console.log(' ' + a + ': ' + obl[a][1] + '/' + obl[a][0]);
console.log('\nCareer & Creativity — kde „work“ stojí:');
for (const r of rows.filter(r => r.area === 'Career & Creativity')) {
  const v = vety(r.short_text); const kde = v.map((x, i) => W.test(x) ? i + 1 : 0).filter(Boolean);
  console.log(' ' + r.drawn_at.slice(0, 10) + ' ' + r.rune_name.padEnd(8) + ' ' + (r.model || '').padEnd(16) + ' face=' + (r.prompt_draws.area_face ?? '-') + ' ess=' + r.prompt_draws.essence + ' vět=' + v.length + ' work ve větě ' + (kde.join(',') || '—'));
}
