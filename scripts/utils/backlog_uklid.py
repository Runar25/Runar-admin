# backlog_uklid.py — přesune hotové a zamítnuté položky z RUNAR_BACKLOG.md doslova do docs/archive/RUNAR_BACKLOG_hotovo.md (CODE-read 2026-10-12).
#
# Proč: owner 2026-10-12 „neni ten backlog moc velky?“ — měl 3 925 řádků (541 kB) při pravidle ~200 řádků na doc; z top-level položek bylo 194
# hotových či zamítnutých vedle 203 otevřených. Hlavička BACKLOGu pravidlo má od 2026-07-04 („Hotové → odškrtnout a … smazat řádek“), jen ho
# nikdo nedodržoval — podle CLAUDE.md §30 ho proto dělá skript. Nic se nemaže: blok jde do archivu pod nadpisem své sekce, a uz_vime.js archiv
# prohledává, takže „už je hotové“ se pozná dál.
#
# Co přesune: položku na začátku řádku (bez odsazení), která začíná `- [x]`, `- ✅`, `- ✖`, `- ~~` nebo `N. ✅/✖`, i s jejími odsazenými
# pokračováními. Vnořené hotové body uvnitř otevřené položky nechá (jsou její kontext).
# Co nechá: blok s lichým počtem ** (rozbitá značka — přesun by posunul párování tučných úseků, smoke ㉘), a blok, ve kterém je
# jakýkoli řádek mladší než 48 h nebo necommitnutý (git blame) — tam pracuje jiná session; přesun by jí sebral
# rozdělanou práci a pre-commit (pojistka 51 proti mazání cizích řádků) by commit stejně zastavil.
#
#   python -X utf8 scripts/utils/backlog_uklid.py              (jen spočítá, nic nezapíše)
#   python -X utf8 scripts/utils/backlog_uklid.py --zapis <lane>   (zapíše přes commit_vlastni; commit: commit_vlastni.py commit <lane> <msg>)
import io, os, re, subprocess, sys, time

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')).replace('\\', '/')
sys.path.insert(0, R + '/scripts/utils')
import commit_vlastni as cv

BL = 'RUNAR_BACKLOG.md'
AR = 'docs/archive/RUNAR_BACKLOG_hotovo.md'
CERSTVE_S = 48 * 3600
HOT = re.compile(r'^(- \[[xX]\]|- (✅|✖|~~)|\d+\. (✅|✖))')
POLOZKA = re.compile(r'^(- |\d+\. )')


def stari_radku():
    # čas autora každého řádku pracovní kopie; necommitnutý řádek = 0 (git blame ho hlásí jako „Not Committed Yet“ s časem teď)
    out = subprocess.run(['git', '-C', R, 'blame', '--line-porcelain', '--contents', R + '/' + BL, '--', BL],
                         capture_output=True, text=True, encoding='utf-8').stdout
    casy, cas, nezaps = [], None, False
    for l in out.split('\n'):
        if re.match(r'^[0-9a-f]{40} ', l):
            nezaps = l.startswith('0' * 40)
        elif l.startswith('author-time '):
            cas = int(l.split()[1])
        elif l.startswith('\t'):
            casy.append(0 if nezaps else cas)
    return casy


def rozdel(text, casy, ted):
    r = text.split('\n')
    zustava, presun, sekce = [], [], ''
    i = 0
    while i < len(r):
        l = r[i]
        if l.startswith('#'):
            sekce = l
        if HOT.match(l):
            j = i + 1
            while j < len(r) and r[j].strip() and r[j][:1] in (' ', '\t') and not r[j].startswith('#'):
                j += 1
            cerstve = any((casy[k] if k < len(casy) else 0) > ted - CERSTVE_S or (k < len(casy) and casy[k] == 0) for k in range(i, j))
            # Lichý počet ** = rozbitá značka tučného (nebo glob v kódu); smoke ㉘ dělí text na ** a páruje v pořadí, takže přesun
            # takového bloku posune párování ve zbytku BACKLOGu a z obyčejných vět udělá „nová opakování“ (2026-10-12, první běh: 3 bloky).
            licha = sum(r[k].count('**') for k in range(i, j)) % 2 == 1
            if cerstve or licha:
                zustava.extend(r[i:j])
            else:
                presun.append((sekce, r[i:j]))
            i = j
            continue
        zustava.append(l)
        i += 1
    return '\n'.join(zustava), presun


def main():
    ted = int(time.time())
    text = cv.cti(BL, R)
    casy = stari_radku()
    novy, presun = rozdel(text, casy, ted)
    radku = sum(len(b) for _, b in presun)
    print('BACKLOG: %d řádků → %d; přesunuto %d položek (%d řádků) do %s' % (text.count('\n') + 1, novy.count('\n') + 1, len(presun), radku, AR))
    if '--zapis' not in sys.argv:
        return 0
    lane = sys.argv[sys.argv.index('--zapis') + 1]
    if not presun:
        return 0
    stary_ar = cv.cti(AR, R) if os.path.exists(R + '/' + AR) else (
        '# RUNAR_BACKLOG_hotovo.md — archiv hotových a zamítnutých položek z RUNAR_BACKLOG.md\n'
        '# Historie, ne pravda o dnešku: co platí, vlastní kód, git log a RUNAR_DECISIONS.md. Přesouvá sem scripts/utils/backlog_uklid.py\n'
        '# (doslova, pod nadpisem původní sekce); uz_vime.js tenhle soubor prohledává.\n')
    dnes = time.strftime('%Y-%m-%d')
    kusy, posl = ['', '## Přesunuto %s (%d položek)' % (dnes, len(presun))], None
    for sekce, blok in presun:
        if sekce != posl:
            kusy += ['', '### ' + (sekce.lstrip('#').strip() or '(bez sekce)')]
            posl = sekce
        kusy += blok
    cv.zapis(AR, stary_ar.rstrip('\n') + '\n' + '\n'.join(kusy) + '\n', lane, R)
    cv.zapis(BL, novy, lane, R)
    print('zapsáno; commit: python -X utf8 scripts/utils/commit_vlastni.py commit %s <zprava.txt>' % lane)
    return 0


if __name__ == '__main__':
    sys.exit(main())
