// PRISOUZENI VLASTNOSTI JEDNOTLIVYM PAKAM PROMPTU.
//
// Proc takhle a ne ctenim promptu: textovy pruchod po dvojicich pravidel neprosel kalibraci
// (2026-08-21 — hledac minul jeden ze dvou znamych rozporu, overovatel bud nepotvrdil nic,
// nebo hlasil i nevinne dvojice). Obe skutecne srazky toho dne nasel az soudce nad HOTOVYM
// ctenim. Tenhle skript to zobecnuje: kazdy clen kazdeho poolu dostane vlastni davku, zbytek
// zadani je zamceny, a merí se vlastnosti vystupu. Kdyz jedna vlastnost pada jen u jednoho
// clenu, viník je pojmenovany adresne.
//
// Vystup se UKLADA (KUKY 2026-08-21: „bude to zajimavy vystup i pro dalsi kalibraci") —
// cely text kazdeho cteni vcetne verdiktu, ne jen souhrn.
const fs = require('fs'), path = require('path'), vm = require('vm');
const KEY = fs.readFileSync(path.join(require('os').homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const REPO = path.resolve(__dirname, '..', '..');
const D = path.join(REPO, 'v2') + path.sep;
// POZOR: indexOf('--out') vraci -1, kdyz prepinac chybi, a argv[0] je cesta k node.exe —
// bez `includes` by se vystup „ukladal" do C:\Program Files\nodejs. Narazeno na to.
const VEN = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(REPO, 'docs', 'eval', '2026-08-21-attribution');
const LANGS = (process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'en,is').split(',');
const N = parseInt(process.argv.includes('--n') ? process.argv[process.argv.indexOf('--n') + 1] : '8', 10);
const JEN = process.argv.includes('--jen') ? process.argv[process.argv.indexOf('--jen') + 1] : '';

const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = 'en';
S.document = { getElementById: () => null, querySelector: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);
const RUNES = vm.runInContext('RUNES', S);
const HEAVY = vm.runInContext('typeof HEAVY_RUNES !== "undefined" ? HEAVY_RUNES.names : []', S);
const zJaz = (jm, L) => (vm.runInContext('typeof ' + jm + ' !== "undefined" ? ' + jm + ' : {}', S) || {})[L] || [];
const glob = (jm) => vm.runInContext('typeof ' + jm + ' !== "undefined" ? ' + jm + ' : null', S);

// Zamcene zadani: lehke runy (aby se losoval OPEN pool), pevne hledani i zamer, bez cocky.
const LEHKE = RUNES.filter(r => HEAVY.indexOf(r.n) === -1);
const TEZKE = RUNES.filter(r => HEAVY.indexOf(r.n) !== -1);

function ramena(L) {
  const A = [];
  const uhly = L === 'is' ? glob('READING_ANGLES_IS') : glob('READING_ANGLES');
  const open = L === 'is' ? glob('ENDING_OPEN_IS') : glob('ENDING_OPEN');
  const heavy = L === 'is' ? glob('ENDING_HEAVY_IS') : glob('ENDING_HEAVY');
  uhly.forEach((t, i) => A.push({ pool: 'uhel', idx: i, text: t, tezka: false }));
  open.forEach((t, i) => A.push({ pool: 'zakonceni_open', idx: i, text: t, tezka: false }));
  heavy.forEach((t, i) => A.push({ pool: 'zakonceni_heavy', idx: i, text: t, tezka: true }));
  zJaz('AREAS', L).forEach((a, i) => A.push({ pool: 'oblast', idx: i, text: a, tezka: false }));
  return A;
}

// Vnucení jednoho clenu poolu: pool se v sandboxu zkrati na nej jedineho, takze losovani
// nema z ceho vybirat. Meni se JEN to; vsechno ostatni v promptu zustava produkcni.
function vnut(r, L) {
  const jm = { uhel: L === 'is' ? 'READING_ANGLES_IS' : 'READING_ANGLES',
               zakonceni_open: L === 'is' ? 'ENDING_OPEN_IS' : 'ENDING_OPEN',
               zakonceni_heavy: L === 'is' ? 'ENDING_HEAVY_IS' : 'ENDING_HEAVY' }[r.pool];
  vm.runInContext('__zaloha = { a: (typeof READING_ANGLES!=="undefined"?READING_ANGLES.slice():null), ai: (typeof READING_ANGLES_IS!=="undefined"?READING_ANGLES_IS.slice():null),'
    + ' o: ENDING_OPEN.slice(), oi: ENDING_OPEN_IS.slice(), h: ENDING_HEAVY.slice(), hi: ENDING_HEAVY_IS.slice() };', S);
  if (jm) vm.runInContext(jm + '.length = 0; ' + jm + '.push(' + JSON.stringify(r.text) + ');', S);
}
function vrat() {
  vm.runInContext('READING_ANGLES.length=0; __zaloha.a.forEach(function(x){READING_ANGLES.push(x)});'
    + 'READING_ANGLES_IS.length=0; __zaloha.ai.forEach(function(x){READING_ANGLES_IS.push(x)});'
    + 'ENDING_OPEN.length=0; __zaloha.o.forEach(function(x){ENDING_OPEN.push(x)});'
    + 'ENDING_OPEN_IS.length=0; __zaloha.oi.forEach(function(x){ENDING_OPEN_IS.push(x)});'
    + 'ENDING_HEAVY.length=0; __zaloha.h.forEach(function(x){ENDING_HEAVY.push(x)});'
    + 'ENDING_HEAVY_IS.length=0; __zaloha.hi.forEach(function(x){ENDING_HEAVY_IS.push(x)});', S);
}

async function claude(sys, obsah, maxTok, model) {
  for (let p = 0; p < 4; p++) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: model || 'claude-opus-4-8', max_tokens: maxTok,
          system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: obsah }] }),
      });
      const d = await r.json();
      if (r.ok) return (d.content || []).map(c => c.text).join('');
      if (r.status !== 429 && r.status < 500) return null;
    } catch (e) { /* sit — zkusit znovu */ }
    await new Promise(res => setTimeout(res, 1500 * (p + 1)));
  }
  return null;
}

