// §16 output B — kontrola na MECHANISMUS, ne na obsah.
//
// Když záznam v RUNAR_DECISIONS.md řekne `Affected doc(s): X`, musí se X opravit.
// Do 2026-07-18 se ta půlka pravidla systematicky neplnila: práce se udělala,
// rozhodnutí zapsalo, doc zůstal špatně. Audit toho dne našel 97 rozporů nad ~12
// fakty — a tenhle nesplněný řádek byl jejich zdroj. Ostatní kontroly (⑭ mrtvé
// pojmy, ⑫ soubory mimo git) chytají NÁSLEDKY; tahle chytá příčinu.
//
// JAK: pro každý `Affected doc(s):` zjistí přes git blame commit, kterým ten řádek
// vznikl, a ověří, že každý jmenovaný soubor byl od té chvíle (včetně) aspoň jednou
// commitnutý. Nesoudí OBSAH opravy — na to stroj nemá. Soudí jen, že se doc vůbec
// pohnul; „zapsal jsem rozhodnutí a doc jsem nechal být" je to, co chytá.
//
// ZPĚTNĚ NEVYMÁHÁ. Záznamy starší než ENFORCE_FROM se jen vypíšou jako informace —
// retroaktivně trestat historii by znamenalo červenou, kterou nikdo nemůže opravit,
// a taková kontrola se do týdne vypne.
//
//   node scripts/verify_decisions_followthrough.js
const { execSync } = require('child_process');
const fs = require('fs');

const R    = 'C:/Users/zkuku/Downloads/Runar-admin';
const DOC  = 'RUNAR_DECISIONS.md';
const ENFORCE_FROM = '2026-07-18';   // den, kdy pravidlo vzniklo (§20)

const git = (cmd) => execSync('git ' + cmd, { cwd: R, encoding: 'utf8', maxBuffer: 1 << 26 });

const lines = fs.readFileSync(R + '/' + DOC, 'utf8').split('\n');

// `Affected doc(s): CLAUDE.md §2 · memory/MEMORY.md · runar-config.js`
const NAME = /[\w./-]+\.(?:md|js|ts|py|sql)/g;
const targets = [];
lines.forEach((line, i) => {
  if (!/Affected doc\(s\)/i.test(line)) return;
  const names = (line.match(NAME) || []).filter(n => n !== DOC);
  if (names.length) targets.push({ line: i + 1, names: [...new Set(names)] });
});

if (!targets.length) {
  console.log('OK    žádný `Affected doc(s)` řádek k ověření');
  process.exit(0);
}

const stale = [], legacy = [];

for (const t of targets) {
  // commit, kterým ten řádek vznikl
  let sha, when;
  try {
    const bl = git(`blame --line-porcelain -L ${t.line},${t.line} -- ${DOC}`);
    sha  = bl.split('\n')[0].split(' ')[0];
    const m = bl.match(/^author-time (\d+)$/m);
    when = m ? new Date(+m[1] * 1000).toISOString().slice(0, 10) : '?';
  } catch (e) { continue; }
  // Rozepsaný, ještě nezacommitovaný řádek: blame vrací samé nuly. Nelze soudit slib,
  // který zatím není v historii — a hlavně: PRÁVĚ TEĎ ho autor možná plní. Kontrola
  // ho uvidí při dalším běhu, až bude commitnutý. (Chyba nalezena 2026-07-19: bez
  // tohohle guard hlásil vlastní rozepsanou opravu jako porušení.)
  if (/^0+$/.test(sha)) continue;

  // soubory dotčené TÍMŽ commitem se počítají jako splněné
  let sameCommit = [];
  try { sameCommit = git(`show --name-only --format= ${sha}`).trim().split('\n'); } catch (e) {}

  for (const name of t.names) {
    const base = name.split('/').pop();
    if (sameCommit.some(f => f.endsWith(base))) continue;

    // Pohnul se ten doc v DEN rozhodnutí nebo po něm?
    //
    // Schválně podle DATA, ne podle předků commitu. Původní verze ptala
    // `git log <sha>..HEAD` — jenže jakákoli pozdější editace toho řádku
    // (překlep, doplnění dalšího docu) přepsala blame na nový commit a tím
    // RESETOVALA HODINY: splněné sliby najednou spadly mimo okno a guard
    // hlásil porušení u práce, která byla dávno hotová. Našlo se to 2026-07-19
    // hned první opravou vlastního záznamu.
    //
    // Kompromis, který tím beru vědomě: doc commitnutý dřív TÝŽ den se počítá
    // jako splněný. Volnější, ale nikdy nelže obráceně — a falešný poplach je
    // u kontroly, která má běžet před každým commitem, dražší než průchod.
    let after = '';
    try { after = git(`log --since="${when}T00:00:00" --oneline -- "*${base}"`).trim(); } catch (e) {}
    if (after) continue;

    // existuje ten soubor vůbec?
    let exists = true;
    try { exists = git(`ls-files -- "*${base}"`).trim().length > 0; } catch (e) {}

    const hit = { doc: DOC + ':' + t.line, when, sha: sha.slice(0, 7), name, exists };
    (when >= ENFORCE_FROM ? stale : legacy).push(hit);
  }
}

if (legacy.length) {
  console.log('ℹ  ' + legacy.length + ' historických `Affected doc(s)` bez následné opravy (před '
              + ENFORCE_FROM + ', nevymáhá se):');
  const by = {};
  legacy.forEach(h => { (by[h.when] = by[h.when] || []).push(h.name); });
  Object.keys(by).sort().forEach(d => console.log('     ' + d + '  →  ' + [...new Set(by[d])].join(' · ')));
}

if (stale.length) {
  console.log('\nFAIL  rozhodnutí slíbilo opravu docu, která se nestala:');
  for (const h of stale) {
    console.log('  · ' + h.doc + ' (' + h.when + ', ' + h.sha + ') jmenuje ' + h.name
                + (h.exists ? '' : '  — a ten soubor navíc není v gitu'));
  }
  console.log('\n  Buď ten doc oprav, nebo — pokud oprava opravdu není potřeba — vyškrtni ho');
  console.log('  z řádku `Affected doc(s)`. Nesplněný slib je horší než žádný.');
  process.exit(1);
}

console.log('OK    §16 output B: ' + targets.length + ' rozhodnutí, každý jmenovaný doc se po něm pohnul');
process.exit(0);
