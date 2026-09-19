export const meta = {
  name: 'odkud-grey',
  description: 'Odkud „grey": Raidho v4.27, S = bez věty „image must be sensory", W = vrácená věta o počasí — 6 slepých pisatelů',
  phases: [{ title: 'Psaní', detail: 'S ×3, W ×3; kontrola K2+R+C už je (grey 8/9)' }],
}
const DIR = 'C:\\Users\\zkuku\\AppData\\Local\\Temp\\claude\\C--Users-zkuku\\19d97179-39e7-4098-bebb-c437e7df8e6e\\scratchpad\\krok2\\'
const ITEMS = ['S', 'W'].flatMap(a => [1, 2, 3].map(i => ({ id: a + '-' + i, file: a + '.txt' })))
const writerPrompt = f => `Read exactly one file: ${DIR}${f}

It contains a SYSTEM PROMPT and a USER MESSAGE. You are the model that receives exactly this system prompt and this user message. Write the response that model would give, following every instruction in them. You do not know today's date or the season. Do not read any other file, do not search, do not use any other tool. Your final answer must be ONLY the JSON array the user message asks for — nothing before or after.`
const textOf = raw => {
  const s = String(raw || '')
  const m = s.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  return m ? m[1].replace(/\\"/g, '"') : s.trim()
}
const out = await parallel(ITEMS.map(it => () =>
  agent(writerPrompt(it.file), { label: 'pisatel ' + it.id, phase: 'Psaní' }).then(r => ({ id: it.id, text: textOf(r) }))))
return out.filter(Boolean)
