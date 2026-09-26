// Postaví to, co uvidí slepý soudce: 24 čtení v pevně zamíchaném pořadí, bez ramen a bez pokynů.
// Klíč (pořadí → runa/rameno) jde zvlášť do soudce_klic.json, soudce ho nevidí.
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(__dirname + '/konce_pilot.json', 'utf8'));
let s = 7; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
const idx = data.map((_, i) => i);
for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
const klic = [], txt = [];
idx.forEach((k, n) => {
  const d = data[k];
  klic.push({ id: n + 1, runa: d.runa, arm: d.arm });
  txt.push('#' + (n + 1) + ' · area: ' + d.area + (d.question ? ' · the seeker asked: "' + d.question + '"' : '') + '\n' + d.reading);
});
fs.writeFileSync(__dirname + '/soudce_klic.json', JSON.stringify(klic, null, 1));
fs.writeFileSync(__dirname + '/slepi_soudce.txt', txt.join('\n\n'));
console.log('ok', klic.length);
