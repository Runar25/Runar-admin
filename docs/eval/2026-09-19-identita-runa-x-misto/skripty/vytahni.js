// Vytáhne texty pisatelů a verdikty soudců z deníku workflow identita-runa-x-misto-rizikove.
const fs = require('fs'), path = require('path');
const J = 'C:/Users/zkuku/.claude/projects/C--Users-zkuku/19d97179-39e7-4098-bebb-c437e7df8e6e/subagents/workflows/wf_4207b96d-87d/journal.jsonl';
const L = fs.readFileSync(J, 'utf8').trim().split('\n').map(x => JSON.parse(x));
const lab = {};
for (const e of L) if (e.type === 'started') lab[e.agentId] = e.label;
const w = {}, j = {};
for (const e of L) {
  if (e.type !== 'result') continue;
  const l = lab[e.agentId] || '', id = l.split(' ')[1];
  if (/^pisatel/.test(l)) {
    let t = e.result;
    try { t = JSON.parse(String(e.result))[0].text; } catch (_) {}
    w[id] = t;
  } else j[id] = typeof e.result === 'string' ? JSON.parse(e.result) : e.result;
}
const out = Object.keys(w).sort().map(id => ({ id, text: w[id], judge: j[id] }));
fs.writeFileSync(path.join(__dirname, 'vysledky.json'), JSON.stringify(out, null, 1));
for (const r of out) {
  const ru = r.id.split('-')[0];
  console.log(r.id.padEnd(12) + ' -> ' + r.judge.rune.padEnd(9) + '(2. ' + r.judge.second + ')' + (r.judge.rune === ru ? '  OK' : '  CHYBA') + '   ' + r.judge.why);
}
