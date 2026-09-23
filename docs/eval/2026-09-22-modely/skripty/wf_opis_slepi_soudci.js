export const meta = {
  name: 'opis-obrazu-slepi-soudci',
  description: 'Blind judges compare two readings per pair (56 pairs, 8 chunks) through 4 lenses, then tiebreak and skeptic',
  phases: [
    { title: 'Judge', detail: '4 lenses per chunk of 7 pairs: re-seeing, image fidelity, overall x2 (second one sees A/B swapped)' },
    { title: 'Resolve', detail: 'tiebreak where the two overall judges disagree; skeptic on one-sided image-drift claims' },
  ],
}

const DIR = args.dir
const CHUNKS = args.chunks

const PRE = `You are judging short readings written for Rúnar, a rune-reading app with a poetic, plain-spoken Nordic voice. Readings are read aloud.
Each pair holds two readings (A and B) written by the same model from the same brief. You do not know how they were produced and must not guess; judge only what is on the page.
Read the JSON file named below with the Read tool. It contains "pairs": each has pid, brief (the exact instructions both readings were written from), image (the source sentence the reading's picture comes from), image_sense (the sense the image lives in: sight, sound, smell, touch, warmth), A and B.
Read ONLY that file. Judge every pair in it.`

const OPEN = ['restates', 'partly', 're-sees']
const L1 = { type: 'object', required: ['pairs'], properties: { pairs: { type: 'array', items: { type: 'object',
  required: ['pid', 'a_opening', 'b_opening', 'better', 'note'],
  properties: { pid: { type: 'string' }, a_opening: { type: 'string', enum: OPEN }, b_opening: { type: 'string', enum: OPEN },
    better: { type: 'string', enum: ['A', 'B', 'tie'] }, note: { type: 'string' } } } } } }
const L2 = { type: 'object', required: ['pairs'], properties: { pairs: { type: 'array', items: { type: 'object',
  required: ['pid', 'a_verdict', 'a_drift', 'a_sense_kept', 'b_verdict', 'b_drift', 'b_sense_kept'],
  properties: { pid: { type: 'string' }, a_verdict: { type: 'string', enum: ['holds', 'drifts'] }, a_drift: { type: 'string' },
    a_sense_kept: { type: 'string', enum: ['yes', 'no', 'n/a'] }, b_verdict: { type: 'string', enum: ['holds', 'drifts'] }, b_drift: { type: 'string' },
    b_sense_kept: { type: 'string', enum: ['yes', 'no', 'n/a'] } } } } } }
const L3 = { type: 'object', required: ['pairs'], properties: { pairs: { type: 'array', items: { type: 'object',
  required: ['pid', 'better', 'reason', 'formula_a', 'formula_b'],
  properties: { pid: { type: 'string' }, better: { type: 'string', enum: ['A', 'B', 'tie'] }, reason: { type: 'string' },
    formula_a: { type: 'array', items: { type: 'string' } }, formula_b: { type: 'array', items: { type: 'string' } } } } } } }
const TIE = { type: 'object', required: ['better', 'reason'], properties: { better: { type: 'string', enum: ['A', 'B', 'tie'] }, reason: { type: 'string' } } }
const SKEP = { type: 'object', required: ['refuted', 'reason'], properties: { refuted: { type: 'boolean' }, reason: { type: 'string' } } }

const l1 = f => `${PRE}
File: ${f}

LENS — how the reading takes up its image. Look at the IMAGE source sentence. For each reading classify its OPENING (the first sentence, plus the second if the picture continues there):
- "restates": retells the source sentence — same content, mostly its own words or its summary verbs — at most with a clause tacked on;
- "partly": keeps the source sentence's own phrasing for the core, but adds concrete detail of its own;
- "re-sees": renders the scene in concrete detail of its own instead of paraphrasing the source sentence (the core may stay, the wording and the detail are its own).
Then "better": which reading makes the image more its own while staying true to it (A, B or tie). "note": at most 20 words.`

const l2 = f => `${PRE}
File: ${f}

LENS — fidelity to the image. For each reading decide whether it keeps the CORE of the image (what happens in the source sentence and, for images whose sense is not sight, the sense it lives in: sound, smell, touch, warmth) or changes it.
"drifts" means: the core event is replaced, or the sense is swapped (for example a sound image told as something seen), or invented objects or events pull the scene somewhere the image is not.
Adding concrete detail INSIDE the same scene is fine and is NOT drift. Moving from the image to the seeker's life later in the reading is the brief's own instruction and is NOT drift.
Per reading: verdict holds|drifts; drift = what changed, at most 20 words, empty string if holds; sense_kept = yes|no for non-sight images, "n/a" for sight images.`

