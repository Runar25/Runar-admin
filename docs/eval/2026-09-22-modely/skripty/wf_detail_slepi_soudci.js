export const meta = {
  name: 'opis-detail-slepi-soudci',
  description: 'Blind judges: production vs one alternative image line, 56 pairs in 8 chunks, canon visible, 4 lenses, tiebreak and skeptic',
  phases: [
    { title: 'Judge', detail: '4 lenses per chunk: restating, image fidelity, overall x2 (second sees A/B swapped)' },
    { title: 'Resolve', detail: 'tiebreak on overall disagreements; skeptic on one-sided drift or sense-loss claims' },
  ],
}
const DIR = args.dir
const CHUNKS = args.chunks
const PRE = `You are judging short readings written for Rúnar, a rune-reading app with a poetic, plain-spoken Nordic voice. Readings are read aloud.
Each pair holds two readings (A and B) written by the same model from the same brief. You do not know how they were produced and must not guess; judge only what is on the page.
First read ${DIR}/system.txt — the system prompt both readings were written under (Rúnar's canon). Then read the JSON file named below. It contains "pairs": each has pid, brief (the exact reading instructions), image (the source sentence the reading's picture comes from), image_sense (sight, sound, smell, touch or warmth), A and B.
Read ONLY those two files. Judge every pair in the file.
Boundaries set by the owner (apply them exactly):
- An imperative that steps INTO the image ("Look closer, and you see…", "See the faint crease…", "Lean over the barrel…") is fine — like saying "look,". A violation of "never tells the seeker what to do" is only ADVICE ABOUT THE SEEKER'S LIFE (a step to take: "Notice which way your body faces before your mind weighs the reasons").
- A physical consequence told as part of the picture ("your knuckles have learned this before your mind has") is fine. Cold reading is only a claim about the seeker's inner state — what is true, stirring, felt or known inside them.`

const REST = ['mostly', 'partly', 'no']
const L1 = { type: 'object', required: ['pairs'], properties: { pairs: { type: 'array', items: { type: 'object',
  required: ['pid', 'a_retells', 'b_retells', 'closer_to_source', 'note'],
  properties: { pid: { type: 'string' }, a_retells: { type: 'string', enum: REST }, b_retells: { type: 'string', enum: REST },
    closer_to_source: { type: 'string', enum: ['A', 'B', 'same'] }, note: { type: 'string' } } } } } }
const L2 = { type: 'object', required: ['pairs'], properties: { pairs: { type: 'array', items: { type: 'object',
  required: ['pid', 'a_verdict', 'a_drift', 'a_sense_kept', 'b_verdict', 'b_drift', 'b_sense_kept'],
  properties: { pid: { type: 'string' }, a_verdict: { type: 'string', enum: ['holds', 'drifts'] }, a_drift: { type: 'string' },
    a_sense_kept: { type: 'string', enum: ['yes', 'no', 'n/a'] }, b_verdict: { type: 'string', enum: ['holds', 'drifts'] }, b_drift: { type: 'string' },
    b_sense_kept: { type: 'string', enum: ['yes', 'no', 'n/a'] } } } } } }
const FL = { type: 'array', items: { type: 'string' } }
const L3 = { type: 'object', required: ['pairs'], properties: { pairs: { type: 'array', items: { type: 'object',
  required: ['pid', 'better', 'reason', 'advice_a', 'advice_b', 'inner_a', 'inner_b', 'force_a', 'force_b', 'formula_a', 'formula_b'],
  properties: { pid: { type: 'string' }, better: { type: 'string', enum: ['A', 'B', 'tie'] }, reason: { type: 'string' },
    advice_a: FL, advice_b: FL, inner_a: FL, inner_b: FL, force_a: FL, force_b: FL, formula_a: FL, formula_b: FL } } } } }
const TIE = { type: 'object', required: ['better', 'reason'], properties: { better: { type: 'string', enum: ['A', 'B', 'tie'] }, reason: { type: 'string' } } }
const SKEP = { type: 'object', required: ['refuted', 'reason'], properties: { refuted: { type: 'boolean' }, reason: { type: 'string' } } }

const l1 = f => `${PRE}
File: ${f}

LENS — how closely the OPENING (first sentence, plus the second if the picture continues there) retells the source sentence.
"mostly": it retells the source sentence — its content in largely the same words or its own summary verbs, at most with a clause tacked on.
"partly": some of the source's own phrasing carries the core, the rest is the reading's own.
"no": it does not retell the source sentence; the scene is told in the reading's own words (the core event may stay).
closer_to_source: which opening stays closer to the source sentence's wording (A, B or same). note: at most 20 words.`

const l2 = f => `${PRE}
File: ${f}

LENS — fidelity to the image. For each reading: does it keep the CORE of the image (what happens in the source sentence and, for images whose sense is not sight, the sense it lives in: sound, smell, touch, warmth), or change it?
"drifts": the core event is replaced, the sense is swapped (a sound image told only as something seen), or invented objects or events pull the scene somewhere the image is not. Concrete detail INSIDE the same scene is NOT drift; moving on to the seeker's life later is NOT drift.
Per reading: verdict holds|drifts; drift = what changed (at most 20 words, empty if holds); sense_kept = yes|no for non-sight images, "n/a" for sight images.`

