// Lab 2026-11-14: pošle složené prompty (sloz1114.js) solu stejně jako claude-proxy callSol (gpt-6-sol, none → minimal). Klíč se nevypisuje.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { postav } = require('./sloz1114.js');
(async () => {
  const ulohy = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  const out = [];
  for (const u of ulohy) {
    const x = postav(u);
    let text = null, chyba = null, usage = null;
    for (const eff of ['none', 'minimal']) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 700, prompt_cache_options: { mode: 'explicit' },
          messages: [{ role: 'system', content: x.sys }, { role: 'user', content: x.p }] }) });
      if (res.status === 400 && eff === 'none') continue;
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { chyba = res.status; break; }
      text = d.choices[0].message.content.trim(); usage = d.usage;
      try { text = JSON.parse(text)[0].text; } catch (e) { /* syrový text */ }
      break;
    }
    out.push({ ...u, obraz: x.draws.image || null, prompt: x.p, system: x.sys, text, chyba, usage });
    console.log('[' + u.id + '] ' + (text || 'HTTP ' + chyba));
  }
  fs.writeFileSync(process.argv[2].replace(/\.json$/, '_vysledky.json'), JSON.stringify(out, null, 1));
})();
