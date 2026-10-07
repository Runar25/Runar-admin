// Co už víme a co už je hotové — DŘÍV, než se ownerovi něco navrhne nebo nahlásí jako nález.
// KUKY 2026-10-07: „teď mi hlásíš spoustu starých věcí… jak to, že nevíš, co jsme už dělali?“ Doklad téhož dne: první průchod
// auditu promptu nahlásil devět typů vad — grey hour, roots, Blank i Berkana byly opravené 25.–28. 9., home-field 6. 10., „You see
// the room more clearly“ owner 25. 9. označil za NE-vadu a „podobu oblasti jen jednou“ 3. 10. zamítl (DECISIONS 2026-10-03 (4)).
// Všechno to stálo v RUNAR_DECISIONS / RUNAR_BACKLOG; nikdo se tam před hlášením nepodíval. Stop-hook (~/.claude/runar-zprava-check.py)
// proto zprávu s návrhem zastaví, když v témže tahu neběžel tenhle příkaz.
//
// Hledá pojmy (bez ohledu na velikost písmen) v RUNAR_DECISIONS.md, RUNAR_BACKLOG.md, RUNAR_EVAL_LOG.md, RUNAR_DESIGN.md, CLAUDE.md,
// memory/*.md a v poznámkách ownerových hlášení v databázi (bug_reports.notes + stav). U každého nálezu ukáže, kam patří (datovaný
// záznam / sekce backlogu) a značku stavu, je-li na řádku: ✅ hotovo · ✖ není vada · ⏸ odloženo · [ ] otevřené.
//   node scripts/utils/uz_vime.js <pojem> [<pojem> …] [--bez-db] [--max 12]
// Víc pojmů = hledá se kterýkoli z nich. Výstup jen do konzole.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2);
const MAX = Number((argv[argv.indexOf('--max') + 1]) || 12) || 12;
const pojmy = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--max');
if (!pojmy.length) { console.log('použití: node scripts/utils/uz_vime.js <pojem> [<pojem> …] [--bez-db]'); process.exit(1); }
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE = new RegExp(pojmy.map(esc).join('|'), 'i');
const stav = (t) => /✅|\[x\]|HOTOVO|opraveno|ZAVŘENO|NASAZENO/i.test(t) ? '✅' : /✖|NENÍ vada|není vada/i.test(t) ? '✖' : /⏸|ODLOŽ/i.test(t) ? '⏸' : /\[ \]|ČEKÁ|otevřen/i.test(t) ? '[ ]' : '  ';

function hledej(soubor, nadpis) {
  let s; try { s = fs.readFileSync(path.join(REPO, soubor), 'utf8'); } catch (e) { return []; }
  const r = s.split(/\r?\n/), out = []; let h = '';
  for (let i = 0; i < r.length; i++) {
    if (nadpis.test(r[i])) h = r[i].replace(/^#+\s*/, '').slice(0, 110);
    if (RE.test(r[i])) out.push({ kde: soubor + ':' + (i + 1), h, stav: stav(r[i] + ' ' + (r[i - 1] || '')), radek: r[i].trim().slice(0, 170) });
  }
  return out;
}
const souhrn = [];
souhrn.push(['RUNAR_DECISIONS.md', hledej('RUNAR_DECISIONS.md', /^## \d{4}-\d{2}-\d{2}/)]);
souhrn.push(['RUNAR_BACKLOG.md', hledej('RUNAR_BACKLOG.md', /^#{2,3} /)]);
souhrn.push(['RUNAR_EVAL_LOG.md', hledej('RUNAR_EVAL_LOG.md', /^## \d{4}-\d{2}-\d{2}/)]);
souhrn.push(['RUNAR_DESIGN.md', hledej('RUNAR_DESIGN.md', /^#{2,3} /)]);
souhrn.push(['CLAUDE.md', hledej('CLAUDE.md', /^#{2,3} /)]);
const mem = []; try { for (const f of fs.readdirSync(path.join(REPO, 'memory'))) if (/\.md$/.test(f)) mem.push(...hledej('memory/' + f, /^name:|^# /)); } catch (e) {}
souhrn.push(['memory/', mem]);

let celkem = 0;
for (const [jm, hity] of souhrn) {
  if (!hity.length) continue;
  celkem += hity.length;
  // novější záznamy napřed (DECISIONS/EVAL rostou na konec souboru)
  const h = hity.slice().reverse().slice(0, MAX);
  console.log('\n## ' + jm + ' — ' + hity.length + ' nálezů' + (hity.length > MAX ? ' (ukázáno ' + MAX + ' nejnovějších)' : ''));
  for (const x of h) console.log(' ' + x.stav + ' ' + x.kde + (x.h ? '  [' + x.h + ']' : '') + '\n      ' + x.radek);
}
if (!argv.includes('--bez-db')) {
  try {
    const kde = pojmy.map((p) => "message ilike '%" + p.replace(/'/g, "''") + "%' or notes ilike '%" + p.replace(/'/g, "''") + "%'").join(' or ');
    const sql = 'select left(id::text, 8) as id, created_at::date as den, status, left(coalesce(notes, \'\'), 160) as notes, left(message, 120) as message from bug_reports where '
      + kde + ' order by created_at desc limit ' + MAX;
    const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: REPO, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const j = JSON.parse(src.slice(src.search(/[\[{]/))); const rows = Array.isArray(j) ? j : j.rows;
    if (rows.length) {
      celkem += rows.length;
      console.log('\n## hlášení v databázi — ' + rows.length + ' (stav: new = nikdo nečetl · triaged = přečteno · fixed = hotovo)');
      for (const r of rows) console.log(' ' + (r.status === 'fixed' ? '✅' : r.status === 'triaged' ? '[ ]' : ' ●') + ' ' + r.den + ' ' + r.id + ' ' + r.status
        + (r.notes ? '\n      poznámka: ' + String(r.notes).replace(/\s+/g, ' ') : '') + '\n      hlášení: ' + String(r.message || '').replace(/\s+/g, ' '));
    }
  } catch (e) { console.log('\n(hlášení z databáze nenačtena: supabase CLI)'); }
}
console.log('\n' + (celkem ? 'Celkem ' + celkem + ' nálezů pro: ' + pojmy.join(' · ') + ' — hotové (✅) a zamítnuté (✖) ownerovi znovu nenavrhuj.'
  : 'Nic nenalezeno pro: ' + pojmy.join(' · ') + ' — zkus jiná slova (anglický termín, jméno runy, číslo verze).'));
