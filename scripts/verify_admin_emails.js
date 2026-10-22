// verify_admin_emails.js — všechny kopie seznamu adminů musí být shodné s v2/runar-config.js.
// Proč (2026-09-23): ADMIN_EMAILS je natvrdo v configu klienta a v každé edge funkci, která pouští jen
// admina (claude-proxy, list-readings, list-reports, elevenlabs-static; gpt-review zrušen 2026-10-09, tree-update smazán 2026-10-14). Edge
// funkce config klienta načíst nemůžou, takže kopie jsou nutné — ale nic nehlídalo, že jsou stejné.
// Rozejdou-li se, admin v jedné funkci projde a v jiné ne (nebo naopak projde někdo, kdo už admin není).
// Mimo záběr: SQL migrace v sql/ (RLS politiky s e-maily) — to jsou historické soubory, ne běžící kód.
// 2026-10-22 (owner „4. ano, připrav to“, krok 3 průchodu CODE-read): + sdílený soubor edge funkcí (_shared/*.ts — jeden místo šesti kopií)
// a ŽIVÁ databáze: seznam ve funkci public.je_admin() (sql/2026-10-22_admin_jedno_misto.sql) i e-maily, které by v pravidlech přístupu
// (RLS) ještě stály natvrdo, musí být = config. Po migraci nesmí pravidlo nést e-mail natvrdo. Databáze nedostupná (bez sítě, bez
// ~/.claude/runar-db-url.txt) = viditelné „neověřeno“, ne FAIL — jinak by push bez sítě nešel.
//   node scripts/verify_admin_emails.js        · --test = vyhodnocení databáze na ukázkových výstupech (všechny stavy migrace)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const vytahni = (src) => {
  const m = src.match(/ADMIN_EMAILS\s*(?::\s*[^=\n]+)?=\s*\[([^\]]*)\]/);   // 2026-10-22: i s typem (`: string[]` v _shared/admini.ts)
  if (!m) return null;
  return (m[1].match(/['"]([^'"]+)['"]/g) || []).map((s) => s.slice(1, -1).toLowerCase()).sort();
};

// Výstup dotazu do katalogu → { vady: [...], popis }. Řádek 'F|<definice je_admin nebo ->' (víceřádkový) a řádky 'P|tabulka/pravidlo|výrazy'.
function vyhodnotDb(out, kanon) {
  const radky = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);   // Windows: psql končí řádky \r (2026-10-22: „-\r“ ≠ „-“)
  const emaily = (t) => [...new Set((t.match(/'([^'@\s]+@[^'\s]+)'/g) || []).map((x) => x.slice(1, -1).toLowerCase()))].sort().join(',');
  const iF = radky.findIndex((l) => l.startsWith('F|')), iP = radky.findIndex((l) => l.startsWith('P|'));
  const fn = iF < 0 ? '-' : radky.slice(iF, iP < 0 ? radky.length : iP).join('\n').slice(2);   // definice funkce je víceřádková
  const pravidla = radky.filter((l) => l.startsWith('P|')).map((l) => l.slice(2));
  const vady = [], k = kanon.join(',');
  if (fn !== '-') {
    if (emaily(fn) !== k) vady.push('databáze public.je_admin(): ' + (emaily(fn) || '(nečitelné)') + '  ≠  config: ' + kanon.join(', '));
    pravidla.forEach((r) => vady.push('databáze: pravidlo ' + r.split('|')[0] + ' nese e-mail natvrdo — má volat public.je_admin()'));
    return { vady, popis: 'je_admin() = config, ' + pravidla.length + ' pravidel s e-mailem natvrdo' };
  }
  pravidla.forEach((r) => { if (emaily(r) !== k) vady.push('databáze: pravidlo ' + r.split('|')[0] + ' — ' + emaily(r) + '  ≠  config'); });
  return { vady, popis: 'je_admin() ještě není (sql/2026-10-22_admin_jedno_misto.sql nespuštěno), ' + pravidla.length + ' pravidel s e-maily = config' };
}

if (process.argv.includes('--test')) {
  // Životní cyklus (memory guard-test-the-lifecycle): před migrací shoda / rozdíl · po migraci shoda / jiný seznam ve funkci / zbylé pravidlo
  // s e-mailem · konce řádků CRLF (Windows) · víceřádková definice funkce.
  const K = ['a@x.is', 'b@x.is'];
  const P = "P|gift_codes/Admin|(auth.email() = ANY (ARRAY['a@x.is'::text, 'b@x.is'::text]))";
  const FN = "F|CREATE OR REPLACE FUNCTION public.je_admin()\n RETURNS boolean\nAS $function$\n  select lower(x) = any (array['a@x.is', 'b@x.is']);\n$function$";
  const T = [
    ['před migrací, pravidla = config', 'F|-\n' + P, 0],
    ['před migrací, pravidlo s jinou adresou', 'F|-\n' + P.replace("'b@x.is'", "'c@x.is'"), 1],
    ['po migraci, vše čisté', FN, 0],
    ['po migraci, funkce s jiným seznamem', FN.replace("'b@x.is'", "'c@x.is'"), 1],
    ['po migraci, zbylé pravidlo s e-mailem', FN + '\n' + P, 1],
    ['konce řádků CRLF', ('F|-\n' + P).replace(/\n/g, '\r\n'), 0],
  ];
  const zle = T.filter(([, out, n]) => vyhodnotDb(out, K).vady.length !== n);
  zle.forEach(([jm]) => console.log('FAIL test: ' + jm));
  if (!zle.length) console.log('OK    test seznamu adminů v databázi: ' + T.length + ' stavů (před i po migraci)');
  process.exit(zle.length ? 1 : 0);
}

