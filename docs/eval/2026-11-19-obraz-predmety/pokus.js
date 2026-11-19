// pokus.js — obraz si dokresluje předměty (hlášení 852ccc73, owner 2026-11-19 „3 volání“). CODE-tune.
// Vstup jako v produkci: prompt single čtení postaví gen_direct.js --dry-run (produkční buildery, v5.24), tady se v něm vymění
// JEN řádek úhlu a věta obrazu — ostatní (osoba, účel, oblast, konec) zůstává, jak je los dal. Systém = buildSysPrompt('en').
//   node docs/eval/2026-11-19-obraz-predmety/pokus.js [--dry-run]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..', '..', '..');
const DRY = process.argv.includes('--dry-run');

cp.execSync('node scripts/utils/gen_direct.js --spread single --lang en --n 1 --rune Dagaz --dry-run', { cwd: ROOT, stdio: 'ignore' });
const radek = fs.readFileSync(path.join(ROOT, 'eval_out', 'archive', 'gen-single-en-gpt-6-sol-dryrun-davka.jsonl'), 'utf8').trim().split('\n').pop();
const zaklad = JSON.parse(radek).prompt;

const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.document = { getElementById: () => null, querySelector: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8') + '\n;this.__A = typeof READING_ANGLES !== "undefined" ? READING_ANGLES : this.__A;', S);
const UHLY = S.__A, system = S.buildSysPrompt(null, 'en');

const OBRAZY = {
  chata: 'You open the door of the mountain hut, and the morning light floods into the darkness all at once.',
  pulnoc: 'At midnight all goes quiet a moment; then the birds sing again, and a new day has dawned.',
};
const POKUSY = [['chata', 3], ['pulnoc', 3], ['chata', 1]];

function prompt(obraz, uhel) {
  let p = zaklad.replace(/^READING ANGLE \(follow this entry point — let it shape the opening and tone\): .*$/m,
    'READING ANGLE (follow this entry point — let it shape the opening and tone): ' + UHLY[uhel]);
  p = p.replace(/(IMAGE — the picture in this reading comes from here: ).*?(\. Let it become)/, '$1' + OBRAZY[obraz].replace(/\.$/, '') + '$2');
  if (!p.includes(OBRAZY[obraz].replace(/\.$/, '')) || !p.includes(UHLY[uhel])) throw new Error('výměna se nepovedla');
  return p;
}

async function sol(user, key) {   // jako claude-proxy (SOL_EFFORTS), max_tokens jako gen_direct pro single
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 700,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    if (res.status === 400 && eff === 'none') continue;
    if (!res.ok) throw new Error('sol ' + res.status + ' ' + (await res.text()).slice(0, 200));
    const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage };
  }
}

(async () => {
  if (DRY) { console.log(prompt('chata', 3)); return; }
  const key = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  const out = { kdy: new Date().toISOString(), model: 'gpt-6-sol', verze: vm.runInContext('RUNAR_PROMPT_VERSION', S), system, radky: [] };
  for (const [obraz, uhel] of POKUSY) {
    const p = prompt(obraz, uhel), r = await sol(p, key);
    out.radky.push({ obraz, uhel, prompt: p, text: r.text, usage: r.usage });
    console.log('\n== ' + obraz + ' · úhel [' + uhel + '] ==\n' + r.text);
  }
  fs.writeFileSync(path.join(__dirname, 'vysledky.json'), JSON.stringify(out, null, 1), 'utf8');
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
