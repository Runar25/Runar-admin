// CODE-tune 2026-09-26 — ukázková čtení ke krokům z handoffu CODE-read (owner „ano jeď 3 → 1 → 2, ukaž čtení“).
// Produkční single builder přes vm, seedovaný Math.random, vynucená podoba oblasti; Opus 5 jako claude-proxy (thinking off).
// Použití: node gen.js <jazyk> <oblast idx> <podoba idx|-> <rejstřík idx> <runa,runa,…> <výstup.json> [pool-override.js]
// Klíč se čte ze souboru a nevypisuje.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const [L, ai, face, si, runy, OUT, over] = process.argv.slice(2);
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="' + L + '";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
if (face !== '-') S._drawAreaFace = () => +face;
if (over) vm.runInContext(fs.readFileSync(over, 'utf8'), S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S), SK = vm.runInContext('SEEKS', S);
(async () => {
  const sys = S.buildSysPrompt(null, L), out = [];
  for (const runa of runy.split(',')) {
    vm.runInContext('__s=' + (runa.length * 7919 + (+ai) * 31 + (+si)) + ';', S);
    const p = S.buildReadingPrompt({ name: 'Kuky', area: A[L][+ai], seeking: SK[L][+si], question: '', intention: '' }, R.find(r => r.n === runa), L, []);
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
    const d = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
    let t = (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
    const img = (p.split('\n').find(l => /^(IMAGE|MYND)/.test(l)) || '').slice(0, 200);
    out.push({ runa, area: A[L][+ai], face, seek: SK[L][+si], img, reading: t, prompt: p });
    console.log('== ' + runa + ' · ' + A[L][+ai] + ' · podoba ' + face + '\n   ' + img + '\n' + t + '\n');
  }
  fs.writeFileSync(path.join(__dirname, OUT), JSON.stringify(out, null, 1));
})();
