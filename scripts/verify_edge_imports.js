// každý import edge funkce (supabase/functions) míří na PŘESNOU verzi — žádné plovoucí `@2`.
//
// Proč (2026-10-11, nález CODE-read kolo 2 / 9; owner „8. připrav a pak nasaď“): všech 10 funkcí bralo
// `https://esm.sh/@supabase/supabase-js@2` — každé nasazení si vzalo nejnovější 2.x, takže funkce nasazené v různé dny běžely
// na různých knihovnách a výpadek nebo podvržení cizího CDN dopadlo na nasazení. Táž třída rizika jako klient (DECISIONS
// 2026-10-10 (33): v2/vendor/ s pevnou verzí). Připnuto na `npm:@supabase/supabase-js@<přesná>`.
// Co hlídá: specifikátor `npm:`, `jsr:` i URL importu musí nést verzi tvaru x.y.z; relativní importy (../_shared) jsou v pořádku.
//   node scripts/verify_edge_imports.js        · --test = kontrola sama sebe
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const FN = path.join(R, 'supabase', 'functions');

function specifikatory(txt) {
  const out = [];
  for (const m of txt.matchAll(/\bimport\s[^'"]*?from\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s+['"]([^'"]+)['"]/gm)) out.push(m[1] || m[2] || m[3]);
  return out;
}
function plovouci(spec) {
  if (/^\.{1,2}\//.test(spec)) return false;                       // vlastní sdílený kód
  if (!/^(npm:|jsr:|https?:)/.test(spec)) return true;            // holé jméno balíčku = verze podle nálady resolveru
  return !/@\d+\.\d+\.\d+([-+][\w.]+)?(\/|$)/.test(spec);         // chybí přesná verze x.y.z
}

if (process.argv[2] === '--test') {
  const ok = plovouci('https://esm.sh/@supabase/supabase-js@2') && plovouci('npm:@supabase/supabase-js@2') && plovouci('npm:@supabase/supabase-js')
    && !plovouci('npm:@supabase/supabase-js@2.117.3') && !plovouci('https://deno.land/std@0.168.0/http/server.ts') && !plovouci('../_shared/voice_usage.ts')
    && specifikatory('import { a } from "npm:x@1.2.3";\nimport "https://y@1.0.0/z.ts";').length === 2;
  console.log((ok ? 'OK    ' : 'FAIL  ') + 'samotest: plovoucí @2 i holé jméno padají, x.y.z a relativní import projdou');
  process.exit(ok ? 0 : 1);
}
let vady = 0, n = 0;
for (const d of fs.readdirSync(FN, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(FN, d.name))) {
    if (!/\.(ts|js|mjs)$/.test(f)) continue;
    const rel = d.name + '/' + f;
    for (const s of specifikatory(fs.readFileSync(path.join(FN, d.name, f), 'utf8'))) {
      n++;
      if (plovouci(s)) { vady++; console.log('FAIL  ' + rel + ': plovoucí import „' + s + '“'); }
    }
  }
}
console.log(vady ? vady + '× import edge funkce bez přesné verze — připni x.y.z (npm:/URL)'
                 : 'OK    edge funkce: ' + n + ' importů, všechny s přesnou verzí');
process.exit(vady ? 1 : 0);
