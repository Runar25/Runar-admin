// odkud_slova.js — ODKUD JSOU SLOVA ČTENÍ: u každého čtení (a jeho Asků) najde úseky ≥ 3 slov, které stojí v něčem, co do čtení vstoupilo,
// a řekne v čem — obraz z losu, klíčové slovo, úhel, konec, podoba oblasti, otázka runy, význam runy, co člověk vyplnil, pevný text promptu
// (který řádek), u Asku text čtení a otázka. Co nikde nestojí, je modelovo vlastní; opakuje-li se to napříč čteními, je to zvyk modelu.
//
// Proč (owner 2026-10-22, nad rozborem čtení Perth): „tak jak teď analyzujeme čtení, budu chtít, abys prošel i starší čtení, třeba
// posledních cca 50 EN a IS, a zjistil, odkud ta slova vychází, přesně jako jsme to udělali teď.“ Monitor ozvěn (monitor_ozveny.js)
// počítá jen vybrané ozvěny přes všechna čtení; tohle je rozbor čtení po čtení (stejné vstupy, stejné ODKUD — funkce z monitoru).
//
// Hranice: pevný text promptu skládají DNEŠNÍ buildery — starší čtení vznikla ze starších verzí promptu (verze je u čtení), takže shoda
// s pevným textem je přibližná. Shoda neříká PŘÍČINU (slovo mohl model napsat i sám); příčinu dokáže jen test odebráním (§25).
// Výstup nese texty čtení a jména → jen mimo repo (cesta v --vystup, výchozí dočasná složka). Čtení odhlášených z analýzy se nečtou.
//
//   node scripts/odkud_slova.js [--en 50] [--is 50] [--vystup <cesta>]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const M = require('./monitor_ozveny.js');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };
const NEN = Number(arg('--en', 50)), NIS = Number(arg('--is', 50));
const VYSTUP = arg('--vystup', path.join(os.tmpdir(), 'runar_odkud_slova_' + new Date().toISOString().slice(0, 10) + '.md'));

function dotaz(lang, n) {
  const sql = "select id, drawn_at, lang, rune_name, area, aol, seeking, intention, question, short_text, deep_text, follow_up, prompt_draws, prompt_version, "
    + "usage->>'model' as model from " + M.CTENI + " where lang = '" + lang + "' and prompt_draws is not null order by drawn_at desc limit " + n;
  const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: M.ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return (Array.isArray(j) ? j : j.rows).reverse();
}

// úseky ≥ 3 slov výstupu, které stojí ve zdroji (alespoň jedno slovo mimo STOP); vrací [od, do) indexy slov výstupu
function useky(vystup, zdroj, min) {
  const z = ' ' + M.slova(zdroj).join(' ') + ' ', w = vystup, out = [];
  if (z.length < 3) return out;
  let i = 0;
  while (i < w.length) {
    let best = 0;
    for (let n = min; i + n <= w.length; n++) { if (z.indexOf(' ' + w.slice(i, i + n).join(' ') + ' ') !== -1) best = n; else break; }
    if (best && w.slice(i, i + best).some((x) => !M.STOP.has(x) && x.length > 2)) { out.push([i, i + best]); i += best; } else i++;
  }
  return out;
}

// zdroje jednoho čtení (pořadí = priorita, když úsek stojí ve více zdrojích)
function zdroje(r, L) {
  let d = r.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } } d = d || {};
  const Z = [];
  if (d.image) Z.push(['obraz z losu', d.image]);
  if (d.kws) Z.push(['klíčové slovo', d.kws]);
  if (d.verb !== undefined && M.SLOVESA_LOS[d.verb]) Z.push(['sloveso z losu', r.rune_name + ' ' + M.SLOVESA_LOS[d.verb]]);
  if (d.angle !== undefined && M.ANG[L][d.angle]) Z.push(['úhel', M.ANG[L][d.angle]]);
  const em = String(d.ending || '').match(/^(heavy|open)(\d+)$/);
  if (em && M.END[L][em[1]][Number(em[2])]) Z.push(['konec', M.END[L][em[1]][Number(em[2])]]);
  const ai = Math.max(M.AREAS.en.indexOf(r.aol || r.area), M.AREAS.is.indexOf(r.aol || r.area));
  if (ai >= 0 && d.area_face !== undefined && M.FACES[ai] && M.FACES[ai][d.area_face]) Z.push(['podoba oblasti', (M.FACES[ai][d.area_face][L] || []).join(' ')]);
  const oq = r.question ? '' : M.otazkaRuny(r.rune_name, L); if (oq) Z.push(['otázka runy (Kolekce)', oq]);
  const ru = M.RUNES.filter((x) => x.n === r.rune_name)[0];
  if (ru) Z.push(['význam runy', L === 'is' ? (ru.k_is || ru.k) : ru.k]);
  Z.push(['co člověk vyplnil', [r.aol || r.area, r.seeking, r.intention, r.question].filter(Boolean).join(' . ')]);
  return Z;
}

function rozebrat(text, Z, druhPromptu) {
  const w = M.slova(text), stitek = new Array(w.length).fill(null);
  for (const [jm, src] of Z) for (const [a, b] of useky(w, src, 3)) for (let k = a; k < b; k++) if (!stitek[k]) stitek[k] = jm;
  // pevný text promptu: úseky ≥ 4 slov, které stojí v řádku dnešního promptu (čtení / Ask)
  const B = M.bloky().filter((x) => x.druh === druhPromptu);
  const pevne = [];
  for (const blok of B) for (const [a, b] of useky(w, blok.text, 4)) {
    if (stitek.slice(a, b).some(Boolean)) continue;
    for (let k = a; k < b; k++) stitek[k] = 'pevný text promptu';
    pevne.push({ kus: w.slice(a, b).join(' '), radek: (blok.sek ? blok.sek + ' › ' : '') + blok.text.slice(0, 110) });
  }
  return { w, stitek, pevne };
}

