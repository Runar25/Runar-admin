// hlas_archiv.js — archiv hlasů z pokusů: každá nahrávka, kterou vygenerujeme, se uloží i s tím, z čeho vznikla.
//
// Proč (owner 2026-10-29: „vždy ukládat, jak čtení, která generujeme, tak hlasy, ať máme s čím porovnávat“): pokusy s hlasem
// (rituál 2026-10-27/28, hlas ve čtení 2026-10-28) ležely každý ve své složce, stránka k poslechu se při dalším běhu přepsala jen novými
// variantami a text, ze kterého nahrávka vznikla, u R3 (značky od modelu) nebyl nikde kromě HTML. Teď jedna složka, jeden katalog,
// jedna stránka se VŠÍM — starší nahrávka se nikdy nepřepíše (stejné jméno dostane číslo).
//
// Kde: ~/runar-eval/hlasy/<pokus>/<jmeno>.mp3 + ~/runar-eval/hlasy/katalog.jsonl (řádek = nahrávka: datum, pokus, jméno, popis, jazyk,
// model, nastavení, text, znaky, soubor) + ~/runar-eval/hlasy/poslech.html (všechno, nejnovější pokus nahoře). Mimo repo: texty čtení
// patří uživatelům (DECISIONS 2026-08-08).
//   const { uloz, poslech } = require('../../scripts/utils/hlas_archiv');   uloz({...}) → cesta souboru; poslech() → stránka
//   node scripts/utils/hlas_archiv.js            jen přestaví poslech.html z katalogu
// Pojistka: zachytVolne() (pouští ji Stop-hook přes zaloha_cteni.js) najde .mp3, které nějaký skript uložil MIMO archiv (scratchpady
// session, ~/runar-eval, eval_out/), a zkopíruje je do hlasy/zachyceno/ — se zdrojem, bez textu (ten skript archivu nepředal).
// Pravidlo „ukládej“ tak nevisí na tom, jestli si skript vzpomene (§30).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const DIR = path.join(os.homedir(), 'runar-eval', 'hlasy');
const KATALOG = path.join(DIR, 'katalog.jsonl');

function nactiKatalog() {
  if (!fs.existsSync(KATALOG)) return [];
  return fs.readFileSync(KATALOG, 'utf8').split('\n').filter(Boolean).map((r) => JSON.parse(r));
}

function uloz({ pokus, jmeno, popis, jazyk, model, nastaveni, text, mp3, datum }) {
  if (!pokus || !jmeno || !mp3) throw new Error('hlas_archiv.uloz: chybí pokus, jméno nebo zvuk');
  const slozka = path.join(DIR, pokus);
  fs.mkdirSync(slozka, { recursive: true });
  let f = jmeno + '.mp3', i = 2;
  while (fs.existsSync(path.join(slozka, f))) f = jmeno + '-' + (i++) + '.mp3';   // nikdy nepřepsat starší nahrávku
  fs.writeFileSync(path.join(slozka, f), mp3);
  const zaznam = { sha1: crypto.createHash('sha1').update(mp3).digest('hex'), datum: datum || new Date().toISOString(), pokus, jmeno, popis: popis || '', jazyk: jazyk || '', model: model || '',
    nastaveni: nastaveni || null, text: text || '', znaku: (text || '').length, soubor: pokus + '/' + f };
  fs.appendFileSync(KATALOG, JSON.stringify(zaznam) + '\n');
  return zaznam.soubor;
}

function poslech() {
  const vse = nactiKatalog();
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pokusy = [...new Set(vse.map((z) => z.pokus))].sort().reverse();
  const html = pokusy.map((p) => '<h2>' + esc(p) + '</h2>\n' + vse.filter((z) => z.pokus === p).map((z) =>
    '<div class="r"><b>' + esc(z.jazyk.toUpperCase() + ' · ' + z.jmeno) + '</b> <span>' + esc(z.popis) + ' · ' + esc(z.model)
    + (z.nastaveni ? ' · ' + esc(JSON.stringify(z.nastaveni)) : '') + ' · ' + z.znaku + ' zn. · ' + esc(z.datum.slice(0, 16).replace('T', ' ')) + '</span><br>'
    + '<audio controls preload="metadata" src="' + esc(z.soubor) + '"></audio><div class="t">' + esc(z.text) + '</div></div>').join('\n')).join('\n');
  const out = path.join(DIR, 'poslech.html');
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(out, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Archiv hlasů Rúnara</title>'
    + '<style>body{font-family:Georgia,serif;background:#0f141f;color:#e8dcc2;max-width:820px;margin:24px auto;padding:0 16px}h2{color:#d6a85c;font-weight:normal;border-bottom:1px solid #2e4a70;padding-bottom:6px;margin-top:36px}'
    + '.r{border-bottom:1px solid #1f2c42;padding:12px 0}span{color:#9fb0c8;font-size:.85em}audio{width:100%;margin:8px 0}.t{font-size:.85em;color:#9fb0c8}</style>'
    + '<h1>Archiv hlasů Rúnara</h1><p>' + vse.length + ' nahrávek · nejnovější pokus nahoře · katalog: katalog.jsonl</p>\n' + html);
  return out;
}

function zachytVolne(koreny, opts) {
  opts = opts || {};
  const kat = nactiKatalog(), zname = new Set();
  for (const z of kat) { let h = z.sha1; if (!h) { try { h = crypto.createHash('sha1').update(fs.readFileSync(path.join(DIR, z.soubor))).digest('hex'); } catch (e) {} } if (h) zname.add(h); }
  const najdi = (d, hl, out) => { if (hl < 0) return out; let pol; try { pol = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return out; }
    for (const p of pol) { const c = path.join(d, p.name); if (p.isDirectory()) { if (c !== DIR && p.name !== 'node_modules' && p.name !== '.git') najdi(c, hl - 1, out); } else if (/\.mp3$/i.test(p.name)) out.push(c); } return out; };
  let nove = 0;
  for (const k of koreny) for (const f of najdi(k, 6, [])) {
    let buf; try { buf = fs.readFileSync(f); } catch (e) { continue; }
    if (buf.length < 2000) continue;
    const h = crypto.createHash('sha1').update(buf).digest('hex');
    if (zname.has(h)) continue;
    zname.add(h); nove++;
    if (!opts.suchy) uloz({ pokus: 'zachyceno', jmeno: path.basename(f, '.mp3'), popis: 'zachyceno zálohou ze ' + f + ' — text skript archivu nepředal', mp3: buf,
      datum: fs.statSync(f).mtime.toISOString() });
    else console.log('  ' + f);
  }
  if (nove && !opts.suchy) poslech();
  return nove;
}

module.exports = { uloz, poslech, nactiKatalog, zachytVolne, DIR };
if (require.main === module) console.log('poslech:', poslech());
