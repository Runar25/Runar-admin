export const meta = {
  name: 'algiz-prejudge-bez-jmena',
  description: 'Algiz × 3 místa: znovu slepý soudce, jméno osoby (Thor) zamaskováno — Thor táhl k Thurisaz',
  phases: [{ title: 'Identita', detail: 'totéž jako předtím, jen [NAME] místo Thor' }],
}
const JUDGE = {
  type: 'object',
  properties: {
    rune: { type: 'string', description: 'exactly one rune name from the list' },
    second: { type: 'string', description: 'your second choice, a rune name from the list' },
    why: { type: 'string', description: 'one short sentence' },
  },
  required: ['rune', 'second', 'why'],
}
const res = await parallel(args.texty.map(t => () =>
  agent(`Below is part of a short rune reading. The sentence that named the rune has been removed, and the seeker's name is shown as [NAME]. Decide which rune of the Elder Futhark the reading is about, using only the text itself. Do not use any tools and do not read any files.

READING (fragment):
"${t.frag}"

THE 25 RUNES (name — traditional keywords):
${args.legenda}

Answer with exactly one rune name from this list, your second choice, and one short sentence why.`, { label: 'soudce ' + t.id, phase: 'Identita', schema: JUDGE })
    .then(v => ({ id: t.id, frag: t.frag, judge: v }))))
return res.filter(Boolean)
