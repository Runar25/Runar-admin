// Islandská čtení přes Greynir (lokálně, zdarma) — krok rutiny „načti reporty“ (scripts/nacti_cteni.js).
//
// Proč (CODE-tune 2026-10-14, owner „zdarma ano“): hlášení 6282e405 — „Potřebuju najít řešení jak IS čtení analyzovat. Jestli je IS
// dobrá.“ Navazuje na smyčku ze skutečných čtení (DECISIONS 2026-09-23 (6) bod 3, RUNAR_BACKLOG.md). První běh 2026-10-14 na 14 IS
// čteních (109 vět) našel jednu jistou chybu („bertum“ → korekce, DECISIONS 2026-10-14 (3)) a 23 vět s nálezem, které chybou nebyly.
// Tady se dělá totéž pokaždé samo, jen na nových čteních (okno = čtení, která nacti_cteni.js právě načetl).
//
// Co dělá: z islandských čtení (text bez řádku ✦ i řádek ✦, u spreadu deep_text — totéž pravidlo jako elevenlabs-proxy; a Asky) udělá věty,
// pustí na ně `is-greynir.py` (lokálně, text nikam neodchází; nástroje a pořadí kontroly IS → CLAUDE.md §2) a vypíše nálezy. Plané poplachy odfiltruje podle měření
// z 2026-10-14 (109 vět, 0 skutečných chyb v těchto třídách): P_VeraAð styl „er að + infinitiv“ · P_NT_SvigaInnihaldNl oslovení jménem ·
// S004/S005/W001 „oprava“ jména runy nebo slova s „rún“ (Perþ → Perú, Lífsrúnin → Lífbrúnin, rúnin → rúin). E001 (věta nerozebraná)
// zůstává jako žlutá — „nerozebráno“ ≠ „v pořádku“ (§19.2).
// Z002 (velké písmeno po dvojtečce) se NEzahazuje, jen nese pravidlo. Do 2026-10-14 večer se zahazoval s odůvodněním „v islandštině se po
// dvojtečce píše malé“ — výmysl (§23). Ritreglur Íslenskrar málnefndar § 29.4: velké písmeno, když za dvojtečkou stojí celá samostatná
// věta, jinak malé (výčet, přístavek, vedlejší věta). Doklad: ve 109 větách 7× Z002 — 4 skutečné chyby („Ehwaz í Skuld: þráðurinn
// liggur…“, Asky modelu Opus 5 v4.84/v4.90) a 3 plané (výčet, přístavek, věta s „að“; GPT-6 sol). Na vadu filtru ukázal test ByT5,
// který „Eihwaz í Verðandi: það…“ opravil na „Það“ stejně jako Greynir, kterého filtr umlčel.
// Výstup jen do terminálu, jména uživatelů maskovaná (maskuj_jmena.js) — věty nesou texty lidí, do repa nepatří (RUNAR_PRIVACY.md).
// Co dál s nálezem dělá session: ověří ho korpusem (`python -X utf8 is-vazba.py --freq "<obrat>"`), potvrzená chyba jde do korekcí
// v DB + BAD_PATTERNS (DECISIONS 2026-09-23 (6)). Greynir nevidí kalky ani idiomy (hlavička is-greynir.py) — čisté čtení ≠ dobrá islandština.
//   node scripts/utils/is_greynir_cteni.js <cteni.json>     · soubor, který zapsal nacti_cteni.js (pole řádků readings)
//   node scripts/utils/is_greynir_cteni.js --test           · obhajoba: „bertum“ najde, plané poplachy odfiltruje (Greynir naostro, bez DB)
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..', '..');

