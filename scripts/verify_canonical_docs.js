// §17 guard for the canonical docs — the same failure mode as ⑪ (memory), one directory up.
//
// §17 says "kanonický doc žije JEN v repu", but nothing checked it. On 2026-07-17 it turned out
// the tree-doc consolidation written on 2026-07-04 had lived ONLY in the working tree for 13 days:
// RUNAR_TREE.md — the canonical Tree of Life entry point — plus RUNAR_SIGIL_STUDIO.md were
// UNTRACKED. A clean checkout did not have them, and neither did Cowork (it reads `git show HEAD:`),
// so Cowork proposed doing the consolidation that was already finished. Invisible work is worse
// than no work: it gets redone, or silently lost.
//
// Scope = what §17 names canonical: RUNAR_*.md + CLAUDE.md. Lowercase/scratch .md at root stays
// free, so this never cries wolf about a working note.
//
// UNTRACKED only. A modified-but-uncommitted doc is the normal state one second before a commit;
// flagging that would just train everyone to ignore the check. Never-added is the unambiguous bug.
//
//   node scripts/verify_canonical_docs.js
const { execSync } = require('child_process');
const R = 'C:/Users/zkuku/Downloads/Runar-admin';

let fail = 0;
let out = '';
try {
  out = execSync('git ls-files --others --exclude-standard -- "RUNAR_*.md" "CLAUDE.md"',
                 { cwd: R, encoding: 'utf8' }).trim();
} catch (e) {
  console.log('FAIL  could not ask git for untracked canonical docs: ' + e.message);
  process.exit(1);
}

const untracked = out ? out.split('\n').map(s => s.trim()).filter(Boolean) : [];
for (const f of untracked) {
  fail++;
  console.log('FAIL  canonical doc is NOT in git: ' + f);
  console.log('      a clean checkout does not have it, and Cowork (git show HEAD:) cannot see it');
}

if (!fail) {
  const tracked = execSync('git ls-files -- "RUNAR_*.md" "CLAUDE.md"', { cwd: R, encoding: 'utf8' })
    .trim().split('\n').filter(Boolean).length;
  console.log('OK    canonical docs: ' + tracked + ' tracked, none untracked');
}
process.exit(fail ? 1 : 0);
