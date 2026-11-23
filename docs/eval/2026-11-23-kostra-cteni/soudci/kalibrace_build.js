// Lab 2026-11-23: KALIBRACE SOUDCŮ dřív, než budou soudit zkoušku (owner: „rád bych věděl, že kontrolují a hlídají to, co mají …
// ne zbytečným voláním API … hledat cestu“). Cesta: sada se ZNÁMOU odpovědí — soudce (agent, bez API) ji dostane naslepo a musí trefit.
// A) soudce tvrzení o člověku: věty, o kterých už rozhodl OWNER nebo kánon (vada × v pořádku), včetně těch, na kterých dřív soudci
//    přestřelili („you“ není vada, fyzický důsledek není vada, „Look closer“ není rada).
// B) soudce runy: skutečná čtení z labu (runa nejmenovaná) + chiméry (obraz jedné runy, věta o významu z jiné) — musí poznat runu
//    a u chiméry říct, že věta 2 k obrazu nepatří.
// Výstup: A_vstup.json, A_klic.json, B_vstup.json, B_klic.json. Nic nevolá.
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, L = path.join(H, '..', '..', '2026-11-09-v2-vyklad-z-v3');
const perm = (n, a, b) => { const p = []; for (let i = 0; i < n; i++) p.push((i * a + b) % n); if (new Set(p).size !== n) throw new Error('není permutace'); return p; };
// ── A: věta, správná odpověď, čí je to rozhodnutí
const A = [
 ['In your current relationship, external calm has stopped the arguments without resolving the weight sitting between you.', 'vada', 'GPT 2026-11-18 + kánon: vymýšlí život (vztah, hádky)'],
 ['In your home the talk has gone flat and careful.', 'vada', 'owner 2026-09-24 „ta Isa je špatně“: stav v prostředí jako fakt'],
 ['You already know which of the two you will choose.', 'vada', 'DESIGN definice 2026-10-16: oznamovací „you already know“'],
 ['What looks like a need to keep gathering is really a fear of the emptiness that would come if you stopped.', 'vada', 'GPT i Gemini 2026-11-23: psychologická příčina podsunutá člověku'],
 ['In your personal plans, an unexpected disruption has broken structures you spent months carefully building.', 'vada', 'GPT 2026-11-18: vymýšlí život'],
 ['You should let this rest before you decide.', 'vada', 'kánon: rada (should)'],
 ['It is time to stop carrying what was never yours.', 'vada', 'kánon: rada bez „should“ + tvrzení'],
 ['The runes are preparing you for what comes next.', 'vada', 'kánon: znamení / osud'],
 ['Are you protecting your growth, or hiding from judgment?', 'vada', 'GPT 2026-11-18: otázka podsouvá problém (strach z hodnocení)'],
 ['You have been giving more than you get back, and it has worn you down.', 'vada', 'kánon: tvrzení o situaci a pocitu'],
 ['What strength is already in you?', 'ok', 'owner 2026-10-16: otázka, není vada'],
 ['Your knuckles have learned this before your mind has.', 'ok', 'owner 2026-09-23: fyzický důsledek v obraze'],
 ['Look closer, and you see the one stem that did not break.', 'ok', 'owner 2026-09-23: vstup do obrazu není rada'],
 ['You stand beneath older birches, where a sapling reaches through their shade.', 'ok', 'úhel [6]: člověk v obraze; „you“ není vada (owner 2026-09-30)'],
 ['In what you make for others, care may give a small beginning time to take hold, though it may also keep it out of sight.', 'ok', 'možnost („may“) v oblasti, kterou člověk zadal'],
 ['Can you leave room for what has not shown itself?', 'ok', 'owner 2026-10-22 „úplně v pohodě“'],
 ['If you looked back today, what line would your steps make?', 'ok', 'owner 2026-11-11: pochválená otázka'],
 ['It may be a standstill you cannot shift, or a pause in which you see more clearly.', 'ok', 'owner 2026-11-14: líbí se; dvě možnosti s „may“'],
 ['What comes from outside can break a plan before anyone has a chance to change it.', 'ok', 'obecná pravda o runě, ne o člověku'],
 ['Do you kneel at the quiet rim, or walk on toward the roar?', 'ok', 'owner 2026-08: vzorová otázka v obraze'],
];
const pa = perm(A.length, 7, 3);
const Aklic = pa.map((p, i) => ({ id: i + 1, veta: A[p][0], spravne: A[p][1], zdroj: A[p][2] }));
fs.writeFileSync(path.join(H, 'A_klic.json'), JSON.stringify(Aklic, null, 1));
fs.writeFileSync(path.join(H, 'A_vstup.json'), JSON.stringify(Aklic.map((k) => ({ id: k.id, sentence: k.veta })), null, 1));
// ── B: čtení bez jména runy + chiméry
const K = JSON.parse(fs.readFileSync(path.join(L, 'napeti', 'kolo4', 'kandidati.json'), 'utf8'));
const V1 = JSON.parse(fs.readFileSync(path.join(L, 'gemini-gpt-4vety', 'ulohy_vysledky.json'), 'utf8'));
const V2 = JSON.parse(fs.readFileSync(path.join(L, 'gemini-gpt-4vety', 'ulohy_zdroj_vysledky.json'), 'utf8'));
const vety = (t) => t.split(/(?<=[.?!])\s+/);
const prave = V1.concat(V2).map((x) => ({ runa: x.runa, text: x.text, druh: 'prave' }));
for (const x of prave) if (new RegExp(x.runa, 'i').test(x.text)) throw new Error('čtení jmenuje runu');
const najdi = (r, i) => prave.filter((x) => x.runa === r)[i];
const chimera = (obrazR, vyznamR) => { const a = vety(najdi(obrazR, 0).text), b = vety(najdi(vyznamR, 0).text);
  return { runa: obrazR, text: [a[0], b[1], a[2], a[3]].join(' '), druh: 'chimera', veta2z: vyznamR }; };
const B = prave.concat([chimera('Berkana', 'Hagalaz'), chimera('Hagalaz', 'Raidho'), chimera('Raidho', 'Berkana')]);
const pb = perm(B.length, 5, 2);
const Bklic = pb.map((p, i) => Object.assign({ id: i + 1 }, B[p]));
fs.writeFileSync(path.join(H, 'B_klic.json'), JSON.stringify(Bklic, null, 1));
const runy = perm(K.length, 7, 3).map((i) => ({ rune: K[i].runa, mechanism: K[i].mech }));
fs.writeFileSync(path.join(H, 'B_vstup.json'), JSON.stringify({ runes: runy, readings: Bklic.map((k) => ({ id: k.id, reading: k.text })) }, null, 1));
console.log('A vět', A.length, '(vada', A.filter((x) => x[1] === 'vada').length + ') | B čtení', B.length, '(chimér 3)');
