// Smoke ㊈: hlídání provozu (supabase/functions/_shared/ops_souhrn.ts) na známých datech — kdy je problém, kdy jde e-mail, jak vypadá souhrn.
// Proč (CODE-tune 2026-10-14, DECISIONS 2026-10-14 (13)): upozornění, které nepřijde, je horší než žádné (owner se na něj spolehne), a
// upozornění, které chodí pořád, se přestane číst. Obojí visí na prazích a na rozhodnutí „jen při změně stavu“ — tady se protlačí
// skutečný kód (typy odstraní Node) a ověří VÝSLEDEK (§19): stav, předmět, „Needs you“, čísla, EN bez češtiny (§31), escapování.
//   node scripts/verify_ops_souhrn.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
let strip;
try { strip = require('node:module').stripTypeScriptTypes; } catch (e) { strip = null; }
if (typeof strip !== 'function') { console.log('FAIL  tenhle Node neumí stripTypeScriptTypes (potřeba Node ≥ 22.13)'); process.exit(1); }
process.removeAllListeners('warning'); process.on('warning', () => {});
const src = fs.readFileSync(path.join(ROOT, 'supabase', 'functions', '_shared', 'ops_souhrn.ts'), 'utf8');
const js = strip(src).replace(/^export\s+/gm, '');
const S = {}; vm.createContext(S);
vm.runInContext(js + '\n;globalThis.__o = { PRAHY, KLICE, stavy, upozorneni, souhrn };', S);
const O = S.__o;
let fail = 0;
const ok = (c, p) => { if (c) console.log('OK    ' + p); else { fail++; console.log('FAIL  ' + p); } };

const TED = '2026-10-14T05:00:00.000Z';
const hod = (h) => new Date(Date.parse(TED) - h * 3.6e6).toISOString();
const H = (o) => Object.assign({ ted: TED, chybModelu60: 0, zalohModelu60: 0, cteni60: 10, brzd60: 0,
  zaloha: { posledniOk: hod(3), bajtu: 5e6, posledniChyba: null } }, o);

// 1) stavy
ok(O.stavy(H({ chybModelu60: 3 })).model === 'problem' && O.stavy(H({ chybModelu60: 2 })).model === 'ok', 'model: 3 selhání za hodinu = problém, 2 ne');
ok(O.stavy(H({ zalohModelu60: 3, cteni60: 7 })).model === 'problem' && O.stavy(H({ zalohModelu60: 3, cteni60: 20 })).model === 'ok',
  'model: 3 přepnutí na zálohu při 30 % pokusů = problém, při 15 % ne');
ok(O.stavy(H({ brzd60: 1 })).voice_brake === 'problem' && O.stavy(H({})).voice_brake === 'ok', 'brzda hlasu: zásah za hodinu = problém');
ok(O.stavy(H({ zaloha: { posledniOk: hod(27), bajtu: 1, posledniChyba: null } })).backup === 'problem', 'záloha: poslední úspěch před 27 h = problém');
ok(O.stavy(H({ zaloha: { posledniOk: hod(2), bajtu: 1, posledniChyba: hod(1) } })).backup === 'problem', 'záloha: chyba po posledním úspěchu = problém');
ok(O.stavy(H({ zaloha: { posledniOk: null, bajtu: null, posledniChyba: null } })).backup === 'unknown',
  'záloha: ještě žádný záznam = neznámo, bez poplachu hned po nasazení');

