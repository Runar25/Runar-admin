export const meta = {
  name: 'raidho-jadro-a-misto',
  description: 'Pilot: Raidho s jádrem obrazu bez místa (volné vs. losované místo) — 6 slepých pisatelů + 3 slepí soudci identity',
  phases: [
    { title: 'Psaní', detail: '6 slepých pisatelů, každý čte jeden prompt' },
    { title: 'Identita', detail: 'slepý soudce u losovaných míst: pozná Raidho bez jména?' },
  ],
}
const DIR = 'C:\\Users\\zkuku\\AppData\\Local\\Temp\\claude\\C--Users-zkuku\\19d97179-39e7-4098-bebb-c437e7df8e6e\\scratchpad\\misto\\'
const ITEMS = [
  { id: 'F-1', file: 'F.txt' }, { id: 'F-2', file: 'F.txt' }, { id: 'F-3', file: 'F.txt' },
  { id: 'D1-shore', file: 'D1.txt', judge: true }, { id: 'D2-lava', file: 'D2.txt', judge: true }, { id: 'D3-fog', file: 'D3.txt', judge: true },
]
const writerPrompt = f => `Read exactly one file: ${DIR}${f}

It contains a SYSTEM PROMPT and a USER MESSAGE. You are the model that receives exactly this system prompt and this user message. Write the response that model would give, following every instruction in them. You do not know today's date or the season. Do not read any other file, do not search, do not use any other tool. Your final answer must be ONLY the JSON array the user message asks for — nothing before or after.`
const JUDGE = {
  type: 'object',
  properties: {
    rune: { type: 'string', description: 'exactly one rune name from the list' },
    second: { type: 'string', description: 'your second choice, a rune name from the list' },
    why: { type: 'string', description: 'one short sentence' },
  },
  required: ['rune', 'second', 'why'],
}
const textOf = raw => {
  const s = String(raw || '')
  const m = s.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  return m ? m[1].replace(/\\"/g, '"') : s.trim()
}
const out = await pipeline(ITEMS,
  it => agent(writerPrompt(it.file), { label: 'pisatel ' + it.id, phase: 'Psaní' }),
  async (raw, it) => {
    const text = textOf(raw)
    if (!it.judge) return { id: it.id, text }
    const masked = text.replace(/Raidho/g, '[RUNE]')
    const v = await agent(`Below is a short rune reading. The name of the rune has been replaced with [RUNE]. Decide which rune of the Elder Futhark it is, using only the reading itself. Do not use any tools and do not read any files.

READING:
"${masked}"

THE 25 RUNES (name — traditional keywords):
${args.legenda}

Answer with exactly one rune name from this list, your second choice, and one short sentence why.`, { label: 'soudce ' + it.id, phase: 'Identita', schema: JUDGE })
    return { id: it.id, text, judge: v }
  })
return out
