export const meta = {
  name: 'identita-runa-x-misto-rizikove',
  description: 'Isa, Laguz, Tiwaz, Algiz × břeh / lávové pole / mlha: 12 slepých pisatelů + 12 slepých soudců identity bez věty se jménem runy',
  phases: [
    { title: 'Psaní', detail: '12 pisatelů, každý čte jeden prompt' },
    { title: 'Identita', detail: 'soudce vidí čtení bez věty se jménem runy, volí z 25' },
  ],
}
const DIR = 'C:\\Users\\zkuku\\AppData\\Local\\Temp\\claude\\C--Users-zkuku\\19d97179-39e7-4098-bebb-c437e7df8e6e\\scratchpad\\misto4\\'
const ITEMS = ['Isa', 'Laguz', 'Tiwaz', 'Algiz'].flatMap(r => ['shore', 'lava', 'fog'].map(m => ({ id: r + '-' + m, runa: r, file: r + '-' + m + '.txt' })))
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
    const vety = text.match(/[^.?!]+[.?!]+/g) || [text]
    const re = new RegExp(it.runa, 'i')
    const frag = vety.map(s => s.trim()).filter(s => !re.test(s)).join(' ').replace(new RegExp(it.runa, 'gi'), '[RUNE]')
    const v = await agent(`Below is part of a short rune reading. The sentence that named the rune has been removed. Decide which rune of the Elder Futhark the reading is about, using only the text itself. Do not use any tools and do not read any files.

READING (fragment):
"${frag}"

THE 25 RUNES (name — traditional keywords):
${args.legenda}

Answer with exactly one rune name from this list, your second choice, and one short sentence why.`, { label: 'soudce ' + it.id, phase: 'Identita', schema: JUDGE })
    return { id: it.id, runa: it.runa, text, frag, judge: v }
  })
return out
