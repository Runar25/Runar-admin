// Lab 2026-11-14: z kandidati.json + napeti_vysledek.json složí README.md (hlava a závěr ručně v tomhle souboru, tabulky z dat).
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, J = (f) => JSON.parse(fs.readFileSync(path.join(H, f), 'utf8'));
const K = J('kandidati.json'), V = J('napeti_vysledek.json');
const zn = { projde: '✅', 'hraniční': '◐', neprojde: '❌' };
let t = `# Napětí runy a obrazy z něj — všech 25 run (CODE-read, 2026-11-14)

Lab, ne kánon. Nic z toho není v bance; islandsky nic napsáno není; o kvalitě rozhoduje owner.

## 1. Zadání (owner 2026-11-14)
1. K Ise: *„Dobrý obraz pro Isu by mohl obsahovat nějaký paradox nebo napětí: něco, co by se normálně pohybovalo, ale nyní je zastavené.
   A jeho zastavení má konkrétní důsledek.“* Tři vzory: vodopád jako stěna ledu · řetízek bublin zastavený pod ledem · kapka zmrzlá na
   špičce rampouchu těsně před pádem. K tomu seznam GPT (kyvadlo v krajní poloze, hrnčířský kruh, pavučina bez větru, zrcadlová
   hladina, lidé po hádce, zpožděný let, zapečetěný dopis).
2. *„to stejné by mělo být aplikováno na ostatní runy.“*
3. K dosavadním zkouškám čtení: *„nezvolil jsi dobrý obraz na to poznat, jestli je to čtení dobré, nebo ne … tenhle obraz je divnej a ty
   ho pak zase vytáhneš. napřed doděláme obrazy a pak dáš jinou runu než Isa.“* → další zkouška čtení až po obrazech a ne na Ise.
4. Rozbor celé banky od GPT: \`../zdroj-gpt-2026-11-14-rozbor-banky.md\` (kopie ownerova souboru).

## 2. Jak to vzniklo
Podle \`docs/postup-obraz.md\`: u každé runy napřed mechanismus jednou větou (z \`RUNAR_POPISY_RUN.md\`) a z něj **napětí** po vzoru Isy
(co je na runě paradoxní a jaký to má důsledek); z napětí tři obrazy — situace, kterou zná skoro každý, nebo fyzický zákon, který je tím
významem; dnešní doba; koná ten, na kom je runa vidět. U Isy jsou obrazy ownerovy tři a jeden můj (kolona).
Zkoušky: strojová kontrola tvaru (0 červených ze 77); dva slepí soudci vybírali runu z 25 jednovětých mechanismů; třetí soudce runy
neviděl vůbec a jen napsal, kdo koná, co se stane a o čem věta je.

## 3. Výsledek po runách
✅ oba soudci správně · ❌ ani jeden · v hranatých závorkách runy od obou soudců · kurzívou, co o větě napsal soudce, který runy neviděl.
`;
for (const r of K) {
  const mine = V.filter((o) => o.runa === r.runa);
  t += '\n### ' + r.runa + '\n**Napětí:** ' + r.napeti + '\n';
  for (const o of mine) t += '- ' + zn[o.stav] + ' ' + o.obraz + (o.stav !== 'projde' ? ' [' + o.A + ' / ' + o.B + ']' : '') +
    (o.popis ? ' — *' + o.popis.point + '*' + (/^no/i.test(o.popis.plausible) ? ' — ⚠️ nevěrohodné: ' + o.popis.plausible.replace(/^no\s*[-–—:]?\s*/i, '') : '') : '') + '\n';
}
const p = (s) => V.filter((o) => o.stav === s).length;
t += `
## 4. Co je změřeno
1. Projde ${p('projde')} ze ${V.length}, neprojde ${p('neprojde')}, hraničních ${p('hraniční')}. Ownerovy tři obrazy Isy prošly všechny.
2. Sedm neprošlých má jasnou příčinu — děj patří sousední runě: kočka syčí (stráž = Algiz) · rada, která dá smysl, až ji řekneš jinému
   (poznání přes druhého = Mannaz) · vykopané semínko a hruška na parapetu (zrání, které nejde uspíšit, si Jera a Ingwaz přehazují) ·
   staré trámy nesou novou střechu (co si ze starého vezmeš = Othila) · zavřená trouba (zraje uvnitř = Ingwaz) · výhonek roztrhne asfalt
   (síla = Uruz).
3. Soudce bez run označil dva obrazy za nevěrohodné: kroupy, po kterých je každý list na zemi, a obrázek váza / dvě tváře (ve
   skutečnosti se přepíná pořád tam a zpět).
4. Kde soudce bez run čte něco jiného, než je napětí runy, i když runa prošla: Sowilo kino („potřebuješ čas, než si zvykneš“) ·
   Blank rozcestník bez tabulí („ukazatel, který už neukazuje“ — ztráta, ne nepopsané) · Othila starý klíč („držíš věc, která už
   nefunguje“) · Kenaz žárovka („oprava jedné věci ukáže zanedbání“).

## 5. Hranice — proč 70 ze 77 není důkaz kvality
1. **Kruh:** mechanismy, ze kterých soudci vybírali, jsem psal já a z týchž vět jsem psal obrazy. Vysoké číslo říká, že obraz sedí na mou
   větu o runě, ne že je dobrý. Nezávislé je jen čtení třetího soudce (bod 4.4) a ownerovo oko.
2. Soudci jsou běhy téhož modelu; anglicky; bez zkoušky čtením (postup, krok 3.6) a bez islandštiny (krok 3.5).
3. Škrtací zkoušku a zkoušku opakem jsem dělal při psaní z hlavy, písemně u každého obrazu doložené nejsou.
4. Poznatelnost není kvalita: jestli je obraz zajímavý a jestli sedí, řekne owner.
`;
fs.writeFileSync(path.join(H, 'README.md'), t);
console.log('README.md', t.split('\n').length, 'řádků');
