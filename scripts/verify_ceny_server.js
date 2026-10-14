// Smoke ㊇: serverový ceník modelů (supabase/functions/_shared/ceny_modelu.ts) = MODEL_PRICES a readingCostUsd z v2/ (generuje
// scripts/utils/gen_ceny_server.js). Proč (CODE-tune 2026-10-14, DECISIONS 2026-10-14 (13)): ranní souhrn provozu počítá cenu čtení na
// serveru; změna ceníku jen ve v2/ by souhrn tiše počítal se starými cenami (§20 — jedna informace, zrcadlo jen generované a hlídané).
//   node scripts/verify_ceny_server.js
'use strict';
const path = require('path'), cp = require('child_process');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'utils', 'gen_ceny_server.js'), '--check'],
  { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, { RUNAR_ROOT: ROOT }) });
process.stdout.write(r.stdout || '');
if (r.stderr) process.stdout.write(r.stderr);
process.exit(r.status === null ? 1 : r.status);
