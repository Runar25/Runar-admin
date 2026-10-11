# -*- coding: utf-8 -*-
# is-greynir.py — islandský pravopis a gramatika přes GreynirCorrect (Miðeind, licence MIT) LOKÁLNĚ: první, bezplatná vrstva kontroly IS.
#
# Proč (2026-10-10): Yfirlestur API zaniklo (DECISIONS 2026-10-10 (39)); GreynirCorrect je tentýž otevřený motor, jen běží u nás a text
# nikam neodchází. KUKY 2026-10-10: „GreynirCorrect pomůže nám? co je zdarma je dobré, pokud to funguje… ano, nainstaluj. nastav jeho
# pravidelnou kontrolu aktualizací!“
# Prostředí: ~/runar-eval/greynir-venv (reynir-correct, reynir, islenska, tokenizer, icegrams) + model Icegrams (213 MB) v
# %LOCALAPPDATA%\icegrams. Spuštěný systémovým Pythonem se skript sám přepne do toho prostředí.
#
# Co umí (změřeno 2026-10-10 při instalaci): překlepy přesně i s opravou (S004 — 4 ze 4); větu, kterou nerozebere, hlásí jako E001 =
# „možná chyba“ (žlutá, ne zelená — §19.2), tak chytil i rod „ákveðin hlutir“ a „nafnlægt“. Na 6 správných větách z produkce 0 nálezů.
# Co NEumí: shodu nebo pád, když je chybný tvar zároveň jiným platným tvarem („Fjöldi lestrar“, „1 lestrar“ — lestrar je i 2. p. j. č.),
# a doslovné idiomy („ríður vindinum“) — na to jsou další kontroly; které a v jakém pořadí, stojí jen v CLAUDE.md §2.
# FALEŠNÉ POPLACHY na našich textech (změřeno 2026-10-10, 18 textů) — nález je PODEZŘENÍ, ne verdikt:
#   · S004 „opraví“ vzácné složeniny appky na nesmysl: lífsrúnar → lífbrúnar (slovo nezná);
#   · W001 u slov appky: prófari → prófar;  · Ý4Í lýst → líst („sem lýst er“ = popsaný, korpus 9546×);
#   · Z001 „Evrópska efnahagssvæðið“ na malé „evrópska“ — korpus má velké 1505× proti 167×;
#   · P_NT_FsMeðFallstjórn „þar til hún er notuð“ → hennar — „þar til“ je tu spojka „dokud“, ne předložka;
#   · E001 u slepených buněk tabulky a dlouhých závorek (AES-256; …) — rozdělit na věty a pustit znovu.
#
#   python -X utf8 is-greynir.py --text "…"     · jeden text (i víc vět)
#   python -X utf8 is-greynir.py <soubor>       · text na řádek
#   python -X utf8 is-greynir.py --samotest     · obhajoba nástroje (12 vět, nic neplatí, nic neodchází ven)
#   python -X utf8 is-greynir.py --aktualizace  · týdenní úloha Windows „Runar - GreynirCorrect aktualizace“: nová verze na PyPI →
#                                                 aktualizovat → samotest → když neprojde, vrátit předchozí verze; zápis do logu
import io, os, sys, json, subprocess, datetime, urllib.request

VENV = os.path.join(os.path.expanduser('~'), 'runar-eval', 'greynir-venv')
VPY = os.path.join(VENV, 'Scripts', 'python.exe')
STAV = os.path.join(VENV, 'aktualizace.json')
LOG = os.path.join(VENV, 'aktualizace.log')
BALICKY = ['reynir-correct', 'reynir', 'islenska', 'tokenizer', 'icegrams']
STARE_DNI = 14   # starší kontrola aktualizací = varování (úloha běží týdně; dvakrát vynechaná = počítač dlouho vypnutý nebo chyba)

try:
    import reynir_correct as rc
