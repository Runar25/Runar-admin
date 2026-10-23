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
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process'), vm = require('vm');
const M = require('./monitor_ozveny.js');
const ROOT = M.ROOT;
const RUNA = process.argv[2], VYZNAM = process.argv[3];
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };
const N = Number(arg('--n', 40));
const VYSTUP = arg('--vystup', path.join(os.tmpdir(), 'runar_odkud_vyznam_' + (RUNA || 'x') + '_' + new Date().toISOString().slice(0, 10) + '.md'));
if (!RUNA || !VYZNAM) { console.log('použití: node scripts/odkud_vyznam.js <Runa> <význam>'); process.exit(2); }

const git = (a) => cp.execFileSync('git', ['-C', ROOT].concat(a), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
// commit kódu pro čtení: poslední před časem čtení, jehož config nese tutéž verzi promptu (jinak dál do minulosti, nejvýš 60 commitů)
const commitCache = {};
function commitPro(cas, verze) {
  const k = cas + '|' + verze;
  if (commitCache[k] !== undefined) return commitCache[k];
  const kandidati = git(['rev-list', '-60', '--before=' + cas, 'origin/main', '--', 'v2/runar-config.js', 'v2/runar-character.js', 'v2/runar-utils.js', 'v2/runar-reading.js']).trim().split('\n').filter(Boolean);
  let nal = null;
  for (const c of kandidati) {
    let cfg = ''; try { cfg = git(['show', c + ':v2/runar-config.js']); } catch (e) { continue; }
    const m = cfg.match(/RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'/);
    if (m && m[1] === verze) { nal = c; break; }
  }
  return (commitCache[k] = nal);
}
// kontext appky z dané revize
const ctxCache = {};
function kontext(c) {
  if (ctxCache[c]) return ctxCache[c];
  const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  S.window = S; S.globalThis = S; vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) {
    let src = ''; try { src = git(['show', c + ':v2/' + f]); } catch (e) { continue; }
    vm.runInContext(src + '\n;\n', S);
  }
  vm.runInContext('var __s = 7; Math.random = function () { __s = (__s * 9301 + 49297) % 233280; return __s / 233280; }; var userGender = "hk"; var currentUser = null; var lang = "en"; var userName = ""; var userTier = ""; var readerUser = null; var activeChar = null; var corrections = [];', S);
  return (ctxCache[c] = S);
}
const G = (S, x) => { try { return vm.runInContext(x, S); } catch (e) { return undefined; } };

// losy čtení dosadit do promptu z dnešního losu: najdi text dnešní volby z bazénu a nahraď ho volbou čtení
function dosad(p, S, d) {
  const dc = G(S, '_promptDraws')(p, 'en') || {};
  const nahrad = (pool, a, b) => { if (pool && a != null && b != null && a !== b && pool[a] && pool[b]) p = p.split(pool[a]).join(pool[b]); };
  nahrad(G(S, 'READING_ANGLES'), dc.angle, d.angle);
  nahrad(G(S, 'LENGTH_BUDGETS'), dc.len, d.len);
  if (dc.image && d.image && dc.image !== d.image) p = p.split(dc.image).join(d.image);
  const em = (x) => String(x || '').match(/^(heavy|open)(\d+)$/);
  const a = em(dc.ending), b = em(d.ending), POOL = { heavy: G(S, 'ENDING_HEAVY'), open: G(S, 'ENDING_OPEN') };
  if (a && b && POOL[a[1]] && POOL[b[1]]) {
    const ta = POOL[a[1]][+a[2]], tb = POOL[b[1]][+b[2]];
    if (ta && tb && ta !== tb) { const ca = ta.split('{L}'), cb = tb.split('{L}'); ca.forEach((x, i) => { if (x && cb[i] != null) p = p.split(x).join(cb[i]); }); }
  }
  const FA = G(S, 'AREA_FACES'), VB = G(S, 'ESSENCE_VERBS_SOL');
  if (FA && dc.area_face != null && d.area_face != null && dc.area_face !== d.area_face)
    for (const f of FA) if (f[dc.area_face] && f[d.area_face]) p = p.split(f[dc.area_face].en[0]).join(f[d.area_face].en[0]);
  if (VB && dc.verb != null && d.verb != null && VB[dc.verb] && VB[d.verb]) p = p.split(VB[dc.verb]).join(VB[d.verb]);
  return p;
}

function zdroje(S, row, d) {
  const runa = G(S, 'RUNES').find((x) => x.n === RUNA);
  const u = { name: '', area: row.aol || row.area || '', seeking: row.seeking || '', intention: row.intention || '', question: row.question || '' };
  const sk = G(S, '_skladba');
  let prompt, kusy = [];
  if (sk) { const r = sk(G(S, 'buildReadingPrompt'), [u, runa, 'en', []]); prompt = r.text; kusy = r.kusy; }
  else prompt = G(S, 'buildReadingPrompt')(u, runa, 'en', []);
  prompt = dosad(prompt, S, d);
  if (d.thought && G(S, '_thoughtLine')) prompt += '\n' + G(S, '_thoughtLine')('en', runa);
  if (G(S, '_lengthReminder')) { const r = G(S, '_lengthReminder')('en'); if (r) prompt += '\n' + r; }
  const radky = [];
  for (const l of prompt.split('\n')) if (l.trim()) {
    const kus = kusy.find((k) => k.text.indexOf(l.trim().slice(0, 40)) !== -1);
    radky.push({ kde: 'prompt čtení' + (kus ? ' · ' + kus.kus : ''), text: l.trim() });
  }
  const sys = G(S, 'buildSysPrompt')(null, 'en');
  let sekce = 'systém';
  for (const l of sys.split('\n')) if (l.trim()) {
    if (/^[A-Z][A-Z &]{3,}$/.test(l.trim())) sekce = 'systém · ' + l.trim();
    radky.push({ kde: sekce, text: l.trim() });
  }
  if (u.area || u.seeking || u.intention || u.question) radky.push({ kde: 'co člověk vyplnil', text: [u.area, u.seeking, u.intention, u.question].filter(Boolean).join(' · ') });
  return radky;
}

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
  const c = commitPro(r.drawn_at, r.prompt_version);
  const vety = text.split(/(?<=[.!?])\s+/).filter((v) => nasel(v).length);
  md.push('### ' + String(r.drawn_at).slice(0, 16) + ' · ' + r.prompt_version + ' · ' + (c ? 'commit ' + c.slice(0, 7) : 'VERZE NENALEZENA'));
  vety.forEach((v) => md.push('- čtení: „' + v + '“'));
  if (!c) { md.push('- zdroj: nelze určit (kód té verze v gitu nenalezen)', ''); (souhrn['verze nenalezena'] = (souhrn['verze nenalezena'] || 0) + 1); continue; }
  const S = kontext(c), zd = zdroje(S, r, d);
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
