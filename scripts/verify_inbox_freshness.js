// docs/inbox/ se má VYSÁVAT — tenhle alarm zviditelní, když se neděje.
//
// docs/inbox/ je záměrně mimo doc-kontroly (chaos OK, NENÍ pravda). Cena té svobody:
// když ho Cowork přestane třídit, stane se z něj tichý junk drawer. Cadence (Cowork
// projde inbox na začátku doc-session) je práce; TENHLE check je pojistka — dělá
// z „inbox se nevysává" hlučný stav místo tichého.
//
// ⚠️ ŽLUTÝ, NE ČERVENÝ: nikdy nefailuje (exit 0), jen tiskne varování. Plný inbox
// nesmí blokovat nesouvisející push — je to nudge, ne brána. (Vzor: ⑰ tiskne ℹ a
// prochází zeleně.) Sourozenec baseline+přírůstek u escape-značek.
//
// Stáří = z GITU (commit, který soubor přidal), ne z filesystem mtime — ten se při
// checkoutu resetuje. Untracked soubory git čas nemají → kryje je práh POČTU.
//
//   node scripts/verify_inbox_freshness.js
const { execSync } = require('child_process');

const R = 'C:/Users/zkuku/Downloads/Runar-admin';
const DIR = 'docs/inbox/';

// ── laditelné prahy ─────────────────────────────────────────────────────────
const COUNT_MAX = 6;    // víc než tolik .md (mimo README) = nevysává se
const AGE_DAYS  = 10;   // soubor ležící déle = nevysává se

const sh = (cmd) => execSync(cmd, { cwd: R, encoding: 'utf8', maxBuffer: 1 << 26 }).trim();

// tracked + untracked *.md v inboxu, mimo README
const tracked   = sh('git ls-files "' + DIR + '*.md"').split('\n').filter(Boolean);
const untracked = sh('git ls-files --others --exclude-standard "' + DIR + '*.md"').split('\n').filter(Boolean);
const all = [...tracked, ...untracked].filter(p => p.split('/').pop().toLowerCase() !== 'readme.md');

const nowSec = Math.floor(Date.now() / 1000);
const ageDaysOf = (rel) => {
  // první commit, který soubor přidal = jeho stáří v inboxu
  const out = sh('git log --format=%ct --reverse -- "' + rel + '"').split('\n').filter(Boolean);
  if (!out.length) return null;              // untracked → git čas nezná
  return Math.floor((nowSec - parseInt(out[0], 10)) / 86400);
};

const warnings = [];
if (all.length > COUNT_MAX) {
  warnings.push('inbox se nevysává: ' + all.length + ' souborů (práh ' + COUNT_MAX + ')');
}
for (const f of all) {
  const age = ageDaysOf(f);
  if (age !== null && age > AGE_DAYS) {
    warnings.push('leží dlouho: ' + f + ' (' + age + ' dní, práh ' + AGE_DAYS + ')');
  }
}

if (warnings.length) {
  for (const w of warnings) console.log('\u26a0  ' + w);       // ⚠ — viditelné, ale ne fatální
  console.log('\u2139  inbox NENÍ pravda a je mimo kontroly — čím déle leží, tím spíš se ztratí. Vysaj ho (kánon/DECISIONS/archive/backlog).');
} else {
  console.log('OK    inbox: ' + all.length + ' souborů (mimo README), čerstvé.');
}
process.exit(0);   // ⚠️ VŽDY 0 — informační, nikdy neblokuje push
