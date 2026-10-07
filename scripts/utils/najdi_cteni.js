// Hledání v čteních, která UŽ MÁME — dřív, než se sáhne po API.
// KUKY 2026-10-07: „já ti teď řekl zkus tohle, což bylo prakticky zadarmo, ale ty za nějakou dobu stejně budeš hledat pokus někde
// jinde na API, i když ho máš přímo pod nosem.“ Doklad: otázku „opisuje sol otázku runy a čím to je?“ jsem chtěl řešit pokusem
// za 18 volání; z 264 uložených čtení (produkce + laby) vyšla zadarmo a přesněji — opis visí na tvaru konce (otázka 4/14, výrok 1/38).
// Data byla rozsypaná ve čtyřech místech a každý pokus si je hledal po svém; tohle je JEDNA cesta ke všem.
//
// Zdroje: produkce (readings + Asky z follow_up, supabase CLI) · záloha ~/runar-eval/zaloha (scripts/utils/zaloha_cteni.js) ·
// ~/runar-eval · eval_out/ · docs/eval/. Záznam: zdroj, typ (cteni/ask), model, jazyk, runy, text; pokud je zná i prompt, otázku,
// rameno pokusu, verzi promptu a losy (prompt_draws). Duplicity (týž text ve víc zdrojích) se počítají jednou.
//   node scripts/utils/najdi_cteni.js [filtry] [--dle pole,pole] [--vypis N] [--cele]
//   filtry: --typ cteni|ask · --model sol|opus|<část jména> · --runa Thurisaz · --lang en|is · --od 2026-09-24 (produkce)
//           --text <regex> (text výstupu) · --prompt <regex> (jen záznamy s uloženým promptem) · --zdroj <část cesty>
//           --draws klic=regex (produkce: např. ending=2$) · --bez-db · --jen-db
//   --dle    seskupení tabulky (výchozí zdroj,model,lang,typ; další: runa, verze, rameno)
//   Výstup jen do konzole: texty nesou jména a ownerova čtení, do repa nepatří (DECISIONS 2026-08-08).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const REPO = path.resolve(__dirname, '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : d; };
const ma = (k) => process.argv.includes(k);
const F = { typ: arg('--typ'), model: arg('--model'), runa: arg('--runa'), lang: arg('--lang'), text: arg('--text'), prompt: arg('--prompt'),
  zdroj: arg('--zdroj'), draws: arg('--draws'), od: arg('--od', '2026-09-01') };
const DLE = String(arg('--dle', 'zdroj,model,lang,typ')).split(',').filter(Boolean);
const VYPIS = Number(arg('--vypis', 0)) || 0;

const TEXT = ['text', 'reading', 'reading_text', 'raw', 'cteni', 'vystup', 'output', 'odpoved', 'answer', 'a', 'short_text'];
const KONTEXT = ['model', 'model_vraceny', 'lang', 'runa', 'rune', 'rune_name', 'prompt', 'konec', 'question', 'otazka', 'q', 'spread', 'kind',
  'varianta', 'arm', 'rameno', 'v', 'prompt_version', 'verze'];
