// Připraví slepé zadání pro čtyři soudce: sada G (Gemini) a sada L (návrh labu), každá dva soudci s jiným pořadím a maskováním.
const fs = require('fs'), path = require('path');
const REPO = 'C:/Users/zkuku/Downloads/Runar-admin';
const OUT = path.join(__dirname, 'soudci');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const vety = JSON.parse(fs.readFileSync(REPO + '/docs/eval/2026-11-26-v4-sfery/test-zameny/vety.json', 'utf8')).vety;
fs.copyFileSync(REPO + '/RUNAR_POPISY_RUN.md', path.join(OUT, 'popisy_run.md'));
const NAHRAZENE = ['K2', 'I1', 'W2', 'W3', 'A1', 'A2'];
const sady = {
  G: vety.filter(v => v.zdroj === 'gemini'),
  L: vety.filter(v => !NAHRAZENE.includes(v.id)),
};
function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; }
let posun = 0;
for (const [sada, seeds] of [['G', [7, 4242]], ['L', [99, 31337]]]) {
  for (const [k, seed] of [['A', seeds[0]], ['B', seeds[1]]]) {
    const jmeno = sada + '-' + k, r = rng(seed), arr = sady[sada].slice();
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    const mapa = {}, radky = [];
    arr.forEach((v, i) => { const m = 'V' + String(posun + i + 1).padStart(3, '0'); mapa[m] = v.id; radky.push(m + ': ' + v.text); });
    posun += 100;
    fs.writeFileSync(path.join(OUT, 'mapa_' + jmeno + '.json'), JSON.stringify(mapa, null, 1));
    fs.writeFileSync(path.join(OUT, 'vety_' + jmeno + '.txt'), radky.join('\n') + '\n');
    console.log(jmeno + ': ' + arr.length + ' vět');
  }
}