function souhrnSlov(R) {
  const n = R.w.filter((x) => !M.STOP.has(x)).length || 1, poc = {};
  R.w.forEach((x, i) => { if (M.STOP.has(x)) return; const s = R.stitek[i] || 'vlastní (nikde ve vstupu)'; poc[s] = (poc[s] || 0) + 1; });
  return Object.entries(poc).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(100 * v / n) + ' %');
}
function zvyrazni(R) {   // úseky ze vstupu v textu: «úsek» [zdroj]
  const out = []; let i = 0;
  while (i < R.w.length) {
    const s = R.stitek[i];
    if (!s) { out.push(R.w[i]); i++; continue; }
    let j = i; while (j < R.w.length && R.stitek[j] === s) j++;
    out.push('«' + R.w.slice(i, j).join(' ') + '» [' + s + ']'); i = j;
  }
  return out.join(' ');
}

const md = ['# Odkud jsou slova čtení — ' + new Date().toISOString().slice(0, 10), '',
  'Úseky ≥ 3 slov (pevný prompt ≥ 4), které stojí ve vstupu čtení, jsou v «závorkách» se zdrojem. Pevný prompt = dnešní buildery (starší čtení mají starší verzi). Shoda není příčina.', ''];
const VLASTNI = {}, PEVNE = {}, CELKEM = {};
const pridejVlastni = (R, L) => {
  for (let i = 0; i + 3 <= R.w.length; i++) {
    const g = R.w.slice(i, i + 3);
    if (R.stitek.slice(i, i + 3).some(Boolean) || g.every((x) => M.STOP.has(x)) || g.some((x) => M.JMENA_RUN.has(x))) continue;
    const k = L + ' | ' + g.join(' '); VLASTNI[k] = (VLASTNI[k] || 0) + 1;
  }
};
for (const [L, n] of [['en', NEN], ['is', NIS]]) {
  if (!n) continue;
  const rows = dotaz(L, n);
  md.push('## ' + L.toUpperCase() + ' — ' + rows.length + ' čtení', '');
  for (const r of rows) {
    const Z = zdroje(r, L), txt = M.telo(r.area === 'spread' ? (r.deep_text || r.short_text) : r.short_text);
    const R = rozebrat(txt, Z, 'čtení');
    md.push('### ' + String(r.drawn_at).slice(0, 16) + ' · ' + r.rune_name + ' · ' + (r.area === 'spread' ? 'výklad' : 'jedna runa') + ' · ' + (r.prompt_version || '?') + ' · ' + (r.model || '?'));
    md.push('- vstupy: ' + Z.map(([jm, s]) => jm + ': „' + String(s).slice(0, 90) + '“').join(' · '));
    md.push('- podíl slov: ' + souhrnSlov(R).join(' · '));
    md.push('- text: ' + zvyrazni(R));
    for (const p of R.pevne) { md.push('  - pevný prompt: „' + p.kus + '“ ← ' + p.radek); PEVNE[L + ' | ' + p.kus] = (PEVNE[L + ' | ' + p.kus] || 0) + 1; }
    souhrnSlov(R).forEach((x) => { const m = x.match(/^(.*) (\d+) %$/); CELKEM[L + '|' + m[1]] = (CELKEM[L + '|' + m[1]] || []).concat(Number(m[2])); });
    pridejVlastni(R, L);
    for (const f of r.follow_up || []) {
      if (!f || !f.q || !f.a) continue;
      const ZA = [['text čtení', txt], ['otázka Asku', f.q]].concat(Z.filter(([jm]) => jm === 'klíčové slovo' || jm === 'význam runy'));
      const RA = rozebrat(f.a, ZA, 'ask');
      md.push('- **Ask:** „' + String(f.q).slice(0, 120) + '“');
      md.push('  - podíl slov: ' + souhrnSlov(RA).join(' · '));
      md.push('  - text: ' + zvyrazni(RA));
      for (const p of RA.pevne) { md.push('    - pevný prompt: „' + p.kus + '“ ← ' + p.radek); PEVNE[L + ' | ask: ' + p.kus] = (PEVNE[L + ' | ask: ' + p.kus] || 0) + 1; }
      pridejVlastni(RA, L);
    }
    md.push('');
  }
}
const prumer = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
md.push('## Souhrn', '', '### Průměrný podíl slov čtení podle zdroje (jen čtení, bez Asků)');
for (const L of ['en', 'is']) md.push('- ' + L.toUpperCase() + ': ' + Object.entries(CELKEM).filter(([k]) => k.startsWith(L + '|')).map(([k, v]) => [k.slice(3), prumer(v), v.length])
  .sort((a, b) => b[1] - a[1]).map(([k, p, c]) => k + ' ' + p + ' % (v ' + c + ' čteních)').join(' · '));
md.push('', '### Pevný text promptu, který se vrací (≥ 2×)');
Object.entries(PEVNE).filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([k, v]) => md.push('- ' + v + '× ' + k));
md.push('', '### Vlastní trojice slov modelu, které se opakují (≥ 3×) — zvyk modelu');
Object.entries(VLASTNI).filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, v]) => md.push('- ' + v + '× ' + k));
fs.writeFileSync(VYSTUP, md.join('\n'));
console.log('zapsáno (mimo repo — nese texty čtení):', VYSTUP);
console.log(md.slice(md.indexOf('## Souhrn')).join('\n'));
