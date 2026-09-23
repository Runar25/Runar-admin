// CODE-read 2026-09-23 — owner: „the tighter Nauthiz draws the coil against itself — rika, ze nauthiz to dela…
// jeste nikdy takhle o rune nemluvil". Kolikrat je runa PODMETEM slovesa (runa jedna), prod × nova, po modelech.
// Kontrola nastroje: „Jera lifts that cloth" (03-jera, Opus prod r2) MUSI byt nalezeno.
'use strict';
const fs = require('fs'), path = require('path');
const NE = new Set(['is', 'was', 'has', 'does']);
function najdi(text, runa) {
  const re = new RegExp('\\b' + runa + '\\s+([a-z]+s)\\b([^.?!,;]{0,50})', 'g'); const out = []; let h;
  while ((h = re.exec(text))) if (!NE.has(h[1])) out.push(runa + ' ' + h[1] + h[2]);
  return out;
}
module.exports = { najdi };
if (require.main === module) {
const DIR = path.join(__dirname, process.argv[2] || 'opis2');
const M = JSON.parse(fs.readFileSync(path.join(DIR, 'mereni.json'), 'utf8'));
const P = {}; for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); P[j.id] = j; }

let kontrola = false;
for (const m of ['claude-opus-4-8', 'gpt-6-sol']) for (const a of ['prod', 'nova']) {
  const xs = M.filter(x => x.model === m && x.rameno === a); let n = 0; const radky = [];
  for (const x of xs) { const h = najdi(x.text, P[x.id].runa); if (h.length) { n++; radky.push('   ' + x.id.padEnd(15) + 'r' + x.rep + '  ' + h.join(' | ')); }
    if (x.id === '03-jera-u1' && m === 'claude-opus-4-8' && a === 'prod' && h.some(s => s.startsWith('Jera lifts'))) kontrola = true; }
  console.log('\n' + m + ' ' + a + ' — cteni, kde runa jedna (podmet + sloveso): ' + n + '/' + xs.length);
  radky.forEach(r => console.log(r));
}
if (!kontrola && !process.argv[2]) { console.log('\nCHYBA NASTROJE: „Jera lifts that cloth" nenalezeno'); process.exitCode = 1; }
}