// 2) upozornění jen při změně
const vse = (s) => ({ model: s, voice_brake: s, backup: s });
ok(O.upozorneni(vse('ok'), vse('ok'), H({})) === null, 'beze změny stavu žádný e-mail');
ok(O.upozorneni({ model: 'unknown', voice_brake: 'unknown', backup: 'unknown' }, vse('ok'), H({})) === null, 'neznámo → v pořádku: žádný e-mail');
const p = O.upozorneni(vse('ok'), { model: 'ok', voice_brake: 'ok', backup: 'problem' }, H({ zaloha: { posledniOk: hod(27), bajtu: 1, posledniChyba: null } }));
ok(p && /^Rúnar Ops · PROBLEM · Database backup/.test(p.subject) && /Last successful backup/.test(p.text), 'v pořádku → problém: e-mail PROBLEM s důvodem');
const r = O.upozorneni({ model: 'problem', voice_brake: 'ok', backup: 'ok' }, vse('ok'), H({}));
ok(r && /^Rúnar Ops · RESOLVED · Reading model/.test(r.subject), 'problém → v pořádku: e-mail RESOLVED');

// 3) ranní souhrn
const D = (o) => Object.assign({ od: hod(24), do: TED, cteni: 0, spready: 0, asky: 0, modely: {}, cenaModelu: 0, bezCeny: 0, hlasy: 0, znakyHlasu: 0,
  cenaHlasu: 0, hlaseni: {}, ulozeno: 0, chybModelu: 0, zalohModelu: 0, brzd: 0,
  kredity: { spotreba: 3000, hladina: 90000, limit: 103807, reset: '2026-11-10T00:00:00.000Z' },
  zaloha: { posledniOk: hod(3), bajtu: 5e6, posledniChyba: null }, otevrene: vse('ok') }, o);
const klid = O.souhrn(D({}));
ok(klid.stav === 'OK' && klid.subject === 'Rúnar Ops · OK · 0 readings · 0 voices · $0.00' && /Nothing needs you/.test(klid.text), 'klidný den: OK, „Nothing needs you“');
const den = O.souhrn(D({ cteni: 12, spready: 2, asky: 3, modely: { 'gpt-6-sol': 14, 'claude-opus-5': 1 }, cenaModelu: 0.21, hlasy: 7, znakyHlasu: 2100,
  cenaHlasu: 0.1, hlaseni: { crash: 1, visual: 2 }, ulozeno: 4 }));
ok(den.stav === 'WATCH' && den.subject === 'Rúnar Ops · WATCH · 12 readings · 7 voices · $0.31' && /3 new app reports \(visual 2, crash 1\)/.test(den.text)
  && /saved lines \(Keep\) 4/.test(den.text), 'den s hlášeními: WATCH, počty podle typu bez textu, Keep zvlášť');
const zle = O.souhrn(D({ otevrene: { model: 'ok', voice_brake: 'problem', backup: 'ok' } }));
ok(zle.stav === 'PROBLEM' && /credit brake/.test(zle.text), 'otevřený problém: PROBLEM a nahoře v „Needs you“');
const malo = O.souhrn(D({ kredity: { spotreba: 85000, hladina: 90000, limit: 103807, reset: null } }));
ok(/only 5,000 credits left/.test(malo.text) && malo.stav === 'WATCH', 'málo kreditů do brzdy: řádek v „Needs you“');
const bez = O.souhrn(D({ zaloha: { posledniOk: null, bajtu: null, posledniChyba: null } }));
ok(/No database backup has reported/.test(bez.text) && bez.stav === 'WATCH', 'záloha ještě nehlásila: WATCH s pokynem');
const zly = O.souhrn(D({ modely: { '<script>x': 1 } }));
ok(zly.html.indexOf('<script>') === -1 && zly.html.indexOf('&lt;script&gt;') !== -1, 'HTML escapované');
const cz = [klid, den, zle, malo, bez, p, r].map((e) => e.subject + e.html + e.text).join(' ');
ok(!/[ěščřžůňťďĚŠČŘŽŮŇŤĎ]/.test(cz), 'e-maily bez češtiny (§31 — admini EN)');

console.log(fail ? '\nFAIL  hlídání provozu: ' + fail + ' případů nesedí'
  : '\nOK    hlídání provozu: prahy, e-mail jen při změně stavu, ranní souhrn (OK / WATCH / PROBLEM, Needs you, čísla) — EN, escapované');
process.exit(fail ? 1 : 0);
