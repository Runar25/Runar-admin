// CODE-read 2026-09-19 — dva malé testy podezřelých (owner: „najdeš podezřelého → menší test").
// RA/RB: Raidho de1e3b16 (rekonstrukce, v4.27, bez čočky). RB = z konce ENDING_OPEN[0] pryč „, or offering a plain choice".
// AN: Ask nad Isa df160bfb (produkční text + ownerova otázka), do RP_ASK.en.rules za větev „plain words" přidána věta o MOŽNOSTECH.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'podezreli');
function jednou(t, a, b, co) { if (t.split(a).length !== 2) throw new Error(co + ': výskyt není právě jeden'); return t.replace(a, b); }
function jinych(a, b) { const x = a.split('\n'), y = b.split('\n'); if (x.length !== y.length) return 99; return y.filter((l, i) => l !== x[i]).length; }
// ── Raidho
const RA = fs.readFileSync(path.join(__dirname, 'isa', 'RAIDHO-de1e3b16.txt'), 'utf8');
const RB = jednou(RA, 'End with one open question asked of the image, or offering a plain choice — ', 'End with one open question asked of the image — ', 'RB');
if (jinych(RA, RB) !== 1) throw new Error('RB se lisi vic nez 1 radek');
fs.writeFileSync(path.join(OUT, 'RA.txt'), RA); fs.writeFileSync(path.join(OUT, 'RB.txt'), RB);
console.log('RB ✓ 1 řádek: ' + RB.split('\n').find(l => /^End with one open question/.test(l)));
// ── Ask
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = 'en';
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
S.__c = 'The cup stays where you set it, going cold while the room shifts around it. Isa is the stillness that holds while everything else moves on, Kuky, the coffee no longer worth drinking. What are you waiting to be given before you touch it?';
S.__q = 'What are you waiting to be given before you touch it? explain. what it could be?';
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
const build = () => vm.runInContext('buildAskPrompt(__c, __q, "Isa", "en", [], RUNES.filter(function(r){return r.n==="Gebo";})[0], {}, { mode: "single", runy: ["Isa"] })', S);
const A0 = build();
const PLAIN = 'the image must not stand in place of the explanation, and must not be the last thing you leave them with.';
const NOVA = ' If they ask what it could be for them, offer one or two concrete possibilities drawn from the image and the rune, each spoken as something that may be so, and leave the choice with them.';
const rules = vm.runInContext('RP_ASK.en.rules', S);
S.__r = jednou(rules, PLAIN, PLAIN + NOVA, 'AN');
vm.runInContext('RP_ASK.en.rules = __r;', S);
const AN = build();
if (jinych(A0, AN) !== 1) throw new Error('AN se lisi vic nez 1 radek');
fs.writeFileSync(path.join(OUT, 'ASK0.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + A0 + '\n');
fs.writeFileSync(path.join(OUT, 'ASKN.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + AN + '\n');
console.log('AN ✓ 1 řádek (pravidla Asku), přidáno:' + NOVA);
console.log('\n==== ASK (nový) — celá zpráva ====\n' + AN);
