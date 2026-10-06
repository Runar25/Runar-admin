// NAČTI ČTENÍ A REPORTY — rutina, kterou CODE pouští, když owner řekne „načti (si) čtení a reporty“ (CODE-tune 2026-10-06).
//
// PROČ (KUKY 2026-10-06): „stačí, že to uděláš automaticky, když řeknu načti si čtení a reporty. To, co je v reportech, je taky
// důležité — ukazuje to na něco, co zmíním nebo někdo jiný!“ Do té doby se čtení a reporty stahovaly ručně a monitor ozvěn se
// pouštěl, jen když si na něj někdo vzpomněl. Jeden příkaz = pokaždé stejné okno a nic se nevynechá.
//
// CO DĚLÁ (vše od posledního zápisu monitoru — značka „do:“ v docs/monitor/ozveny.md; bez značky 2 dny zpět):
//   1) nová čtení → CELÉ řádky do souboru MIMO repo (nesou jména a otázky lidí; repo je veřejné) — ten soubor CODE čte
//   2) monitor ozvěn --nove --zapis → tabulka do docs/monitor/ozveny.md + ⚠ k ohlášení
//   3) hlášení z appky (bug_reports) od téže chvíle → jen do terminálu (texty uživatelů do repa nepatří, RUNAR_PRIVACY.md)
//   node scripts/nacti_cteni.js [--od 2026-10-06] [--vystup <soubor.json>] [--bez-zapisu]
//   --bez-zapisu = monitor jen vypíše, nepřipíše do tabulky (zkušební běh — neposune značku pro ownerovo příští „načti“)
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const TABULKA = path.join(ROOT, 'docs', 'monitor', 'ozveny.md');
function znacka() {   // táž značka, kterou čte monitor_ozveny.js --nove (stav žije v tabulce, §20)
  if (!fs.existsSync(TABULKA)) return null;
  const m = fs.readFileSync(TABULKA, 'utf8').match(/<!-- do: ([^>]+?) -->/g);
  return m ? m[m.length - 1].replace(/^<!-- do: | -->$/g, '') : null;
}
function dotaz(sql) {
  const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: ROOT, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return Array.isArray(j) ? j : j.rows;
}
const od = arg('--od') || znacka() || new Date(Date.now() - 2 * 864e5).toISOString();
const odSql = od.replace(/'/g, '');
const kratce = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };

// 1) čtení
const cteni = dotaz("select id, drawn_at, lang, rune_name, area, aol, seeking, intention, question, reading_mode, life_rune, short_text, follow_up, "
  + "prompt_draws, prompt_version, usage from readings where drawn_at > '" + odSql + "' order by drawn_at");
const vystup = arg('--vystup') || path.join(os.tmpdir(), 'runar_cteni_' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json');
fs.writeFileSync(vystup, JSON.stringify(cteni, null, 1));
const poModelu = {}, poJazyku = {}; let asku = 0;
for (const r of cteni) {
  const m = String((r.usage && r.usage.model) || '?').replace('claude-', ''); poModelu[m] = (poModelu[m] || 0) + 1;
  poJazyku[r.lang] = (poJazyku[r.lang] || 0) + 1; asku += (r.follow_up || []).length;
}
console.log('══ ČTENÍ od ' + od.slice(0, 16) + ': ' + cteni.length + ' (Asků ' + asku + ') · ' + Object.entries(poModelu).map(([k, n]) => k + ' ' + n).join(', ')
  + ' · ' + Object.entries(poJazyku).map(([k, n]) => k + ' ' + n).join(', '));
console.log('   celé řádky (mimo repo): ' + vystup);

// 2) monitor ozvěn — jen když přibyla čtení (bez nich nemá co měřit a nic nepřipíše)
if (cteni.length) {
  const okno = arg('--od') ? ['--od', arg('--od')] : ['--nove'];   // táž okna jako čtení výš
  const zapis = !process.argv.includes('--bez-zapisu');
  const r = cp.spawnSync('node', [path.join(__dirname, 'monitor_ozveny.js')].concat(okno, zapis ? ['--zapis'] : []), { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  console.log('\n══ MONITOR OZVĚN' + (zapis ? ' (připsáno do docs/monitor/ozveny.md)' : ' (jen výpis, bez zápisu)'));
  console.log(String(r.stdout || '').split('\n').filter((l) => l.trim() && !/^Initialising/.test(l)).join('\n'));
  if (r.status !== 0) console.log('   ⚠ monitor skončil chybou: ' + kratce(r.stderr, 300));
}

// 3) hlášení
const rep = dotaz("select created_at, type, status, message, flagged_text, suggested_replacement, screen_context, locale, app_version "
  + "from bug_reports where created_at > '" + odSql + "' order by created_at");
const otevrene = dotaz("select count(*) as n from bug_reports where status is distinct from 'fixed'");
console.log('\n══ HLÁŠENÍ od ' + od.slice(0, 16) + ': ' + rep.length + ' (otevřených celkem ' + ((otevrene[0] && otevrene[0].n) || '?') + ')');
for (const x of rep) {
  console.log('\n· ' + String(x.created_at).slice(0, 16) + ' · ' + x.type + ' · ' + x.status + (x.locale ? ' · ' + x.locale : '') + (x.screen_context ? ' · ' + kratce(x.screen_context, 40) : ''));
  if (x.message) console.log('  zpráva: ' + kratce(x.message, 400));
  if (x.flagged_text) console.log('  označeno: ' + kratce(x.flagged_text, 300));
  if (x.suggested_replacement) console.log('  návrh: ' + kratce(x.suggested_replacement, 200));
}