const l3 = (f, n) => `${PRE}
File: ${f}
(Independent judge #${n}.)

LENS — overall. Which is the better reading, given its brief? Weigh together: it follows the brief (reading angle, how the image lands on the area, the essence line, the required ending shape, the name rule, four short sentences near the word count); the image is carried through and made concrete; no cold reading (never telling the seeker what is true or stirring inside them); lean sentences that sound good read aloud; no stock or formulaic phrasing.
better = A, B or tie (tie only when you genuinely cannot prefer one). reason: at most 25 words.
formula_a / formula_b: exact quotes of any phrase in that reading that sounds like a stock formula, or like an instruction meant for the writer that ended up spoken to the listener. Empty list if none.`

const swapBack = r => ({ ...r, better: r.better === 'A' ? 'B' : r.better === 'B' ? 'A' : 'tie', formula_a: r.formula_b, formula_b: r.formula_a })

const vysledky = await pipeline(
  CHUNKS,
  async (c) => {
    const f = `${DIR}/${c}.json`, fs = `${DIR}/${c}-s.json`
    const [a, b, x, y] = await parallel([
      () => agent(l1(f), { label: `L1 znovuvideni ${c}`, phase: 'Judge', schema: L1 }),
      () => agent(l2(f), { label: `L2 vernost ${c}`, phase: 'Judge', schema: L2 }),
      () => agent(l3(f, 1), { label: `L3a celkove ${c}`, phase: 'Judge', schema: L3 }),
      () => agent(l3(fs, 2), { label: `L3b celkove ${c} (prohozene)`, phase: 'Judge', schema: L3 }),
    ])
    return { c, l1: a && a.pairs, l2: b && b.pairs, l3a: x && x.pairs, l3b: y && y.pairs ? y.pairs.map(swapBack) : null }
  },
  async (r) => {
    const f = `${DIR}/${r.c}.json`
    const byPid = arr => Object.fromEntries((arr || []).map(p => [p.pid, p]))
    const A3 = byPid(r.l3a), B3 = byPid(r.l3b), D2 = byPid(r.l2)
    const pids = Object.keys(A3).filter(p => B3[p])
    const spory = pids.filter(p => A3[p].better !== 'tie' && B3[p].better !== 'tie' && A3[p].better !== B3[p].better)
    const tie = await parallel(spory.map(p => () => agent(`${PRE}
File: ${f}

Judge ONLY pair ${p}. Two earlier judges disagreed about it. Which is the better reading, given its brief? Weigh: follows the brief (angle, image landing on the area, essence line, ending shape, name rule, four short sentences near the word count), the image carried through and made concrete, no cold reading, lean sentences that sound good aloud, no stock phrasing. better = A, B or tie; reason at most 25 words.`,
      { label: `tiebreak ${p}`, phase: 'Resolve', schema: TIE }).then(v => ({ pid: p, ...(v || {}) }))))
    const jednostranne = []
    for (const p of Object.keys(D2)) {
      const d = D2[p]
      if (d.a_verdict === 'drifts' && d.b_verdict !== 'drifts') jednostranne.push({ pid: p, strana: 'A', drift: d.a_drift })
      if (d.b_verdict === 'drifts' && d.a_verdict !== 'drifts') jednostranne.push({ pid: p, strana: 'B', drift: d.b_drift })
    }
    const skep = await parallel(jednostranne.map(j => () => agent(`${PRE}
File: ${f}

Look ONLY at pair ${j.pid}, reading ${j.strana}. A previous judge claimed this reading DRIFTS from its image: "${j.drift}".
Try to refute that claim. Drift means the core event of the source image is replaced, its sense is swapped (a sound image told as sight), or invented objects or events pull the scene somewhere the image is not. Concrete detail added inside the same scene is NOT drift, and moving on to the seeker's life later in the reading is NOT drift.
refuted = true if the reading in fact keeps the image's core (or if you are unsure); false only if the drift is clearly real. reason: at most 25 words.`,
      { label: `skeptik ${j.pid}${j.strana}`, phase: 'Resolve', schema: SKEP }).then(v => ({ ...j, ...(v || {}) }))))
    return { ...r, tiebreak: tie.filter(Boolean), skeptik: skep.filter(Boolean) }
  },
)
const chybi = vysledky.filter(v => !v || !v.l1 || !v.l2 || !v.l3a || !v.l3b).length
if (chybi) log(`POZOR: ${chybi} chunku ma aspon jednu cocku bez vysledku`)
return { vysledky }
