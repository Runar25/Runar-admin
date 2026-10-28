// Hlas rituálu pod BEFORE WE BEGIN — čtyři varianty přednesu v EN i IS k poslechu (owner 2026-10-27: „chci přijít na to, jak měnit
// intonaci Rúnarova hlasu tak, aby to při čtení odpovídalo tomu, že to má navodit klidnou atmosféru“; „7. pusť“, klíč „8. máš ho tam“).
// Páky podle dokumentace ElevenLabs (ověřeno 2026-10-27): rychlost 0,7–1,2 (výchozí 1,0); výpustky „…“ = pauza; eleven_v3 bere popisné
// značky v [ ], značky <break> nebere; eleven_multilingual_v2 islandštinu neumí, eleven_v3 a eleven_v4 ano.
//   A = dnešní hlas appky (EN eleven_multilingual_v2 / IS eleven_v3, nastavení z _shared/el_voice.ts)
//   B = eleven_v3, rychlost 0,85, pauza „…“ mezi větami
//   C = B + úvodní značka klidného hlasu, stabilita 0,5 (značky na vysoké stabilitě slábnou)
//   D = eleven_v4, rychlost 0,85, pauza „…“ mezi větami
//   E = D s nastavením C (značka klidného hlasu, stabilita 0,5) + delší pauza před poslední větou „… …“ (owner 2026-10-28: „zkus D EN a IS
//       stejně jako C, trochu delší pauza před … When your mind settles“; „D IS je trochu hrubší hlas než v C, jde ho zjemnit?“)
//   F = E, ale delší pauza značkou [long pause] — dokumentace v4 uvádí pro pauzy výpustky; [long pause] jen v seznamu značek
//       „bez záruky“ (elevenlabs.io/docs/product/prompting/pauses, 2026-10-28), proto obě cesty vedle sebe
//   E/F: text z ritual_text (od 2026-10-28 ownerova věta s „what is on your heart“ / „liggur þér á hjarta“; 28. 10. stál zvlášť)
//   ⭐ F = HLAS RITUÁLU V APPCE (owner 2026-10-28: „EN a IS F verze jako rituál moc dobrá … odrážet dál pro další rituální čtení“)
//   node docs/eval/2026-10-27-ritual-hlas/gen.js --do-appky F   zkopíruje ritual_<l>_F.mp3 do v2/audio/ a vypíše otisky textu pro config
//       (RUNAR_RITUAL_HLAS.*.text_sha1; smoke ㊗ hlídá, že nahrávka sedí na text)
//   node docs/eval/2026-10-27-ritual-hlas/gen.js --jen E,F   jen vybrané varianty; poslech.html pak ukáže všechny soubory ve složce
// Hlas, nastavení: supabase/functions/_shared/el_voice.ts (čte se odtud, ne kopie). Text: ritual_text v runar-translations.js.
// Klíč: ~/.claude/runar-elevenlabs-key.txt (nikdy se nevypisuje). Výstup MIMO repo: ~/runar-eval/ritual-hlas/ (mp3 + poslech.html).
//   node docs/eval/2026-10-27-ritual-hlas/gen.js [--dry]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm');
const R = path.resolve(__dirname, '..', '..', '..');
const el = fs.readFileSync(path.join(R, 'supabase/functions/_shared/el_voice.ts'), 'utf8');
const VOICE = el.match(/EL_VOICE_ID\s*=\s*"([^"]+)"/)[1];
const NAST = JSON.parse(el.match(/EL_VOICE_SETTINGS\s*=\s*(\{[\s\S]*?\});/)[1].replace(/(\w+):/g, '"$1":').replace(/,\s*}/, '}'));
const S = {}; S.window = S; vm.createContext(S);
vm.runInContext(fs.readFileSync(path.join(R, 'v2/runar-translations.js'), 'utf8') + '\n;this.__UI = UI_TEXT;', S);
const TEXT = { en: S.__UI.en.ritual_text, is: S.__UI.is.ritual_text };
const pauzy = (t) => t.replace(/([.!?])\s+/g, '$1 … ');
const POSLEDNI = { en: 'When your mind settles', is: 'Þegar hugurinn kyrrist' };
const delsi = (l, t, co) => { const i = t.lastIndexOf(' … ' + POSLEDNI[l]); if (i < 0) throw new Error('poslední věta nenalezena ' + l); return t.slice(0, i) + co + POSLEDNI[l] + t.slice(i + 3 + POSLEDNI[l].length); };
const ZNACKA = { en: '[calm, slow, low and gentle voice] ', is: '[calm, slow, low and gentle voice] ' };
const VAR = [
  { k: 'A', popis: 'dnešní hlas appky', model: (l) => l === 'is' ? 'eleven_v3' : 'eleven_multilingual_v2', text: (l) => TEXT[l], nast: () => NAST },
  { k: 'B', popis: 'v3, rychlost 0,85, pauzy', model: () => 'eleven_v3', text: (l) => pauzy(TEXT[l]), nast: () => Object.assign({}, NAST, { speed: 0.85 }) },
  { k: 'C', popis: 'v3, rychlost 0,85, pauzy, značka klidného hlasu, stabilita 0,5', model: () => 'eleven_v3', text: (l) => ZNACKA[l] + pauzy(TEXT[l]), nast: () => Object.assign({}, NAST, { speed: 0.85, stability: 0.5 }) },
  { k: 'D', popis: 'v4, rychlost 0,85, pauzy', model: () => 'eleven_v4', text: (l) => pauzy(TEXT[l]), nast: () => Object.assign({}, NAST, { speed: 0.85 }) },
  { k: 'E', popis: 'v4 jako C (značka, stabilita 0,5, rychlost 0,85), delší pauza „… …“ před poslední větou, nový text', model: () => 'eleven_v4',
    text: (l) => ZNACKA[l] + delsi(l, pauzy(TEXT[l]), ' … … '), nast: () => Object.assign({}, NAST, { speed: 0.85, stability: 0.5 }) },
  { k: 'F', popis: 'jako E, delší pauza značkou [long pause]', model: () => 'eleven_v4',
    text: (l) => ZNACKA[l] + delsi(l, pauzy(TEXT[l]), ' … [long pause] '), nast: () => Object.assign({}, NAST, { speed: 0.85, stability: 0.5 }) },
];
const OUT = path.join(os.homedir(), 'runar-eval', 'ritual-hlas');
fs.mkdirSync(OUT, { recursive: true });
if (process.argv.includes('--do-appky')) {
  const k = process.argv[process.argv.indexOf('--do-appky') + 1];
  for (const l of ['en', 'is']) {
    fs.copyFileSync(path.join(OUT, 'ritual_' + l + '_' + k + '.mp3'), path.join(R, 'v2', 'audio', 'ritual_' + l + '.mp3'));
    console.log(l + ": { src: 'audio/ritual_" + l + ".mp3', text_sha1: '" + require('crypto').createHash('sha1').update(TEXT[l], 'utf8').digest('hex') + "' },");
  }
  console.log('↑ otisky do RUNAR_RITUAL_HLAS (v2/runar-config.js); nahrávka musí být namluvená z TÉHOŽ textu (vyrob ji napřed: --jen ' + k + ')');
  process.exit(0);
}
const plan = [];
const JEN = (process.argv[process.argv.indexOf('--jen') + 1] || '').split(',').filter((k) => process.argv.includes('--jen') && k);
for (const l of ['en', 'is']) for (const v of VAR) if (!JEN.length || JEN.includes(v.k)) plan.push({ l, v, text: v.text(l), model: v.model(l), nast: v.nast() });
console.log('voice', VOICE.slice(0, 4) + '…', '· znaků celkem', plan.reduce((s, p) => s + p.text.length, 0));
if (process.argv.includes('--dry')) { plan.forEach((p) => console.log(p.l, p.v.k, p.model, JSON.stringify(p.nast), '|', p.text.slice(0, 70))); process.exit(0); }
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-elevenlabs-key.txt'), 'utf8').trim();
(async () => {
  const hotovo = [];
  for (const p of plan) {
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + '?output_format=mp3_44100_128', {
      method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: p.text, model_id: p.model, voice_settings: p.nast }) });
    if (!res.ok) { const e = (await res.text()).slice(0, 200); console.log(p.l, p.v.k, 'CHYBA', res.status, e); hotovo.push({ ...p, chyba: res.status + ' ' + e }); continue; }
    const f = 'ritual_' + p.l + '_' + p.v.k + '.mp3';
    fs.writeFileSync(path.join(OUT, f), Buffer.from(await res.arrayBuffer()));
    console.log(p.l, p.v.k, 'ok', f); hotovo.push({ ...p, f });
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // Poslech ukáže všechny varianty, které ve složce jsou (i z dřívějšího běhu) — ať jde C a D porovnat s E/F vedle sebe.
  const vse = [];
  for (const l of ['en', 'is']) for (const v of VAR) {
    const h = hotovo.find((p) => p.l === l && p.v.k === v.k), f = 'ritual_' + l + '_' + v.k + '.mp3';
    if (h) vse.push(h); else if (fs.existsSync(path.join(OUT, f))) vse.push({ l, v, text: v.text(l), model: v.model(l), f });
  }
  const radky = vse.map((p) => '<div class="r"><b>' + p.l.toUpperCase() + ' · ' + p.v.k + '</b> <span>' + esc(p.v.popis) + ' · ' + esc(p.model) + '</span><br>'
    + (p.f ? '<audio controls preload="none" src="' + p.f + '"></audio>' : '<i>chyba: ' + esc(p.chyba) + '</i>') + '<div class="t">' + esc(p.text) + '</div></div>').join('\n');
  fs.writeFileSync(path.join(OUT, 'poslech.html'), '<!doctype html><meta charset="utf-8"><title>Hlas rituálu — varianty</title><style>body{font-family:Georgia,serif;background:#0f141f;color:#e8dcc2;max-width:760px;margin:24px auto;padding:0 16px}.r{border-bottom:1px solid #2e4a70;padding:14px 0}span{color:#9fb0c8;font-size:.9em}audio{width:100%;margin:8px 0}.t{font-size:.85em;color:#9fb0c8}</style><h1>Hlas rituálu — varianty</h1><p>A dnešní hlas appky · B v3 pomaleji s pauzami · C jako B + značka klidného hlasu · D v4 pomaleji s pauzami · E v4 jako C, delší pauza „… …“ před poslední větou · F jako E, pauza značkou [long pause]</p>\n' + radky);
  console.log('poslech:', path.join(OUT, 'poslech.html'));
})();
