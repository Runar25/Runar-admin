// CODE-read 2026-09-23 — kolik tokenu stoji IS blok korekci a kolik by usetrilo procisteni (owner: „jak ho vyresit?").
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const K = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const src = fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/v2/runar-character.js', 'utf8');
const a = src.indexOf('function getCorrPrompt'), b = src.indexOf('// ─── SEGMENT PARSER', a);
const getCorrPrompt = new Function(src.slice(a, b) + ';return getCorrPrompt;')();
const C = require(path.join(__dirname, 'korekce-norm.json'));
const bez = i => C.filter((_, j) => !i.includes(j + 1));
// procisteno: 1 test pryc · 6, 8 = jednorazove prepisy cele otazky (styl) pryc · 14 = dve chyby v jedne vete → dve kratke
const cist = bez([1, 6, 8, 14]).concat([{ from_word: 'Auða rúnan', to_word: 'Auða rúnin', lang: 'is' }, { from_word: 'tóm blað', to_word: 'tómt blað', lang: 'is' }]);
async function tok(t) {
  const r = await fetch('https://api.anthropic.com/v1/messages/count_tokens', { method: 'POST',
    headers: { 'x-api-key': K, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-opus-4-8', messages: [{ role: 'user', content: 'x' + t }] }) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j)); return j.input_tokens;
}
(async () => {
  const nula = await tok('');
  for (const [co, rows] of [['plny IS', C], ['procisteny IS', cist], ['IS bez kontextu', C.map(r => Object.assign({}, r, { context: '' }))], ['plny EN', C]]) {
    const t = getCorrPrompt(co.endsWith('EN') ? 'en' : 'is', rows);
    console.log(co.padEnd(14), 'radku', t.split('\n').length - 2, '· znaku', t.length, '· tokenu', (await tok(t)) - nula);
  }
})();
