# CODE-read 2026-11-14 — strojová kontrola ukázkových čtení, než je uvidí owner (postup.md, krok 2.1).
# Proč: ukázky 7.4 a 7.9 začínaly „Imagine“ 4/4, ač je to jen jedna položka losu (zadani-v3 G48, G57); nic to nezastavilo.
# Vstup: textový soubor, jedno čtení na řádek (prázdné řádky a řádky s # se přeskočí). Výstup: červená = vada, žlutá = stroj neposoudí.
# Hranice: věrohodnost obrazu, runu v obraze ani opakovaný děj stroj neposoudí — vypíše je žlutě pokaždé (§19.2, žádné tiché zelené).
import re, sys
from collections import Counter

DELKA = (50, 58)          # zadani-v3 bod 30, G54
ROLE = r'\b(father|mother|grandmother|grandfather|sister|brother|daughter|son|husband|wife|aunt|uncle)\b'   # bod 17
CAS = r'\b(yesterday|last (week|month|year|summer|winter|spring|autumn)|\d+ (days|weeks|months|years) ago|tomorrow)\b'   # bod 18
NALEPKA = r'\b(its shadow|the shadow of|the danger is)\b'   # G55, krok 44


def zkontroluj(cteni):
    vady, n = [], len(cteni)
    prvni = Counter(c.split()[0].strip('.,:;').lower() for c in cteni)
    for slovo, k in prvni.items():
        if k > 1 and k > n / 3:
            vady.append(f'stejné první slovo „{slovo}“ u {k}/{n} čtení — vstup do scény má být z losu, ne šablona')
    for i, c in enumerate(cteni, 1):
        slov = len(c.split())
        if not DELKA[0] <= slov <= DELKA[1]:
            vady.append(f'čtení {i}: {slov} slov (má být {DELKA[0]}–{DELKA[1]})')
        for nazev, vzor in (('jmenovaná rodinná role', ROLE), ('přesný časový údaj', CAS), ('nálepka stínu', NALEPKA)):
            m = re.search(vzor, c, re.I)
            if m:
                vady.append(f'čtení {i}: {nazev} — „{m.group(0)}“')
    return vady


if __name__ == '__main__':
    radky = [r.strip() for r in open(sys.argv[1], encoding='utf-8')]
    cteni = [r for r in radky if r and not r.startswith('#')]
    vady = zkontroluj(cteni)
    for v in vady:
        print('ČERVENÁ  ' + v)
    for z in ('věrohodnost obrazu (stává se to lidem opravdu takhle?)', 'runa v obraze — slepý soudce s výběrem z více run',
              'jiný děj, ne jiný předmět proti předchozím ukázkám', 'úhel významu ze schváleného zdroje'):
        print('ŽLUTÁ    stroj neposoudí: ' + z + ' — doložit ručně (postup.md 2.2–2.6)')
    print(f'{len(cteni)} čtení, {len(vady)} vad')
    sys.exit(1 if vady else 0)