except ImportError:
    rc = None
    if os.path.exists(VPY) and os.path.normcase(os.path.abspath(sys.executable)) != os.path.normcase(os.path.abspath(VPY)):
        sys.exit(subprocess.call([VPY, '-X', 'utf8', os.path.abspath(__file__)] + sys.argv[1:]))
    if '--aktualizace' not in sys.argv:
        print('GreynirCorrect není nainstalovaný (čekám ho v %s) — instalace: DECISIONS 2026-10-10 (40).' % VENV)
        sys.exit(2)


def zkontroluj(text):
    """Vrátí seznam nálezů [(kód, úsek věty, popis, návrh)] pro celý text (víc vět)."""
    out = []
    for odstavec in rc.check(text):
        for veta in odstavec:
            for a in (getattr(veta, 'annotations', None) or []):
                slova = (getattr(veta, 'tidy_text', '') or '').split()
                usek = ' '.join(slova[a.start:a.end + 1]) if slova else ''
                out.append((a.code, usek, a.text, getattr(a, 'suggest', None)))
    return out


SAMOTEST = [
    ('Þetta er mjög góð hugmind.', 'S'),                                         # překlep → hugmynd
    ('Ég fór í búðinna í gær.', 'S'),                                            # → búðina
    ('Rúnar talar við leitandan.', 'S'),                                         # → leitandann
    ('Hún hefur verið hér síðann í morgun.', 'S'),                               # → síðan
    ('Þegar þú ferð um Rúnar, eru ákveðin hlutir munuð.', 'E'),                  # rod; byl v produkci do 2026-10-10
    ('Geymt vegna bókhalds (nafnlægt þegar reikningi er eytt).', 'E'),           # neexistující slovo; v produkci do 2026-10-10
    ('Ekki tókst að vista — athugaðu nettenginguna og reyndu aftur.', None),     # správné věty z produkce
    ('Rúnirnar spá ekki fyrir um örlög þín.', None),
    ('Þú ert hér Gestur. Dragðu rún og sjáðu hver kemur til þín.', None),
    ('Einu sinni á dag geymum við þar öryggisafrit af gagnagrunninum okkar, á dulkóðuðu formi.', None),
    ('Hverju afriti er eytt eftir 30 daga.', None),
    ('Þeir fóru allir heim saman.', None),
]


def samotest(tisk=True):
    spatne = []
    for i, (t, cekano) in enumerate(SAMOTEST, 1):
        n = zkontroluj(t)
        kody = [k for k, _, _, _ in n]
        if cekano is None:
            ok = not kody
        elif cekano == 'S':
            ok = any(k.startswith('S') for k in kody)
        else:
            ok = 'E001' in kody
        if not ok:
            spatne.append(i)
        if tisk:
            print('  [%d] %s  %s  %s' % (i, 'OK  ' if ok else 'FAIL', t[:80], ' '.join(kody) or '—'))
    return spatne


def verze_v_prostredi():
    r = subprocess.run([VPY, '-m', 'pip', 'list', '--format=json', '--disable-pip-version-check'], capture_output=True, text=True)
    return {d['name'].lower(): d['version'] for d in json.loads(r.stdout or '[]')}


def verze_na_pypi(balik):
    with urllib.request.urlopen('https://pypi.org/pypi/%s/json' % balik, timeout=60) as r:
        return json.load(r)['info']['version']


def zapis(vysledek, zprava, verze):
    radek = '%s  %-12s %s' % (datetime.datetime.now().strftime('%Y-%m-%d %H:%M'), vysledek, zprava)
    io.open(LOG, 'a', encoding='utf-8').write(radek + '\n')
    io.open(STAV, 'w', encoding='utf-8').write(json.dumps({'kdy': datetime.datetime.now().isoformat(timespec='seconds'),
                                                           'vysledek': vysledek, 'zprava': zprava, 'verze': verze}, ensure_ascii=False))
    print(radek)


