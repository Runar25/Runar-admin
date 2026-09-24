export const meta = {
  name: 'opis-detail-kritik',
  description: 'Attack draft conclusions of the one-detail batch: completeness critic + adversary, both recount from raw data',
  phases: [{ title: 'Attack', detail: 'critic and adversary in parallel' }],
}
const D = args.dir
const COMMON = `Read ${D}/souhrn2-pro-kritika.md first. Raw data: ${D}/soudy2-odslepene.json (one row per pair: prod_* and detail_* fields incl. retells, drift, lost, advice, inner, force, formula lists, l3, l3a, l3b, duvody, prod_text, detail_text) and ${D}/mereni3.json (hard metrics per reading, arms prod/nova/detail). Recount anything your verdict depends on yourself.`
const SCH = { type: 'object', required: ['recounts', 'unsupported', 'missing', 'verdict'], properties: {
  recounts: { type: 'array', items: { type: 'object', required: ['claim', 'summary_value', 'your_value', 'ok'], properties: { claim: { type: 'string' }, summary_value: { type: 'string' }, your_value: { type: 'string' }, ok: { type: 'boolean' } } } },
  unsupported: { type: 'array', items: { type: 'string' } }, missing: { type: 'array', items: { type: 'string' } }, verdict: { type: 'string' } } }
const [kritik, protivnik] = await parallel([
  () => agent(`${COMMON}

ROLE: completeness critic. Which draft conclusions are supported, which overreach, what is missing (confounds, splits not checked, judge bias, length confound, cells too small)? Recount at least: retells counts per model×arm, L3 per rep and per half per model, advice and inner flag counts per model×arm. Read the Opus DETAIL inner-state flags and judge whether each is a real claim about the seeker's inner state or falls under the owner's boundaries (physical consequence / picture) — report how many survive. verdict 3–5 sentences.`, { label: 'kritik uplnosti', phase: 'Attack', schema: SCH }),
  () => agent(`${COMMON}

ROLE: adversary. Try hardest to REFUTE conclusion 2 and recommendation 5 (hand DETAIL to production for Opus 4.8). Is the 18:10 lean driven by length, by a few prompts, by the tiebreaks, or by the flags? Is there a cost of DETAIL visible in the texts that the judges missed (new formula, invented props, the rune acting as a force, cold reading)? Read at least 8 Opus DETAIL texts next to their PROD pair. verdict 3–5 sentences; say plainly whether conclusion 2 and recommendation 5 survive and in what narrowed form.`, { label: 'protivnik zaveru 2 a 5', phase: 'Attack', schema: SCH }),
])
return { kritik, protivnik }
