// Kontrola: ktere los konce vedou k Asku "nerozumim / co tim myslis / vysvetli"? (owner, EN, od 2026-08-01)
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'prod_cteni.txt'), 'utf8'); t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows;
const NEPO = /(don'?t|do not|dont) understand|what do you mean|what does (that|this|it) mean|explain|what.{0,20}mean\b/i;
const by = {}; let celkem = 0;
for (const r of rows) {
  let d = {}, fu = []; try { d = JSON.parse(r.draws || '{}'); } catch (e) {} try { fu = JSON.parse(r.fu || '[]') || []; } catch (e) {}
  if (!d.ending || !fu.length) continue;
  const q = fu[0].q || '';
  const k = d.ending; by[k] = by[k] || { ask: 0, nep: 0, ukazky: [] }; by[k].ask++; celkem++;
  if (NEPO.test(q)) { by[k].nep++; by[k].ukazky.push((r.rune_name || '') + ': ' + q.slice(0, 90)); }
}
console.log('čtení s losem konce a s Askem: ' + celkem);
for (const [k, x] of Object.entries(by).sort()) { console.log(k.padEnd(8) + ' Ask ' + String(x.ask).padEnd(3) + ' nepochopení ' + x.nep); x.ukazky.forEach(u => console.log('          » ' + u)); }