const SOUDCE_CHLAD = [
  'You grade rune readings for ONE property: COLD READING.',
  'A reading COLD-READS when it asserts something it cannot know and the reader cannot',
  'disconfirm: (a) the reader\'s inner state or knowledge; (b) a claim smuggled inside a',
  'question the reader cannot answer without accepting it; (c) a claim about another person',
  'or about events in the reader\'s life.',
  'It does NOT cold-read when it only places the reader inside the IMAGE, describes the world,',
  'names what the rune is, or asks a question that can honestly be answered "no" / "neither".',
  'The word "already" is not the test. The test is whether a claim is made.',
  'One word: YES (it cold-reads) or NO.',
].join('\n');

const SOUDCE_SMYSL = [
  'You grade rune readings for ONE property.',
  'PROPERTY: does the reading state, in ordinary words, WHAT THE RUNE STANDS FOR — a sense a',
  'reader who has never heard of this rune could grasp — as opposed to only placing the rune',
  'inside a picture?',
  'Icelandic texts are judged by the same rule.',
  'One word: YES or NO.',
].join('\n');

const slov = t => (t.trim().match(/\S+/g) || []).length;
const vet = t => (t.replace(/\s+/g, ' ').match(/[.!?…]+(\s|$)/g) || []).length;

(async () => {
  fs.mkdirSync(VEN, { recursive: true });
  const zaznamy = [];
  for (const L of LANGS) {
    const AREAS = zJaz('AREAS', L), SEEKS = zJaz('SEEKS', L), INT = zJaz('INTENTIONS', L);
    const R = ramena(L).filter(r => !JEN || r.pool === JEN);
    for (const r of R) {
      vnut(r, L);
      const sada = r.tezka ? TEZKE : LEHKE;
      const ulohy = [];
      for (let i = 0; i < N; i++) {
        const runa = sada[i % sada.length];
        const u = { name: 'Anna', seeking: SEEKS[1] || SEEKS[0], intention: INT[0], question: '', lifeRune: null,
                    area: r.pool === 'oblast' ? r.text : (AREAS[2] || '') };
        const prompt = S.buildReadingPrompt(u, runa, L, null);
        const sys = S.buildSysPrompt(null, L);
        ulohy.push({ runa: runa.n, prompt, sys, oblast: u.area });
      }
      vrat();
      const hotove = [];
      for (let i = 0; i < ulohy.length; i += 4) {
        const c = ulohy.slice(i, i + 4);
        const t = await Promise.all(c.map(x => claude(x.sys, x.prompt, 700)));
        t.forEach((txt, k) => {
          if (!txt) return;
          const roz = (typeof S._parseSegments === 'function') ? S._parseSegments(txt.trim()) : null;
          hotove.push({ ...c[k], text: (roz && roz.reading) ? roz.reading : txt.trim() });
        });
      }
      for (let i = 0; i < hotove.length; i += 4) {
        const c = hotove.slice(i, i + 4);
        const chl = await Promise.all(c.map(x => claude(SOUDCE_CHLAD, 'Reading:\n"' + x.text + '"', 5)));
        const sm = await Promise.all(c.map(x => claude(SOUDCE_SMYSL, 'Rune drawn: ' + x.runa + '\n\nReading:\n"' + x.text + '"', 5)));
        c.forEach((x, k) => zaznamy.push({
          lang: L, pool: r.pool, idx: r.idx, paka: r.text, rune: x.runa, oblast: x.oblast,
          text: x.text, slov: slov(x.text), vet: vet(x.text),
          chlad: (chl[k] || '').trim().toUpperCase().indexOf('YES') === 0,
          smysl: (sm[k] || '').trim().toUpperCase().indexOf('YES') === 0,
        }));
      }
      const skup = zaznamy.filter(z => z.lang === L && z.pool === r.pool && z.idx === r.idx);
      console.log('  ' + L + ' ' + (r.pool + '[' + r.idx + ']').padEnd(22)
        + ' chlad ' + skup.filter(z => z.chlad).length + '/' + skup.length
        + '  smysl ' + skup.filter(z => z.smysl).length + '/' + skup.length
        + '  ' + Math.round(skup.reduce((s, z) => s + z.slov, 0) / Math.max(1, skup.length)) + ' slov');
      fs.writeFileSync(VEN + '/readings.jsonl', zaznamy.map(z => JSON.stringify(z)).join(String.fromCharCode(10)));
    }
  }
  console.log('\n  ulozeno: ' + VEN + '/readings.jsonl   (' + zaznamy.length + ' cteni)');
})();