const PRESKOC_KODY = new Set(['P_VeraAð', 'P_NT_SvigaInnihaldNl']);   // Z002 ne — viz hlavička (Ritreglur § 29.4)
const Z002_PRAVIDLO = '  (chyba jen když za dvojtečkou stojí celá samostatná věta — Ritreglur § 29.4; výčet, přístavek a vedlejší věta mají malé)';
function slovaRun() {
  const S = { console };
  vm.createContext(S);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', 'runar-runes.js'), 'utf8') + '\n;globalThis.__R = RUNES;', S);
  const w = new Set();
  for (const r of S.__R || []) for (const t of [r.n, r.is_n]) String(t || '').toLowerCase().split(/[^a-záðéíóúýþæö]+/).forEach((x) => x && w.add(x));
  return w;
}
function jeRunaNeboRun(slovo, RUNY) {
  const s = String(slovo || '').toLowerCase();
  return !!s && (RUNY.has(s) || s.indexOf('rún') !== -1);
}
function vety(text) {
  const out = [];
  for (const odst of String(text || '').split(/\n+/)) {
    const o = odst.trim();
    if (!o || /^[ᚠ-᛿]/.test(o)) continue;   // hlavička spreadu z glyfů a jmen run
    for (const v of o.split(/(?<=[.?!])\s+(?=[A-ZÁÐÉÍÓÚÝÞÆÖ\[„])/)) { const t = v.replace(/^✦\s*/, '').trim(); if (t) out.push(t); }
  }
  return out;
}
function pripravVety(rows) {
  const seznam = [];
  for (const r of rows) {
    if (r.lang !== 'is') continue;
    const id = String(r.id || '').slice(0, 8), runa = r.rune_name || '?';
    const zdroj = r.area === 'spread' ? (r.deep_text || r.short_text) : r.short_text;   // jako elevenlabs-proxy
    for (const v of vety(zdroj)) seznam.push({ v, id, runa, kde: 'čtení' });
    for (const f of (Array.isArray(r.follow_up) ? r.follow_up : [])) for (const v of vety(f && f.a)) seznam.push({ v, id, runa, kde: 'Ask' });
  }
  return seznam;
}
function greynir(seznam) {
  const tmp = path.join(os.tmpdir(), 'runar_is_vety_' + process.pid + '.txt');
  fs.writeFileSync(tmp, seznam.map((x) => x.v.replace(/\s+/g, ' ')).join('\n') + '\n');
  const r = cp.spawnSync('python', ['-X', 'utf8', path.join(ROOT, 'is-greynir.py'), tmp], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000 });
  try { fs.unlinkSync(tmp); } catch (e) {}
  if (r.status === 2 || r.error || !/textů, \d+ s nálezem/.test(r.stdout || '')) return { chyba: ((r.stdout || '') + (r.stderr || '') + (r.error ? r.error.message : '')).trim().slice(-300) };
  const nalezy = [];
  let i = null;
  for (const l of String(r.stdout).split(/\r?\n/)) {   // Python na Windows píše \r\n — JS „.“ ani „$“ přes \r nejdou
    const h = /^\s*\[(\d+)\] NÁLEZ/.exec(l);
    if (h) { i = Number(h[1]) - 1; continue; }
    if (/^\s*\[\d+\] OK/.test(l)) { i = null; continue; }
    const n = /^\s{6,}(\S+) „(.*?)“: (.*?)(?: → (.*))?$/.exec(l);
    if (n && i !== null) nalezy.push({ i, kod: n[1], usek: n[2], popis: n[3], navrh: n[4] || '' });
  }
  const varovani = String(r.stdout).split(/\r?\n/).filter((l) => /^⚠/.test(l));
  return { nalezy, varovani };
}
function roztrid(nalezy, RUNY) {
  const zustava = [], odfiltrovano = {};
  for (const n of nalezy) {
    const kod = n.kod.split('/')[0];
    const puvodni = (/(?:Orðið|Rita á) '([^']+)'/.exec(n.popis) || [])[1] || n.usek;   // S004/W001 „Orðið 'X'“, S005 „Rita á 'X' sem …“
    const plany = PRESKOC_KODY.has(kod) || (/^(S004|S005|W001)$/.test(kod) && jeRunaNeboRun(puvodni, RUNY));
    if (plany) odfiltrovano[kod] = (odfiltrovano[kod] || 0) + 1; else zustava.push(Object.assign(n, { puvodni }));
  }
  return { zustava, odfiltrovano };
}

