// Hlas Rúnara ve čtení — dá se měnit intonace? Čtyři varianty na dvou skutečných čteních (EN single Hagalaz, IS single Isa).
// Owner 2026-10-28: „jestli můžeme udělat změny pro čtení run … dají se pro čtení měnit intonace hlasu? Dokázal by to model pro výklad
// udělat? A jak to udělat. Najdi možnosti a ověř je. Najdi nejlepší řešení.“ Výchozí bod = hlas rituálu F (DECISIONS 2026-10-28 (3)).
//   R0 = dnešek: EN eleven_multilingual_v2 / IS eleven_v3, nastavení z _shared/el_voice.ts, text jako v proxy (mezery slité)
//   R1 = eleven_v4, dnešní nastavení — co udělá samotný model
//   R2 = v4 jako rituál, ale čtení není rituál: úvodní značka klidného hlasu, stabilita 0,5, rychlost 0,9, „…“ mezi větami
//   R3 = R2 + intonační značky, které do textu vloží MODEL VÝKLADU (sol, SOL_MODEL v claude-proxy). Pojistka: po odebrání značek musí
//        text sedět slovo od slova na originál — jinak varianta padá (model nesmí čtení přepsat).
//   R4 = R2 na eleven_v4_turbo (owner 2026-10-29: „dej mi i čtení EN a IS v4 turbo“; poloviční cena, umí IS)
// Každá nahrávka jde i do archivu hlasů (scripts/utils/hlas_archiv.js) i s textem, který zazněl — u R3 i se značkami od modelu.
// Texty čtení: ~/runar-eval/hlas-cteni/{en,is}.txt (z produkce přes najdi_cteni.js; do repa nepatří, DECISIONS 2026-08-08).
// Klíče: ~/.claude/runar-elevenlabs-key.txt, ~/.claude/runar-openai-key.txt (nikdy se nevypisují). Výstup ~/runar-eval/hlas-cteni/.
//   node docs/eval/2026-10-28-hlas-cteni/gen.js [--dry] [--jen R2,R3]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const R = path.resolve(__dirname, '..', '..', '..');
const el = fs.readFileSync(path.join(R, 'supabase/functions/_shared/el_voice.ts'), 'utf8');
const VOICE = el.match(/EL_VOICE_ID\s*=\s*"([^"]+)"/)[1];
const NAST = JSON.parse(el.match(/EL_VOICE_SETTINGS\s*=\s*(\{[\s\S]*?\});/)[1].replace(/(\w+):/g, '"$1":').replace(/,\s*}/, '}'));
const DNES = { en: el.match(/EL_MODEL_EN\s*=\s*"([^"]+)"/)[1], is: el.match(/EL_MODEL_IS\s*=\s*"([^"]+)"/)[1] };
const SOL = fs.readFileSync(path.join(R, 'supabase/functions/claude-proxy/index.ts'), 'utf8').match(/const SOL_MODEL = "([^"]+)"/)[1];
const OUT = path.join(os.homedir(), 'runar-eval', 'hlas-cteni');
const TEXT = { en: fs.readFileSync(path.join(OUT, 'en.txt'), 'utf8').trim(), is: fs.readFileSync(path.join(OUT, 'is.txt'), 'utf8').trim() };
for (const l of ['en', 'is']) TEXT[l] = TEXT[l].split('✦')[0].replace(/\s+/g, ' ').trim();   // = textKHlasu + normalizuj v proxy
const pauzy = (t) => t.replace(/([.!?])\s+/g, '$1 … ');
const ZNACKA = '[calm, warm and thoughtful voice] ';
const POVOLENE = ['[softly]', '[thoughtfully]', '[warmly]', '[gravely]', '[gently]', '[short pause]', '[long pause]'];
const bezZnacek = (t) => t.replace(/\[[^\]]*\]/g, ' ').replace(/…/g, ' ').replace(/\s+/g, ' ').replace(/\s+([.,!?;:])/g, '$1').trim();

async function reziser(l) {
  const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  const pokyn = 'You prepare a rune reading for spoken narration by a calm old rune keeper (ElevenLabs v4, which reads audio tags in square brackets). '
    + 'Insert between 2 and 4 audio tags where the voice should change: only from this list: ' + POVOLENE.join(' ') + '. '
    + 'Put a tag before the words it colours, or a pause tag between sentences. The reading is in ' + (l === 'is' ? 'Icelandic' : 'English')
    + '; the tags stay in English. Do NOT change, add, remove or reorder any word or punctuation of the reading. Return only the tagged reading.';
  let res, eff;
  for (eff of ['none', 'minimal']) {
    res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ model: SOL, max_completion_tokens: 900, reasoning_effort: eff, messages: [{ role: 'system', content: pokyn }, { role: 'user', content: TEXT[l] }] }) });
    if (res.status !== 400) break;
  }
  if (!res.ok) throw new Error('sol ' + res.status + ' ' + (await res.text()).slice(0, 200));
  const d = await res.json(), t = d.choices[0].message.content.trim();
  const zn = t.match(/\[[^\]]*\]/g) || [], cizi = zn.filter((z) => !POVOLENE.includes(z));
  const shoda = bezZnacek(t) === bezZnacek(TEXT[l]);
  return { t, zn, cizi, shoda, usage: d.usage };
}

