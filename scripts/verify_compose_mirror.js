// §19 contract: the proxy's composeReading (TS) MUST produce the same stored text as the
// client's _parseSegments(...).reading (JS). This harness loads the REAL _parseSegments from
// runar-reading.js and compares it, over representative fixtures, against a JS mirror of the
// TS composeReading. If a future edit to _parseSegments changes its output, this fails loudly
// — a reminder to update the proxy's composeReading (they are a mirrored pair).
const fs = require('fs');
const path = require('path');

// ── extract the REAL _parseSegments source from the client file (brace-match) ──
const src = fs.readFileSync(path.join(__dirname, '..', 'v2', 'runar-reading.js'), 'utf8');
const start = src.indexOf('function _parseSegments(raw) {');
if (start === -1) throw new Error('_parseSegments not found');
let i = src.indexOf('{', start), depth = 0, end = -1;
for (; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const fnSrc = src.slice(start, end);
const _parseSegments = new Function(fnSrc + '\nreturn _parseSegments;')();

// ── JS mirror of the TS composeReading (must match index.ts line-for-line) ──
function composeReading(raw) {
  if (!raw) return "";
  const s = String(raw);
  const a = s.indexOf("["), b = s.lastIndexOf("]");
  if (a !== -1 && b > a) {
    try {
      const j = JSON.parse(s.slice(a, b + 1));
      if (Array.isArray(j) && j.length && j[0] && typeof j[0].text === "string") {
        let reading = j.map((x) => (x.text || "").trim()).join(" ").trim();
        const tail = s.slice(b + 1).replace(/```/g, "").trim();
        if (tail) reading = (reading + " " + tail).trim();
        return reading;
      }
    } catch (_e) { /* fall through */ }
  }
  return String(raw);
}

const fixtures = [
  ['empty',         ''],
  ['plain prose',   'Fehu speaks of movement. The herd stirs before dawn.'],
  ['single seg',    '[{"rune":"Fehu","text":"The herd stirs before dawn."}]'],
  ['spread 3 seg',  '[{"rune":"Fehu","text":"First."},{"rune":"Uruz","text":"Second."},{"rune":"Ansuz","text":"Third."}]'],
  ['seg + tail',    '[{"rune":"Fehu","text":"The herd stirs."}]\nAnd so the path opens before you.'],
  ['code-fenced',   '```json\n[{"rune":"Fehu","text":"Fenced reading here."}]\n```'],
  ['deeper field',  '[{"rune":"Fehu","text":"Visible line.","deeper_meaning":"hidden"}]'],
  ['whitespace seg','[{"rune":"Fehu","text":"  padded  "}]'],
  ['non-json bracket','He said [aside] and walked on. No array here.'],
];

let fail = 0;
for (const [name, raw] of fixtures) {
  const expected = _parseSegments(raw).reading;   // REAL client parser
  const got = composeReading(raw);                // mirror of proxy TS
  const ok = expected === got;
  if (!ok) fail++;
  console.log((ok ? 'OK  ' : 'FAIL') + '  ' + name + (ok ? '' : `\n      _parseSegments: ${JSON.stringify(expected)}\n      composeReading: ${JSON.stringify(got)}`));
}
console.log(fail === 0 ? '\nALL MATCH — proxy composeReading is a faithful mirror.' : `\n${fail} MISMATCH(es) — fix index.ts composeReading.`);
process.exit(fail === 0 ? 0 : 1);
