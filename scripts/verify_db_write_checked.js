// §19 guard: every DB write from the client must OBSERVE its result.
//
// supabase-js RESOLVES a failed write as { error } — it does NOT throw. So the two shapes
// that look like error handling are blind:
//     await sb.from('x').update({...})              <- result discarded
//     sb.from('x').update({...}).then(() => {})     <- .catch() can never fire for a DB error
// Both fail in total silence. That is how Sigrún's DOB and life rune vanished: the writes
// were never checked, so nobody could know whether they had landed (2026-07-18/19, 8 sites).
//
// A write counts as OBSERVED when either:
//   - its result is assigned  (const/var/let X = await sb.from...)  and `error` appears
//     within the following few lines, or
//   - it ends in .then(cb) whose callback body mentions `error`.
//
//   node scripts/verify_db_write_checked.js
const fs = require('fs');
const path = require('path');
const V2 = 'C:/Users/zkuku/Downloads/Runar-admin/v2';

// runar-tree-prod.js is generated (build_tree_production.py) and does not write.
const SKIP = new Set(['runar-tree-prod.js']);
const WRITE = /\.(update|insert|upsert|delete)\s*\(/;

let fail = 0, checked = 0;

for (const f of fs.readdirSync(V2).filter(n => n.endsWith('.js') && !SKIP.has(n))) {
  const src = fs.readFileSync(path.join(V2, f), 'utf8');
  const lines = src.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (!/\bsb\s*\.\s*from\s*\(/.test(lines[i])) continue;

    // A call can span lines — collect until the statement ends (';' at depth 0) or 12 lines.
    let stmt = '', j = i;
    for (; j < lines.length && j < i + 12; j++) {
      stmt += lines[j] + '\n';
      if (/;\s*$/.test(lines[j].trim())) break;
    }
    if (!WRITE.test(stmt)) continue;   // a plain .select() — reads are not this check's job
    checked++;

    const assigned = /\b(?:const|var|let)\s+\w+\s*=\s*await?\s*sb\s*\.\s*from/.test(stmt)
                  || /\b\w+\s*=\s*await\s+sb\s*\.\s*from/.test(stmt);
    // widen the window a little: the error check usually sits just after the assignment
    const after = lines.slice(j, Math.min(j + 6, lines.length)).join('\n');
    const observed = (assigned && /\.error|\berror\b/.test(stmt + after))
                  || (/\.then\s*\(/.test(stmt) && /error/.test(stmt));

    if (!observed) {
      fail++;
      console.log('FAIL  ' + f + ':' + (i + 1) + '  DB write with an unobserved result');
      console.log('      ' + lines[i].trim().slice(0, 96));
      console.log('      -> supabase-js resolves failures as { error }; assign the result and check it.');
    }
  }
}

console.log(fail === 0
  ? 'OK    ' + checked + ' DB writes, every result observed.'
  : '\n' + fail + ' of ' + checked + ' DB writes fail silently.');
process.exit(fail ? 1 : 0);
