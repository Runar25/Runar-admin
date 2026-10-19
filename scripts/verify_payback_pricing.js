// Kalkulačka návratnosti ve shrine (v2/runar-payback-admin.js, záložka PAYBACK) čte čísla přímo z RUNAR_PRICING.md — tři tabulky:
// „Subscription Pricing“, „ElevenLabs Plan — When to Upgrade“, „Fixed monthly costs“. Tahle kontrola pustí TENTÝŽ parser na doc a hlídá:
//   1. tabulky jdou přečíst (jinak by záložka ukázala jen chybu — a nikdo by si toho nevšiml, dokud ji owner neotevře);
//   2. řádky fixních nákladů po spuštění dávají dohromady řádek „Celkem“ (± $1) — kdo změní položku a zapomene součet (nebo naopak),
//      dozví se to tady, ne až z kalkulačky, která by počítala s jiným číslem, než doc tvrdí.
// Proč (2026-10-13, CODE-read): owner „payback nemá být odkaz na claude… nevadí, pokud to bude webovka“ — kalkulačka se přestěhovala
// do shrine a čísla nesmí bydlet na dvou místech (§20), proto je čte z docu a kontrola drží tvar docu.
//   node scripts/verify_payback_pricing.js     · --test = kontrola sama sebe
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const pb = require(path.join(R, 'v2', 'runar-payback-admin.js'));
// 2026-10-19: ceny předplatného bydlí v configu (TIERS.*.price_isk_month / _year), doc už jen kurz, plány ElevenLabs a fixní náklady.
const vm = require('vm');
const CFG = {}; vm.createContext(CFG);
vm.runInContext(fs.readFileSync(path.join(R, 'v2', 'runar-config.js'), 'utf8').replace(/^const /gm, 'var ').replace(/^let /gm, 'var '), CFG);
const TIERS = CFG.TIERS;

function over(md, tiers) {
  const p = pb.parsePricing(md, tiers || TIERS);
  const vady = p.chyby.slice();
  if (!vady.length) {
    const soucet = p.fix.concat(p.nativ).reduce((a, b) => a + b.usd, 0) + (p.elPo || 0);
    if (Math.abs(soucet - p.celkem) > 1) vady.push('fixní náklady po spuštění dávají $' + soucet.toFixed(2) + ', řádek „Celkem“ říká ~$' + p.celkem + ' — oprav položku nebo součet');
  }
  return { p, vady };
}

if (process.argv.includes('--test')) {
  const md = fs.readFileSync(path.join(R, 'RUNAR_PRICING.md'), 'utf8');
  const pripady = [
    ['dnešní doc projde', md, 0],
    ['položka změněná bez součtu padne', md.replace('| Supabase | 0 ✔ | 25 |', '| Supabase | 0 ✔ | 45 |'), 1],
    ['chybějící cena v configu padne', md, 1, Object.assign({}, TIERS, { premium: Object.assign({}, TIERS.premium, { price_isk_month: undefined }) })],
    ['chybějící kurz padne', md.replace(/\$1\s*=\s*[\d.,]+\s*ISK/g, 'kurz neuveden'), 1],
  ];
  let spatne = 0;
  for (const [jm, text, cekam, tiers] of pripady) {
    if (jm !== 'dnešní doc projde' && text === md && !tiers) { spatne++; console.log('FAIL  samotest: ' + jm + ' — podstrčení se neprojevilo (doc se změnil, uprav případ)'); continue; }
    const r = over(text, tiers);
    if ((r.vady.length > 0) !== !!cekam) { spatne++; console.log('FAIL  samotest: ' + jm + ' — ' + JSON.stringify(r.vady)); }
  }
  if (spatne) process.exit(1);
  console.log('OK    samotest kalkulačky návratnosti: ' + pripady.length + ' stavů');
  process.exit(0);
}

const r = over(fs.readFileSync(path.join(R, 'RUNAR_PRICING.md'), 'utf8'));
r.vady.forEach((v) => console.log('FAIL  ' + v));
if (r.vady.length) { console.log('FAIL  kalkulačka návratnosti (shrine PAYBACK) by RUNAR_PRICING.md nepřečetla správně'); process.exit(1); }
console.log('OK    kalkulačka návratnosti čte RUNAR_PRICING.md: ' + r.p.el.length + ' plánů hlasu, ' + (r.p.fix.length + r.p.nativ.length)
  + ' fixních položek, součet sedí na „Celkem“ ~$' + r.p.celkem);