const l3 = (f, n) => `${PRE}
File: ${f}
(Independent judge #${n}.)

LENS — overall. Which is the better reading given its brief AND the canon in system.txt? Weigh together: follows the brief (reading angle, how the image lands on the area, the essence line, the required ending shape, the name rule, four short sentences near the word count); the image carried through and made concrete; the owner's boundaries above; lean sentences that sound good aloud; no stock or formulaic phrasing.
better = A, B or tie (tie only if you genuinely cannot prefer one). reason: at most 25 words.
Exact quotes, empty lists if none: advice_a/advice_b = advice about the seeker's life; inner_a/inner_b = claims about the seeker's inner state (cold reading); force_a/force_b = the rune itself acting as a physical force inside the scene (e.g. "the tighter Nauthiz draws the coil against itself"), as opposed to the rune named as a quality of the scene; formula_a/formula_b = phrases that sound like a stock formula or like an instruction meant for the writer that ended up in the text.`

const swapBack = r => ({ ...r, better: r.better === 'A' ? 'B' : r.better === 'B' ? 'A' : 'tie',
  advice_a: r.advice_b, advice_b: r.advice_a, inner_a: r.inner_b, inner_b: r.inner_a, force_a: r.force_b, force_b: r.force_a, formula_a: r.formula_b, formula_b: r.formula_a })

const vysledky = await pipeline(
  CHUNKS,
  async (c) => {
    const f = `${DIR}/${c}.json`, fsw = `${DIR}/${c}-s.json`
    const [a, b, x, y] = await parallel([
      () => agent(l1(f), { label: `L1 prevypraveni ${c}`, phase: 'Judge', schema: L1 }),
      () => agent(l2(f), { label: `L2 vernost ${c}`, phase: 'Judge', schema: L2 }),
      () => agent(l3(f, 1), { label: `L3a celkove ${c}`, phase: 'Judge', schema: L3 }),
      () => agent(l3(fsw, 2), { label: `L3b celkove ${c} (prohozene)`, phase: 'Judge', schema: L3 }),
    ])
    return { c, l1: a && a.pairs, l2: b && b.pairs, l3a: x && x.pairs, l3b: y && y.pairs ? y.pairs.map(swapBack) : null }
  },
  async (r) => {
    const f = `${DIR}/${r.c}.json`
    const by = arr => Object.fromEntries((arr || []).map(p => [p.pid, p]))
    const A3 = by(r.l3a), B3 = by(r.l3b), D2 = by(r.l2)
    const spory = Object.keys(A3).filter(p => B3[p] && A3[p].better !== 'tie' && B3[p].better !== 'tie' && A3[p].better !== B3[p].better)
    const tie = await parallel(spory.map(p => () => agent(`${PRE}
File: ${f}

Judge ONLY pair ${p}. Two earlier judges disagreed. Which is the better reading given its brief and the canon? Weigh: follows the brief (angle, image landing on the area, essence line, ending shape, name rule, four short sentences near the word count), the image carried through and made concrete, the owner's boundaries, lean sentences that sound good aloud, no stock phrasing. better = A, B or tie; reason at most 25 words.`,
      { label: `tiebreak ${p}`, phase: 'Resolve', schema: TIE }).then(v => ({ pid: p, ...(v || {}) }))))
    const claims = []
    for (const p of Object.keys(D2)) {
      const d = D2[p]
      if (d.a_verdict === 'drifts' && d.b_verdict !== 'drifts') claims.push({ pid: p, strana: 'A', kind: 'drift', text: d.a_drift })
      if (d.b_verdict === 'drifts' && d.a_verdict !== 'drifts') claims.push({ pid: p, strana: 'B', kind: 'drift', text: d.b_drift })
      if (d.a_sense_kept === 'no' && d.b_sense_kept !== 'no') claims.push({ pid: p, strana: 'A', kind: 'sense', text: 'the non-sight sense of the image is lost' })
      if (d.b_sense_kept === 'no' && d.a_sense_kept !== 'no') claims.push({ pid: p, strana: 'B', kind: 'sense', text: 'the non-sight sense of the image is lost' })
    }
    const skep = await parallel(claims.map(j => () => agent(`${PRE}
File: ${f}

Look ONLY at pair ${j.pid}, reading ${j.strana}. A previous judge claimed: "${j.text}" (${j.kind === 'drift' ? 'the reading drifts from its image' : 'the reading loses the sense the image lives in'}).
Try to refute it. Drift = the core event replaced, the sense swapped, or invented objects/events pulling the scene elsewhere; concrete detail inside the same scene is NOT drift. Sense lost = the sound/smell/touch/warmth of the image is gone from the reading, not merely joined by sight.
refuted = true if the reading in fact keeps it (or if you are unsure); false only if the claim is clearly real. reason: at most 25 words.`,
      { label: `skeptik ${j.pid}${j.strana}-${j.kind}`, phase: 'Resolve', schema: SKEP }).then(v => ({ ...j, ...(v || {}) }))))
    return { ...r, tiebreak: tie.filter(Boolean), skeptik: skep.filter(Boolean) }
  },
)
const chybi = vysledky.filter(v => !v || !v.l1 || !v.l2 || !v.l3a || !v.l3b).length
if (chybi) log(`POZOR: ${chybi} chunku ma aspon jednu cocku bez vysledku`)
return { vysledky }