def samotest_v_prostredi():
    r = subprocess.run([VPY, '-X', 'utf8', os.path.abspath(__file__), '--samotest'], capture_output=True, text=True, encoding='utf-8')
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def aktualizace():
    pred = verze_v_prostredi()
    nove = {}
    for b in BALICKY:
        try:
            v = verze_na_pypi(b)
        except Exception as e:
            zapis('chyba', 'PyPI nedostupné (%s): %s' % (b, e), pred); return 1
        if pred.get(b) and v != pred[b]:
            nove[b] = (pred[b], v)
    if not nove:
        zapis('aktualni', 'beze změny: ' + ', '.join('%s %s' % (b, pred.get(b, '?')) for b in BALICKY), pred)
        return 0
    subprocess.run([VPY, '-m', 'pip', 'install', '--upgrade', '--disable-pip-version-check', '-q'] + list(nove), check=False)
    kod, vystup = samotest_v_prostredi()
    if kod != 0 and 'ModelNotFoundError' in vystup:
        # nový icegrams může chtít novější model (213 MB, oficiální vydání Miðeind, kontrolní součet ověří stahovač)
        subprocess.run([VPY, '-X', 'utf8', '-m', 'icegrams.download'], check=False)
        kod, vystup = samotest_v_prostredi()
    po = verze_v_prostredi()
    zmeny = ', '.join('%s %s → %s' % (b, s, n) for b, (s, n) in nove.items())
    if kod == 0:
        zapis('aktualizovano', zmeny + ' — samotest prošel', po)
        return 0
    subprocess.run([VPY, '-m', 'pip', 'install', '--disable-pip-version-check', '-q'] + ['%s==%s' % (b, s) for b, (s, _) in nove.items()], check=False)
    kod2, _ = samotest_v_prostredi()
    zapis('chyba', zmeny + ' — samotest NEprošel, vráceno na předchozí verze (samotest po vrácení: %s)' % ('OK' if kod2 == 0 else 'FAIL'),
          verze_v_prostredi())
    return 1


def varovani_aktualizace():
    try:
        s = json.load(io.open(STAV, encoding='utf-8'))
    except Exception:
        return '⚠ kontrola aktualizací GreynirCorrect ještě neproběhla (úloha „Runar - GreynirCorrect aktualizace“)'
    dni = (datetime.datetime.now() - datetime.datetime.fromisoformat(s['kdy'])).days
    if s.get('vysledek') == 'chyba':
        return '⚠ poslední kontrola aktualizací GreynirCorrect selhala (%s): %s — log %s' % (s['kdy'], s.get('zprava'), LOG)
    if dni > STARE_DNI:
        return '⚠ poslední kontrola aktualizací GreynirCorrect je stará %d dní (úloha „Runar - GreynirCorrect aktualizace“ neběží?)' % dni
    return None


def main():
    a = sys.argv[1:]
    if a and a[0] == '--aktualizace':
        sys.exit(aktualizace())
    if a and a[0] == '--samotest':
        spatne = samotest()
        if spatne:
            print('FAIL  samotest: %d z %d nesedí — %s' % (len(spatne), len(SAMOTEST), ', '.join('[%d]' % i for i in spatne)))
            sys.exit(1)
        print('OK    samotest: 4 překlepy a 2 nerozebrané věty nalezeny, 6 správných vět bez nálezu (reynir-correct %s)'
              % getattr(rc, '__version__', '?'))
        return
    if a and a[0] == '--text':
        texty = [' '.join(a[1:])]
    elif a:
        texty = [r.strip() for r in io.open(a[0], encoding='utf-8') if r.strip()]
    else:
        texty = [r.strip() for r in sys.stdin.read().splitlines() if r.strip()]
    s_nalezem = 0
    for i, t in enumerate(texty, 1):
        n = zkontroluj(t)
        if not n:
            print('  [%d] OK      %s' % (i, t[:110])); continue
        s_nalezem += 1
        print('  [%d] NÁLEZ   %s' % (i, t[:110]))
        for kod, usek, popis, navrh in n:
            print('        %s „%s“: %s%s' % (kod, usek, popis, (' → ' + str(navrh)) if navrh else ''))
    print('\n%d textů, %d s nálezem (GreynirCorrect, lokálně). E001 = věta nerozebraná, možná chyba — ověř GPT nebo korpusem.' % (len(texty), s_nalezem))
    v = varovani_aktualizace()
    if v:
        print(v)
    sys.exit(1 if s_nalezem else 0)


if __name__ == '__main__':
    main()