const kanon = vytahni(fs.readFileSync(path.join(ROOT, 'v2', 'runar-config.js'), 'utf8'));
if (!kanon || !kanon.length) { console.log('FAIL  ADMIN_EMAILS v v2/runar-config.js nenalezen'); process.exit(1); }
const FN = path.join(ROOT, 'supabase', 'functions');
let chyby = 0, kopie = 0;
const SHARED = path.join(FN, '_shared');
const soubory = fs.readdirSync(FN).map((d) => [d, path.join(FN, d, 'index.ts')])
  .concat(fs.existsSync(SHARED) ? fs.readdirSync(SHARED).filter((f) => /\.(ts|mjs)$/.test(f)).map((f) => ['_shared/' + f, path.join(SHARED, f)]) : []);
for (const [d, f] of soubory) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (src.indexOf('ADMIN_EMAILS') === -1) continue;
  // 2026-10-22 (DECISIONS 2026-10-22 (5) (a)): edge funkce seznam IMPORTUJÍ z _shared/admini.ts — vlastní kopie mimo _shared je vada
  // (do té doby šest kopií, každou šlo změnit zvlášť). Funkce, která ADMIN_EMAILS používá, musí mít import ze sdíleného souboru.
  const deklarace = /ADMIN_EMAILS\s*(?::\s*[^=\n]+)?=\s*\[/.test(src);
  if (!d.startsWith('_shared/')) {
    if (deklarace) { chyby++; kopie++; console.log('  ✘ ' + d + ': vlastní kopie seznamu adminů — importuj ADMIN_EMAILS z ../_shared/admini.ts'); }
    else if (!/import\s*\{[^}]*ADMIN_EMAILS[^}]*\}\s*from\s*["']\.\.\/_shared\/admini\.ts["']/.test(src)) {
      chyby++; console.log('  ✘ ' + d + ': používá ADMIN_EMAILS bez importu z ../_shared/admini.ts');
    }
    continue;
  }
  if (!deklarace) continue;
  // generovaný balíček promptu = kopie v2/runar-config.js (build_prompt_skladani.js; aktuálnost hlídá ㊌), ne druhý seznam
  if (d === '_shared/prompt_skladani.mjs') continue;
  const s = vytahni(src);
  kopie++;
  if (!s || s.join(',') !== kanon.join(',')) {
    chyby++;
    console.log('  ✘ ' + d + ': ' + (s ? s.join(', ') : '(seznam nečitelný)') + '  ≠  config: ' + kanon.join(', '));
  }
}
// ── databáze: je_admin() a pravidla přístupu ──
let db = 'neověřeno';
try {
  const os = require('os');
  const urlF = path.join(os.homedir(), '.claude', 'runar-db-url.txt');
  if (process.env.RUNAR_ADMIN_DB_SKIP || !fs.existsSync(urlF)) throw new Error('bez přístupu k databázi');
  const { psql } = require('./utils/pgdump_runar');
  const SQL = "select 'F|' || coalesce((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'je_admin' limit 1), '-');" +
    "select 'P|' || c.relname || '/' || p.polname || '|' || coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') from pg_policy p join pg_class c on c.oid = p.polrelid " +
    "where pg_get_expr(p.polqual, p.polrelid) like '%@%' or pg_get_expr(p.polwithcheck, p.polrelid) like '%@%';";
  const r = vyhodnotDb(psql(fs.readFileSync(urlF, 'utf8').trim(), ['-X', '-At', '-f', '-'], { input: SQL, stdio: ['pipe', 'pipe', 'pipe'] }), kanon);
  r.vady.forEach((v) => { chyby++; console.log('  ✘ ' + v); });
  db = r.popis;
} catch (e) { db = 'neověřeno (' + String(e.message || e).split('\n')[0].replace(/postgres(ql)?:\/\/\S+/g, '<url>').slice(0, 80) + ')'; }
if (!chyby && kopie !== 1) { chyby++; console.log('  ✘ seznam adminů pro edge funkce má stát právě jednou (_shared/admini.ts), je ' + kopie + '×'); }
if (chyby) { console.log('FAIL  ADMIN_EMAILS: ' + chyby + ' rozdílů proti v2/runar-config.js (kód ' + kopie + ' kopií; databáze: ' + db + ')'); process.exit(1); }
console.log('OK    ADMIN_EMAILS: 1 seznam pro edge funkce (_shared/admini.ts, funkce ho importují) = v2/runar-config.js (' + kanon.length + ' adres); databáze: ' + db);
