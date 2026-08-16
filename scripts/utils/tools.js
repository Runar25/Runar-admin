// ═══════════════════════════════════════════════════════
// RÚNAR · tools.js — JEDEN příkaz, který vypíše, co všechno v projektu máme
//
// KUKY 2026-08-16: „všechno, co takhle někdy vytvoříme, si musíš uložit tak, abys se k tomu
// dostal." Ten den jsem postavil čtyři nástroje a pak o nich sám nevěděl — archiv čtení,
// `--voice`, kontrolu profilů, mapu promptu. Owner mi musel říct, že existují.
//
// ⭐ PROČ NE „KONTROLA, ŽE JE NÁSTROJ ZMÍNĚNÝ V DOCU": změřeno, než se to stavělo — z 38
// nástrojů nejsou zmíněné jen 2. `archive_batches.js` zmíněný JE, a stejně jsem ho nenašel.
// **Zmínka v docu není dosažitelnost.** Chybí jedno místo, kde je vidět všechno najednou;
// tohle je ono a hook na něj ukazuje.
//
// Popis se NEOPISUJE (§20) — čte se z hlavičky každého souboru. Nový nástroj se tu objeví
// sám, jakmile vznikne; nic se nikam nezapisuje a nic nemůže zastarat.
//
//   node scripts/utils/tools.js           — vše
//   node scripts/utils/tools.js eval      — jen co obsahuje „eval" v názvu nebo popisu
// ═══════════════════════════════════════════════════════
const fs = require('fs'), path = require('path');

const R = path.resolve(__dirname, '..', '..');
const filtr = (process.argv[2] || '').toLowerCase();

// Skupiny podle toho, K ČEMU to je — ne podle složky. Session hledá „čím změřím čtení",
// ne „co leží v scripts/utils".
const SKUPINY = [
  ['generování a archiv čtení', ['gen_batch', 'archive_batches', 'export_readings', 'findings_to_backlog']],
  ['měření a hodnocení výstupu', ['measure_readings', 'lint_readings', 'measure_reading_costs', 'stats', 'find_seeds']],
  ['kontrola promptu a pravidel', ['lint_prompts', 'test_no_planted_bans', 'test_spine', 'test_lever_maps']],
  ['porovnání dávek', ['compare_']],
  ['islandština', ['is-vazba', 'is-grammar-qa', 'is-corr-qa', 'check-is', 'check-translations']],
  ['kontroly ve smoke (verify_*)', ['verify_']],
  ['ostatní', []],
];

// ⚠️ PRVNÍ komentářová řádka bývá jen rámeček „═══". Popis je ta první, která nese písmena.
function popis(soubor) {
  let txt = '';
  try { txt = fs.readFileSync(soubor, 'utf8'); } catch (e) { return '(nelze přečíst)'; }
  for (const radka of txt.split('\n').slice(0, 14)) {
    const m = /^\s*(?:\/\/|#)\s?(.*)$/.exec(radka);
    if (!m) continue;
    const t = m[1].replace(/^[-=═─\s]+|[-=═─\s]+$/g, '').trim();
    if (!t || !/[A-Za-zÁ-ža-ž]/.test(t)) continue;
    if (/^-\*- coding/.test(t)) continue;
    // hlavicka casto zacina „RÚNAR · nazev.js — popis"; zajima nas ta cast za pomlckou
    const d = t.split(' — ');
    return (d.length > 1 ? d.slice(1).join(' — ') : t).slice(0, 96);
  }
  return '(bez popisu v hlavičce)';
}

const soubory = [];
for (const d of ['scripts/utils', 'scripts', '.']) {
  const abs = path.join(R, d);
  let list = [];
  try { list = fs.readdirSync(abs); } catch (e) { continue; }
  for (const f of list) {
    if (!/\.(js|py)$/.test(f)) continue;
    if (d === '.' && !/^(smoke|check-|is-|show_)/.test(f)) continue;  // v korenu jen utility, ne patch skripty
    if (/^_/.test(f)) continue;                                       // gitignorovane sloty session (§1)
    const rel = (d === '.' ? '' : d + '/') + f;
    if (soubory.some((x) => x.f === f)) continue;
    soubory.push({ f, rel, p: popis(path.join(abs, f)) });
  }
}

function kam(f) {
  for (let i = 0; i < SKUPINY.length - 1; i++)
    if (SKUPINY[i][1].some((k) => f.indexOf(k) !== -1)) return SKUPINY[i][0];
  return 'ostatní';
}

let n = 0, bezPopisu = 0;
for (const [nazev] of SKUPINY) {
  const g = soubory.filter((s) => kam(s.f) === nazev)
    .filter((s) => !filtr || (s.f + ' ' + s.p).toLowerCase().indexOf(filtr) !== -1)
    .sort((a, b) => a.f.localeCompare(b.f));
  if (!g.length) continue;
  console.log('\n── ' + nazev);
  for (const s of g) {
    console.log('   ' + s.rel.padEnd(38) + s.p);
    n++;
    if (s.p.indexOf('bez popisu') !== -1) bezPopisu++;
  }
}

console.log('\n  ' + n + ' nástrojů' + (filtr ? ' (filtr „' + filtr + '")' : '') +
  (bezPopisu ? '  ·  ⚠️ ' + bezPopisu + ' bez popisu v hlavičce — doplň, jinak je tenhle výpis k ničemu' : ''));
console.log('  Data, co už máme: `archive_batches.js --list` · exporty v ~/runar-eval/');
