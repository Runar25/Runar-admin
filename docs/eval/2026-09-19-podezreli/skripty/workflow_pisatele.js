export const meta = {
  name: 'podezreli-raidho-konec-a-ask',
  description: 'Raidho de1e3b16: konec s „plain choice" vs bez (3+3) · Ask nad Isa: dnešní pravidla vs věta o možnostech (3+3)',
  phases: [{ title: 'Psaní', detail: '12 slepých pisatelů, každý čte jeden prompt' }],
}
const DIR = 'C:\\Users\\zkuku\\AppData\\Local\\Temp\\claude\\C--Users-zkuku\\19d97179-39e7-4098-bebb-c437e7df8e6e\\scratchpad\\podezreli\\'
const ITEMS = [['RA', 'json'], ['RB', 'json'], ['ASK0', 'ask'], ['ASKN', 'ask']].flatMap(([a, k]) => [1, 2, 3].map(i => ({ id: a + '-' + i, file: a + '.txt', kind: k })))
const writerPrompt = (f, kind) => `Read exactly one file: ${DIR}${f}

It contains a SYSTEM PROMPT and a USER MESSAGE. You are the model that receives exactly this system prompt and this user message. Write the response that model would give, following every instruction in them. You do not know today's date or the season. Do not read any other file, do not search, do not use any other tool. Your final answer must be ONLY ${kind === 'json' ? 'the JSON array the user message asks for' : 'the answer the user message asks for'} — nothing before or after.`
const textOf = raw => {
  const s = String(raw || '')
  const m = s.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  return m ? m[1].replace(/\\"/g, '"') : s.trim()
}
const out = await parallel(ITEMS.map(it => () =>
  agent(writerPrompt(it.file, it.kind), { label: 'pisatel ' + it.id, phase: 'Psaní' }).then(r => ({ id: it.id, text: textOf(r) }))))
return out.filter(Boolean)
