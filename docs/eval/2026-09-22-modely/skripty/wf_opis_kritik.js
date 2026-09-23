export const meta = {
  name: 'opis-obrazu-kritik',
  description: 'Attack the draft conclusions of the image-line batch: completeness critic + adversarial refuter, each checking the raw data',
  phases: [{ title: 'Attack', detail: 'critic and refuter in parallel, both read the unblinded data' }],
}
const D = args.dir
const COMMON = `Read ${D}/souhrn-pro-kritika.md first. The raw data are in ${D}/soudy-odslepene.json (one row per pair; prod_* and nova_* fields, l1, l3, l3a, l3b, l3duvod, prod_text, nova_text) and ${D}/mereni.json (one row per reading with hard metrics and the text). Check claims against the raw data yourself — recount anything you rely on. Do not trust the summary's numbers without recounting at least the ones your verdict depends on.`
const SCH = { type: 'object', required: ['recounts', 'unsupported', 'missing', 'verdict'], properties: {
  recounts: { type: 'array', items: { type: 'object', required: ['claim', 'summary_value', 'your_value', 'ok'], properties: { claim: { type: 'string' }, summary_value: { type: 'string' }, your_value: { type: 'string' }, ok: { type: 'boolean' } } } },
  unsupported: { type: 'array', items: { type: 'string' } },
  missing: { type: 'array', items: { type: 'string' } },
  verdict: { type: 'string' } } }
const [kritik, protivnik] = await parallel([
  () => agent(`${COMMON}

ROLE: completeness critic. Which of the four draft conclusions are supported by the data, which overreach, and what is missing (confounds, a modality not measured, a split not checked, a cell too small to carry a claim, a judge bias the design did not control)? Consider especially: the angles (7) and the non-sight images (7) are not balanced across halves the same way; the 'overall' lens mixes many criteria; judges are a Claude model judging a Claude model; 2 repetitions per cell. Recount at least: the restate/partly/re-sees counts per model×arm, the L3 split per half per model, and sense-lost per model×arm. verdict: 3–5 sentences.`, { label: 'kritik uplnosti', phase: 'Attack', schema: SCH }),
  () => agent(`${COMMON}

ROLE: adversary. Try hardest to REFUTE conclusion 3 and the recommendation in conclusion 4 ("do not put NOVA into production for Opus 4.8"). Is the imperative/sense-loss cost real and attributable to NOVA, or noise / specific to one or two prompts / also present in PROD? Is there a reading of the data under which NOVA should go to production for Opus 4.8 anyway? Recount imperative sentence openings (sentences starting with Look/See/Notice/Listen/Watch/Feel/Bend/Lean/Step) per model×arm from mereni.json, and which prompts they come from. verdict: 3–5 sentences, say plainly whether conclusion 3 and 4 survive.`, { label: 'protivnik zaveru 3-4', phase: 'Attack', schema: SCH }),
])
return { kritik, protivnik }
