// Maskování jmen uživatelů ve výpisech čtení a hlášení: „[jméno]“ místo jména, i v islandských pádových tvarech.
//
// Proč (KUKY 2026-10-11): „já u vzorků čtení nepotřebuju vidět nic ohledně uživatele ani jeho jméno. jen čtení, jak je model udělá.“
// Navazuje na DECISIONS 2026-10-11 (30) bod (c) — co se nevypíše, nedostane se do přepisů konverzací. Nevisí na paměti session: dělá to
// nástroj, který čtení vypisuje (najdi_cteni.js, nacti_cteni.js).
// Jména bere z DB (user_profiles.name, norse_name; bug_reports.tester). Rúnara a jména run nemaskuje (jsou to slova čtení, ne člověk).
//   const M = require('./maskuj_jmena.js'); const jm = M.nacti(ROOT); M.maskuj(text, jm)      · node scripts/utils/maskuj_jmena.js --test
'use strict';
const cp = require('child_process');
const NE = /^(rúnar|runar|fehu|uruz|thurisaz|ansuz|raidho|kenaz|gebo|wunjo|hagalaz|nauthiz|isa|jera|eihwaz|perth|algiz|sowilo|tiwaz|berkan|ehwaz|mannaz|laguz|ingwaz|dagaz|othala|odin|óðin)/i;

function nacti(root) {
  try {
    const sql = "select name n from user_profiles where name is not null union select norse_name from user_profiles where norse_name is not null " +
      "union select tester from bug_reports where tester is not null";
    const src = cp.execSync('supabase db query --linked "' + sql + '"', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 24 });
    return pripravit(JSON.parse(src.slice(src.indexOf('{'))).rows.map((r) => r.n));
  } catch (_) { return null; }   // bez DB: volající musí výpis odmítnout nebo zkrátit, ne ukázat nemaskovaný text
}

function pripravit(jmena) {
  const out = new Set();
  for (const j of jmena || []) for (const cast of String(j).split(/[\s,]+/)) {
    const c = cast.trim();
    if (c.length >= 3 && !NE.test(c)) out.add(c);
  }
  return [...out].sort((a, b) => b.length - a.length);
}

function maskuj(text, jmena) {
  if (!text || !jmena || !jmena.length) return text;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // jméno + až 3 písmena koncovky (Sigrún → Sigrúnu, Sigrúnar), jen jako celé slovo
  const re = new RegExp('(?<![\\p{L}])(?:' + jmena.map(esc).join('|') + ')\\p{L}{0,3}(?![\\p{L}])', 'giu');
  return String(text).replace(re, '[jméno]');
}

function samotest() {
  const jm = pripravit(['Sigrún Jónsdóttir', 'Thor', 'Rúnar', 'Al', null]);
  const ok = [], chk = (n, v) => ok.push([n, !!v]);
  chk('1. jméno i příjmení se maskují', maskuj('Sigrún, the hill. Jónsdóttir walks.', jm) === '[jméno], the hill. [jméno] walks.');
  chk('2. islandské pády (Sigrúnu, Sigrúnar)', maskuj('Fyrir Sigrúnu og Sigrúnar', jm) === 'Fyrir [jméno] og [jméno]');
  chk('3. Rúnar a runy se nemaskují; krátké jméno (Al) taky ne', maskuj('Rúnar sees Thurisaz. Al', jm) === 'Rúnar sees Thurisaz. Al');
  chk('4. jen celé slovo (Thor ≠ Thorough? Thor+3 = Thorough má 4 → zůstane)', maskuj('Thorough work, Thor.', jm) === 'Thorough work, [jméno].');
  chk('5. bez seznamu jmen text beze změny', maskuj('Sigrún', null) === 'Sigrún');
  for (const [n, v] of ok) console.log((v ? 'OK    ' : 'FAIL  ') + n);
  return ok.every(([, v]) => v) ? 0 : 1;
}

if (require.main === module && process.argv.includes('--test')) process.exit(samotest());
module.exports = { nacti, pripravit, maskuj };
