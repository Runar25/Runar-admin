export const meta = {
  name: 'kontrola-srozumitelnosti-validace',
  description: 'Ověření nástroje: slepý soudce srozumitelnosti nad 12 produkčními čteními ownera (6 pochválených, 6 s „nerozumím")',
  phases: [{ title: 'Soud', detail: '12 slepých soudců, každý jedno čtení, bez ownerovy otázky i skupiny' }],
}
const SCHEMA = {
  type: 'object',
  properties: {
    whole: { type: 'string', description: 'in one plain sentence, what the reading tells the person' },
    last: { type: 'string', description: 'in one plain sentence, what the last sentence asks or says' },
    verdict: { type: 'string', enum: ['CLEAR', 'PARTLY', 'UNCLEAR'], description: 'would a reader who knows nothing about runes understand what the reading is telling them?' },
    hardest: { type: 'string', description: 'the exact phrase that is hardest to understand, or empty if none' },
    why: { type: 'string', description: 'one short sentence' },
  },
  required: ['whole', 'last', 'verdict', 'hardest', 'why'],
}
const res = await parallel(args.texty.map(t => () =>
  agent(`You are checking whether a short rune reading is understandable. Read it as someone who knows nothing about runes. Do not use any tools and do not read any files.

READING:
"${t.text}"

Say in one plain sentence what the reading tells the person, and in one plain sentence what its last sentence asks or says. Then judge: would such a reader understand what the reading is telling them — CLEAR, PARTLY, or UNCLEAR? Quote the single phrase that is hardest to understand (empty if none), and say why in one short sentence.`, { label: 'soudce ' + t.id, phase: 'Soud', schema: SCHEMA })
    .then(v => ({ id: t.id, ...v }))))
return res.filter(Boolean)
