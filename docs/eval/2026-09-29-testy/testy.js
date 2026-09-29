// 2026-09-29 — testy, které owner schválil (odpovědi „1 … souhlas s návrhem“, „2 ok zkus to“, „7 více z runy“, „11 ano, stačí 3“, „12 ano“).
// Vše produkční cestou (buildery z v2/), liší se jen popsaný řádek. Soudí owner čtením — soudce nevidí nic, co nevidí uživatel.
//   node testy.js 1   … Norny se psem: NIT + B2 (GPT + Opus) · single se zvířetem: „pojmenuj postavu“ (Uruz v ohradě, Ehwaz — Opus)
//   node testy.js 2   … Fehu životní runa BEZ klíče „mobile energy“ — přinese model „hodnota žije v pohybu“ sám? (3× Opus)
//   node testy.js 7   … závěrečná myšlenka Z RUNY, ne z obrazu (Kříž Opus · Norny GPT · single Uruz Opus — losy jako myslenka_pilot)
//   node testy.js 11  … esenční řádek [0] „which side of the rune this picture shows“ — srozumitelný bez obrazu? (3× Opus)
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
const NIT = [
  ['Skuld does not predict — she speaks of where you are heading if you keep walking as you are now, and you can walk differently.',
   'Skuld does not predict — she speaks of where the thread is heading if it keeps its course, and it can turn.'],
  ['Skuld (where you are heading)', 'Skuld (where the thread is heading)'],
];
const B2 = 'The main figure of this picture is not the seeker, and the seeker has not seen the picture: name the figure plainly the first time it appears. Tell the picture from that figure\'s side, without "you", and let only the last line turn to the seeker.';
const JMENUJ = 'The main figure of this picture is not the seeker, and the seeker has not seen the picture: name the figure plainly the first time it appears.';
const MYSLENKA_RUNA = 'AFTER THE READING — after everything else, on a new line beginning with ✦, one more short line set apart: a thought grown from the rune itself — from what it is and what it holds, not from the picture — offered for the seeker to carry away. A quiet question or a still line. Never what to do, never a claim about what they feel or know.';
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
function zaObraz(p, radek) { const r = p.split('\n'), i = r.findIndex((l) => l.indexOf('IMAGE —') === 0); if (i === -1) throw new Error('IMAGE'); r.splice(i + 1, 0, radek); return r.join('\n'); }
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
  const zapis = async (jm, engine, p, max) => { const t = spoj(await volej(engine, sys, p, max)); out.push({ jm, text: t }); console.log('\n== ' + jm + '\n' + t); };
  if (kdo === '1') {
    const norny = (eng) => { let p = losuj(eng, () => S.buildNornsPrompt(u('Crossroads & Decisions', 'Clarity'), ['Algiz', 'Ingwaz', 'Uruz'].map(rr), 'en', []),
      (d) => (d.image || '').indexOf('The sheepdog lies') === 0 && d.area_face === 0 && d.name === 2);
      for (const [a, b] of NIT) { if (p.indexOf(a) === -1) throw new Error('nit: ' + a.slice(0, 30)); p = p.replace(a, b); } return zaObraz(p, B2); };
    await zapis('Norny · nit + B2 · GPT', 'sol', norny('sol'));
    await zapis('Norny · nit + B2 · Opus', 'opus', norny('opus'));
    await zapis('Single Uruz (ohrada) · pojmenuj postavu · Opus', 'opus', zaObraz(losuj('opus', () => S.buildReadingPrompt(u('The Unseen', 'General Guidance'), rr('Uruz'), 'en', []),
      (d) => (d.image || '').indexOf('The bull turns in the pen') === 0), JMENUJ));
    await zapis('Single Ehwaz (dva koně) · pojmenuj postavu · Opus', 'opus', zaObraz(losuj('opus', () => S.buildReadingPrompt(u('Purpose & Path', ''), rr('Ehwaz'), 'en', []),
      (d) => (d.image || '').indexOf('When one horse tires') === 0), JMENUJ));
  }
  if (kdo === '2') {
    const fehu = Object.assign({}, rr('Fehu'), { k: 'wealth, cattle, material prosperity' });   // „mobile energy“ pryč — nic jiného se nemění
    for (let i = 0; i < 3; i++) {
      vm.runInContext('__s=' + (i * 104729 + 3) + ';', S);
      const p = S.buildLifeRunePrompt('Kuky', fehu, 4, 7, 1985, 'en', false, []);
      if (p.indexOf('mobile energy') !== -1) throw new Error('klíč v promptu zůstal');
      await zapis('Fehu životní runa bez „mobile energy“ #' + (i + 1), 'opus', p, vm.runInContext('RUNAR_MODES.life_rune_standard.max_tokens', S));
    }
  }
  if (kdo === '7') {
    const beh = [
      ['Kříž · myšlenka z runy · Opus', 'opus', () => S.buildKrizPrompt(u('The Unseen', 'Reflection'), ['Blank', 'Tiwaz', 'Perth', 'Ingwaz', 'Sowilo'].map(rr), 'en', []),
        (d) => (d.image || '').indexOf('In the low sun a whole trail') === 0 && d.area_face === 2 && d.name === 1],
      ['Norny · myšlenka z runy · GPT', 'sol', () => S.buildNornsPrompt(u('Purpose & Path', 'Confirmation'), ['Nauthiz', 'Tiwaz', 'Perth'].map(rr), 'en', []),
        (d) => (d.image || '').indexOf('The rope has swollen') === 0 && d.area_face === 0 && d.name === 2],
      ['Single Uruz · myšlenka z runy · Opus', 'opus', () => S.buildReadingPrompt(u('Purpose & Path', 'Confirmation'), rr('Uruz'), 'en', []),
        (d) => (d.image || '').indexOf('The bull tears itself') === 0],
    ];
    for (const [jm, eng, stav, test] of beh) await zapis(jm, eng, losuj(eng, stav, test) + '\n' + MYSLENKA_RUNA);
  }
  if (kdo === '11') {
    const R0 = vm.runInContext('ESSENCE_FRAMES', S);
    for (const [runa, ob] of [['Berkana', 'The eider leads'], ['Hagalaz', 'The river swells overnight'], ['Gebo', 'You lend the neighbour']]) {
      let p = losuj('opus', () => S.buildReadingPrompt(u('', ''), rr(runa), 'en', []), (d) => (d.image || '').indexOf(ob) === 0);
      if (p.indexOf(R0[1]) !== -1) p = p.replace(R0[1], R0[0]);   // vždy rámec [0] — ten byl měřen se soudcem, který viděl obraz
      if (p.indexOf(R0[0]) === -1) throw new Error('rámec [0] v promptu není');
      await zapis('Esence [0] · ' + runa + ' · Opus', 'opus', p);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_' + kdo + '.json'), JSON.stringify(out, null, 1));
})();
