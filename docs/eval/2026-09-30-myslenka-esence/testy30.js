// 2026-09-30 — testy, které owner zadal: „7. jeď možnost 1, udělej 3 čtení“ a k esenci [0] u Hagalaz „tohle nechápu, was built
// too close? co má esenční řádek bez obrazu dělat, popiš to znova“. Produkční buildery (v4.80), liší se jen popsaný řádek.
//   node testy30.js 7   … myšlenka ✦ ZE ZDROJE: první odstavec textu runy z Kolekce (coll_rune[runa][0]) jako zdroj, ne k opsání.
//                         Losy jako minulé kolo (docs/eval/2026-09-29-testy/test_7.json): Kříž Opus · Norny GPT · single Uruz Opus.
//                         Zdrojová runa: Kříž = střed (runes[0]), Norny = Skuld (runes[2], závěr patří jí), single = tažená.
//   node testy30.js 11  … esence [0] BEZ věty „The familiar word may live inside the scene (…)“ (A) — ta zve model říct význam
//                         předměty obrazu; Hagalaz pak „the water taking back what was built too close“ (postavené nikde v textu).
//                         + Hagalaz s A + věta, že čtenář obraz nezná (B). Losy jako docs/eval/2026-09-29-testy/test_11.json.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), rr = (n) => R.find((r) => r.n === n);
const UI = vm.runInContext('UI_TEXT', S);
const zdroj = (runa) => UI.en.coll_rune[runa][0];
const jmeno = (runa) => runa === 'Blank' ? 'the Blank rune' : runa;
const MYSLENKA = (runa) => 'AFTER THE READING — after everything else, on a new line beginning with ✦, one more short line set apart: a thought offered for the seeker to carry away, grown from what ' + jmeno(runa) + ' is, not from the picture. Its source: "' + zdroj(runa) + '" Let it grow out of that, but say it in your own words. A quiet question or a still line. Never what to do, never a claim about what they feel or know.';
const E0 = vm.runInContext('ESSENCE_FRAMES', S);
const SCENA = ' The familiar word may live inside the scene ("exchange between the sea and the shore").';
const E0_A = E0[0].replace(SCENA, '');
const E0_B = E0_A.replace(' Never a fixed formula.', ' The seeker knows only the words of the reading, not the picture behind them: say what the rune means in its own terms, not what happens in the scene. Never a fixed formula.');
if (E0_A === E0[0] || E0_B === E0_A) throw new Error('rámec [0] se nezměnil — věta o scéně v něm není');
function losuj(engine, stav, test) {
  vm.runInContext('READ_ENGINE="' + engine + '"', S);
  for (let s = 1; s < 8000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
    const p = stav(); const d = S._promptDraws(p, 'en') || {};
    if (test(d, p)) return p;
  }
  throw new Error('losy se nevylosovaly');
}
async function volej(engine, sys, p, max) {
  if (engine === 'sol') {
    for (const eff of ['none', 'minimal']) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: max || 1000,
          messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
      if (res.status === 400 && eff === 'none') continue;
      const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
      return String(d.choices[0].message.content || '');
    }
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max || 1000, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
}
const spoj = (t) => { const i = t.indexOf('✦'); const m = i === -1 ? '' : t.slice(i).trim(); let b = i === -1 ? t : t.slice(0, i);
  try { b = JSON.parse(b.slice(b.indexOf('['), b.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) {} return (b.trim() + (m ? '\n' + m : '')); };
const u = (area, seeking) => ({ name: 'Kuky', area, seeking, question: '', intention: '' });
(async () => {
  const kdo = process.argv[2], sys = S.buildSysPrompt(null, 'en'), out = [];
  const zapis = async (jm, engine, p, pokyn) => { const t = spoj(await volej(engine, sys, p)); out.push({ jm, pokyn, text: t }); console.log('\n== ' + jm + '\n' + t); };
  if (kdo === '7') {
    const beh = [
      ['Kříž · myšlenka ze zdroje (Blank, střed) · Opus', 'opus', 'Blank', () => S.buildKrizPrompt(u('The Unseen', 'Reflection'), ['Blank', 'Tiwaz', 'Perth', 'Ingwaz', 'Sowilo'].map(rr), 'en', []),
        (d) => (d.image || '').indexOf('In the low sun a whole trail') === 0 && d.area_face === 2 && d.name === 1],
      ['Norny · myšlenka ze zdroje (Perth, Skuld) · GPT', 'sol', 'Perth', () => S.buildNornsPrompt(u('Purpose & Path', 'Confirmation'), ['Nauthiz', 'Tiwaz', 'Perth'].map(rr), 'en', []),
        (d) => (d.image || '').indexOf('The rope has swollen') === 0 && d.area_face === 0 && d.name === 2],
      ['Single Uruz · myšlenka ze zdroje · Opus', 'opus', 'Uruz', () => S.buildReadingPrompt(u('Purpose & Path', 'Confirmation'), rr('Uruz'), 'en', []),
        (d) => (d.image || '').indexOf('The bull tears itself') === 0],
    ];
    for (const [jm, eng, runa, stav, test] of beh) await zapis(jm, eng, losuj(eng, stav, test) + '\n' + MYSLENKA(runa), MYSLENKA(runa));
  }
  if (kdo === '11') {
    const esence = (runa, ob, ram) => { let p = losuj('opus', () => S.buildReadingPrompt(u('', ''), rr(runa), 'en', []), (d) => (d.image || '').indexOf(ob) === 0);
      if (p.indexOf(E0[1]) !== -1) p = p.replace(E0[1], E0[0]);   // vždy rámec [0], jako v testu 2026-09-29
      if (p.indexOf(E0[0]) === -1) throw new Error('rámec [0] v promptu není'); return p.replace(E0[0], ram); };
    for (const [runa, ob] of [['Berkana', 'The eider leads'], ['Hagalaz', 'The river swells overnight'], ['Gebo', 'You lend the neighbour']])
      await zapis('Esence A (bez věty o scéně) · ' + runa + ' · Opus', 'opus', esence(runa, ob, E0_A), E0_A);
    await zapis('Esence B (A + čtenář obraz nezná) · Hagalaz · Opus', 'opus', esence('Hagalaz', 'The river swells overnight', E0_B), E0_B);
  }
  if (kdo === '11b') {   // B i na Berkaně a Gebu — ať je B vidět na týchž třech runách jako A
    const esence = (runa, ob, ram) => { let p = losuj('opus', () => S.buildReadingPrompt(u('', ''), rr(runa), 'en', []), (d) => (d.image || '').indexOf(ob) === 0);
      if (p.indexOf(E0[1]) !== -1) p = p.replace(E0[1], E0[0]);
      if (p.indexOf(E0[0]) === -1) throw new Error('rámec [0] v promptu není'); return p.replace(E0[0], ram); };
    for (const [runa, ob] of [['Berkana', 'The eider leads'], ['Gebo', 'You lend the neighbour']])
      await zapis('Esence B (A + čtenář obraz nezná) · ' + runa + ' · Opus', 'opus', esence(runa, ob, E0_B), E0_B);
  }
  fs.writeFileSync(path.join(__dirname, 'test_' + kdo + '.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
