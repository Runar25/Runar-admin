// §17 guard — a canonical file that is not in git does not exist.
//
// Two classes, same failure mode, very different blast radius:
//
//   1. DOCS (RUNAR_*.md + CLAUDE.md). On 2026-07-17 the tree-doc consolidation written on
//      2026-07-04 turned out to have lived ONLY in the working tree for 13 days — RUNAR_TREE.md,
//      the canonical Tree entry point, was untracked. A clean checkout did not have it and Cowork
//      (which reads `git show HEAD:`) could not see it, so Cowork proposed doing the consolidation
//      that was already finished.
//
//   2. SQL MIGRATIONS (sql/*.sql) — the worse one, spotted by KUKY the same day: three migrations
//      that had ALREADY RUN on the production DB had never been committed. A missing doc can be
//      rewritten from memory; a migration with no record cannot be reconstructed — you no longer
//      know what state the live database is in, or what a fresh environment has to replay.
//
// UNTRACKED only, and `--exclude-standard` is deliberate: a file .gitignore excludes ON PURPOSE
// (e.g. readings_export.* — user reading text = PII) must never be reported as missing. A
// modified-but-uncommitted file is the normal state one second before a commit; flagging that
// would only train everyone to ignore the check.
//
//   node scripts/verify_canonical_files.js
const { execSync } = require('child_process');
const R = (process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin') + '';

const CLASSES = [
  {
    label: 'canonical doc',
    globs: '"RUNAR_*.md" "CLAUDE.md"',
    why:   'a clean checkout does not have it; Cowork (git show HEAD:) cannot see it',
  },
  {
    label: 'SQL migration',
    globs: '"sql/*.sql"',
    why:   'it may already have run on the live DB — with no record you cannot tell what state it is in',
  },
];

// Čerstvý neverzovaný soubor (mladší než CERSTVE_H) je rozdělaná práce některé session, ne zapomenutý soubor — jen varování.
// 2026-10-11: rozepsaná migrace CODE-tune (pár minut) tu zastavila push všem třem session; pre-push tuhle kontrolu pouští nad
// SDÍLENÝM stromem. Starší než CERSTVE_H = zapomenutý → FAIL jako dřív.
const CERSTVE_H = 2;
const cerstvy = (f) => { try { return (Date.now() - require('fs').statSync(require('path').join(R, f)).mtimeMs) < CERSTVE_H * 3600e3; } catch (e) { return false; } };
let fail = 0;
let tracked = 0;

for (const c of CLASSES) {
  let out = '';
  try {
    out = execSync('git ls-files --others --exclude-standard -- ' + c.globs,
                   { cwd: R, encoding: 'utf8' }).trim();
  } catch (e) {
    console.log('FAIL  could not ask git about ' + c.label + ': ' + e.message);
    fail++;
    continue;
  }
  const untracked = (out ? out.split('\n') : []).map(s => s.trim()).filter(Boolean);
  for (const f of untracked) {
    if (cerstvy(f)) { console.log('⚠  ' + c.label + ' not in git yet (younger than ' + CERSTVE_H + ' h — work in progress?): ' + f); continue; }
    fail++;
    console.log('FAIL  ' + c.label + ' is NOT in git: ' + f);
    console.log('      ' + c.why);
  }
  tracked += execSync('git ls-files -- ' + c.globs, { cwd: R, encoding: 'utf8' })
    .trim().split('\n').filter(Boolean).length;
}

if (!fail) {
  console.log('OK    canonical files: ' + tracked + ' tracked (docs + SQL), none untracked for longer than ' + CERSTVE_H + ' h');
}
process.exit(fail ? 1 : 0);
