// CODE-read 2026-09-22 — tvrda cisla ze srovnani modelu. Jen to, co jde spocitat bez soudce:
// cena, tokeny, latence, format, delka proti rozpoctu (4 vety / 50–58 slov), jmeno runy, jmeno cloveka,
// tvar mostu (moznost + „nebo"), IS BAD_PATTERNS. Styl a IS vazby soudi az workflow.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DIR = __dirname;
const V = JSON.parse(fs.readFileSync(path.join(DIR, 'vysledky.json'), 'utf8'));
const MODELY = ['claude-opus-4-8', 'claude-opus-5', 'claude-opus-5-5', 'claude-opus-5-5@2000', 'gpt-5.6-sol', 'gpt-6-astra', 'gpt-6-sol', 'gpt-6-luna'];

// BAD_PATTERNS z check-is.py (jediny zdroj, §18)
const pats = JSON.parse(cp.execSync('python -X utf8 -c "import re,ast,io,json;s=io.open(r\'C:/Users/zkuku/Downloads/Runar-admin/check-is.py\',encoding=\'utf-8\').read();m=re.search(r\'BAD_PATTERNS\\s*=\\s*(\\[.*?\\n\\])\',s,re.S);p=ast.literal_eval(m.group(1));print(json.dumps([x[0] if isinstance(x,(list,tuple)) else x for x in p]))"').toString());

function vytahni(raw) {
  // produkce ceka JSON pole [{rune,text}]; kdyz model vrati neco jineho, je to vada formatu
  try { const a = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
        if (Array.isArray(a) && a[0] && a[0].text) return { ok: raw.trim().startsWith('['), text: a.map(x => x.text).join(' ').trim() }; } catch (e) {}
  return { ok: false, text: raw.trim() };
}
const vety = t => t.split(/(?<=[.?!])\s+(?=[A-ZÁÐÉÍÓÚÝÞÆÖ“"„])/).filter(s => s.trim());
const slov = t => t.split(/\s+/).filter(Boolean).length;
const prum = a => a.reduce((x, y) => x + y, 0) / a.length;

const radky = [];
for (const m of MODELY) for (const lang of ['en', 'is']) {
  const arr = V[m + '|' + lang];
  const ok = arr.filter(x => !x.error);
  const t = ok.map(x => vytahni(x.text));
  const posl = t.map(x => { const v = vety(x.text); return v[v.length - 1] || ''; });
  radky.push({
    m, lang, n: ok.length,
    konfig: ok[0] && ok[0].konfig, vraceny: ok[0] && ok[0].model_vraceny,
    stop: [...new Set(ok.map(x => x.stop))].join(','),
    tokIn: prum(ok.map(x => x.tok.in + (x.tok.cache_zapis || 0) + (m.startsWith('claude') ? x.tok.cache_cteni : 0))),
    tokOut: prum(ok.map(x => x.tok.out)),
    reas: prum(ok.map(x => x.tok.reasoning || 0)),
    cacheHit: ok.slice(1).some(x => x.tok.cache_cteni > 0),
    usdStud: ok[0].usd, usdTepla: prum(ok.slice(1).map(x => x.usd)),
    ms: prum(ok.map(x => x.ms)), msMin: Math.min(...ok.map(x => x.ms)), msMax: Math.max(...ok.map(x => x.ms)),
    json: t.filter(x => x.ok).length,
    slov: t.map(x => slov(x.text)), vet: t.map(x => vety(x.text).length),
    runa: t.filter(x => /Raidho|Reið|Raið/i.test(x.text)).length,
    kuky: t.filter(x => /Kuky/.test(x.text)).length,
    moznost: posl.filter(s => lang === 'en' ? /\bmay\b|\bmight\b|\bperhaps\b/i.test(s) : /gæti|kannski|má vera/i.test(s)).length,
    nebo: posl.filter(s => lang === 'en' ? /\bor\b/i.test(s) : /\beða\b/i.test(s)).length,
    bad: lang === 'is' ? t.reduce((s, x) => s + pats.filter(p => { try { return new RegExp(p, 'i').test(x.text); } catch (e) { return false; } }).length, 0) : 0,
    texty: t.map(x => x.text),
  });
}
fs.writeFileSync(path.join(DIR, 'metriky.json'), JSON.stringify(radky, null, 1));

const f = (x, d = 0) => x.toFixed(d);
console.log('CENA A RYCHLOST (prumer ze 3 volani; tepla = volani 2–3, kdyz uz je prompt v cache)\n');
console.log('model            jaz  tokeny vst/vyst  reason  $/cteni stud  $/cteni tepla  $/1000 cteni  latence s (min–max)  konfig');
for (const r of radky)
  console.log([r.m.padEnd(21), r.lang, (f(r.tokIn) + '/' + f(r.tokOut)).padStart(14), f(r.reas).padStart(6),
    ('$' + r.usdStud.toFixed(5)).padStart(13), ('$' + r.usdTepla.toFixed(5)).padStart(13),
    ('$' + f(r.usdTepla * 1000, 2)).padStart(12), (f(r.ms / 1000, 1) + ' (' + f(r.msMin / 1000, 1) + '–' + f(r.msMax / 1000, 1) + ')').padStart(18),
    ' ' + r.konfig + (r.cacheHit ? ' · cache✓' : '')].join('  '));
console.log('\nPOSLUSNOST ZADANI (z 3 cteni): rozpocet 4 vety / 50–58 slov · JSON · runa · jmeno Kuky · posledni veta = moznost + „nebo" · IS BAD_PATTERNS');
console.log('model            jaz  slov (3 cteni)   vet      JSON  runa  Kuky  moznost  nebo  stop       IS bad');
for (const r of radky)
  console.log([r.m.padEnd(21), r.lang, r.slov.join('/').padEnd(14), r.vet.join('/').padEnd(8),
    (r.json + '/3').padEnd(5), (r.runa + '/3').padEnd(5), (r.kuky + '/3').padEnd(5), (r.moznost + '/3').padEnd(8),
    (r.nebo + '/3').padEnd(5), r.stop.padEnd(10), r.lang === 'is' ? String(r.bad) : '–'].join('  '));
console.log('\nvracene ID modelu: ' + [...new Set(radky.map(r => r.m + '→' + r.vraceny))].join(' · '));
