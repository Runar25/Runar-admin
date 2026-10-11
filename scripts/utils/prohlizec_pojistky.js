// Pojistky kontrol ve skutečném prohlížeči (Chrome bez okna přes DevTools) — JEDNO místo pro všechny, které ji zapojí (CODE-tune 2026-10-11).
//
// Proč: pre-push CODE-tune 2026-10-11 stál 48 minut na verify_wts.js (smoke ㊺) a CODE-read hlásil, že mu tatáž kontrola v čisté kopii
// „visí“. Kontroly neměly celkový limit: když Chrome bez okna při souběhu (smoke, protipříklady, pushe jiných session) spadl, nebo stránka
// otevřela dialog, čekaly na odpověď, která nepřišla — navždy, a s nimi push každé session. CODE-tree totéž opravil v ㊷ (c05fcb3), CODE-read
// dal limit na útok do protipříkladů (39e91ca); tohle je pojistka pro samotné běhy kontrol ve smoke.
// Co dělá: (1) limit — po N s vypíše FAIL „visí“ s posledním krokem, zabije Chrome a skončí s kódem 1; (2) spojení s Chrome se zavře dřív,
// než kontrola skončí → FAIL „spadl“; (3) dialog (alert / confirm / beforeunload) sám potvrdí, ať nezablokuje stránku, a zapíše ho —
// kontrola ho z hotovo() ohlásí jako FAIL.
//   const poj = require('./utils/prohlizec_pojistky').zabezpec({ ws, proc, jmeno: 'okno Where to start (㊺)', limitS: 180 });
//   poj.krok('3. nasazená verze');  …  const dialogy = poj.hotovo();   // před zabitím Chrome; prázdné = v pořádku
//   node scripts/utils/prohlizec_pojistky.js --test
'use strict';

function zabezpec({ ws, proc, jmeno, limitS }) {
  let krok = 'start', skoncilo = false, idDialogu = 990000;
  const dialogy = [];
  const selhani = (zprava) => {
    if (skoncilo) return;
    skoncilo = true;
    console.log('FAIL  ' + jmeno + ': ' + zprava + ' (krok: ' + krok + ')');
    try { proc.kill(); } catch (e) {}
    setTimeout(() => process.exit(1), 300);
  };
  const casovac = setTimeout(() => selhani('visí déle než ' + limitS + ' s — Chrome bez okna nebo stránka neodpověděla'), limitS * 1000);
  ws.addEventListener('close', () => { if (!skoncilo) selhani('spojení s Chrome bez okna se zavřelo dřív, než kontrola skončila (spadl?)'); });
  ws.addEventListener('message', (m) => {
    let d; try { d = JSON.parse(m.data); } catch (e) { return; }
    if (d.method !== 'Page.javascriptDialogOpening') return;
    dialogy.push(krok + ': ' + d.params.type + ' „' + String(d.params.message || '').slice(0, 80) + '“');
    try { ws.send(JSON.stringify({ id: ++idDialogu, method: 'Page.handleJavaScriptDialog', params: { accept: true } })); } catch (e) {}
  });
  return {
    krok: (k) => { krok = k; },
    hotovo: () => { skoncilo = true; clearTimeout(casovac); return dialogy.slice(); },
  };
}
module.exports = { zabezpec };

if (require.main === module && process.argv.includes('--test')) {
  // Samotest (falešné spojení a proces v dětském procesu, ať jde ověřit i konec přes process.exit): dialog se potvrdí a zapíše ·
  // zavřené spojení před koncem = FAIL · limit = FAIL · hotovo() před zavřením spojení FAIL nevyvolá.
  const cp = require('child_process');
  const pust = (telo) => cp.spawnSync(process.execPath, ['-e', `
    const { zabezpec } = require(${JSON.stringify(__filename)});
    class Ws extends EventTarget { constructor() { super(); this.poslano = []; } send(s) { this.poslano.push(JSON.parse(s)); }
      zprava(o) { const e = new Event('message'); e.data = JSON.stringify(o); this.dispatchEvent(e); } zavri() { this.dispatchEvent(new Event('close')); } }
    const ws = new Ws(), proc = { zabit: 0, kill() { this.zabit++; } };
    ${telo}`], { encoding: 'utf8', timeout: 10000 });
  const P = [
    ['dialog se potvrdí a zapíše', pust(`const p = zabezpec({ ws, proc, jmeno: 't', limitS: 5 }); p.krok('k1');
      ws.zprava({ method: 'Page.javascriptDialogOpening', params: { type: 'alert', message: 'ahoj' } });
      const d = p.hotovo(); console.log(d.length === 1 && /k1: alert/.test(d[0]) && ws.poslano[0].method === 'Page.handleJavaScriptDialog' ? 'ANO' : 'NE');`),
      (r) => r.status === 0 && /ANO/.test(r.stdout)],
    ['spojení zavřené před koncem = FAIL a kód 1', pust(`zabezpec({ ws, proc, jmeno: 't', limitS: 5 }); ws.zavri();`),
      (r) => r.status === 1 && /FAIL  t: spojení/.test(r.stdout)],
    ['limit = FAIL „visí“ a kód 1', pust(`const p = zabezpec({ ws, proc, jmeno: 't', limitS: 0.2 }); p.krok('k2');`),
      (r) => r.status === 1 && /visí déle než 0.2 s/.test(r.stdout) && /krok: k2/.test(r.stdout)],
    ['hotovo() před zavřením spojení = bez FAIL', pust(`const p = zabezpec({ ws, proc, jmeno: 't', limitS: 5 }); p.hotovo(); ws.zavri(); console.log('KONEC');`),
      (r) => r.status === 0 && /KONEC/.test(r.stdout) && !/FAIL/.test(r.stdout)],
  ];
  const zle = P.filter(([, r, ok]) => !ok(r));
  zle.forEach(([n, r]) => console.log('FAIL test: ' + n + ' — kód ' + r.status + ' · ' + (r.stdout + r.stderr).trim().slice(0, 200)));
  if (!zle.length) console.log('OK    test pojistek prohlížeče: ' + P.length + ' případů (dialog, spadlé spojení, limit, řádný konec)');
  process.exit(zle.length ? 1 : 0);
}
