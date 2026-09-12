// IMPORT MANNANAFNASKRÁ → v2/runar-names-registry.js
//
// PROČ: `runar-names.js` je KURÁTOROVANÝ seznam (etymologie, mýtus, přezdívky) a má dnes 123 jmen.
// Změřeno 2026-09-12: ze 402 nejběžnějších islandských jmen (Coats 2019) v něm **289 chybí** —
// tedy 72 %. Einar, Dagur, Bjarni, Árni, Gísli a další severská jména proto dostávala odpověď
// „Rúnar sees no Norse root in this name", což je nepravda. Tenhle rejstřík tu díru zavírá:
// rozhoduje otázku „je to vůbec islandské jméno?", takže u jména, které v kurátorovaném seznamu
// není, umí Rúnar říct pravdu („jméno znám, kořeny jsem u něj nedohledal") místo lži.
//
// ⚠️ CO REJSTŘÍK NENESE: etymologii, původ, ani nic, z čeho by se dal odvodit `norse: true/false`.
// Ověřeno na datech — `description` má jen 308 z 5859 záznamů a je to 2. pád nebo úřední poznámka
// („ef. Abigaelar", „Tekið úr birtingu að beiðni mnn"). Kdo sem někdy dopíše odvozování původu
// z rejstříku, domýšlí si (§23). Původ vzniká VÝHRADNĚ kurací v `runar-names.js`.
//
// ZDROJ: island.is GraphQL `getAllIcelandicNames` (Mannanafnaskrá, Þjóðskrá Íslands) —
// veřejné, bez klíče. Bere se jen `status: 'Sam'` (samþykkt = schválené) a `visible`;
// zamítnutá jména (`Haf`) se NEBEROU — o zamítnutém jménu nechceme tvrdit, že je islandské.
//
// SPUSTIT PŘI AKTUALIZACI:  node scripts/import_mannanafnaskra.js
const fs = require('fs'), path = require('path'), https = require('https');
const REPO = path.resolve(__dirname, '..');
const VEN = path.join(REPO, 'v2', 'runar-names-registry.js');

const DOTAZ = JSON.stringify({
  query: '{ getAllIcelandicNames { icelandicName type status visible } }',
});

function stahni() {
  return new Promise((ok, ne) => {
    const req = https.request('https://island.is/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(DOTAZ),
                 'User-Agent': 'Runar names import (agndofa.is)' },
      timeout: 60000,
    }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => {
        if (res.statusCode !== 200) return ne(new Error('HTTP ' + res.statusCode + ': ' + b.slice(0, 300)));
        try { ok(JSON.parse(b)); } catch (e) { ne(e); }
      });
    });
    req.on('error', ne);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end(DOTAZ);
  });
}

(async () => {
  const odpoved = await stahni();
  const vse = odpoved && odpoved.data && odpoved.data.getAllIcelandicNames;
  if (!Array.isArray(vse) || vse.length < 4000) {
    console.log('FAIL  rejstřík vrátil ' + (vse ? vse.length : 'nic') + ' záznamů — čekal jsem tisíce.');
    console.log('      Nic se nepřepisuje; zdroj se buď změnil, nebo je dočasně rozbitý.');
    process.exit(1);
  }
  // ⚠️ Tři záznamy jsou v datech špinavé (jeden „alexander jónas" = dvě jména v jednom poli,
  // dva s koncovou mezerou). Trim + rozpad na slova to vyřeší a oba díly jsou stejně platná jména.
  const jmena = new Set();
  let odmitnuto = 0;
  for (const z of vse) {
    if (z.status !== 'Sam' || z.visible === false) { odmitnuto++; continue; }
    String(z.icelandicName || '').toLowerCase().split(/\s+/).forEach((n) => {
      const c = n.trim();
      if (c) jmena.add(c);
    });
  }
  const serazene = [...jmena].sort();
  const den = new Date().toISOString().slice(0, 10);

  const hlava = [
    '// MANNANAFNASKRÁ — schválená islandská jména, ' + serazene.length + ' položek.',
    '//',
    '// GENEROVANÉ — needituj ručně. Zdroj: island.is GraphQL `getAllIcelandicNames`',
    '// (Mannanafnaskrá, Þjóðskrá Íslands). Stáhnout znovu: node scripts/import_mannanafnaskra.js',
    '// Stav k ' + den + ': ' + vse.length + ' záznamů v rejstříku, ' + odmitnuto + ' nepřevzato',
    '// (zamítnutá `Haf` + neviditelná — o zamítnutém jménu netvrdíme, že je islandské).',
    '//',
    '// ⚠️ NESE JEN JMÉNA. Žádnou etymologii, žádný původ — `norse: true/false` se z tohohle',
    '// odvodit NEDÁ a kdo to zkusí, domýšlí si (§23). Původ vlastní kurátorovaný `runar-names.js`.',
    '// K čemu to tedy je: rozhodne „je to vůbec islandské jméno?", takže u jména mimo kurátorovaný',
    '// seznam umí Rúnar říct pravdu („znám ho, kořeny jsem nedohledal") místo „kořeny nevidím".',
    '//',
    '// Uloženo jako JEDEN řetězec oddělený mezerou (37 kB proti 47 kB v poli, 15 kB po gzipu);',
    '// na Set se převádí až při první otázce, ne při načtení stránky.',
    'const IS_NAME_REGISTRY = ',
  ].join('\n');

  // Řetězec se láme na řádky po ~110 znacích, aby diff v gitu šel číst.
  const kusy = [];
  let radek = '';
  for (const n of serazene) {
    if (radek.length + n.length + 1 > 110) { kusy.push(radek); radek = ''; }
    radek += (radek ? ' ' : '') + n;
  }
  if (radek) kusy.push(radek);
  const telo = kusy.map((r, i) => "  '" + r + (i < kusy.length - 1 ? ' ' : '') + "'").join(' +\n');

  fs.writeFileSync(VEN, hlava + '\n' + telo + ';\n', 'utf8');
  console.log('OK    ' + path.relative(REPO, VEN) + ' — ' + serazene.length + ' jmen'
              + ' (' + Math.round(fs.statSync(VEN).size / 1024) + ' kB, ' + kusy.length + ' řádků)');
  console.log('      nepřevzato: ' + odmitnuto + ' (zamítnutá / neviditelná)');
})().catch((e) => { console.log('FAIL  ' + e.message); process.exit(1); });