function main(rows, maskuj) {
  const seznam = pripravVety(rows);
  const nIs = new Set(seznam.map((x) => x.id)).size;
  if (!seznam.length) { console.log('   žádná nová islandská čtení'); return { zustava: [] }; }
  const g = greynir(seznam);
  if (g.chyba) { console.log('   ⚠ Greynir neběží — islandská čtení NEZKONTROLOVÁNA: ' + g.chyba); return { chyba: true }; }
  const { zustava, odfiltrovano } = roztrid(g.nalezy, slovaRun());
  const vetSNalezem = new Set(zustava.map((n) => n.i)).size;
  console.log('   ' + nIs + ' IS čtení · ' + seznam.length + ' vět · k ověření ' + zustava.length + ' nálezů v ' + vetSNalezem + ' větách'
    + (Object.keys(odfiltrovano).length ? ' · plané poplachy odfiltrované: ' + Object.entries(odfiltrovano).map(([k, n]) => k + ' ' + n).join(', ') : ''));
  for (const n of zustava) {
    const x = seznam[n.i] || {};
    console.log('   · ' + x.id + ' ' + x.runa + ' (' + x.kde + ') — ' + n.kod + ' „' + maskuj(n.puvodni || n.usek) + '“' + (n.navrh ? ' → Greynir navrhuje ' + maskuj(n.navrh) : '')
      + (n.kod === 'E001' ? '  (věta nerozebraná — ověř korpusem)' : '')
      + (n.kod.split('/')[0] === 'Z002' ? Z002_PRAVIDLO : ''));
    console.log('       ' + maskuj(x.v).slice(0, 160));
  }
  if (zustava.length) console.log('   Každý nález ověř korpusem (python -X utf8 is-vazba.py --freq "<obrat>"); potvrzená chyba → korekce v DB + BAD_PATTERNS (DECISIONS 2026-09-23 (6)).');
  for (const v of g.varovani) console.log('   ' + v);
  return { zustava, odfiltrovano };
}

if (process.argv.includes('--test')) {
  // Smyšlená čtení: „bertum“ (neexistující tvar) musí zůstat a „Perþ“ (S004 → Perú) odfiltrovat. Velké písmeno po dvojtečce (Z002) NESMÍ
  // zmizet: „Ehwaz í Skuld: þráðurinn liggur…“ je podle Ritreglur § 29.4 chyba (celá věta za dvojtečkou) a filtr ji do 2026-10-14 zahazoval.
  const rows = [
    { id: 'test0001-x', lang: 'is', rune_name: 'Ingwaz', area: 'Inner Growth', short_text: 'Hryssan snýr höfðinu að bertum jarðvegi og stendur kyrr.', follow_up: [] },
    { id: 'test0002-x', lang: 'is', rune_name: 'Perth', area: 'Inner Growth', short_text: 'Perþ snýst um það sem sést aðeins um stund.', follow_up: [{ a: 'Ehwaz í Skuld: þráðurinn liggur núna í samfylgd.' }] },
    { id: 'test0003-x', lang: 'en', rune_name: 'Fehu', area: 'Inner Growth', short_text: 'This English line is not checked.', follow_up: [] },
  ];
  const v = main(rows, (t) => t);
  const kody = (v.zustava || []).map((n) => n.kod.split('/')[0]);
  const ok = !v.chyba && (v.zustava || []).some((n) => /bertum/.test(n.popis + n.usek + n.navrh) || /bertum/.test(n.usek))
    && kody.includes('Z002') && !(v.zustava || []).some((n) => /Perþ|Perú/.test(n.popis + n.usek));
  console.log(ok ? 'OK    is_greynir_cteni: „bertum“ najde, Perþ odfiltruje, velké písmeno po dvojtečce ukáže (§ 29.4), anglické čtení nekontroluje'
    : 'FAIL  is_greynir_cteni: ' + JSON.stringify(v.zustava || v).slice(0, 300));
  process.exit(ok ? 0 : 1);
} else {
  const soubor = process.argv[2];
  if (!soubor) { console.log('Použití: node scripts/utils/is_greynir_cteni.js <cteni.json> | --test'); process.exit(1); }
  let j = JSON.parse(fs.readFileSync(soubor, 'utf8'));
  if (!Array.isArray(j)) j = j.rows || [];
  let maskuj = (t) => t;
  try { const M = require('./maskuj_jmena.js'); const jm = M.nacti(ROOT); maskuj = (t) => M.maskuj(String(t || ''), jm); }
  catch (e) { maskuj = () => '(text skryt — jména z DB nejdou načíst)'; }
  main(j, maskuj);
}
