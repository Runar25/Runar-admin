// Smoke — mapa „pravidla při dotyku“ (scripts/utils/pravidla_mapa.json) neukazuje do prázdna a hook projde svým samotestem.
//
// Proč (2026-10-11, KUKY: „žádná session nekontroluje, jestli to pravidlo existuje… ať je automaticky čtou, jakmile se jich dotknou“):
// hook pravidla_pri_dotyku.py ukazuje session pravidla živě podle mapy. Kdyby mapa ukazovala na sloučené §, přejmenovaný nadpis nebo
// smazanou paměť, hook by tiše ukázal „nenalezeno“ — tahle kontrola to zastaví dřív. Dřívější mapa v SessionStart hooku stejně tiše
// zastarala (mrtvý is-grammar-qa, „BACKLOG ~ř. 251–263“), protože ji nic nehlídalo.
// Hlídá: každé § v CLAUDE.md existuje a není jen odkaz po sloučení („→ §…“) · každý nadpis docu existuje · každá paměť a hlavička existuje ·
// každá cesta v mapě odpovídá aspoň jednomu verzovanému souboru · samotest hooku (všechny stavy) projde.
//   node scripts/verify_pravidla_mapa.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const R = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const mapa = JSON.parse(fs.readFileSync(process.env.PRAVIDLA_MAPA || path.join(R, 'scripts/utils/pravidla_mapa.json'), 'utf8'));
const claude = fs.readFileSync(path.join(R, 'CLAUDE.md'), 'utf8').split(/\r?\n/);
const tracked = cp.execSync('git ls-files', { cwd: R, encoding: 'utf8', maxBuffer: 64 << 20 }).split('\n').filter(Boolean);
const globRe = (g) => new RegExp('^' + g.split('**/').map((a) => a.split('**').map((b) => b.split('*').map((c) => c.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*')).join('(?:.*/)?') + '$', 'i');
const vady = [];
for (const o of mapa.oblasti) {
  const jm = '„' + o.oblast + '“';
  for (const g of o.cesty) if (!tracked.some((f) => globRe(g).test(f))) vady.push(jm + ': cesta ' + g + ' neodpovídá žádnému verzovanému souboru');
  for (const n of o.pravidla || []) {
    const i = claude.findIndex((l) => new RegExp('^###\\s+' + n.replace('§', '§') + '\\s').test(l));
    if (i < 0) vady.push(jm + ': ' + n + ' v CLAUDE.md není');
    else if (/^→ §/.test((claude[i + 1] || '').trim())) vady.push(jm + ': ' + n + ' je po sloučení jen odkaz („' + claude[i + 1].trim().slice(0, 40) + '…“) — dej do mapy cílové číslo');
  }
  for (const d of o.docs || []) {
    const t = fs.existsSync(path.join(R, d.soubor)) ? fs.readFileSync(path.join(R, d.soubor), 'utf8') : '';
    if (!t.split(/\r?\n/).some((l) => { const m = l.match(/^#+\s+(.*)$/); return m && m[1].trim().startsWith(d.nadpis); })) vady.push(jm + ': v ' + d.soubor + ' chybí nadpis „' + d.nadpis + '“');
  }
  for (const p of o.pamet || []) if (!fs.existsSync(path.join(R, 'memory', p + '.md'))) vady.push(jm + ': paměť memory/' + p + '.md neexistuje');
  for (const h of o.hlavicky || []) if (!fs.existsSync(path.join(R, h))) vady.push(jm + ': hlavička ' + h + ' neexistuje');
}
let test = '';
try { test = cp.execFileSync('python', ['-X', 'utf8', process.env.PRAVIDLA_HOOK || path.join(R, 'scripts/utils/pravidla_pri_dotyku.py'), '--test'], { cwd: R, encoding: 'utf8', env: Object.assign({}, process.env, { RUNAR_ROOT: R }) }); }
catch (e) { test = String(e.stdout || '') + '\nFAIL  samotest hooku spadl'; }
for (const l of test.split('\n')) if (/^FAIL/.test(l)) vady.push('hook: ' + l.replace(/^FAIL\s+/, ''));
for (const v of vady) console.log('FAIL  ' + v);
console.log(vady.length ? vady.length + '× vada v mapě pravidel při dotyku — oprav scripts/utils/pravidla_mapa.json'
  : 'OK    mapa pravidel při dotyku: ' + mapa.oblasti.length + ' oblastí, všechny odkazy živé; samotest hooku ' + (test.match(/^OK/gm) || []).length + ' stavů');
process.exit(vady.length ? 1 : 0);
