# -*- coding: utf-8 -*-
# Brána obrazů se statickými popisy run (metoda docs/archive/2026-09-23-brana-s-popisy.md): soudce dostane obraz a TŘI popisy run
# bez jmen (správná runa + dvě, se kterými si ji plete), neví, který je správný. 3 soudci, každý jiné pořadí a jiné kódy.
# Prošel = správná runa aspoň u 2 ze 3. Popisy = RUNAR_POPISY_RUN.md (ownerovy, doslovně), jména run nahrazena „Tato runa“.
# Použití: python -X utf8 brana_build.py <kandidati.json> <predpona>  → <predpona>_soudce{1,2,3}.txt + <predpona>_klic.json
import io, json, re, random, sys, os
ROOT = 'C:/Users/zkuku/Downloads/Runar-admin/'
HERE = os.path.dirname(os.path.abspath(__file__))
kand = json.load(io.open(os.path.join(HERE, sys.argv[1]), encoding='utf-8'))
pred = sys.argv[2]
doc = io.open(ROOT + 'RUNAR_POPISY_RUN.md', encoding='utf-8').read()
JMENA = {'Othila': ['Othila', 'Othala', 'Óðal'], 'Berkana': ['Berkana', 'Berkano'], 'Tiwaz': ['Tiwaz', 'Týr'], 'Sowilo': ['Sowilo'],
         'Eihwaz': ['Eihwaz'], 'Perth': ['Perth', 'Perthro'], 'Raidho': ['Raidho'], 'Ehwaz': ['Ehwaz']}
def popis(runa):
    i = doc.index('\n## ' + runa + '\n')
    j = doc.find('\n---', i + 5)
    t = doc[i + len(runa) + 5: j].strip()
    if '### Znění A' in t:   # Tiwaz / Ehwaz: první znění
        t = t.split('### Znění A', 1)[1].split('### Znění B', 1)[0].strip()
    # jména bohů a jejich tvary prozradí runu (Tiwaz: „Je spojován s Týrem — bohem…“) → pryč i se skloňováním
    t = re.sub(r'Týr\w*\s*—\s*', '', t)
    for jm in JMENA.get(runa, [runa]):
        t = re.sub(r'\b' + re.escape(jm) + r'\b', 'Tato runa', t)
    return t
runy = sorted({k['runa'] for k in kand} | {p for k in kand for p in k['plete']})
klic = {'kandidati': [k['id'] for k in kand], 'soudci': []}
for s in range(3):
    rnd = random.Random(1000 + s)
    kody = ['R' + str(n) for n in rnd.sample(range(10, 99), len(runy))]
    kod = dict(zip(runy, kody))
    poradi = kand[:]; rnd.shuffle(poradi)
    radky = ['Do not read any files and do not use any tools. Your final message is your answer.',
             'Below are descriptions of several runes (in Czech), each under a code; the rune name is hidden as "Tato runa".',
             'Then come short images. For EACH image you get three codes: decide which of the three runes the image belongs to —',
             'which description the image carries best. Answer one line per image: "<image number>: <code>" and nothing else.', '',
             '=== DESCRIPTIONS ===']
    for r in sorted(runy, key=lambda x: kod[x]):
        radky += ['', '[' + kod[r] + ']', popis(r)]
    radky += ['', '=== IMAGES ===']
    zaznam = []
    for n, k in enumerate(poradi, 1):
        mozn = [k['runa']] + k['plete']; rnd.shuffle(mozn)
        radky.append(str(n) + '. "' + k['en'] + '" — choose: ' + ' / '.join(kod[m] for m in mozn))
        zaznam.append({'n': n, 'id': k['id'], 'spravne': kod[k['runa']], 'kody': {kod[m]: m for m in mozn}})
    io.open(os.path.join(HERE, pred + '_soudce' + str(s + 1) + '.txt'), 'w', encoding='utf-8').write('\n'.join(radky))
    klic['soudci'].append(zaznam)
json.dump(klic, io.open(os.path.join(HERE, pred + '_klic.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(kand), 'obrazů,', len(runy), 'popisů')
