// rodiny_vyznamu.js — RODINY VARIANT VÝZNAMŮ: pro každý význam runy (RUNES.k) skupina tvarů slova („hidden · hide · hides · hiding“) a jak
// často se rodina objeví v posledních čteních té runy — a odkud tam nejspíš přišla: z obrazu (slovo stojí v obrazu z losu), z aspektu
// (vylosovaná hlavička „focus on: …“), nebo odjinud (model sám / význam runy, který zná).
//
// Proč (owner 2026-10-22): „každý obraz runy by měl být vytvořen tak, že v něm význam runy bude … když model bere význam z obrazu, vědět
// to“ a „detekovat prosakující slova a jejich varianty“. Krok 5 plánu „z čeho se skládá čtení“ („10. ano 11. ano“); owner chtěl napřed
// vzorek na pár runách („9. ano“) — tenhle nástroj ho dělá.
// Rodiny jsou PRAVIDLOVÉ (koncovky, odtržení -ness/-ity/-ion, pár nepravidelných tvarů v NEPRAVIDELNE) — návrh k posouzení, ne slovník.
// Hranice: shoda slova není příčina (§25); slovo z obrazu mohl model napsat i sám. Jen jedna runa (spready mají víc run v jednom textu).
// Výstup nese texty čtení → mimo repo.
//   node scripts/rodiny_vyznamu.js [--runy Perth,Isa,Fehu] [--n 40] [--vystup <cesta>]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const M = require('./monitor_ozveny.js');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };
const RUNY = arg('--runy', 'Perth,Isa,Fehu').split(',').map((x) => x.trim()).filter(Boolean);
const N = Number(arg('--n', 40));
const VYSTUP = arg('--vystup', path.join(os.tmpdir(), 'runar_rodiny_vyznamu_' + new Date().toISOString().slice(0, 10) + '.md'));

// Nepravidelné tvary (ručně, ať jde vidět, co pravidlo neumí) — owner je posoudí ve vzorku.
const NEPRAVIDELNE = { hidden: ['hide', 'hides', 'hiding', 'hid'], clarity: ['clear', 'clearly', 'clearer', 'clarify'], unseen: ['unseen'],
  cold: ['cold', 'colder', 'coldness'], ice: ['icy', 'iced'], luck: ['lucky', 'luckily'], light: ['lights', 'lit', 'lighter'],
  wealth: ['wealthy'], cattle: ['cattle', 'cow', 'cows', 'herd', 'herds'], making: ['make', 'makes', 'made'] };
const MALA = new Set(('the a an of to in on at for with and or through into coming').split(' '));
function tvary(w, hloubka) {
  const o = new Set([w]);
  const add = (x) => { if (x && x.length > 2) o.add(x); };
  const podst = /(ness|ity|ion|ment)$/.test(w);
  if (!podst && !w.endsWith('ing') && !w.endsWith('s')) {
    if (w.endsWith('e')) { add(w + 's'); add(w + 'd'); add(w.slice(0, -1) + 'ing'); }
    else if (w.endsWith('y')) { add(w.slice(0, -1) + 'ies'); add(w.slice(0, -1) + 'ied'); add(w + 'ing'); }
    else { add(w + 's'); add(w + 'ed'); add(w + 'ing'); }
  } else if (podst) add(w + 's');
  // odtržení přípony podstatného jména / průběhového tvaru → kořen a jeho tvary (jednou, bez další rekurze)
  if (!hloubka) for (const suf of ['ness', 'ity', 'ion', 'ment', 'ing'])
    if (w.endsWith(suf) && w.length > suf.length + 3) tvary(w.slice(0, -suf.length), 1).forEach(add);
  (NEPRAVIDELNE[w] || []).forEach(add);
  return [...o];
}
// rodina významu = tvary jeho plnovýznamových slov (u víceslovného významu stačí kterékoli slovo kromě malých)
function rodina(vyznam) {
  const slova = (String(vyznam).toLowerCase().match(/[a-z]+/g) || []).filter((x) => !MALA.has(x) && x.length > 2);
  const o = new Set(slova);
  slova.forEach((x) => tvary(x).forEach((t) => { if (typeof SLOVNIK === 'undefined' || SLOVNIK.has(t)) o.add(t); }));
  return [...o];
}
const najdi = (text, rod) => { const w = ' ' + (String(text).toLowerCase().match(/[a-z']+/g) || []).join(' ') + ' ';
  return rod.filter((t) => w.indexOf(' ' + t + ' ') !== -1); };

function cteni(runa) {
  const sql = "select id, drawn_at, short_text, prompt_draws from " + M.CTENI + " where lang = 'en' and rune_name = '" + runa.replace(/'/g, '')
    + "' and coalesce(area,'') <> 'spread' and prompt_draws is not null order by drawn_at desc limit " + N;
  const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: M.ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return Array.isArray(j) ? j : j.rows;
}

// Slovník = slova, která se ve všech EN čteních opravdu vyskytují (2026-10-23): pravidlové tvary jako „hiddens“ nikde nestojí — do rodiny
// se ukáže jen to, co v textech existuje, plus slova samotného významu. Na počty to nemá vliv (neexistující tvar se nenajde), jen na čitelnost.
function slovnik() {
  const sql = "select short_text from " + M.CTENI + " where lang = 'en' order by drawn_at desc limit 3000";
  const src = cp.execSync('supabase db query --linked "' + sql + '"', { cwd: M.ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const j = JSON.parse(src.slice(src.search(/[\[{]/))), rows = Array.isArray(j) ? j : j.rows, o = new Set();
  for (const r of rows) (M.telo(r.short_text).toLowerCase().match(/[a-z']+/g) || []).forEach((w) => o.add(w));
  return o;
}
const SLOVNIK = slovnik();
const md = ['# Rodiny variant významů — vzorek ' + new Date().toISOString().slice(0, 10), '',
  'Rodina = tvary slov významu (pravidla koncovek + ruční nepravidelné). „z obrazu“ = slovo z rodiny stojí i v obrazu z losu toho čtení; „z aspektu“ = ve vylosované hlavičce významu; „jinde“ = ani tam (model sám / význam, který zná). Shoda není příčina.', ''];
for (const n of RUNY) {
  const r = M.RUNES.find((x) => x.n === n);
  if (!r) { md.push('## ' + n + ' — runa nenalezena', ''); continue; }
  const rows = cteni(n);
  const vyznamy = String(r.k).split(',').map((x) => x.trim()).filter(Boolean);
  md.push('## ' + n + ' — ' + rows.length + ' čtení EN (jedna runa)', '', '| význam | rodina (tvary) | ve čtení | z obrazu | z aspektu | jinde |', '|---|---|---|---|---|---|');
  for (const v of vyznamy) {
    const rod = rodina(v);
    let ve = 0, zObrazu = 0, zAspektu = 0, jinde = 0;
    for (const x of rows) {
      let d = x.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } } d = d || {};
      const hit = najdi(M.telo(x.short_text), rod);
      if (!hit.length) continue;
      ve++;
      if (najdi(d.image || '', hit).length) zObrazu++;
      else if (najdi(d.kws || '', hit).length) zAspektu++;
      else jinde++;
    }
    md.push('| ' + [v, rod.join(' · '), ve + ' / ' + rows.length, zObrazu, zAspektu, jinde].join(' | ') + ' |');
  }
  md.push('');
}
fs.writeFileSync(VYSTUP, md.join('\n'));
console.log('zapsáno (mimo repo — nese texty čtení):', VYSTUP);
console.log(md.join('\n'));
