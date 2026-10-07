// Záloha všech čtení, která vzniknou mimo produkci (testy, laby, pokusy přes API).
// KUKY 2026-10-07: „všechna čtení, která uděláme, musíme zálohovat, protože se nám budou hodit.“ Do té doby ležely výstupy
// pokusů v dočasných složkách session (scratchpad v %TEMP%) a nic je nechránilo před úklidem — 2026-10-07 tam bylo mimo jiné
// 300 odpovědí Asku (pokus A, 2026-10-06), ze kterých se ten den bez jediného volání ověřilo, že nová pravidla nezvedla převyprávění.
// Pravidlo „zálohuj“ platilo od 2026-08-16 (archive_batches.js) a přestalo se plnit, protože viselo na paměti session.
// Proto to dělá Stop-hook (~/.claude/tree-guard.sh) při každém konci tahu v KAŽDÉ session — nezávisí na tom, kdo si vzpomene.
//
// Co dělá: projde scratchpady všech session a eval_out/ (gitignorované dávky) a každý JSON/JSONL, ve kterém je text čtení nebo
// odpovědi, zkopíruje do ~/runar-eval/zaloha/ — MIMO repo: výstupy nesou jméno a stojí na ownerových čteních, repo je veřejné
// (DECISIONS 2026-08-08). docs/eval/ se nekopíruje — je v gitu. Stejný obsah podruhé nekopíruje (sha1 v manifestu).
//   node scripts/utils/zaloha_cteni.js [--tichy] [--suchy]
//   --tichy  nic nevypíše, když nic nového   ·   --suchy  jen ukáže, co by zkopíroval
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const REPO = path.resolve(__dirname, '..', '..');
const CIL = process.env.RUNAR_ZALOHA || path.join(os.homedir(), 'runar-eval', 'zaloha');
const TEMP = path.join(os.tmpdir(), 'claude');
const TICHY = process.argv.includes('--tichy'), SUCHY = process.argv.includes('--suchy');
// Výpisy promptů a kopie repa nejsou čtení — prompt se postaví z gitu (golden, registr), stažené edge funkce a supabase/.temp taky.
const VYNECH = /golden|zaloha_plny|prompt_rules_registry|proxy_dl|lr_dl|linked-project|[\\/]\.temp[\\/]|node_modules/i;
// Text čtení / odpovědi: dlouhý řetězec pod klíčem, jakým ho píšou naše harnessy a export z DB.
const CTENI = /"(text|reading|reading_text|short_text|a|odpoved|answer|raw|cteni|vystup|output)"\s*:\s*"(?:[^"\\]|\\.){120,}/;
const MAX = 20 * 1024 * 1024;
// Verze filtru jde do klíče mezipaměti „viděno“: změní-li se VYNECH nebo CTENI, posoudí se znovu i soubory, které dřív neprošly.
const FILTR = 'f2';

function soubory(d, hloubka, out) {
  let pol; try { pol = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return out; }
  for (const p of pol) {
    const f = path.join(d, p.name);
    if (VYNECH.test(f)) continue;
    if (p.isDirectory()) { if (hloubka > 0) soubory(f, hloubka - 1, out); }
    else if (/\.jsonl?$/i.test(p.name)) out.push(f);
  }
  return out;
}
function zdroje() {
  const out = [];
  // scratchpady všech session: %TEMP%/claude/<projekt>/<session>/scratchpad/**
  let proj = []; try { proj = fs.readdirSync(TEMP).map((x) => path.join(TEMP, x)); } catch (e) {}
  for (const p of proj) {
    let ses = []; try { ses = fs.readdirSync(p); } catch (e) { continue; }
    for (const s of ses) { const sp = path.join(p, s, 'scratchpad'); if (fs.existsSync(sp)) soubory(sp, 4, out); }
  }
  soubory(path.join(REPO, 'eval_out'), 4, out);
  return out;
}

fs.mkdirSync(CIL, { recursive: true });
const MAN = path.join(CIL, 'manifest.json');
let man = { soubory: {}, videno: {} };
try { man = JSON.parse(fs.readFileSync(MAN, 'utf8')); } catch (e) {}
man.soubory = man.soubory || {}; man.videno = man.videno || {};

let nove = 0, bajty = 0;
for (const f of zdroje()) {
  let st; try { st = fs.statSync(f); } catch (e) { continue; }
  if (st.size > MAX || st.size < 200) continue;
  const klic = FILTR + '|' + st.size + '|' + Math.round(st.mtimeMs);
  if (man.videno[f] === klic) continue;                       // beze změny od posledního průchodu
  let s; try { s = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
  man.videno[f] = klic;
  if (!CTENI.test(s)) continue;
  const h = crypto.createHash('sha1').update(s).digest('hex');
  if (man.soubory[h]) { if (!man.soubory[h].zdroje.includes(f)) man.soubory[h].zdroje.push(f); continue; }
  const ses = (/[\\/]([0-9a-f]{8})[0-9a-f-]{28}[\\/]scratchpad[\\/]/i.exec(f) || [])[1]
    || (f.indexOf(path.join(REPO, 'eval_out')) === 0 ? 'eval_out' : 'jine');
  const den = new Date(st.mtimeMs).toISOString().slice(0, 10);
  let jmeno = den + '_' + ses + '_' + path.basename(f);
  if (fs.existsSync(path.join(CIL, jmeno))) jmeno = jmeno.replace(/(\.jsonl?)$/i, '_' + h.slice(0, 6) + '$1');
  if (!SUCHY) fs.copyFileSync(f, path.join(CIL, jmeno));
  man.soubory[h] = { cil: jmeno, zdroje: [f], velikost: st.size, zalohovano: new Date().toISOString().slice(0, 10) };
  nove++; bajty += st.size;
  if (SUCHY) console.log('  ' + jmeno + '  ← ' + f);
}
if (!SUCHY) fs.writeFileSync(MAN, JSON.stringify(man, null, 1));
const celkem = Object.keys(man.soubory).length;
if (!(TICHY && !nove)) console.log('záloha čtení: +' + nove + ' souborů (' + Math.round(bajty / 1024) + ' kB) · celkem ' + celkem + ' · ' + CIL + (SUCHY ? ' (nanečisto)' : ''));
