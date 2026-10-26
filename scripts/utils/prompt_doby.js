// prompt_doby.js — prompt uloženého čtení složený KÓDEM ZE SVÉ DOBY. Jedno místo pro odkud_vyznam.js a fraze_z_historie.js (§18).
//
// Commit čtení = poslední commit před časem čtení, jehož RUNAR_PROMPT_VERSION = verze uložená u čtení; čtení bez verze (do 2026-07-14)
// dostane prostě poslední commit kódu před svým časem. Z toho commitu (git show) se v sandboxu načte config, runy, překlady, character
// a utils a složí se:
//   úroveň „prompt“ — builder jedné runy s tím, co člověk vyplnil, s losy čtení (prompt_draws) dosazenými přes bazény TÉ verze, k tomu
//     systémový prompt té verze a doplňky appky (myšlenka ✦, připomínka délky). Jde jen tam, kde čtení losy nese a verze je umí vrátit.
//   úroveň „kód“ — jinak (staré čtení bez losů, builder té doby nejde zavolat): všechny řádky souborů, ze kterých se prompt té doby
//     skládal (včetně bazénů obrazů). Říká „stálo to v kódu promptu“, ne „model to dostal“ — volající to musí uvést.
// Proxy prompt nemění: system i prompt posílá appka (claude-proxy `callSol` / `systemParts`, ověřeno 2026-10-26).
// Hranice: jméno člověka v DB není; postava z charakteru v DB (do 2026-10-12, tabulka prázdná) se nepočítá.
'use strict';
const cp = require('child_process'), vm = require('vm'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const SOUBORY = ['v2/runar-config.js', 'v2/runar-character.js', 'v2/runar-utils.js', 'v2/runar-reading.js'];
const KOD = ['v2/runar-config.js', 'v2/runar-runes.js', 'v2/runar-character.js', 'v2/runar-utils.js', 'v2/runar-reading.js',
  'supabase/functions/claude-proxy/index.ts'];
const git = (a) => cp.execFileSync('git', ['-C', ROOT].concat(a), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ukaz = (c, f) => { try { return git(['show', c + ':' + f]); } catch (e) { return ''; } };

const _commit = {};
function commitPro(cas, verze) {
  const k = cas + '|' + (verze || '');
  if (_commit[k] !== undefined) return _commit[k];
  const kandidati = git(['rev-list', '-80', '--before=' + cas, 'origin/main', '--'].concat(SOUBORY)).trim().split('\n').filter(Boolean);
  let nal = null;
  if (!verze) nal = kandidati[0] || null;
  else for (const c of kandidati) {
    const m = ukaz(c, 'v2/runar-config.js').match(/RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'/);
    if (m && m[1] === verze) { nal = c; break; }
  }
  return (_commit[k] = nal);
}

const _ctx = {};
function kontext(c) {
  if (_ctx[c]) return _ctx[c];
  const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  S.window = S; S.globalThis = S; vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) {
    const src = ukaz(c, 'v2/' + f); if (!src) continue;
    try { vm.runInContext(src + '\n;\n', S); } catch (e) { /* starý soubor, který v sandboxu nejde — zbytek kontextu zůstane */ }
  }
  vm.runInContext('var __s = 7; Math.random = function () { __s = (__s * 9301 + 49297) % 233280; return __s / 233280; }; var userGender = "hk"; var currentUser = null; var lang = "en"; var userName = ""; var userTier = ""; var readerUser = null; var activeChar = null; var corrections = [];', S);
  return (_ctx[c] = S);
}
const G = (S, x) => { try { return vm.runInContext(x, S); } catch (e) { return undefined; } };

// losy čtení do promptu: text dnešní volby z bazénu té verze nahradit volbou čtení
function dosad(p, S, d) {
  const pd = G(S, '_promptDraws'); if (typeof pd !== 'function') return null;
  const dc = pd(p, 'en') || {};
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

const _kod = {};
function radkyKodu(c) {
  if (_kod[c]) return _kod[c];
  const out = [];
  for (const f of KOD) ukaz(c, f).split('\n').forEach((l, i) => { if (l.trim()) out.push({ kde: 'kód ' + f.replace(/^.*\//, '') + ':' + (i + 1), text: l.trim() }); });
  return (_kod[c] = out);
}

// Řádky promptu jednoho čtení EN jedné runy: { commit, uroven: 'prompt' | 'kód', radky: [{ kde, text }] }, nebo null (commit nenalezen).
function promptCteni(row) {
  const c = commitPro(row.drawn_at, row.prompt_version);
  if (!c) return null;
  let d = row.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = null; } }
  const S = kontext(c);
  const runa = (G(S, 'RUNES') || []).find((x) => x.n === row.rune_name);
  const build = G(S, 'buildReadingPrompt');
  if (d && runa && typeof build === 'function') {
    try {
      const u = { name: '', area: row.aol || row.area || '', seeking: row.seeking || '', intention: row.intention || '', question: row.question || '' };
      const sk = G(S, '_skladba');
      let prompt, kusy = [];
      if (typeof sk === 'function') { const r = sk(build, [u, runa, 'en', []]); prompt = r.text; kusy = r.kusy; }
      else prompt = build(u, runa, 'en', []);
      prompt = dosad(prompt, S, d);
      if (prompt) {
        if (d.thought && typeof G(S, '_thoughtLine') === 'function') prompt += '\n' + G(S, '_thoughtLine')('en', runa);
        if (typeof G(S, '_lengthReminder') === 'function') { const r = G(S, '_lengthReminder')('en'); if (r) prompt += '\n' + r; }
        const radky = [];
        for (const l of prompt.split('\n')) if (l.trim()) {
          const kus = kusy.find((k) => k.text.indexOf(l.trim().slice(0, 40)) !== -1);
          radky.push({ kde: 'prompt čtení' + (kus ? ' · ' + kus.kus : ''), text: l.trim() });
        }
        let sekce = 'systém';
        const sys = G(S, 'buildSysPrompt');
        if (typeof sys === 'function') for (const l of String(sys(null, 'en')).split('\n')) if (l.trim()) {
          if (/^[A-Z][A-Z &]{3,}$/.test(l.trim())) sekce = 'systém · ' + l.trim();
          radky.push({ kde: sekce, text: l.trim() });
        }
        if (u.area || u.seeking || u.intention || u.question) radky.push({ kde: 'co člověk vyplnil', text: [u.area, u.seeking, u.intention, u.question].filter(Boolean).join(' · ') });
        return { commit: c, uroven: 'prompt', radky };
      }
    } catch (e) { /* builder té doby s tímhle vstupem nejde — padá na úroveň kódu */ }
  }
  return { commit: c, uroven: 'kód', radky: radkyKodu(c) };
}

module.exports = { commitPro, kontext, dosad, promptCteni, radkyKodu, G, git, ROOT };
