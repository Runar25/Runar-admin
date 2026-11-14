# CODE-read 2026-11-14 — strojová kontrola TVARU obrazu, než ho uvidí owner (docs/postup-obraz.md, krok 3.1).
# Proč: pravidla o obraze ležela na pěti místech a nic je při psaní nepřipomnělo; obrazy vznikaly z věty popisu a kontrola „která runa“
# je pouštěla (rozbor: docs/eval/2026-11-09-v2-vyklad-z-v3/audit-deje/pruchod-code-read.md). Owner 2026-11-14: „15. ok“.
# Vstup: textový soubor, jeden anglický obraz na řádek (prázdné řádky a řádky s # se přeskočí), nebo --banka = celá RUNE_IMAGES z v2.
# Výstup: červená = vada tvaru · žlutá = podezření, které posoudí člověk · na konci VŽDY otázky, které stroj neposoudí (§19.2).
# Hranice: stroj nepozná, kdo v obraze koná, jestli je to runa, věrohodnost ani dobu. Není ve smoke — banka má staré obrazy,
# které by spadly; je to nástroj pro nové a přepisované obrazy.
import re, subprocess, sys

DELKA_MAX = 20            # RUNAR_DESIGN „Délka a tvar obrazu“: kolem 12; nad 20 je to příběh
CAS = r'\b(yesterday|tomorrow|last (week|month|year|summer|winter|spring|autumn)|\d+ (days|weeks|months|years) ago|for (weeks|months|years)|a year ago|in (may|june|july|august|september|october|november|december|january|february|march|april))\b'
ROLE = r'\b(father|mother|grandmother|grandfather|sister|brother|daughter|son|husband|wife|aunt|uncle|forefathers?|ancestors?)\b'
TVRZENI = r'\b(you (once|used to|grew up|remember|have always)|your (childhood|family|past))\b'
PONAUCENI = r'\b(whoever|whenever|the more\b.*\bthe more|as long as|always|never)\b'
OSOBA = r'\b(someone|stranger|neighbours?|woman|man|boy|girl|child|children|kids?|friend|people|person|everyone|party|families)\b'
STOJI = r'\b(stands?|lies|waits?|burns|hangs|sits)\b'
DRUHA_UDALOST = r';|\band then\b|, and (later|afterwards)\b'


def zkontroluj(obraz):
    cervene, zlute = [], []
    slov = len(obraz.split())
    if slov > DELKA_MAX:
        cervene.append(f'{slov} slov (nad {DELKA_MAX} je to příběh, ne obraz)')
    # Role je žlutá, ne červená: owner 2026-11-14 schválil „The newborn lies in its mother's arms“ — vada je role ČTENÁŘOVA, a tu stroj nepozná.
    for nazev, vzor in (('přesný čas nebo kalendář (výjimka: slovo, které runu nese — RUNAR_DESIGN „Délka a tvar obrazu“ 3)', CAS), ('tvrzení o čtenářově minulosti', TVRZENI)):
        m = re.search(vzor, obraz, re.I)
        if m:
            cervene.append(f'{nazev} — „{m.group(0)}“')
    for nazev, vzor in (('zní jako pravidlo nebo ponaučení — je to zákon, který JE významem runy, nebo morálka?', PONAUCENI),
                        ('rodinná role — patří postavě v obraze, nebo ji obraz přisuzuje čtenáři?', ROLE),
                        ('osoba jiná než „you“ — zaslouží si místo? obejde se obraz bez ní?', OSOBA),
                        ('sloveso stání — dělá tu někdo něco, nebo věc jen stojí?', STOJI),
                        ('možná druhá událost', DRUHA_UDALOST)):
        m = re.search(vzor, obraz, re.I)
        if m:
            zlute.append(f'{nazev} — „{m.group(0)}“')
    return cervene, zlute


def banka():
    js = ("const fs=require('fs'),vm=require('vm');const S={console:{log(){},warn(){},error(){}}};S.window=S;S.globalThis=S;"
          "S.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]};S.localStorage={getItem:()=>null,setItem(){},removeItem(){}};"
          "vm.createContext(S);for(const f of ['runar-config.js','runar-runes.js','runar-translations.js','runar-utils.js','runar-character.js'])"
          "vm.runInContext(fs.readFileSync('v2/'+f,'utf8')+'\\n;\\n',S);"
          "console.log(vm.runInContext('RUNE_IMAGES',S).map(r=>r[0]+': '+r[3]).join('\\n'))")
    return subprocess.run(['node', '-e', js], capture_output=True, text=True, encoding='utf-8', check=True).stdout.splitlines()


def main():
    if len(sys.argv) != 2:
        print('použití: kontrola_tvaru.py <soubor s obrazy> | --banka'); return 2
    radky = banka() if sys.argv[1] == '--banka' else [r.strip() for r in open(sys.argv[1], encoding='utf-8') if r.strip() and not r.startswith('#')]
    nc = nz = 0
    for i, o in enumerate(radky, 1):
        c, z = zkontroluj(o)
        if c or z:
            print(f'{i}. {o}')
        for x in c: print(f'    🔴 {x}'); nc += 1
        for x in z: print(f'    🟡 {x}'); nz += 1
    print(f'\n{len(radky)} obrazů · červených {nc} · žlutých {nz}')
    print('🟡 STROJ NEPOSOUDÍ — odpověz písemně u každého obrazu (docs/postup-obraz.md oddíl 3):')
    print('    kdo v obraze koná a co dělá · je právě tohle mechanismus runy · škrtací zkouška · zkouška opakem · dnešní doba a věrohodnost')
    return 1 if nc else 0


if __name__ == '__main__':
    sys.exit(main())
