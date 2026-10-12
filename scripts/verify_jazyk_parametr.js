// verify_jazyk_parametr.js — smoke ㊀: prompt závisí jen na jazyku, který builder dostane parametrem, ne na globálním `lang`
// (CODE-tune 2026-10-12).
//
// Proč: buildery promptu (runar-character.js) berou jazyk parametrem, ale pomocníci rk/rn/rnPrompt/rnPromptAcc/rworld četli globál.
// V appce je globál stejný jako parametr, takže to nebylo vidět — spread postavený s jiným globálem ale měl smíchané jazyky
// („Fehu — wealth, cattle…“ v islandském promptu; 16 ze 40 otisků golden). Skládání promptu na serveru (BACKLOG) ani skripty globál
// nemají. Past zapsaná od 2026-08-15 (BACKLOG „rk()/rn() čtou GLOBÁLNÍ lang“), opravena 2026-10-12.
// Co dělá: pustí scripts/golden/golden_dump.js dvakrát — globál = parametr a globál schválně opačný (GOLDEN_CIZI_LANG=1) — a porovná
// všechny otisky (single, spready, životní runa, Ask, rozbor jména, system prompt; obě řeči). Rozdíl = FAIL s klíčem a prvním odlišným
// řádkem. Netvrdí nic o rozhraní: to pomocníky volá bez parametru, tedy s globálem, a tak je to správně.
//   node scripts/verify_jazyk_parametr.js
'use strict';
const cp = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const ROOT = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..'));
const DUMP = path.join(ROOT, 'scripts', 'golden', 'golden_dump.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jazyk-parametr-'));

function otisky(nazev, cizi) {
  const soubor = path.join(tmp, nazev + '.json');
  const env = Object.assign({}, process.env, { RUNAR_ROOT: ROOT });
  if (cizi) env.GOLDEN_CIZI_LANG = '1'; else delete env.GOLDEN_CIZI_LANG;
  const r = cp.spawnSync(process.execPath, [DUMP, soubor], { env, encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0 || /ERRORS:/.test(r.stdout || '') || !fs.existsSync(soubor)) {
    console.log('FAIL  golden_dump neproběhl' + (cizi ? ' (s opačným globálem)' : '') + ': ' + ((r.stdout || '') + (r.stderr || '')).trim().slice(0, 400));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(soubor, 'utf8'));
}

const a = otisky('globál-parametr', false), b = otisky('globál-opačný', true);
fs.rmSync(tmp, { recursive: true, force: true });
const klice = Object.keys(a);
if (!klice.length) { console.log('FAIL  golden_dump nevrátil žádný otisk'); process.exit(1); }
const lisi = klice.filter((k) => a[k] !== b[k]);
if (lisi.length) {
  for (const k of lisi.slice(0, 5)) {
    const A = String(a[k]).split('\n'), B = String(b[k]).split('\n');
    const i = A.findIndex((x, j) => x !== B[j]);
    console.log('  ' + k + ': „' + String(A[i]).slice(0, 80) + '“ × s opačným globálem „' + String(B[i]).slice(0, 80) + '“');
  }
  console.log('FAIL  ' + lisi.length + ' z ' + klice.length + ' promptů závisí na globálním lang, ne na jazyku z parametru buildru: ' + lisi.join(', '));
  process.exit(1);
}
console.log('OK    prompt závisí jen na jazyku z parametru buildru — ' + klice.length + ' otisků golden stejných i s opačným globálním lang');
