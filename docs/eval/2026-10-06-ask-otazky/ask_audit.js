// CODE-tune 2026-10-06 — rozbor otázek z nabídky Asku na ownerových čteních (KUKY „projdi ostatní otázky v ASK, jestli jsou správně
// formulované. Najdi si je v mých čteních… už teď bys měl vidět vzorec, co nechceme a co chceme“).
// Každou otázku přiřadí k šabloně z UI_TEXT (EN i IS, {rune}/{life}/{area} = cokoli) a u každé šablony měří:
//   ozvěna otázky  = podíl odpovědí, které obsahují slovní spojení z otázky (bez dosazených jmen; „I/my/me“ → „you/your“)
//   ozvěna pokynu  = věty, které vznikají z pokynů promptu, ne z obrazu („the rune does not say“, „drawn here“, „leaves … open“…)
//   stejná fráze   = trojice slov, které se opakují ve ≥ 30 % odpovědí téže šablony
//   začátek        = nejčastější první dvě slova odpovědi
// Data (ownerova čtení) jsou mimo repo: node ask_audit.js <export.json> [od-data] → ask_audit.md vedle skriptu (jen čísla a fráze).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '..', '..', '..', 'v2') + path.sep;
const S = { console: { log() {} }, document: { getElementById: () => null }, localStorage: { getItem: () => null, setItem() {} } };
S.window = S; vm.createContext(S);
vm.runInContext(fs.readFileSync(D + 'runar-translations.js', 'utf8'), S);
const U = vm.runInContext('UI_TEXT', S);
const src = fs.readFileSync(process.argv[2], 'utf8');
const rows = (() => { const j = JSON.parse(src.slice(src.search(/[\[{]/))); return Array.isArray(j) ? j : j.rows; })();
const OD = process.argv[3] || '';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SABLONY = [];
for (const k of Object.keys(U.en).filter((k) => /^ask_h_/.test(k)))
  for (const L of ['en', 'is']) {
    const t = U[L][k]; if (!t) continue;
    const kusy = t.replace(/[?.]\s*$/, '').split(/\{(?:rune|life|area)\}/).map(esc);
    const re = new RegExp('^\\s*' + kusy.join('(.+?)') + '\\s*[?.]?\\s*$', 'i');
    SABLONY.push({ k, L, re, text: t });
  }
const STOP = new Set('the a an of in on to this that is are be what does do my me i you your it its how why with for about and or'.split(' '));
const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-záðéíóúýþæö' ]+/gi, ' ').replace(/\s+/g, ' ').trim();
const naYou = (s) => s.replace(/\bi\b/g, 'you').replace(/\bmy\b/g, 'your').replace(/\bme\b/g, 'you').replace(/\bam\b/g, 'are');
function spojeni(q, dosazene) {   // dvojice a trojice slov z otázky, které nejsou jen výplň a neobsahují dosazená jména
  let w = naYou(norm(q)).split(' ');
  const jmena = new Set(dosazene.map((x) => norm(x)).join(' ').split(' ').filter(Boolean));
  const out = new Set();
  for (const n of [3, 2]) for (let i = 0; i + n <= w.length; i++) {
    const g = w.slice(i, i + n); if (g.some((x) => jmena.has(x))) continue;
    if (g.every((x) => STOP.has(x))) continue;
    if (n === 2 && g.filter((x) => !STOP.has(x)).length < 1) continue;
    out.add(g.join(' '));
  }
  return [...out];
}
const POKYNY = [
  ['„the rune/reading does not say…“', /\b(the )?(rune|reading|picture|image) (does not|doesn't|cannot|can't) (say|tell|decide|show)/i],
  ['„drawn here / not drawn“', /drawn here|rune drawn|not (one of|among) the runes|was not drawn|is not a second rune/i],
  ['„leaves … open“', /\bleaves? (that|it|this|the [a-z]+|room)? ?(question )?open\b|left open\b/i],
  ['„not a promise / not a verdict“', /\bnot a (promise|verdict|prediction|sign)\b/i],
  ['„without the image“ v odpovědi', /without the (image|picture)/i],
];
const skup = {};
let celkem = 0, vlastni = 0;
for (const r of rows) {
  if (OD && String(r.drawn_at) < OD) continue;
  for (const f of r.follow_up || []) {
    const q = String(f.q || '').trim(), a = String(f.a || '').trim(); if (!q || !a) continue;
    celkem++;
    let hit = null, dos = [];
    for (const s of SABLONY) { const m = q.match(s.re); if (m) { hit = s; dos = m.slice(1); break; } }
    const k = hit ? hit.k : '(vlastní otázka)'; if (!hit) vlastni++;
    const g = skup[k] = skup[k] || { n: 0, modely: {}, ozvena: 0, pokyny: {}, troj: {}, zacatky: {}, slov: 0, priklady: [] };
    g.n++; const mdl = String((f.usage && f.usage.model) || r.model || '?').replace('claude-', ''); g.modely[mdl] = (g.modely[mdl] || 0) + 1;
    const an = naYou(norm(a));
    if (hit && spojeni(q, dos).some((sp) => an.includes(sp))) g.ozvena++;
    for (const [jm, re] of POKYNY) if (re.test(a)) g.pokyny[jm] = (g.pokyny[jm] || 0) + 1;
    const w = norm(a).split(' '); const vid = new Set();
    for (let i = 0; i + 3 <= w.length; i++) { const t = w.slice(i, i + 3); if (t.every((x) => STOP.has(x))) continue; const s3 = t.join(' '); if (!vid.has(s3)) { vid.add(s3); g.troj[s3] = (g.troj[s3] || 0) + 1; } }
    const z = w.slice(0, 2).join(' '); g.zacatky[z] = (g.zacatky[z] || 0) + 1;
    g.slov += w.length;
    if (g.priklady.length < 2) g.priklady.push({ q, a: a.slice(0, 220) });
  }
}
const pct = (a, n) => n ? Math.round(100 * a / n) + ' %' : '—';
let md = '# Otázky z nabídky Asku — rozbor ownerových čtení\n\n' + (OD ? 'Od ' + OD + '. ' : '') + 'Asků ' + celkem + ', z toho vlastních otázek ' + vlastni + '.\n\n'
  + '| šablona | n | modely | ozvěna otázky | ozvěna pokynu | stejná fráze (≥ 30 %) | začátek | slov |\n|---|---|---|---|---|---|---|---|\n';
for (const [k, g] of Object.entries(skup).sort((a, b) => b[1].n - a[1].n)) {
  const troj = Object.entries(g.troj).filter(([, c]) => c >= Math.max(2, 0.3 * g.n)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, c]) => '„' + t + '“ ' + c);
  const zac = Object.entries(g.zacatky).sort((a, b) => b[1] - a[1])[0];
  const pok = Object.entries(g.pokyny).sort((a, b) => b[1] - a[1]).map(([t, c]) => t + ' ' + c).join(' · ');
  md += '| ' + k + ' | ' + g.n + ' | ' + Object.entries(g.modely).map(([m, c]) => m + ' ' + c).join(', ') + ' | ' + pct(g.ozvena, g.n) + ' | ' + (pok || '—') + ' | '
    + (troj.join(' · ') || '—') + ' | „' + (zac ? zac[0] : '') + '“ ' + (zac ? zac[1] : '') + ' | ' + Math.round(g.slov / g.n) + ' |\n';
}
fs.writeFileSync(path.join(__dirname, 'ask_audit' + (OD ? '_od_' + OD.slice(0, 10) : '') + '.md'), md);
console.log(md);
fs.writeFileSync(path.join(process.env.TEMP || '.', 'ask_audit_priklady.json'), JSON.stringify(skup, null, 1));
