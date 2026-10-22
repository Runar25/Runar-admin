// zakazy_promptu.mjs — SOUPIS ZÁKAZŮ v promptu: každá věta typu „never / do not / no … / aldrei / ekki …“, kde stojí (který prompt, který
// řádek runar-character.js) a které zákazy se opakují — v témže složeném promptu dvakrát, nebo jinde v jiném znění.
//
// Proč (owner 2026-10-22): „chci znovu provést kontrolu, abychom se vyvarovali, že vkládáme do míst ‚Rúnare, neříkej tohle a tamto‘, když
// už to někde v kódu je. Hlavní problém je, že o tom nemáš vůbec přehled.“ Prompt se skládá z vrstev (systémový prompt = charakter + hlas,
// prompt čtení / výkladu / Asku, korekce); zákaz přidaný do jedné vrstvy často už stál v jiné.
//
// Jak: prompty skládá PRODUKČNÍ balíček (supabase/functions/_shared/prompt_skladani.mjs = týž kód jako appka), engine sol, EN i IS,
// pro single, čtyři výklady, Ask, životní runu. Věta se zákazem = obsahuje zápor nebo „avoid / instead of“ (IS „ekki / aldrei / forðastu“).
// Opakování = dvě věty z různých míst, které sdílejí ≥ 60 % plnovýznamových slov (kmenů). Nástroj nerozhoduje, který zákaz je zbytečný —
// ukáže, kde stojí totéž dvakrát; jestli druhý výskyt něco přidává, rozhodne člověk (a případně test odebráním).
//
//   node scripts/zakazy_promptu.mjs                → souhrn do konzole
//   node scripts/zakazy_promptu.mjs --zapis <md>   → celý soupis do souboru (Markdown)
import fs from 'fs';
import { pathToFileURL } from 'url';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const { vytvorSkladani } = await import(pathToFileURL(ROOT + 'supabase/functions/_shared/prompt_skladani.mjs').href);
const KOD = fs.readFileSync(ROOT + 'v2/runar-character.js', 'utf8').split('\n');

const S = vytvorSkladani({ random: () => 0.37 });
S.nastav('engine', 'sol');
const R = (n) => S.RUNES.filter((r) => r.n === n)[0];
const U = { en: { name: 'Anna', area: 'Love', seeking: 'Clarity', question: '', intention: '' },
            is: { name: 'Anna', area: 'Ást', seeking: 'Skýrleiki', question: '', intention: '' } };
const PROMPTY = [];
for (const L of ['en', 'is']) {
  S.nastav('lang', L);
  const sys = S.buildSysPrompt(null, L);
  PROMPTY.push({ L, druh: 'systém (charakter + hlas)', text: sys });
  PROMPTY.push({ L, druh: 'čtení — jedna runa', text: S.buildReadingPrompt(U[L], R('Perth'), L, []) });
  PROMPTY.push({ L, druh: 'výklad — Norny', text: S.buildNornsPrompt(U[L], [R('Fehu'), R('Isa'), R('Perth')], L, []) });
  PROMPTY.push({ L, druh: 'výklad — Kompas', text: S.buildKrizPrompt(U[L], ['Fehu', 'Uruz', 'Isa', 'Perth', 'Algiz'].map(R), L, []) });
  PROMPTY.push({ L, druh: 'výklad — Podkova', text: S.buildHorseshoePrompt(U[L], ['Fehu', 'Uruz', 'Isa', 'Perth', 'Algiz', 'Sowilo', 'Tiwaz'].map(R), L, []) });
  PROMPTY.push({ L, druh: 'výklad — Yggdrasil', text: S.buildYggdrasilPrompt(U[L], ['Fehu', 'Uruz', 'Isa', 'Perth', 'Algiz', 'Sowilo', 'Tiwaz', 'Berkana', 'Ehwaz'].map(R), L, []) });
  PROMPTY.push({ L, druh: 'Ask', text: S.buildAskPrompt('READING TEXT.', 'QUESTION?', 'Perth', L, [], null, null, null, 'the hidden coming to light', []) });
  PROMPTY.push({ L, druh: 'životní runa', text: S.buildLifeRunePrompt('Anna', R('Perth'), 5, 3, null, L, []) });
}

