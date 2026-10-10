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

// RYCHLOST (2026-10-10, CODE-read — kontrola architektury; CODE-tune hlásil smoke 30+ min): dřív `git blame -L n,n` zvlášť
// pro každý z ~340 řádků nad souborem o 9 000 řádcích, plus `show`/`log` znovu pro tytéž commity a soubory. Teď JEDEN blame celého
// souboru a JEDEN průchod historií (`git log --name-only`) místo `show`/`log`/`ls-files` pro každý řádek. Změřeno: 575 s → 5 s.
// Ověřeno týž den: výstup na repu shodný a v testovacím repu obě verze chytí tentýž nesplněný slib a pustí splněný.
let _blame = null;
function blameOf(lineNo) {
  if (!_blame) {
    _blame = {};
    let out = '';
    try { out = git(`blame --line-porcelain -- ${DOC}`); } catch (e) { return null; }
    const shaTime = {};
    let cur = null;
    for (const l of out.split('\n')) {
      const h = l.match(/^([0-9a-f]{40}) \d+ (\d+)/);
      if (h) { cur = { sha: h[1], line: +h[2] }; continue; }
      const at = l.match(/^author-time (\d+)$/);
      if (at && cur) shaTime[cur.sha] = new Date(+at[1] * 1000).toISOString().slice(0, 10);
      if (l.startsWith('\t') && cur) { _blame[cur.line] = cur.sha; cur = null; }
    }
    for (const k of Object.keys(_blame)) _blame[k] = { sha: _blame[k], when: shaTime[_blame[k]] || '?' };
  }
  return _blame[lineNo] || null;
}
// Jeden průchod historií: commit → soubory, soubor (basename) → časy commitů (lokální čas jako `git log --since`),
// a seznam souborů v gitu. Nahrazuje `git show`/`git log --since`/`git ls-files` pro každý řádek zvlášť.
let _hist = null;
function hist() {
  if (_hist) return _hist;
  _hist = { files: {}, times: [], tracked: [] };
  const out = git('log --format=@@%H@%cd --date=format-local:%Y-%m-%dT%H:%M:%S --name-only');
  let cur = null;
  for (const l of out.split('\n')) {
    if (l.startsWith('@@')) { const [h, d] = l.slice(2).split('@'); cur = { h, d }; _hist.files[h] = []; continue; }
    if (!l.trim() || !cur) continue;
    _hist.files[cur.h].push(l.trim());
    _hist.times.push([l.trim(), cur.d]);   // cesta + čas; maska "*název" jako u git log -- "*${base}"
  }
  _hist.tracked = git('ls-files').split('\n').map((f) => f.trim()).filter(Boolean);
  return _hist;
}

const stale = [], legacy = [];

for (const t of targets) {
  // commit, kterým ten řádek vznikl
  const bi = blameOf(t.line);
  if (!bi) continue;
  const sha = bi.sha, when = bi.when;
  // Rozepsaný, ještě nezacommitovaný řádek: blame vrací samé nuly. Nelze soudit slib,
  // který zatím není v historii — a hlavně: PRÁVĚ TEĎ ho autor možná plní. Kontrola
  // ho uvidí při dalším běhu, až bude commitnutý. (Chyba nalezena 2026-07-19: bez
  // tohohle guard hlásil vlastní rozepsanou opravu jako porušení.)
  if (/^0+$/.test(sha)) continue;

  // soubory dotčené TÍMŽ commitem se počítají jako splněné
  let sameCommit = [];
  sameCommit = hist().files[sha] || [];

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
    after = hist().times.some(([f, d]) => f.endsWith(base) && d >= when + 'T00:00:00') ? 'ano' : '';
    if (after) continue;

    // existuje ten soubor vůbec?
    let exists = true;
    exists = hist().tracked.some((f) => f.endsWith(base));

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
