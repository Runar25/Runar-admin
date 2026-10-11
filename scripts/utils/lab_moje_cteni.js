// lab_moje_cteni.js — čtení ownera z produkce do labu stromu (CODE-tree 2026-10-11).
//
// Proč: KUKY 2026-10-11 „možná nejlepší bude, když převedeš moje čtení do labu a tak to můžeme ladit“. Lab měl vlastní starší log
// (388 čtení, staré zakládací Norny) a strom se STEJNÝM nastavením vypadal jinak než v produkci (471 čtení, dnešní Norny první:
// koruna 879 × 1332, kořeny 0,88 × 0,44 šířky koruny) — ladit na jiných datech nemá smysl.
// Jak: čtení admin účtu ownera (ADMIN_EMAILS[0] z v2/runar-config.js, nebo e-mail v argumentu) z produkční DB, převod STEJNOU funkcí
// jako aplikace (readingsToTreeLog z v2/runar-tree.js), zakládací Norny první (founding_reading_id, jako renderLivingTree). Zapíše
// v2/tree-lab-crown-composer/_moje_cteni.js — v labu pak tlačítko MOJE ČTENÍ Z PRODUKCE (build_crown_composer.py) přepíše log labu.
// Soukromí: soubor nese jen runy, oblast, záměr a seeking (žádný text čtení, žádné id ani čas) a je v .gitignore — repo je veřejné.
//   node scripts/utils/lab_moje_cteni.js [email]      (potřebuje přihlášený `supabase db query --linked`)
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), V2 = path.join(ROOT, 'v2');
const OUT = path.join(V2, 'tree-lab-crown-composer', '_moje_cteni.js');
const cfg = fs.readFileSync(path.join(V2, 'runar-config.js'), 'utf8');
const email = process.argv[2] || (cfg.match(/ADMIN_EMAILS\s*=\s*\[\s*'([^']+)'/) || [])[1];
if (!email || !/^[^'\s]+@[^'\s]+$/.test(email)) { console.error('Nevím, čí čtení: chybí e-mail (argument nebo ADMIN_EMAILS v runar-config.js).'); process.exit(1); }
const sql = `select json_build_object(
  'rows', (select coalesce(json_agg(json_build_object('id', r.id, 'rune_name', r.rune_name, 'rune_glyph', r.rune_glyph, 'short_text', r.short_text,
            'area', r.area, 'aol', r.aol, 'intention', r.intention, 'seeking', r.seeking, 'drawn_at', r.drawn_at) order by r.drawn_at), '[]'::json)
           from public.readings r join auth.users u on u.id = r.user_id where u.email = '${email}'),
  'prof', (select json_build_object('f', p.founding_reading_id, 'ft', p.tree_founded_at, 'd', p.dob_day, 'm', p.dob_month, 'y', p.dob_year, 'lr', p.life_rune_number)
           from public.user_profiles p join auth.users u on u.id = p.id where u.email = '${email}'))::text as j`;
const tmp = path.join(os.tmpdir(), 'lab_moje_cteni_' + process.pid + '.sql');
fs.writeFileSync(tmp, sql, 'utf8');
let out;
try { out = cp.execSync('supabase db query --linked -f "' + tmp + '"', { encoding: 'utf8', maxBuffer: 1 << 28, cwd: ROOT }); }
catch (e) { console.error('supabase db query selhalo: ' + String(e.message || e).slice(0, 300)); process.exit(1); }
finally { try { fs.unlinkSync(tmp); } catch (e) {} }
const data = JSON.parse(JSON.parse(out.slice(out.indexOf('{'))).rows[0].j);
if (!data.prof) { console.error('Účet nenalezen.'); process.exit(1); }
// stejný převod jako aplikace: runy z glyfů (short_text jen pro glyfy spreadu), slugy oblasti/záměru/seekingu
const sb = { Math, JSON, Date, console, lang: 'en' }; sb.window = sb; sb.globalThis = sb; sb.self = sb;
sb.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} };
sb.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
vm.createContext(sb);
let code = 'var lang="en";\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'tree-lab-trunk-composer/runar-trunk.js', 'tree-lab-branch-composer/runar-branch.js'])
  code += fs.readFileSync(path.join(V2, f), 'utf8') + '\n;\n';
const T = fs.readFileSync(path.join(V2, 'runar-tree.js'), 'utf8');
const a = T.indexOf('var TREE_AREA_SLUG'), b = T.indexOf('// Přehrávání růstu.');
if (a < 0 || b < a) { console.error('runar-tree.js: nenašel jsem slovníky a readingsToTreeLog — změnil se soubor?'); process.exit(1); }
vm.runInContext(code + T.slice(a, b), sb, { filename: 'lab-moje-cteni' });
let log = vm.runInContext('readingsToTreeLog', sb)(data.rows);
const fi = log.findIndex(r => r.id === data.prof.f);
if (fi > 0) log = [log[fi]].concat(log.slice(0, fi), log.slice(fi + 1));   // zakládací Norny první (jako renderLivingTree)
const lr = vm.runInContext('RUNES', sb)[(data.prof.lr || 0) - 1];
const bk = sb.RunarBranch.RUNES.filter(x => x.g === (lr && lr.g))[0];
const MC = { kdy: new Date().toISOString().slice(0, 16).replace('T', ' '), zalozeno: !!data.prof.ft,
  rune: bk ? bk.k : null, dob: { d: data.prof.d, m: data.prof.m, y: data.prof.y == null ? null : data.prof.y },
  log: log.map(r => ({ spread: r.spread, runes: r.runes.map(x => x.blank ? { rune: x.rune, el: x.el, blank: true } : { rune: x.rune, el: x.el }),
                       area: r.area || null, intention: r.intention || null, seeking: r.seeking || null })) };
fs.writeFileSync(OUT, '/* GENEROVANÉ scripts/utils/lab_moje_cteni.js ' + MC.kdy + ' — osobní data ownera, NIKDY necommitovat (.gitignore; repo je veřejné). */\n' +
  'window.RUNAR_MOJE_CTENI = ' + JSON.stringify(MC) + ';\n');
console.log('OK  ' + log.length + ' čtení do labu (' + (MC.zalozeno ? 'založeno, zakládací Norny první' : 'strom nezaložen — lab ukáže semínko') + ') → ' +
  path.relative(ROOT, OUT).replace(/\\/g, '/') + '\n    v labu: tvrdý reload (Ctrl+Shift+R), pak tlačítko MOJE ČTENÍ Z PRODUKCE (dole v NÁSTROJE).');
