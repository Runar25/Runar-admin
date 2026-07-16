// §19 guard: what can a logged-in user actually WRITE?
//
// This exists because of the 2026-07-16 hole: every layer looked right on its own
// (the RLS policy was a correct ROW filter, the grants were the Supabase default, the
// client wrote legitimate columns) and the hole lived in the SEAM between them — RLS
// cannot filter COLUMNS, so a table-wide UPDATE grant meant any user could PATCH
// credits_balance on their own row. Proven live: status 200, data: Array(1).
// No linter, review or security advisor sees a seam, because it is in no single file.
//
// So this check reads the two sides and compares them:
//   client side — every column v2/*.js writes to user_profiles
//   grant side  — the column list in sql/2026-07-16_user_profiles_column_grants.sql
//
// Three ways it goes red:
//   1. the client writes a column that is NOT granted
//        -> in production that is a 403 the client SWALLOWS into console.warn.
//           Silent. This is the one that will actually happen: someone adds a
//           profile field and nobody grants it.
//   2. the client writes a PRIVILEGED column -> the money is being written client-side
//   3. a PRIVILEGED column appears in the grant list -> the hole is being reopened
//
// LIMIT, stated honestly: this compares the repo against the repo. The DB is the real
// authority and it is not readable from here (no service-role key). The grants actually
// in force are audited by sql/audit_write_surface.sql, which the owner runs.
//
//   node scripts/verify_write_surface.js

const fs = require('fs');
const R = 'C:/Users/zkuku/Downloads/Runar-admin/';

const TABLE = 'user_profiles';
const GRANT_SQL = 'sql/2026-07-16_user_profiles_column_grants.sql';

// Columns that decide money or authority. Written ONLY by edge functions via
// service_role (which bypasses grants). If any of these ever reaches the client
// or the grant list, that is the hole coming back.
const PRIVILEGED = [
  'tier', 'credits_balance', 'free_balance',
  'month_units', 'month_key', 'drip_week', 'is_tester',
];

// Production client only — tree-snapshots/ are archived copies, not shipped.
const CLIENT_FILES = fs.readdirSync(R + 'v2')
  .filter(f => f.endsWith('.js'))
  .map(f => 'v2/' + f);

// ── client side: columns written to the table ────────────────────────────────
// Matches .update({...}) / .insert({...}) / .upsert({...} , opts) after from('<table>').
// Only the FIRST object literal is taken — upsert's second argument is options
// (onConflict, ignoreDuplicates), not columns.
function clientWrites() {
  const found = new Map(); // column -> "file:line"
  for (const rel of CLIENT_FILES) {
    const src = fs.readFileSync(R + rel, 'utf8');
    const re = new RegExp(
      "from\\('" + TABLE + "'\\)[\\s\\S]{0,200}?\\.(update|insert|upsert)\\(\\s*\\{([^{}]*)\\}",
      'g'
    );
    let m;
    while ((m = re.exec(src)) !== null) {
      const line = src.slice(0, m.index).split('\n').length;
      for (const k of m[2].matchAll(/(\w+)\s*:/g)) {
        if (!found.has(k[1])) found.set(k[1], rel + ':' + line);
      }
    }
  }
  return found;
}

// ── grant side: the column list in the migration ─────────────────────────────
function grantedColumns() {
  const sql = fs.readFileSync(R + GRANT_SQL, 'utf8');
  const cols = new Set();
  for (const m of sql.matchAll(/grant\s+(?:update|insert)\s*\(([^)]*)\)/gi)) {
    for (const c of m[1].split(',')) {
      const name = c.trim().replace(/--.*$/, '').trim();
      if (name) cols.add(name);
    }
  }
  return cols;
}

const writes  = clientWrites();
const granted = grantedColumns();
let fail = 0;

if (writes.size === 0) {
  console.log('FAIL  no writes to ' + TABLE + ' found — the check lost its own surface');
  process.exit(1);
}
if (granted.size === 0) {
  console.log('FAIL  no granted columns parsed from ' + GRANT_SQL);
  process.exit(1);
}

// 1. every column the client writes must be granted, or production 403s in silence
for (const [col, where] of writes) {
  if (!granted.has(col)) {
    fail++;
    console.log('FAIL  ' + where + ' writes "' + col + '" but no grant covers it');
    console.log('      -> 403 in production, swallowed by the client into console.warn.');
    console.log('      -> add it to ' + GRANT_SQL + ' AND run it against the DB.');
  }
}

// 2. the client must never write the money
for (const [col, where] of writes) {
  if (PRIVILEGED.includes(col)) {
    fail++;
    console.log('FAIL  ' + where + ' writes PRIVILEGED column "' + col + '"');
    console.log('      -> money/authority is written server-side only (claude-proxy, redeem-code).');
  }
}

// 3. nobody re-opens the hole from the SQL side
for (const col of granted) {
  if (PRIVILEGED.includes(col)) {
    fail++;
    console.log('FAIL  ' + GRANT_SQL + ' grants PRIVILEGED column "' + col + '" to the client');
  }
}

if (fail === 0) {
  console.log('OK    ' + TABLE + ': client writes ' + writes.size + ' columns, all granted, none privileged.');
  console.log('      granted: ' + [...granted].sort().join(', '));
  console.log('      (DB-side grants are audited separately: sql/audit_write_surface.sql)');
} else {
  console.log('\n' + fail + ' PROBLEM(S) — the write surface and the grants disagree.');
}
process.exit(fail ? 1 : 0);
