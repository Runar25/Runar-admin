// odkud_vyznam.js — PŘESNĚ ODKUD je slovo významu runy ve čtení: u každého výskytu buď kus/řádek promptu, který to slovo obsahoval, nebo
// „v promptu nestojí — model ho vytvořil sám“. Žádné „jinde“.
//
// Proč (owner 2026-10-23 nad vzorkem rodin: „isa stillness. jinde? já nechci vidět jinde! to má být přesná analýza kde! model to odněkud
// má nebo to vytváří. jednoduché.“). Krok 5 plánu „z čeho se skládá čtení“.
// Jak: každé čtení dostane prompt složený KÓDEM ZE SVÉ DOBY — poslední commit před časem čtení, jehož RUNAR_PROMPT_VERSION = verze uložená
// u čtení (git show <commit>:v2/…). Builder jedné runy s tím, co člověk vyplnil (oblast, hledání, záměr, otázka), a s losy čtení
// (prompt_draws: obraz, úhel, konec, délka, podoba oblasti, sloveso) dosazenými přes bazény TÉ verze. K tomu systémový prompt té verze a
// doplňky appky (myšlenka ✦, připomínka délky), pokud je ta verze měla. Zdroj = kus (_kus, od 2026-10-22) nebo řádek promptu.
// Hranice: jméno člověka v DB není (jen u kusu „PERSON“/oslovení — slova významu nenese); postava z charakteru v DB do 2026-10-12 se
// nepočítá (tabulka byla prázdná); čtení, jehož verzi v gitu nenajdu, se vypíše jako „verze nenalezena“, ne odhadem.
// Výstup nese texty čtení → mimo repo.
//   node scripts/odkud_vyznam.js Isa stillness [--n 40] [--vystup <cesta>]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const M = require('./monitor_ozveny.js');
const ROOT = M.ROOT;
const RUNA = process.argv[2], VYZNAM = process.argv[3];
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };
const N = Number(arg('--n', 40));
const VYSTUP = arg('--vystup', path.join(os.tmpdir(), 'runar_odkud_vyznam_' + (RUNA || 'x') + '_' + new Date().toISOString().slice(0, 10) + '.md'));
if (!RUNA || !VYZNAM) { console.log('použití: node scripts/odkud_vyznam.js <Runa> <význam>'); process.exit(2); }

// Skládání promptu z doby čtení (commit, sandbox, losy, úroveň „prompt“ / „kód“) vlastní scripts/utils/prompt_doby.js — sdílí ho fraze_z_historie.js.
const P = require('./utils/prompt_doby.js');

const tvaryVyznamu = (() => {
  const w = VYZNAM.toLowerCase().match(/[a-z]+/g) || [];
  const o = new Set(w);
  for (const x of w) { if (x.endsWith('ness')) o.add(x.slice(0, -4)); if (x.endsWith('ing')) o.add(x.slice(0, -3)); }
  for (const x of [...o]) ['s', 'ed', 'ing', 'ly'].forEach((s) => o.add(x + s));
  return [...o].filter((x) => x.length > 2);
})();
const slova = (t) => ' ' + (String(t).toLowerCase().match(/[a-z']+/g) || []).join(' ') + ' ';
const nasel = (t) => tvaryVyznamu.filter((f) => slova(t).indexOf(' ' + f + ' ') !== -1);

const sql = "select id, drawn_at, aol, area, seeking, intention, question, short_text, prompt_draws, prompt_version from " + M.CTENI
  + " where lang = 'en' and rune_name = '" + RUNA.replace(/'/g, '') + "' and coalesce(area,'') <> 'spread' and prompt_draws is not null order by drawn_at desc limit " + N;
const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const j = JSON.parse(src.slice(src.search(/[\[{]/))), rows = (Array.isArray(j) ? j : j.rows);

const md = ['# Odkud je „' + VYZNAM + '“ v čteních ' + RUNA + ' (EN, jedna runa) — ' + new Date().toISOString().slice(0, 10), '',
  'Tvary: ' + tvaryVyznamu.join(' · ') + '. Každé čtení: prompt složený kódem ze své doby (commit) s jeho losy. Zdroj = kde v promptu tvar stál; jinak model sám.', ''];
const souhrn = {};
for (const r of rows) {
  let d = r.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } } d = d || {};
  const text = M.telo(r.short_text), hit = nasel(text);
  if (!hit.length) continue;
  r.rune_name = RUNA;
  const pc = P.promptCteni(r);
  const vety = text.split(/(?<=[.!?])\s+/).filter((v) => nasel(v).length);
  md.push('### ' + String(r.drawn_at).slice(0, 16) + ' · ' + r.prompt_version + ' · ' + (pc ? 'commit ' + pc.commit.slice(0, 7) + (pc.uroven === 'kód' ? ' · ⚠ prompt nejde složit — hledáno v celém kódu té verze' : '') : 'VERZE NENALEZENA'));
  vety.forEach((v) => md.push('- čtení: „' + v + '“'));
  if (!pc) { md.push('- zdroj: nelze určit (kód té verze v gitu nenalezen)', ''); (souhrn['verze nenalezena'] = (souhrn['verze nenalezena'] || 0) + 1); continue; }
  const zd = pc.radky;
  const kde = zd.filter((z) => nasel(z.text).some((f) => hit.includes(f)));
  if (!kde.length) { md.push('- zdroj: **v promptu nestojí — model ho vytvořil sám**'); souhrn['model sám'] = (souhrn['model sám'] || 0) + 1; }
  else kde.forEach((z) => { md.push('- zdroj: **' + z.kde + '** — „' + z.text.slice(0, 220) + (z.text.length > 220 ? '…' : '') + '“'); });
  if (kde.length) kde.forEach((z) => { souhrn[z.kde] = (souhrn[z.kde] || 0) + 1; });
  md.push('');
}
md.splice(3, 0, '**Souhrn:** ' + (Object.entries(souhrn).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v + '×').join(' · ') || 'žádný výskyt'), '');
fs.writeFileSync(VYSTUP, md.join('\n'));
console.log('zapsáno (mimo repo — nese texty čtení):', VYSTUP);
console.log(md.join('\n'));
