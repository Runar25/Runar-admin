# -*- coding: utf-8 -*-
# Vyhodnocení brány: odpovědi soudců (<pred>_odpovedi.json, {soudce: {číslo obrazu: kód}}) × klíč (<pred>_klic.json).
import io, json, sys, os
H = os.path.dirname(os.path.abspath(__file__)); pred = sys.argv[1]
klic = json.load(io.open(os.path.join(H, pred + '_klic.json'), encoding='utf-8'))
odp = json.load(io.open(os.path.join(H, pred + '_odpovedi.json'), encoding='utf-8'))
kand = {k['id']: k for k in json.load(io.open(os.path.join(H, sys.argv[2]), encoding='utf-8'))}
vys = {i: {'ok': 0, 'kam': []} for i in klic['kandidati']}
for s, zaznam in enumerate(klic['soudci'], 1):
    for z in zaznam:
        kod = odp[str(s)][str(z['n'])]
        if kod == z['spravne']: vys[z['id']]['ok'] += 1
        else: vys[z['id']]['kam'].append(z['kody'].get(kod, '?' + kod))
prosly = 0
for i, v in vys.items():
    k = kand[i]; ok = v['ok'] >= 2; prosly += ok
    print(('PROŠEL ' if ok else 'neprošel') + ' ' + i + ' ' + k['runa'].ljust(7) + ' ' + str(v['ok']) + '/3' + ('  → ' + ', '.join(v['kam']) if v['kam'] else '') + ' | ' + k['en'])
print('\nprošlo', prosly, 'z', len(vys))
json.dump(vys, io.open(os.path.join(H, pred + '_vysledek.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