const cteni = [];
function runyZTextu(t) { try { const j = JSON.parse(String(t).trim()); return Array.isArray(j) ? j.map((x) => x && x.rune).filter(Boolean) : null; } catch (e) { return null; } }
function telo(t) {
  let b = String(t || '').trim();
  if (b[0] === '[' || b[0] === '{') { try { let j = JSON.parse(b); if (!Array.isArray(j)) j = j.readings || [j]; b = j.map((x) => (x && x.text) || '').join(' '); } catch (e) {} }
  return b.trim();   // i s řádkem ✦ — hledá se i v myšlence (její opakování u téže runy je nález auditu 2026-10-07)
}
function pridej(r) { cteni.push(r); }
function projdi(o, ctx, zdroj) {
  if (Array.isArray(o)) { o.forEach((x) => projdi(x, ctx, zdroj)); return; }
  if (!o || typeof o !== 'object') return;
  const c = Object.assign({}, ctx);
  for (const k of KONTEXT) if (typeof o[k] === 'string' || typeof o[k] === 'number') c[k] = String(o[k]);
  if (Array.isArray(o.runy)) c.runy = o.runy.filter((x) => typeof x === 'string');
  if (o.usage && typeof o.usage.model === 'string') c.model = o.usage.model;
  if (o.draws && typeof o.draws === 'object' && !Array.isArray(o.draws)) c.draws = o.draws;   // dávky gen_batch/gen_direct
  const tk = TEXT.find((k) => typeof o[k] === 'string' && o[k].length >= 80 && / /.test(o[k]));
  if (tk) {
    const raw = o[tk], rr = runyZTextu(raw);
    const ask = (tk === 'a' || tk === 'odpoved' || tk === 'answer') || (/ask/i.test(zdroj) && (c.otazka || c.q));
    pridej({ zdroj, typ: ask ? 'ask' : 'cteni', modelPlny: c.model || c.model_vraceny || '?', lang: c.lang, runy: rr || c.runy || [c.runa || c.rune || c.rune_name].filter(Boolean),
      text: telo(raw), prompt: c.prompt || c.konec || '', otazka: c.otazka || c.q || c.question || '', rameno: c.varianta || c.arm || c.rameno || c.v || '',
      verze: c.prompt_version || c.verze || '', draws: c.draws });
  }
  for (const [k, v] of Object.entries(o)) {
    if (!v || typeof v !== 'object') continue;
    const c2 = Object.assign({}, c);
    const m = /^(claude-[a-z0-9.-]+|gpt-[a-z0-9.-]+)\|(en|is)$/.exec(k); if (m) { c2.model = m[1]; c2.lang = m[2]; }
    projdi(v, c2, zdroj);
  }
}
function soubory(d, hloubka, out) {
  let pol; try { pol = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return out; }
  for (const p of pol) {
    const f = path.join(d, p.name);
    if (/golden|prompt_rules_registry|node_modules|manifest\.json$|\.meta\.json$/i.test(f)) continue;
    if (p.isDirectory()) { if (hloubka > 0) soubory(f, hloubka - 1, out); }
    else if (/\.jsonl?$/i.test(p.name)) out.push(f);
  }
  return out;
}
function nactiSoubor(f, jmeno) {
  let s; try { s = fs.readFileSync(f, 'utf8'); } catch (e) { return; }
  if (s.length > 30 * 1024 * 1024) return;
  const i = s.search(/[\[{]/); if (i < 0) return; s = s.slice(i);   // výpisy z CLI začínají „Initialising login role…“
  if (/\.jsonl$/i.test(f)) s.split('\n').filter(Boolean).forEach((l) => { try { projdi(JSON.parse(l), {}, jmeno); } catch (e) {} });
  else { try { projdi(JSON.parse(s), {}, jmeno); } catch (e) {} }
}

if (!ma('--jen-db')) {
  const Z = [['zaloha', path.join(os.homedir(), 'runar-eval', 'zaloha'), 1], ['runar-eval', path.join(os.homedir(), 'runar-eval'), 2],
    ['eval_out', path.join(REPO, 'eval_out'), 4], ['docs/eval', path.join(REPO, 'docs', 'eval'), 3]];
  const vid = new Set();
  for (const [jm, d, h] of Z) for (const f of soubory(d, h, [])) {
    if (jm === 'runar-eval' && f.indexOf(path.join('runar-eval', 'zaloha')) !== -1) continue;
    if (vid.has(f)) continue; vid.add(f);
    nactiSoubor(f, jm + '/' + path.relative(d, f).replace(/\\/g, '/'));
  }
}
if (!ma('--bez-db')) {
  try {
    const sql = "select id, drawn_at, lang, rune_name, area, question, short_text, follow_up, prompt_draws, prompt_version, usage->>'model' as model from readings where drawn_at >= '"
      + String(F.od).replace(/'/g, '') + "' order by drawn_at";
    const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: REPO, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const j = JSON.parse(src.slice(src.search(/[\[{]/))); const rows = Array.isArray(j) ? j : j.rows;
    for (const r of rows) {
      let d = r.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } }
      const spread = r.area === 'spread';
      if (r.short_text) pridej({ zdroj: 'produkce', typ: 'cteni', modelPlny: r.model || '?', lang: r.lang, runy: spread ? (runyZTextu(r.short_text) || []) : [r.rune_name],
        text: telo(r.short_text), prompt: '', otazka: r.question || '', rameno: spread ? 'spread' : 'single', verze: r.prompt_version || '', draws: d || {}, kdy: String(r.drawn_at).slice(0, 10) });
      for (const f of r.follow_up || []) if (f && f.a) pridej({ zdroj: 'produkce', typ: 'ask', modelPlny: r.model || '?', lang: r.lang, runy: [r.rune_name],
        text: String(f.a), prompt: '', otazka: String(f.q || ''), rameno: '', verze: r.prompt_version || '', draws: d || {}, kdy: String(r.drawn_at).slice(0, 10) });
    }
  } catch (e) { console.error('produkce nenačtena (supabase CLI): ' + String(e.message || e).split('\n')[0]); }
}

// model zkráceně, jazyk dopočítaný, duplicity pryč — produkce napřed: exporty z DB v ~/runar-eval jsou její kopie bez losů
cteni.sort((a, b) => (a.zdroj === 'produkce' ? 0 : 1) - (b.zdroj === 'produkce' ? 0 : 1));
const vid = new Set();
let C = cteni.filter((x) => { const k = x.typ + '|' + x.text.slice(0, 160); if (!x.text || vid.has(k)) return false; vid.add(k); return true; });
for (const x of C) {
  x.model = /sol/i.test(x.modelPlny) ? 'sol' : /opus|claude|sonnet|haiku/i.test(x.modelPlny) ? 'opus' : '?';
  if (x.lang !== 'en' && x.lang !== 'is') x.lang = /[ðþæ]/i.test(x.text) ? 'is' : 'en';
  x.runa = (x.runy || []).join('+');
}
const re = (s) => new RegExp(s, 'i');
if (F.typ) C = C.filter((x) => x.typ === F.typ);
if (F.model) C = C.filter((x) => x.model === F.model || re(F.model).test(x.modelPlny));
if (F.runa) C = C.filter((x) => (x.runy || []).some((r) => re('^' + F.runa + '$').test(r)));
if (F.lang) C = C.filter((x) => x.lang === F.lang);
if (F.zdroj) C = C.filter((x) => x.zdroj.indexOf(F.zdroj) !== -1);
if (F.prompt) C = C.filter((x) => x.prompt && re(F.prompt).test(x.prompt));
if (F.draws) { const [k, v] = F.draws.split('='); C = C.filter((x) => x.draws && x.draws[k] !== undefined && re(v || '.').test(String(x.draws[k]))); }
const shoda = F.text ? (x) => re(F.text).test(x.text) : null;

const sk = {};
for (const x of C) {
  const k = DLE.map((p) => p === 'zdroj' ? x.zdroj.split('/').slice(0, 2).join('/') : String(x[p] === undefined || x[p] === '' ? '—' : x[p])).join(' · ');
  const g = sk[k] = sk[k] || { n: 0, s: 0 }; g.n++; if (shoda && shoda(x)) g.s++;
}
console.log('záznamů: ' + C.length + (shoda ? ' · s textem /' + F.text + '/: ' + C.filter(shoda).length : '') + '   (seskupení: ' + DLE.join(', ') + ')');
for (const k of Object.keys(sk).sort()) console.log('  ' + k.padEnd(60) + String(sk[k].n).padStart(5) + (shoda ? '   ' + sk[k].s + '/' + sk[k].n : ''));
if (VYPIS) {
  const V = (shoda ? C.filter(shoda) : C).slice(0, VYPIS);
  console.log('');
  for (const x of V) console.log('— ' + [x.zdroj, x.model, x.lang, x.runa, x.verze, x.rameno, x.kdy].filter(Boolean).join(' · ')
    + (x.otazka ? '\n  otázka: ' + x.otazka.slice(0, 200) : '') + '\n  ' + (ma('--cele') ? x.text : x.text.slice(0, 400) + (x.text.length > 400 ? '…' : '')));
}
