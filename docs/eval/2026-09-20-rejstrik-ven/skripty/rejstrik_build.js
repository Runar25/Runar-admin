// CODE-read 2026-09-20 — TEST: ma radek rejstriku zustat v TELE single, kdyz uz rejstrik
// urcuje TVAR MOSTU? Owner: „ven a zmerit… pust ten rejstrik na rameni V."
// ⚠️ Stavim proti AKTUALNI PRODUKCI (34c1bbd v4.36): dosednuti do oblasti a tvar podle rejstriku
// UZ JSOU NASAZENE. Chybi jen vyjimka v zakazu oblasti (= rameno V, ktere vyhralo v testu (10)),
// tu doplnuji do obou ramen, aby se merila JEDNA vec.
//   A = radek rejstriku V TELE   (dnesek + vyjimka)
//   B = radek rejstriku PRYC     (dnesek + vyjimka)              ← navrh
// General Guidance se NEMERI: jeho tvar je z losu, takze v rameni B neni co poznat (zamer).
// Zbyle ctyri rejstriky maji kazdy vlastni tvar → slepa identifikace 1 ze 4, sance 25 %.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'rejstrik');
fs.mkdirSync(OUT, { recursive: true });

const AREA = 'Purpose & Path';
const ZAKAZ = 'Do not tell them where they are headed.';
const VYJIMKA = 'Do not tell them where they are headed — except in the closing line, and there only as a possibility they may weigh.';

const REJ = [
  { slug: 'clarity',   seek: 'Clarity',
    radek: 'Bring one thing into focus, not one answer; sharpen what matters and leave the deciding to them.' },
  { slug: 'confirm',   seek: 'Confirmation',
    radek: 'Neither confirm nor refute; describe the ground beneath the decision and what the image leaves standing just out of frame.' },
  { slug: 'challenge', seek: 'Insight into Challenge',
    radek: 'Name the friction honestly, without softening it into comfort.' },
  { slug: 'reflect',   seek: 'Reflection',
    radek: 'Open a mirror, not an answer; turn them inward.' },
];
const RUNY = ['Jera', 'Laguz'];   // obe lehke

function box() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {};
  S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
const S = box();
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);

let n = 0;
for (const r of RUNY) for (const j of REJ) {
  const u = `{name:"Kuky",area:${JSON.stringify(AREA)},seeking:${JSON.stringify(j.seek)}}`;
  const base = vm.runInContext(`buildReadingPromptSingle(${u},RUNES.filter(function(x){return x.n===${JSON.stringify(r)};})[0],"en",[])`, S);
  if (base.split(j.radek).length !== 2) throw new Error(r + '/' + j.slug + ': radek rejstriku neni prave jednou');
  if (base.split(ZAKAZ).length !== 2) throw new Error(r + '/' + j.slug + ': zakaz neni prave jednou');
  const konec = (base.match(/End on [^\n]*/g) || []);
  if (konec.length !== 1) throw new Error(r + '/' + j.slug + ': konec neni prave jeden');
  if (konec[0].indexOf('in where the seeker is going') === -1)
    throw new Error(r + '/' + j.slug + ': most nedosedl do oblasti — produkce se zmenila?');

  const V = base.replace(ZAKAZ, VYJIMKA);                       // zaklad = rameno V
  const ramena = { A: V, B: V.replace(' ' + j.radek, '').replace(j.radek, '') };
  for (const [id, user] of Object.entries(ramena)) {
    if (user.indexOf(VYJIMKA) === -1) throw new Error(id + ': vyjimka chybi');
    if (id === 'B' && user.indexOf(j.radek) !== -1) throw new Error('B: radek rejstriku tam porad je');
    if (id === 'A' && user.indexOf(j.radek) === -1) throw new Error('A: radek rejstriku chybi');
    fs.writeFileSync(path.join(OUT, id + '-' + j.slug + '-' + r.toLowerCase() + '.txt'),
      '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
    n++;
  }
  console.log((r + '/' + j.slug).padEnd(20) + konec[0].slice(0, 58) + '…');
}
console.log('\nhotovo: ' + n + ' promptu ve ' + OUT);
