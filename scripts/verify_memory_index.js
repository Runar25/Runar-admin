// §19 guard for the memory index — two failure modes that cost a day on 2026-07-17:
//
//   1. MEMORY.md pointed at tree-of-life.md and runar-patterns.md, which sat in the repo
//      ROOT, not in memory/. The index looked fine and led nowhere.
//   2. Four memory files (proceed-dont-ask, one-patch-script-path, paste-sql-explicitly,
//      is-done-together-not-for-sigrun) were UNTRACKED — on disk, never in git. §17 says
//      memory is versioned by git, so a clean checkout simply would not have them.
//
// Neither was caught by a rule telling someone to be careful. Both are mechanical, so they
// belong in smoke rather than in anyone's head — including the owner's.
//
//   node scripts/verify_memory_index.js
const fs = require('fs');
const { execSync } = require('child_process');
const R = 'C:/Users/zkuku/Downloads/Runar-admin/';
const MEM = R + 'memory/';

let fail = 0;

// ── 1. every link in MEMORY.md resolves (relative to memory/) ─────────────────
const idx = fs.readFileSync(MEM + 'MEMORY.md', 'utf8');
const targets = [...idx.matchAll(/\]\(([A-Za-z0-9_./-]+\.md)\)/g)].map(m => m[1]);
const seen = new Set();
for (const t of targets) {
  if (seen.has(t)) continue;
  seen.add(t);
  if (fs.existsSync(MEM + t)) continue;
  fail++;
  const atRoot = fs.existsSync(R + t);
  console.log('FAIL  MEMORY.md -> ' + t + (atRoot
    ? '  (exists in the repo ROOT, not memory/ — move it or fix the link)'
    : '  (target does not exist at all)'));
}

// ── 2. nothing under memory/ is untracked ────────────────────────────────────
// Only '??' — a staged or modified file is normal mid-work and must not fail the run.
const porcelain = execSync('git status --porcelain -- memory/', { cwd: R }).toString();
for (const line of porcelain.split('\n')) {
  if (!line.startsWith('??')) continue;
  fail++;
  console.log('FAIL  untracked in memory/: ' + line.slice(3).trim());
  console.log('      -> memory is versioned by git (§17); untracked means it is not in the repo.');
}

if (fail === 0) {
  console.log('OK    memory index: ' + seen.size + ' links resolve, nothing untracked.');
} else {
  console.log('\n' + fail + ' PROBLEM(S) in the memory index.');
}
process.exit(fail ? 1 : 0);