const ZAKAZ = { en: /\b(never|not|no|don['’]?t|do not|avoid|without|nothing|nor|instead of|rather than|forbidden|must not)\b/i,
                is: /\b(aldrei|ekki|engin|ekkert|enga|engan|engum|forðastu|án|bannað|frekar en)\b/i };
const STOP = new Set(('the a an and or of to in on at for with is are be it this that as by from your you they their them his her he she its '
  + 'not no never do does dont don any one when if but so than then there what which who into out up over just only also each every '
  + 'og eða að í á um við er eru sem en ekki aldrei þú þinn þín þitt hann hún það þeir þær því þess hans hennar til frá með fyrir yfir '
  + 'undir eftir hvert hver hvað þegar ef svo eins líka bara einnig').split(' '));
const kmen = (w) => (w.length > 4 ? w.replace(/(ing|ed|es|s|e|ar|ir|ur|inn|in|um|a|i)$/, '') : w);
const slova = (t) => (String(t).toLowerCase().match(/[a-záðéíóúýþæö']+/g) || []).filter((w) => !STOP.has(w) && w.length > 2).map(kmen);
const vety = (t) => String(t).replace(/\n+/g, ' \n ').split(/(?<=[.!?])\s+|\s\n\s/).map((x) => x.trim()).filter((x) => x.length > 12);
function radekKodu(veta) {   // kde ve runar-character.js věta (nebo její delší kus) stojí — číslo řádku
  const kus = veta.replace(/["“”„]/g, '').split(/\s+/).slice(0, 7).join(' ');
  if (kus.length < 15) return null;
  for (let i = 0; i < KOD.length; i++) if (KOD[i].indexOf(kus) !== -1) return i + 1;
  const kus2 = veta.split(/\s+/).slice(2, 8).join(' ');
  for (let i = 0; i < KOD.length; i++) if (kus2.length > 15 && KOD[i].indexOf(kus2) !== -1) return i + 1;
  return null;
}

const Z = [];
for (const p of PROMPTY) for (const v of vety(p.text)) {
  if (!ZAKAZ[p.L].test(v)) continue;
  const k = new Set(slova(v));
  if (k.size < 2) continue;
  Z.push({ L: p.L, druh: p.druh, veta: v, kmeny: k, radek: radekKodu(v) });
}
// jedinečné zákazy (táž věta ve více promptech = sdílený blok, ne opakování) — klíč = text věty
const U2 = new Map();
for (const z of Z) { const key = z.L + '|' + z.veta; if (!U2.has(key)) U2.set(key, Object.assign({}, z, { kde: new Set([z.druh]) })); else U2.get(key).kde.add(z.druh); }
const J = [...U2.values()];
const podobnost = (a, b) => { let s = 0; for (const x of a.kmeny) if (b.kmeny.has(x)) s++; return s / Math.min(a.kmeny.size, b.kmeny.size); };
const DVOJICE = [];
for (let i = 0; i < J.length; i++) for (let j = i + 1; j < J.length; j++) {
  const a = J[i], b = J[j];
  if (a.L !== b.L) continue;
  const p = podobnost(a, b);
  if (p >= 0.6 && Math.min(a.kmeny.size, b.kmeny.size) >= 3) DVOJICE.push({ a, b, p });
}
// opakování UVNITŘ jednoho složeného promptu (systém + prompt typu) — to model dostane opravdu dvakrát
const spolu = (a, b) => [...a.kde].some((d) => b.kde.has(d) || d.startsWith('systém') || [...b.kde].some((e) => e.startsWith('systém')));

const out = [];
const L2 = (z) => (z.radek ? 'runar-character.js:' + z.radek : 'řádek nenalezen') + ' · ' + [...z.kde].join(', ');
out.push('# Soupis zákazů v promptu (' + new Date().toISOString().slice(0, 10) + ', balíček prompt_skladani, engine sol)\n');
for (const L of ['en', 'is']) {
  const jl = J.filter((z) => z.L === L), dv = DVOJICE.filter((d) => d.a.L === L).sort((x, y) => y.p - x.p);
  out.push('## ' + L.toUpperCase() + ' — ' + jl.length + ' vět se zákazem, ' + dv.length + ' podobných dvojic\n');
  out.push('### Podobné zákazy na dvou místech (≥ 60 % společných slov)\n');
  for (const d of dv) out.push('- **' + Math.round(d.p * 100) + ' %** ' + (spolu(d.a, d.b) ? '(model dostane OBA v jednom promptu)' : '(různé prompty)') + '\n  - „' + d.a.veta + '“ — ' + L2(d.a) + '\n  - „' + d.b.veta + '“ — ' + L2(d.b));
  out.push('\n### Všechny věty se zákazem\n');
  for (const z of jl) out.push('- „' + z.veta + '“ — ' + L2(z));
  out.push('');
}
const md = out.join('\n');
const zi = process.argv.indexOf('--zapis');
if (zi !== -1) { fs.writeFileSync(process.argv[zi + 1], md); console.log('zapsáno', process.argv[zi + 1]); }
for (const L of ['en', 'is']) {
  const dv = DVOJICE.filter((d) => d.a.L === L);
  console.log(L.toUpperCase() + ': vět se zákazem ' + J.filter((z) => z.L === L).length + ' · podobných dvojic ' + dv.length + ' · z toho v jednom promptu ' + dv.filter((d) => spolu(d.a, d.b)).length);
}
