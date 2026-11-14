// Lab 2026-11-14: složí produkční prompt single (buildery v2) a udělá v něm pojmenované změny. Nic nevolá.
// Úloha: { id, runa, seed, lang, zmeny: ['B1'|'B2'|'C'|'IS_SLOVA'], slova }  — každá náhrada musí sednout právě jednou, jinak chyba
// (volitelné náhrady jsou označené a jejich nesednutí se vypíše).
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
function jednou(t, stary, novy, id, volitelne) {
  const n = t.split(stary).length - 1;
  if (n !== 1) {
    if (volitelne && n === 0) { console.error('  [' + id + '] volitelná náhrada nesedla: ' + stary.slice(0, 50)); return t; }
    throw new Error(id + ': „' + stary.slice(0, 60) + '“ je v promptu ' + n + '×');
  }
  return t.replace(stary, () => novy);
}
const BLOK_IMAGE = 'THE IMAGE\nRúnar uses one image per reading and carries it through; he does not list images. A second picture earns its place only when it takes the first one further — the same scene, one step on. Two unrelated pictures side by side say nothing. Never a simile stacked on a metaphor. The image must connect to where this person is standing right now — atmosphere on its own is decoration, not a reading.\n';
const RADEK_RE = /IMAGE — the picture in this reading comes from here: (.+?) Let it become your own seeing in the text, down to one detail the sentence does not name\./;
function obrazNaJednoMisto(p, runa, id, novyRadek) {
  p = jednou(p, BLOK_IMAGE, '', id);
  const m = p.match(RADEK_RE); if (!m) throw new Error(id + ': řádek IMAGE nenalezen');
  p = p.replace(RADEK_RE, () => novyRadek.split('{X}').join(m[1]).split('{R}').join(runa));
  const e = p.match(/THE ESSENCE LINE: after the picture, one short line that begins ("[^"]+") and .*? No invented mechanism,/);
  if (!e) throw new Error(id + ': ESSENCE nenalezena');
  p = p.replace(e[0], () => 'THE ESSENCE LINE: one short line that begins ' + e[1] + " and gives the rune's own sense, in plain words a stranger to runes can grasp. No invented mechanism,");
  p = jednou(p, ' Describe the image; their inner life is not yours to narrate.', ' Their inner life is not yours to narrate.', id);
  return p;
}
const ZMENY = {
  // B1: totéž, co dnes říká pět míst, na jednom místě (obsah beze změny směru)
  B1: (x, u) => { x.p = obrazNaJednoMisto(x.p, u.runa, u.id, 'THE IMAGE — one picture for the whole reading, and it comes from here: {X} Make it your own seeing, down to one detail the sentence does not name, and carry it through; it must touch where this person stands right now. The meaning line comes after it.'); },
  // B2: jedno místo a jiný směr — obraz jednou větou, zbytek patří runě
  B2: (x, u) => { x.p = obrazNaJednoMisto(x.p, u.runa, u.id, 'THE IMAGE — the reading opens with this picture: {X} Give it one sentence, seen your own way, down to one detail the sentence does not name. The picture is there to show what {R} means in a life; every sentence after it belongs to the rune, not to the scene.'); },
  // C: ostatní zdvojení sjednocená (obrazové kusy nedotčené)
  C: (x, u) => {
    const id = u.id;
    x.sys = jednou(x.sys, 'Rúnar never predicts fate or claims absolute truths.\n', '', id);
    x.sys = jednou(x.sys, 'YOUR STANCE\nNever hand the seeker a conclusion.\n\n', '', id);
    x.sys = jednou(x.sys, 'Avoid abstract, mystical-sounding lines that say nothing plain — if it cannot be felt, it does not belong here.\n\n', '', id);
    x.sys = jednou(x.sys, '3. NO clichés, self-help/wellness phrasing, or modern slang.', '3. NO clichés, self-help/wellness phrasing, modern slang, or abstract, mystical-sounding lines that say nothing plain.', id);
    x.sys = jednou(x.sys, 'THE VOICE\nHe does not perform mysticism. He simply inhabits it.\n\n', '', id);
    x.sys = x.sys.replace(/\n*WHAT NEVER CHANGES\nRúnar never tells the seeker what to do — he names the shape of what is happening, never the step to take\.\s*$/, (m) => { x._wnc = 1; return ''; });
    if (!x._wnc) throw new Error(id + ': WHAT NEVER CHANGES nenalezeno');
    x.p = jednou(x.p, ' No invented mechanism, no fate. Never tell the seeker what it means for them.', ' No invented mechanism.', id);
    const nr = x.p.match(/NO COLD READING: .*\n/); if (!nr) throw new Error(id + ': NO COLD READING nenalezeno');
    x.p = x.p.replace(nr[0], () => 'ABOUT THE SEEKER — the one rule: you do not know this person. Never say what is true, stirring or known inside them, what the rune means for them, what will happen, or what they should do; no omen, no destiny at work, no conclusion handed over. Describe the image and name the rune; the rest is theirs.\n');
    x.p = jednou(x.p, ' One clear insight is enough — do not pack everything in.', '', id);
    x.p = jednou(x.p, ', never as something you know about them', '', id, true);
    x.p = x.p.replace(/\n*Length, once more: [^\n]*\s*$/, (m) => { x._len = 1; return ''; });
    if (!x._len) throw new Error(id + ': připomínka délky nenalezena');
  },
  // IS: obraz ne jako hotová věta, ale jako rozpojená slova (odložený test z BACKLOGu, bod 4)
  IS_SLOVA: (x, u) => { x.p = jednou(x.p, u.veta, u.slova, u.id); },
};
function postav(u) {
  const L = u.lang || 'en';
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var __s = ' + u.seed + '; Math.random = function () { __s = (__s * 16807) % 2147483647; return (__s - 1) / 2147483646; };', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var currentUser = null, userTier = "", userGender = "hk", lang = "' + L + '";', S);
  const G = (x) => vm.runInContext(x, S);
  const r = G('RUNES').find((x) => x.n === u.runa);
  const x = { sys: G('buildSysPrompt')(null, L),
    p: G('buildReadingPrompt')({ name: '', area: '', seeking: '', question: '', intention: '' }, r, L, []) + G('_promptKonec')('SINGLE', [r], L, false) };
  x.draws = (typeof S._promptDraws === 'function' && S._promptDraws(x.p, L)) || {};
  for (const z of u.zmeny || []) ZMENY[z](x, u);
  return x;
}
module.exports = { postav };
if (require.main === module) {
  const ulohy = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  for (const u of ulohy) {
    const x = postav(u);
    const slov = (t) => t.split(/\s+/).filter(Boolean).length;
    console.log('==== ' + u.id + ' | systém ' + slov(x.sys) + ' slov, zadání ' + slov(x.p) + ' slov | obraz: ' + (x.draws.image || '?'));
    if (process.argv.includes('--cely')) console.log(x.sys + '\n--- USER ---\n' + x.p + '\n');
  }
}