const VAR = [
  { k: 'R0', popis: 'dnešek (' + DNES.en + ' / ' + DNES.is + ', stabilita ' + NAST.stability + ')', model: (l) => DNES[l], text: async (l) => TEXT[l], nast: NAST },
  { k: 'R1', popis: 'v4, dnešní nastavení', model: () => 'eleven_v4', text: async (l) => TEXT[l], nast: NAST },
  { k: 'R2', popis: 'v4 jako rituál pro čtení: značka klidného hlasu, stabilita 0,5, rychlost 0,9, pauzy mezi větami', model: () => 'eleven_v4',
    text: async (l) => ZNACKA + pauzy(TEXT[l]), nast: Object.assign({}, NAST, { stability: 0.5, speed: 0.9 }) },
  { k: 'R3', popis: 'R2 + intonační značky od modelu výkladu (' + SOL + ')', model: () => 'eleven_v4',
    text: async (l, info) => { const r = await reziser(l); info.reziser = r; if (!r.shoda || r.cizi.length) throw new Error('režisér změnil text nebo použil cizí značku: ' + JSON.stringify(r.cizi)); return ZNACKA + pauzy(r.t); },
    nast: Object.assign({}, NAST, { stability: 0.5, speed: 0.9 }) },
  { k: 'R4', popis: 'R2 na v4 Turbo (poloviční cena)', model: () => 'eleven_v4_turbo',
    text: async (l) => ZNACKA + pauzy(TEXT[l]), nast: Object.assign({}, NAST, { stability: 0.5, speed: 0.9 }) },
];

(async () => {
  const JEN = process.argv.includes('--jen') ? process.argv[process.argv.indexOf('--jen') + 1].split(',') : null;
  const dry = process.argv.includes('--dry');
  const KEY = dry ? '' : fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-elevenlabs-key.txt'), 'utf8').trim();
  const hotovo = [];
  for (const l of ['en', 'is']) for (const v of VAR) {
    if (JEN && !JEN.includes(v.k)) continue;
    const info = {};
    let text;
    try { text = dry && v.k === 'R3' ? '(režisér se v --dry nevolá)' : await v.text(l, info); } catch (e) { console.log(l, v.k, 'CHYBA', e.message); hotovo.push({ l, v, chyba: e.message, info }); continue; }
    if (dry) { console.log(l, v.k, v.model(l), JSON.stringify(v.nast), '|', text.length, 'zn |', text.slice(0, 90)); continue; }
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + '?output_format=mp3_44100_128', {
      method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: v.model(l), voice_settings: v.nast }) });
    if (!res.ok) { const e = (await res.text()).slice(0, 200); console.log(l, v.k, 'CHYBA', res.status, e); hotovo.push({ l, v, chyba: res.status + ' ' + e, info }); continue; }
    const f = 'cteni_' + l + '_' + v.k + '.mp3';
    const zvuk = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT, f), zvuk);
    require('../../../scripts/utils/hlas_archiv').uloz({ pokus: new Date().toISOString().slice(0, 10) + '-cteni', jmeno: 'cteni_' + l + '_' + v.k,
      popis: v.popis + (info.reziser ? ' · značky ' + info.reziser.zn.join(' ') : ''), jazyk: l, model: v.model(l), nastaveni: v.nast, text, mp3: zvuk });
    console.log(l, v.k, 'ok', f, text.length, 'zn', info.reziser ? '· značky ' + info.reziser.zn.join(' ') : '');
    hotovo.push({ l, v, f, text, model: v.model(l), info });
  }
  if (dry) return;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const radky = hotovo.map((p) => '<div class="r"><b>' + p.l.toUpperCase() + ' · ' + p.v.k + '</b> <span>' + esc(p.v.popis) + '</span><br>'
    + (p.f ? '<audio controls preload="metadata" src="' + p.f + '"></audio>' : '<i>chyba: ' + esc(p.chyba) + '</i>') + '<div class="t">' + esc(p.text || '') + '</div></div>').join('\n');
  fs.writeFileSync(path.join(OUT, 'poslech.html'), '<!doctype html><meta charset="utf-8"><title>Hlas ve čtení — varianty</title><style>body{font-family:Georgia,serif;background:#0f141f;color:#e8dcc2;max-width:760px;margin:24px auto;padding:0 16px}.r{border-bottom:1px solid #2e4a70;padding:14px 0}span{color:#9fb0c8;font-size:.9em}audio{width:100%;margin:8px 0}.t{font-size:.85em;color:#9fb0c8}</style><h1>Hlas Rúnara ve čtení — R0 až R3</h1><p>R0 dnešek · R1 v4 s dnešním nastavením · R2 v4 jako rituál pro čtení · R3 R2 + intonační značky od modelu výkladu</p>\n' + radky);
  fs.writeFileSync(path.join(OUT, 'vysledek.json'), JSON.stringify(hotovo.map((p) => ({ l: p.l, k: p.v.k, f: p.f, chyba: p.chyba, zn: p.info.reziser && p.info.reziser.zn, usage: p.info.reziser && p.info.reziser.usage })), null, 1));
  console.log('poslech:', path.join(OUT, 'poslech.html'));
  console.log('archiv:', require('../../../scripts/utils/hlas_archiv').poslech());
})();
