# -*- coding: utf-8 -*-
# Pravidla při dotyku — PreToolUse hook (Edit/Write/NotebookEdit/Bash/PowerShell). Platí pro KAŽDOU session.
#
# Proč (KUKY 2026-10-11): „stále dokola žádná session nekontroluje, jestli to pravidlo existuje, takže si ty pravidla ani na začátku
# nečtou! jak to ošetřit, aby je automaticky četli, jakmile se jich dotknou. já to pořád hlídat nemůžu.“ Do té doby tiskl mapu
# „sáhneš na tohle → přečti tenhle doc“ jen SessionStart hook: na začátku a po compactu, nic nevynutil a mapa měla opsané kusy pravidel
# a čísla řádků, které zastaraly (mrtvý is-grammar-qa, „BACKLOG ~ř. 251–263“). DECISIONS 2026-10-11.
#
# Co dělá:
# 1. Z cesty, na kterou nástroj sahá (Edit/Write: file_path; Bash/PowerShell: zápis do cesty v příkazu, nebo obsah spouštěného
#    patch skriptu), najde oblasti v mapě scripts/utils/pravidla_mapa.json.
# 2. Při PRVNÍM dotyku oblasti v session (a znovu po compactu) úpravu jednou zastaví a jako důvod vypíše AKTUÁLNÍ znění pravidel —
#    čte je živě z CLAUDE.md, docs a paměti, nic neopisuje. Druhý pokus projde.
# 3. Dlouhou sekci (nad LIMIT znaků) nevloží celou: dá začátek + rozsah řádků a pustí až poté, co session ten soubor přečetla (Read).
# 4. Oblast s "uz_vime": zápis projde, jen když PO POSLEDNÍ ZPRÁVĚ OWNERA běžel `node scripts/utils/uz_vime.js <pojmy>` —
#    dohledání, jestli to pravidlo / rozhodnutí už neexistuje (do 2026-10-11 stačil jeden běh kdykoli v session).
#    Navíc u zápisu skriptem hook sám prohledá kánon vzácnými slovy NOVÉHO textu ze skriptu a podobná místa ukáže (jednou na obsah).
# Mez (pojmenovaná): Bash vidí jen cesty v příkazu a v obsahu spouštěného skriptu ze scratchpadu nebo scripts/_patch*.py; zápis jiným
# nástrojem, který cestu v textu nemá, neuvidí. Chyba hooku = projde (fail-open) a zapíše se do chyby.log — hook nesmí zastavit práci.
#   python -X utf8 scripts/utils/pravidla_pri_dotyku.py --test      (samotest všech stavů)
import hashlib, io, json, os, re, sys

R = os.environ.get('RUNAR_ROOT', 'C:/Users/zkuku/Downloads/Runar-admin').replace('\\', '/').rstrip('/')
STAV = os.environ.get('PRAVIDLA_STATE_DIR', os.path.join(os.path.expanduser('~'), '.claude', 'pravidla-dotyk'))
MAPA = os.environ.get('PRAVIDLA_MAPA', R + '/scripts/utils/pravidla_mapa.json')
KANON = os.environ.get('PRAVIDLA_KANON', R)   # kde se hledá, jestli ownerův pokyn už stojí (CLAUDE.md, RUNAR_*.md, memory/)
LIMIT = 4000
PISE = {'Edit', 'Write', 'NotebookEdit', 'MultiEdit'}
SHELL = {'Bash', 'PowerShell'}


def cti(p, limit=None):
    with io.open(p, encoding='utf-8', errors='replace') as f:
        return f.read() if limit is None else f.read(limit)


def glob_re(g, volny=False):
    """Glob → regex. volny=True = najdi cestu uvnitř textu (příkaz, obsah skriptu)."""
    znak = r"[^/\s'\"`]" if volny else r'[^/]'
    out, i = '', 0
    while i < len(g):
        if g.startswith('**/', i):
            out += (r"(?:[^\s'\"`]*/)?" if volny else r'(?:.*/)?'); i += 3
        elif g.startswith('**', i):
            out += r"[^\s'\"`]*" if volny else '.*'; i += 2
        elif g[i] == '*':
            out += znak + '*'; i += 1
        else:
            out += re.escape(g[i]); i += 1
    return re.compile((r'(?<![\w.])' + out + r'(?![\w/])') if volny else ('^' + out + '$'), re.I)


def rel(p):
    p = (p or '').replace('\\', '/')
    lo, rlo = p.lower(), R.lower() + '/'
    return p[len(rlo):] if lo.startswith(rlo) else None


def oblasti_pro(cesty_rel, text_volny, mapa):
    hit = []
    for o in mapa['oblasti']:
        for g in o['cesty']:
            if any(glob_re(g).match(c) for c in cesty_rel) or (text_volny and glob_re(g, True).search(text_volny)):
                hit.append(o); break
    return hit


PISICI = {'cp', 'mv', 'rm', 'tee', 'touch', 'install', 'set-content', 'out-file', 'add-content', 'new-item', 'copy-item', 'move-item', 'remove-item'}
SKRIPT = re.compile(r"""(?<![\w.-])(?:python3?|py|node)(?:\s+-X\s+\S+|\s+-\S+)*\s+["']?([^\s"']+\.(?:py|js))""", re.I)


# cv.zapis / commit_vlastni: od 2026-10-11 je to JEDINÁ povolená cesta zápisu sdílených docs (pre-commit) — bez ní hook neviděl
# skoro žádný zápis do docs (doloženo týž den: zápis paměti přes cv.zapis prošel bez pravidel i bez kontroly kánonu).
ZAPISUJE = re.compile(r"""\.zapis\(|commit_vlastni\.py\s+pridej|writeFileSync|appendFileSync|copyFileSync|renameSync|rmSync|unlinkSync|createWriteStream|\.write\(|open\([^)]*['"][wa]['"]|shutil\.|os\.remove|os\.rename|Path\([^)]*\)\.write_""")


KOD_SKRIPTU = ''   # celý kód zapisujících skriptů posledního příkazu — pro kontrolu nového textu proti kánonu


def cil_z_prikazu(cmd):
    """Text, ve kterém se hledají cesty: jen CÍLE zápisu (přesměrování, cp/mv/rm/sed -i/tee…, PowerShell zápis) + obsah spouštěných
    patch/scratch skriptů. Celý příkaz ne — commit s `> msg.txt` by jinak „zapisoval“ do všech souborů v pathspecu."""
    c = cmd.replace(chr(92), '/')
    # Proměnné z téhož příkazu (`S=<scratchpad>; python $S/x.py`) rozvést: do 2026-10-11 hook skript za `$S/` neviděl, takže každý zápis
    # do docs spuštěný takhle prošel bez gate i bez kontroly kánonu (CODE-read tak zapsal DECISIONS (44) i (46) — zjištěno na (46)).
    for jm, _, hod in re.findall(r"(?:^|[;&|\s])([A-Za-z_]\w*)=(['\"]?)([^\s;'\"&|]+)\2", c):
        c = re.sub(r'\$(?:\{' + jm + r'\}|' + jm + r'(?!\w))', lambda m, h=hod: h, c)
    c2 = re.sub(r'\d?>&\d|\d?>\s*/dev/null|\b2>\S*', ' ', c)
    kusy = re.findall(r"""(?<![0-9&=-])>>?\s*["']?([^\s"';|&)]+)""", c2)
    for seg in re.split(r'&&|\|\||;|\|', c2):
        t = [x for x in seg.split() if not re.match(r'^\w+=', x)]
        if not t: continue
        hlava = t[0].split('/')[-1].lower()
        if hlava in PISICI or (hlava == 'sed' and re.search(r'\s-i', seg)) or (hlava == 'git' and t[1:2] == ['rm']):
            kusy.append(seg)
    text = chr(10).join(kusy)
    for s in SKRIPT.findall(c):
        lo = s.lower()
        if '/temp/claude/' in lo or re.search(r'scripts/_patch[^/]*\.py$', lo):
            p = s if re.match(r'^([a-z]:|/)', s, re.I) else R + '/' + s
            # Jen skript, který opravdu zapisuje. Doloženo 2026-10-11: čtecí měřicí skript s cestami `v2/…` v textu dostal pravidla
            # „JS ve v2“, ač nic neměnil — zmínka cesty ≠ zápis.
            try:
                obsah = cti(p, 300000)
                # Bez komentářů: 2026-10-11 skript jen ZMÍNIL RUNAR_PRIVACY.md v komentáři a hook ho vzal jako zápis do docs.
                # Jen MIMO víceřádkové řetězce: nadpis „## 2026-…“ uvnitř """…""" je zapisovaný text, ne komentář (2026-10-11).
                kod, uvnitr = [], False
                for l in obsah.split(chr(10)):
                    if uvnitr or not re.match(r'\s*(//|#)', l): kod.append(l)
                    if (l.count('"""') + l.count("'''")) % 2: uvnitr = not uvnitr
                kod = chr(10).join(kod)
                if ZAPISUJE.search(kod):
                    global KOD_SKRIPTU
                    KOD_SKRIPTU += chr(10) + kod.replace(chr(92), '/')
                    # Cíle zápisu, když jsou všechna zápisová volání s DOSLOVNOU cestou — jinak celý kód (2026-10-11: skript s útoky
                    # jmenoval v2/runar-character.js jen jako TEXT útoku a zapisoval cv.zapis('scripts/protipriklady.py', …); hook mu
                    # ukázal pravidla promptu a stromu a chtěl Read 400 řádků docs). Zmínka cesty v datech ≠ zápis.
                    # počítat volání jen v KÓDU, ne v textu, který skript zapisuje (2026-10-11: záznam DECISIONS s „io.open(…,'w')“
                    # v """…""" se počítal jako zápis → celý kód → falešná oblast). Krátké literály ('w', 'a') zůstávají — jinak by
                    # open(p, 'w') s cílem v proměnné zmizel z počtu a hook by ho přehlédl.
                    bez_textu = re.sub(r'"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'', '', kod)
                    bez_textu = re.sub(r'"[^"\n]{4,}"|\'[^\'\n]{4,}\'', '""', bez_textu)
                    vse = len(ZAPISUJE.findall(bez_textu))
                    doslovne = re.findall(r"""(?:\.zapis|writeFileSync|appendFileSync)\(\s*['"]([^'"]+)['"]|open\(\s*['"]([^'"]+)['"]\s*,\s*['"][wa]""", kod)
                    cile = [a or b for a, b in doslovne]
                    text += chr(10) + (' '.join(cile) if cile and len(cile) == vse else kod.replace(chr(92), '/'))
            except Exception: pass
    return text


# ---------- živé čtení zdrojů (nic se neopisuje) ----------
def sekce(soubor, nadpis):
    radky = cti(R + '/' + soubor).split('\n')
    for i, l in enumerate(radky):
        m = re.match(r'^(#+)\s+(.*)$', l)
        if m and m.group(2).strip().startswith(nadpis):
            uroven = len(m.group(1)); j = i + 1
            while j < len(radky):
                m2 = re.match(r'^(#+)\s', radky[j])
                if (m2 and len(m2.group(1)) <= uroven) or radky[j].strip() == '---': break
                j += 1
            return '\n'.join(radky[i:j]).rstrip(), i + 1, j
    return None, 0, 0


def pravidlo(n):
    radky = cti(R + '/CLAUDE.md').split('\n')
    for i, l in enumerate(radky):
        if re.match(r'^###\s+' + re.escape(n) + r'\s', l):
            j = i + 1
            while j < len(radky) and not re.match(r'^(###?\s|---\s*$)', radky[j]): j += 1
            return '\n'.join(radky[i:j]).rstrip(), i + 1, j
    return None, 0, 0


def pamet(jm):
    t = cti(R + '/memory/' + jm + '.md')
    t2 = re.sub(r'^---\n[\s\S]*?\n---\n', '', t.replace('\r', ''))
    return t2.strip(), 'memory/' + jm + '.md'


def hlavicka(p):
    out = []
    for l in cti(R + '/' + p).split('\n'):
        if re.match(r'^\s*(//|#)', l) or (not out and not l.strip()): out.append(l)
        else: break
    return '\n'.join(out).strip()


def polozky(o):
    """[(nadpis, text, soubor_k_precteni_nebo_None)]"""
    out = []
    for n in o.get('pravidla', []):
        t, a, b = pravidlo(n)
        out.append(('CLAUDE.md ' + n, t or '⚠ ' + n + ' v CLAUDE.md nenalezeno — oprav mapu', 'CLAUDE.md', a, b))
    for d in o.get('docs', []):
        t, a, b = sekce(d['soubor'], d['nadpis'])
        out.append((d['soubor'] + ' „' + d['nadpis'] + '“', t or '⚠ sekce nenalezena — oprav mapu', d['soubor'], a, b))
    for jm in o.get('pamet', []):
        t, p = pamet(jm)
        out.append(('paměť ' + jm, t, p, 1, len(t.split('\n'))))
    for p in o.get('hlavicky', []):
        out.append(('hlavička kontroly ' + p, hlavicka(p), None, 0, 0))
    return out


# ---------- kontrola proti kánonu po nové zprávě ownera ----------
# Proč (owner 2026-10-11 přes CODE-tree): session zapsala ownerův pokyn do DECISIONS a BACKLOGu jako nový, ačkoli stál v RUNAR_TREE.md §2;
# uz_vime pustila, ale s vlastními pojmy, ne se slovy ownera. Teď hook před prvním zápisem do docs/paměti po nové zprávě ownera prohledá
# kánon SLOVY Z TÉ ZPRÁVY a nálezy ukáže — session nemusí nic pamatovat ani volit pojmy.
import unicodedata
def bezd(t): return ''.join(c for c in unicodedata.normalize('NFD', t.lower()) if unicodedata.category(c) != 'Mn')
STOP = set(bezd(w) for w in """pokracuj pokracujeme pokracovat kontrole kontrolu kontrola dalsich dalsi casti prosim dekuji udelej udelat
zkontroluj napis myslim protoze ktery ktera ktere kterou takze jeste porad nejak vlastne session sessions rekni chci nechci budeme muzeme
pokud kdyz jsem jsme jsou bude nebude neni tohle tento tato toto taky treba opravdu vsechno vsechny vsichni neco nekdo nikdo jinak potom
takhle takto stale furt jenom proste samozrejme dobre jasne mozna aspon kazdy kazda kazde nejaky nejaka nejake jejich mame mate maji
code tune tree read cowork owner ownera nemusis musis muzes kdyby abych abys tvoje tvuj moje muj""".split())
def kmeny(text):
    out = []
    for w in re.findall(r'[^\W\d_]{5,}', bezd(text)):
        if w in STOP: continue
        k = w[:5]
        if k not in out: out.append(k)
    return out

def text_ownera(line):
    try: e = json.loads(line)
    except Exception: return None
    if e.get('type') == 'attachment':
        a = e.get('attachment') or {}
        o = a.get('origin')
        if a.get('type') == 'queued_command' and isinstance(o, dict) and o.get('kind') == 'human': return str(a.get('prompt') or '')
        return None
    if e.get('type') != 'user' or e.get('isCompactSummary'): return None
    c = (e.get('message') or {}).get('content')
    if not isinstance(c, str): return None
    t = c.strip()
    if not t or t.startswith('<') or t.startswith('Stop hook feedback'): return None
    return t

def kanon_radky():
    soubory = ['CLAUDE.md'] + sorted(f for f in os.listdir(KANON) if re.match(r'^RUNAR_.*\.md$', f))
    try: soubory += ['memory/' + f for f in sorted(os.listdir(KANON + '/memory')) if f.endswith('.md')]
    except Exception: pass
    radky = []
    for f in soubory:
        try: radky += [(f, i + 1, l, bezd(l)) for i, l in enumerate(cti(KANON + '/' + f).split('\n'))]
        except Exception: continue
    return radky


# ---------- nový text zapisovaný skriptem: nestojí už v kánonu? ----------
# Proč (owner 2026-10-11: „zapsal jsi do souboru a zkontroloval jsi, že to tam už není?“): gate uz_vime pouštěl zápis po JAKÉMKOLI hledání
# — session si zvolila úzká slova („protipříklady samotest“) a zapsala DECISIONS (44) s čísly, která opravovala až (45): kontroly svoje útoky
# popisují slovy „mutace“ a „podstrčená“. Hook teď vezme z zapisujícího skriptu dlouhé řetězce, které v kánonu ještě nejsou (= nový text),
# a kánon prohledá JEJICH vzácnými slovy — nezáleží na tom, co session napadne hledat.
def novy_text(kod, radky):
    # kod tu má zpětná lomítka nahrazená '/' (cil_z_prikazu), takže escape \n je '/n'; porovnává se bez bílých znaků
    cele = re.sub(r'\s+', '', '\n'.join(l for _, _, l, _ in radky))
    lit = re.findall(r'"""(.*?)"""', kod, re.S) + re.findall(r"'''(.*?)'''", kod, re.S)
    lit += [m.group(2) for m in re.finditer(r'(["\'])((?:(?!\1)[^\n/]|/.){120,})\1', kod)]
    novy = []
    for t in lit:
        kusy = [re.sub(r'\s+', '', k) for k in re.split(r'/n|\n', t) if len(k.strip()) > 40]
        if kusy and not all(k in cele for k in kusy): novy.append(t)   # celý už v kánonu = kotva / starý text, ne nový
    return '\n'.join(novy)

def novy_text_hity(text, radky, maxn=8):
    # Po VĚTÁCH, ne za celý text: dlouhý zápis má desítky vzácných slov a s dlouhými řádky kánonu sdílí 7–11 kmenů náhodou (změřeno
    # 2026-10-11 na skutečném skriptu DECISIONS (44): osm nálezů, všechny šum). Věta zasáhne řádek, když s ním sdílí aspoň polovinu svých
    # vzácných slov (nejméně 3). Kód v `backtickách` a cesty se do slov nepočítají (`scrip`, `pytho`, `updat` nic neříkají).
    n = max(1, len(radky)); cetnost = {}
    def vz(k): return re.compile(r'(?<![^\W\d_])' + re.escape(k))
    nejlepsi = {}
    for veta in re.split(r'(?<=[.!?;])\s+|\n|\s—\s', re.sub(r'`[^`]*`|\S+/\S+', ' ', text)):
        km = kmeny(veta)
        for k in km:
            if k not in cetnost:
                r_ = vz(k); cetnost[k] = (r_, sum(1 for _, _, _, b in radky if r_.search(b)))
        vzacne = [k for k in km if 0 < cetnost[k][1] <= max(3, 0.01 * n)]
        if len(vzacne) < 4: continue
        potreba = max(3, -(-len(vzacne) // 2))
        for f, c, l, b in radky:
            shoda = [k for k in vzacne if cetnost[k][0].search(b)]
            if len(shoda) >= potreba:
                skore = len(shoda) / len(vzacne)
                if skore > nejlepsi.get((f, c), (0,))[0]: nejlepsi[(f, c)] = (skore, f, c, shoda, l.strip())
    hity = sorted(nejlepsi.values(), key=lambda h: -h[0])
    return [(round(h[0] * 100), h[1], h[2], h[3], h[4]) for h in hity[:maxn]]


def kanon_hity(km, maxn=8):
    radky = kanon_radky()
    vzor = {k: re.compile(r'(?<![^\W\d_])' + re.escape(k)) for k in km}
    # Obecná slova podle četnosti v kánonu, ne pevným seznamem (2026-10-11): kmen, který stojí ve víc než 1 % řádků, nic nerozliší
    # („kontrola“, „čtení“, „strom“, „proto“). Doloženo týž den: shody „proto, kontrola, nestačí“ i „uživatel, případ, smazat“ byly jen šum;
    # pokyn ke stromu se dál chytí na vzácných slovech (založení, deník, obsahovat).
    n = max(1, len(radky))
    vzacne = [k for k in km if sum(1 for _, _, _, b in radky if vzor[k].search(b)) <= max(3, 0.01 * n)]
    if len(vzacne) < 2: return []
    # Aspoň 40 % vzácných slov, a když jich je ≥ 4, aspoň 3 (2026-10-11: dvě shody „kritika, nestačí“ byly šum).
    potreba = max(3 if len(vzacne) >= 4 else 2, -(-len(vzacne) * 2 // 5))
    hity = []
    for f, c, l, b in radky:
        shoda = [k for k in vzacne if vzor[k].search(b)]
        if len(shoda) >= potreba: hity.append((len(shoda), f, c, shoda, l.strip()))
    hity.sort(key=lambda h: -h[0])
    return hity[:maxn]


# ---------- stav session (z přepisu, inkrementálně) ----------
def nacti_stav(sid):
    os.makedirs(STAV, exist_ok=True)
    p = os.path.join(STAV, re.sub(r'[^\w-]', '_', sid) + '.json')
    try: s = json.load(io.open(p, encoding='utf-8'))
    except Exception: s = {}
    for k, v in (('scanned', 0), ('uz_vime', False), ('shown', {}), ('need_read', {}), ('reads', [])): s.setdefault(k, v)
    return p, s


def projdi_prepis(tp, s):
    if not tp or not os.path.isfile(tp): return
    with open(tp, 'rb') as f:
        f.seek(s['scanned']); data = f.read()
    konec = data.rfind(b'\n')
    if konec < 0: return
    pos = s['scanned']   # bajtová pozice řádku v přepisu — rostoucí, takže jde porovnat „uz_vime běžel PO zprávě ownera“
    for raw in data[:konec + 1].split(b'\n'):
        pos += len(raw) + 1
        if not raw: continue
        line = raw.decode('utf-8', 'replace')
        if 'compact_boundary' in line and re.search(r'"subtype"\s*:\s*"compact_boundary"', line):
            s['uz_vime'] = False; s['uz_vime_at'] = -1; s['shown'] = {}; s['need_read'] = {}; s['reads'] = []; s['kanon_pro'] = None
            continue
        if 'queued_command' in line or re.search(r'"type"\s*:\s*"user"', line):
            t = text_ownera(line)
            if t: s['owner'] = {'text': t[:4000], 'id': s['scanned'] + len(raw), 'pos': pos}
        if '"tool_use"' not in line: continue
        try: msg = json.loads(line).get('message', {})
        except Exception: continue
        for c in msg.get('content') or []:
            if not isinstance(c, dict) or c.get('type') != 'tool_use': continue
            inp = c.get('input') or {}
            if c.get('name') in SHELL and 'uz_vime.js' in str(inp.get('command', '')): s['uz_vime'] = True; s['uz_vime_at'] = pos
            if c.get('name') == 'Read' and inp.get('file_path'):
                r = rel(inp['file_path'])
                if r and r not in s['reads']: s['reads'].append(r)
    s['scanned'] += konec + 1


# ---------- pasti v příkazech (opakovaně porušená pravidla, poznatelná z textu příkazu) ----------
# Proč (KUKY 2026-10-11): „kritika musí být vyřešena. proto se necháváš kontrolovat, aby se ti nestávalo.“ Obě pasti stály jen v paměti
# a padly znovu týž den: heredoc s \\n / \\\\ 2× (memory heredoc-mangles-backslash-escapes) a grep na OK|FAIL jako podmínka commitu
# (memory read-the-check-before-push; commit prošel i při FAIL).
def pasti(cmd):
    out = []
    m = re.search(r"<<-?\s*['\"]?([A-Za-z_]\w*)['\"]?", cmd)
    telo = cmd[cmd.find('\n', m.end()) + 1:] if (m and '\n' in cmd[m.end():]) else ''
    if telo and chr(92) in telo:
        out.append('⛔ PAST: heredoc se zpětným lomítkem v těle — tady se z \\n stane konec řádku a escapování se rozbije (memory '
                   'heredoc-mangles-backslash-escapes; 2026-10-11 se to stalo 2×). Skript napiš nástrojem Write do scratchpadu a spusť ho.')
    # `cat` bez souboru čte vstup, který v neinteraktivním příkazu nikdy nepřijde → příkaz visí do vypršení (2026-10-11: zablokovalo
    # zápis i commit na 10 minut). Heredoc (`cat <<EOF`) je v pořádku — i za přesměrováním výstupu (`cat > f <<'EOF'`, falešný poplach
    # 2026-10-11): vstup v témže kusu příkazu (`<`, `<<`) cat nakrmí.
    holy = [m for m in re.finditer(r'(^|[;&|]\s*|\s)cat\s*(>|\||;|&&|$)', cmd, re.M)
            if '<' not in re.split(r'[;&|\n]', cmd[m.end() - (1 if m.group(2) == '>' else 0):] + '\n', maxsplit=1)[0]]
    if holy:
        out.append('⛔ PAST: `cat` bez souboru čte standardní vstup, který tu nikdy nepřijde — příkaz zůstane viset. Smaž ho, nebo mu dej soubor.')
    if re.search(r'grep\b[^|;&\n]*OK\|FAIL[^|;&\n]*&&', cmd):
        out.append('⛔ PAST: `grep … OK|FAIL … &&` pustí další krok i při FAIL (grep najde řádek FAIL a skončí úspěšně). Jako podmínku '
                   'použij `| grep -q "^OK"` nebo exit kód kontroly (memory read-the-check-before-push; 2026-10-11 tak prošel commit při FAIL).')
    return out


# ---------- rozhodnutí ----------
def sdileny(rel):
    # Vzor sdílených souborů vlastní hooks/pre-commit.py (`_SDILENE`) — tady se jen čte, ať nejsou dva seznamy (2026-10-11).
    try:
        # vzor může stát na víc řádcích jako spojené r'…' r'…' (2026-10-11) — spojit všechny kusy až po uzavírací závorku
        m = re.search(r"_SDILENE = re\.compile\(((?:\s*r'[^']*')+)\s*\)", cti(R + '/hooks/pre-commit.py'))
        if m: return bool(re.match(''.join(re.findall(r"r'([^']*)'", m.group(1))), rel))
    except Exception: pass
    return bool(re.match(r'^(CLAUDE\.md|RUNAR_[^/]*\.md|memory/.+\.md)$', rel))   # záloha, kdyby se tvar v pre-commitu změnil


def primy_zapis_sdileneho(kod):
    # Proč (CODE-tree 2026-10-11, ověřeno jeho skriptem): Edit/Write na sdílený soubor hook zastaví, ale patch skript s io.open(P, 'w') prošel;
    # vada se ukázala až při commitu a vracet ji `git checkout` maže cizí kusy. Cíl = první argument open(…, 'w'|'a') / writeFileSync(…):
    # doslovný řetězec, poskládaný (R + '/v2/x.js') nebo proměnná, které skript přiřadil řetězec. kod má zpětná lomítka už jako '/'.
    if not kod: return []
    prirazeni = {}
    for jm, rhs in re.findall(r'^\s*([A-Za-z_]\w*)\s*=\s*([^\n]+)$', kod, re.M):
        prirazeni[jm] = re.findall(r"""['"]([^'"]+)['"]""", rhs)
    out = []
    for arg in re.findall(r"""(?:\bopen|writeFileSync|appendFileSync)\(\s*([^,\n]+?)\s*,\s*(?:['"][wa]|[^)\n]*\bmode\s*=\s*['"][wa])""", kod):
        kusy = re.findall(r"""['"]([^'"]+)['"]""", arg)
        for jm in re.findall(r'[A-Za-z_]\w*', arg):
            kusy += prirazeni.get(jm, [])
        for k in kusy:
            rel = k.replace(chr(92), '/')
            if rel.lower().startswith(R.lower()): rel = rel[len(R):]
            rel = rel.lstrip('/')
            if rel and sdileny(rel) and rel not in out: out.append(rel)
    return out


def neviditelne(inp):
    # Proč (2026-10-11, CODE-read, podruhé): `\u2028` napsané v parametru Edit/Write se už při předání (JSON) změní na SKUTEČNÝ znak.
    # Do scripts/protipriklady.py se tak dostaly znaky místo textu (útok pak nic nenašel) a do regexu v JS znak U+2028, který JS bere
    # jako konec řádku (SyntaxError). Dřív totéž v runar-translations.js (memory edit-tool-escapes-new-text). Neviditelný znak, který
    # v cílovém souboru ještě není, se proto zastaví.
    novy = inp.get('new_string') or inp.get('content') or ''
    novy += ''.join((e or {}).get('new_string', '') for e in (inp.get('edits') or []))
    stary = inp.get('old_string') or ''
    p = inp.get('file_path') or ''
    try: stary += cti(p) if p and os.path.isfile(p) else ''
    except Exception: pass
    out = []
    for ch in sorted(set(novy)):
        kat = unicodedata.category(ch)
        if (kat in ('Zl', 'Zp', 'Cf') or (kat == 'Cc' and ch not in '\t\n\r')) and ch not in stary:
            out.append('U+%04X' % ord(ch))
    return out


# §11 (2026-10-14, CODE-read; mapa nosičů ㊁ ukázala §11 jako „escape v Python skriptu napsaném nástrojem Write nehlídá nic“): islandský text
# v Python skriptu se píše doslovně, nikdy jako escape — escape se při předávání mezi nástroji láme (memory heredoc-mangles-backslash-escapes,
# edit-tool-escapes-new-text) a v kódu se nedá přečíst ani zkontrolovat (check-is ho nevidí jako slovo). Zastaví se escape islandského znaku,
# který v souboru ještě není (úprava starého skriptu, který escapy už má, projde).
IS_ESCAPE = re.compile(r'\\(?:u00|x)(e1|e9|ed|f3|fa|fd|fe|f0|e6|f6|c1|c9|cd|d3|da|dd|de|d0|c6|d6)', re.I)


def is_escape(inp):
    p = inp.get('file_path') or ''
    if not p.lower().endswith('.py'):
        return []
    novy = inp.get('new_string') or inp.get('content') or ''
    novy += ''.join((e or {}).get('new_string', '') for e in (inp.get('edits') or []))
    stary = inp.get('old_string') or ''
    try: stary += cti(p) if os.path.isfile(p) else ''
    except Exception: pass
    return sorted(set(m.group(0) for m in IS_ESCAPE.finditer(novy) if m.group(0) not in stary))


def rozhodni(vstup):
    tool = vstup.get('tool_name', '')
    inp = vstup.get('tool_input') or {}
    if tool in PISE:
        nv = neviditelne(inp)
        if nv:
            return ('⛔ Zápis vkládá neviditelný znak (' + ', '.join(nv) + '), který v souboru ještě není. Skoro jistě vznikl z `\\uXXXX`\n'
                    'v parametru nástroje — escape se změní na skutečný znak už při předání. Chceš-li v souboru TEXT `\\u2028`, poskládej ho\n'
                    'skriptem (chr(92) + "u2028"); chceš-li opravdu ten znak, vlož ho skriptem výslovně (chr(0x2028)).\n\n'
                    '(Hook pravidla_pri_dotyku.py — neviditelné znaky)')
        ie = is_escape(inp)
        if ie:
            return ('⛔ §11: islandský znak jako escape v Python skriptu (' + ', '.join(ie) + '). Piš ho doslovně (á, þ, ð, æ, ö…) a skript\n'
                    'spouštěj s python -X utf8 — escape se mezi nástroji láme a check-is ho jako slovo nevidí (CLAUDE.md §11).\n\n'
                    '(Hook pravidla_pri_dotyku.py — §11 escape v Pythonu)')
        # Sdílený doc nástrojem Edit (nebo Write přes EXISTUJÍCÍ soubor) by šel zapsat, ale ne commitnout: commit_vlastni bere jen zápisy
        # ze zapis() a pre-commit jinou cestu nepustí (CODE-read 2026-10-11, kolo 3 — rozpor dvou mechanismů). Zastavit hned, ne až při commitu.
        r0 = rel(inp.get('file_path') or inp.get('notebook_path'))
        if r0 and sdileny(r0) and (tool != 'Write' or os.path.exists(R + '/' + r0)):
            return ('⛔ Sdílený soubor ' + r0 + ' nástrojem ' + tool + ' nepiš — taková změna nejde commitnout (pre-commit pouští sdílené docy jen\n'
                    'přes commit_vlastni, ten bere jen zápisy ze zapis()). Místo toho:\n'
                    '  • napiš nástrojem Write dva soubory do scratchpadu (starý text, nový text) a pusť\n'
                    '    python -X utf8 scripts/utils/commit_vlastni.py uprav <CODE-lane> ' + r0 + ' <stary.txt> <novy.txt>\n'
                    '  • nebo v Python skriptu: s = cv.cti(soubor); …; cv.zapis(soubor, s, "<CODE-lane>")\n'
                    'Nový soubor smí vzniknout nástrojem Write, pak commit_vlastni.py pridej <lane> <soubor>.\n\n'
                    '(Hook pravidla_pri_dotyku.py — sdílené docy)')
    if tool in PISE:
        r = rel(inp.get('file_path') or inp.get('notebook_path'))
        cesty, volny = ([r] if r else []), ''
    elif tool in SHELL:
        pp = pasti(str(inp.get('command', '')))
        if pp: return '\n\n'.join(pp) + '\n\n(Hook pravidla_pri_dotyku.py — pasti v příkazech)'
        global KOD_SKRIPTU
        KOD_SKRIPTU = ''
        cesty, volny = [], cil_z_prikazu(str(inp.get('command', '')))
        pz = primy_zapis_sdileneho(KOD_SKRIPTU)
        if pz:
            return ('⛔ Skript zapisuje přímo do sdíleného souboru (' + ', '.join(pz) + ') — taková změna nejde commitnout (pre-commit pouští\n'
                    'sdílené soubory jen přes commit_vlastni, ten bere jen zápisy ze zapis()), a vracet ji `git checkout` by smazalo i cizí\n'
                    'necommitnuté kusy. Místo open(…, "w") v skriptu: s = cv.cti(soubor, R); …; cv.zapis(soubor, s, "<CODE-lane>", R).\n\n'
                    '(Hook pravidla_pri_dotyku.py — sdílené soubory; nahlásil CODE-tree 2026-10-11)')
        if not volny: return None
    else:
        return None
    mapa = json.loads(cti(MAPA))
    hit = oblasti_pro(cesty, volny, mapa)
    if not hit: return None
    p, s = nacti_stav(vstup.get('session_id') or 'nosid')
    projdi_prepis(vstup.get('transcript_path'), s)
    zpravy = []
    if any(o.get('uz_vime') for o in hit) and s.get('owner') and s['owner']['id'] != s.get('kanon_pro'):
        s['kanon_pro'] = s['owner']['id']
        km = kmeny(s['owner']['text'])
        if len(km) >= 3:
            hh = kanon_hity(km)
            if hh:
                zpravy.append('⛔ KE TVÉ POSLEDNÍ ZPRÁVĚ OD OWNERA UŽ V KÁNONU NĚCO STOJÍ — napřed ověř, že nezapisuješ jako nové to, co už platí\n'
                              '(owner 2026-10-11: „pokud něco řeknu, že se má nějak udělat, tak napřed vždy každá session zkontroluje, jestli to tak už není“).\n'
                              'Hledáno slovy z jeho zprávy (' + ', '.join(km[:10]) + '…), řádky s nejvíc shodami:\n'
                              + '\n'.join('  ' + f + ':' + str(n) + '  [' + ', '.join(sh) + ']  ' + l[:150] for _, f, n, sh, l in hh)
                              + '\nJe-li to totéž: odkaž na to místo, nepiš znovu. Je-li to nové nebo jiné: zápis zopakuj (ukáže se jednou na zprávu).')
    if any(o.get('uz_vime') for o in hit) and tool in SHELL and volny:
        radky = kanon_radky()
        nt = novy_text(KOD_SKRIPTU or volny, radky)
        klic_nt = hashlib.sha1(nt.encode('utf-8')).hexdigest()[:12] if nt else ''   # hash() je náhodný pro každý proces
        if nt and klic_nt not in s.setdefault('novy_ukazan', []):
            hh = novy_text_hity(nt, radky)
            if hh:
                s['novy_ukazan'] = (s['novy_ukazan'] + [klic_nt])[-50:]
                zpravy.append('⛔ TEXT, KTERÝ ZAPISUJEŠ, MÁ PODOBNÁ MÍSTA V KÁNONU — napřed ověř, že nepíšeš podruhé, a co tam stojí, ať nepíšeš proti tomu (§20).\n'
                              'Hledáno vzácnými slovy z nového textu ve skriptu, řádky s nejvíc shodami:\n'
                              + '\n'.join('  ' + f + ':' + str(n) + '  [' + ', '.join(sh) + ']  ' + l[:150] for _, f, n, sh, l in hh)
                              + '\nJe-li to totéž: odkaž, nepiš znovu; doplňuje-li to, uprav text. Jinak zápis zopakuj (ukáže se jednou na obsah skriptu).')
    uz_ok = s.get('uz_vime_at', -1 if not s['uz_vime'] else 0) > (s.get('owner') or {}).get('pos', -1)
    for o in hit:
        jm = o['oblast']
        if o.get('uz_vime') and not uz_ok:
            zpravy.append('⛔ „' + jm + '“: zápis projde, až PO poslední zprávě ownera poběží `node scripts/utils/uz_vime.js <pojmy>` — dohledej, jestli '
                          'to, co píšeš, už neexistuje (pravidlo, rozhodnutí, položka). Hledej i slovy, kterými by to popsal někdo jiný. '
                          'Jedno místo pro jednu informaci (CLAUDE.md §20). (Od 2026-10-11 nestačí běh kdykoli dřív v session.)')
        if jm not in s['shown']:
            kusy, cist = [], []
            for nad, t, soubor, a, b in polozky(o):
                if len(t) > LIMIT and soubor:
                    kusy.append('── ' + nad + ' (dlouhé — začátek; CELÉ si přečti: Read ' + soubor + ' ř. ' + str(a) + '–' + str(b) + ')\n' + t[:1500] + '\n…')
                    cist.append(soubor)
                else:
                    kusy.append('── ' + nad + '\n' + t)
            s['shown'][jm] = True
            if cist: s['need_read'][jm] = sorted(set(cist))
            zpravy.append('PRAVIDLA PRO OBLAST „' + jm + '“ — přečti je, pak úpravu zopakuj (ukáže se jednou za session a znovu po compactu).\n\n' + '\n\n'.join(kusy))
        elif s['need_read'].get(jm):
            chybi = [f for f in s['need_read'][jm] if f not in s['reads']]
            if chybi:
                zpravy.append('⛔ „' + jm + '“: napřed si přečti (Read) ' + ', '.join(chybi) + ' — rozsah řádků ukázal předchozí zásah.')
            else:
                s['need_read'].pop(jm)
    json.dump(s, io.open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    if not zpravy: return None
    return '\n\n'.join(zpravy) + '\n\n(Hook pravidla_pri_dotyku.py · mapa scripts/utils/pravidla_mapa.json)'


def main():
    try:
        vstup = json.load(sys.stdin)
        duvod = rozhodni(vstup)
    except Exception as e:
        try:
            os.makedirs(STAV, exist_ok=True)
            io.open(os.path.join(STAV, 'chyby.log'), 'a', encoding='utf-8').write(repr(e) + '\n')
        except Exception: pass
        return 0
    if duvod:
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                                  'permissionDecisionReason': duvod}}, ensure_ascii=False))
    return 0


def samotest():
    import tempfile
    global STAV
    STAV = tempfile.mkdtemp()
    tp = os.path.join(STAV, 't.jsonl')
    def prepis(*radky):
        with io.open(tp, 'a', encoding='utf-8') as f:
            for r in radky: f.write(json.dumps(r, ensure_ascii=False) + '\n')
    def tu(name, **inp): return {'message': {'content': [{'type': 'tool_use', 'name': name, 'input': inp}]}, 'x': '"tool_use"'}
    io.open(tp, 'w').close()
    V = lambda tool, sid='s1', **inp: rozhodni({'tool_name': tool, 'tool_input': inp, 'session_id': sid, 'transcript_path': tp})
    ok = []
    def chk(jm, podminka): ok.append((jm, bool(podminka)))
    js = R + '/v2/runar-app.js'
    def Wz(sid, relp, vol=None):
        sk = os.path.join(STAV, 'Temp', 'claude', 'cvz_' + sid + '.py'); os.makedirs(os.path.dirname(sk), exist_ok=True)
        io.open(sk, 'w', encoding='utf-8').write("s = cv.cti('" + relp + "', R)" + chr(10) + "cv.zapis('" + relp + "', s + 'a', 'CODE-read', R)" + chr(10))
        return (vol or V)('Bash', sid, command='python -X utf8 "' + sk.replace(chr(92), '/') + '"')
    chk('1. první dotyk v2/*.js zastaví a vypíše §1', (lambda d: d and 'PRAVIDLA PRO OBLAST „JS ve v2“' in d and '### §1' in d)(V('Edit', file_path=js)))
    chk('2. druhý dotyk projde', V('Edit', file_path=js) is None)
    chk('3. soubor mimo mapu projde', V('Edit', file_path=R + '/docs/x.txt') is None)
    chk('4. jiná session dostane pravidla znovu', V('Edit', sid='s2', file_path=js) is not None)
    prepis({'type': 'system', 'subtype': 'compact_boundary'})
    chk('5. po compactu znovu', V('Edit', file_path=js) is not None)
    d = Wz('s1', 'memory/x.md')
    chk('6. paměť bez uz_vime: zastaví s požadavkem uz_vime', d and 'uz_vime.js' in d and '§20' in d)
    chk('7. paměť dál bez uz_vime: pořád zastaví', (lambda d: d and 'uz_vime.js' in d)(Wz('s1', 'memory/x.md')))
    prepis(tu('Bash', command='node scripts/utils/uz_vime.js pravidla'))
    chk('8. po uz_vime projde', Wz('s1', 'memory/x.md') is None)
    d = V('Edit', file_path=R + '/v2/runar-character.js')
    chk('9. dlouhá sekce: chce Read a vypíše rozsah', d and 'Read RUNAR_DESIGN.md' in d)
    chk('10. bez Read pořád zastaví', (lambda d: d and 'napřed si přečti' in d)(V('Edit', file_path=R + '/v2/runar-character.js')))
    prepis(tu('Read', file_path=R + '/RUNAR_DESIGN.md'))
    chk('11. po Read projde', V('Edit', file_path=R + '/v2/runar-character.js') is None)
    chk('12. Bash jen čte (grep, 2>/dev/null) → projde', V('Bash', sid='s3', command='grep -n x supabase/functions/a/index.ts 2>/dev/null | head') is None)
    chk('13. Bash zapisuje do sql/ → zastaví', V('Bash', sid='s3', command='echo x > sql/2026-10-11_x.sql') is not None)
    sc = os.path.join(STAV, 'Temp', 'claude', 'p.py'); os.makedirs(os.path.dirname(sc), exist_ok=True)
    io.open(sc, 'w', encoding='utf-8').write("s = 'x'\nio.open('v2/runar-shrine.html', 'w').write(s)\n")
    sc2 = os.path.join(STAV, 'Temp', 'claude', 'cti.js')
    io.open(sc2, 'w', encoding='utf-8').write("const t = fs.readFileSync('v2/runar-app.js', 'utf8'); console.log(t.length)\n")
    chk('17. čtecí skript ze scratchpadu s cestou v2/ → projde', V('Bash', sid='s7', command='node "' + sc2.replace('\\', '/') + '"') is None)
    chk('14. patch skript ze scratchpadu → najde cestu v obsahu', (lambda d: d and 'UI readeru' in d)(V('Bash', sid='s4', command='python -X utf8 "' + sc.replace('\\', '/') + '" "' + R + '"')))
    chk('16. commit s > msg.txt a pathspecem CLAUDE.md projde', V('Bash', sid='s6', command='printf x > /tmp/m.txt && git commit -F /tmp/m.txt -- CLAUDE.md memory/MEMORY.md') is None)
    chk('15. Read/Grep se nehlídá', rozhodni({'tool_name': 'Read', 'tool_input': {'file_path': js}, 'session_id': 's5', 'transcript_path': tp}) is None)
    # 18–21: kontrola proti kánonu po zprávě ownera (falešný kánon v dočasné složce)
    global KANON
    kd = os.path.join(STAV, 'kanon'); os.makedirs(kd + '/memory', exist_ok=True)
    io.open(kd + '/CLAUDE.md', 'w', encoding='utf-8').write('# x\n')
    io.open(kd + '/RUNAR_TREE.md', 'w', encoding='utf-8').write('## 2. IDENTITA\n⛔ STROM NEROSTE BEZ ZALOŽENÍ — po založení obsahuje VŠECHNA čtení z deníku.\n')
    KANON = kd
    tp2 = os.path.join(STAV, 't2.jsonl'); io.open(tp2, 'w').close()
    def V2(tool, sid, **inp): return rozhodni({'tool_name': tool, 'tool_input': inp, 'session_id': sid, 'transcript_path': tp2})
    def p2(o):
        with io.open(tp2, 'a', encoding='utf-8') as f: f.write(json.dumps(o, ensure_ascii=False) + '\n')
    p2(tu('Bash', command='node scripts/utils/uz_vime.js neco'))
    p2({'type': 'user', 'message': {'content': 'je to jednoduchý proces: založení NORNS v produkci a strom bude obsahovat čtení z deníku'}})
    d = Wz('k1', 'RUNAR_BACKLOG.md', lambda t, sid, **k: V2(t, sid, **k))
    chk('18. nová zpráva ownera s pokynem → první zápis do docs ukáže, kde to už stojí', d and 'RUNAR_TREE.md:2' in d and 'KÁNONU' in d)
    chk('34. uz_vime z doby PŘED zprávou ownera nestačí', (lambda d: d and 'PO poslední zprávě ownera' in d)(Wz('k1', 'RUNAR_BACKLOG.md', lambda t, sid, **k: V2(t, sid, **k))))
    UZ = tu('Bash', command='node scripts/utils/uz_vime.js neco')
    p2(UZ)
    chk('19. po novém uz_vime druhý zápis k téže zprávě projde', Wz('k1', 'RUNAR_BACKLOG.md', lambda t, sid, **k: V2(t, sid, **k)) is None)
    p2({'type': 'user', 'message': {'content': 'pokračuj v kontrole dalších částí'}}); p2(UZ)
    chk('20. „pokračuj v kontrole“ kánon nehledá', Wz('k1', 'RUNAR_BACKLOG.md', lambda t, sid, **k: V2(t, sid, **k)) is None)
    p2({'type': 'attachment', 'attachment': {'type': 'queued_command', 'prompt': 'strom bude obsahovat čtení z deníku po založení', 'origin': {'kind': 'human'}}}); p2(UZ)
    d = Wz('k1', 'memory/x.md', lambda t, sid, **k: V2(t, sid, **k))
    chk('21. zpráva poslaná během práce (queued_command) se počítá taky', d and 'RUNAR_TREE.md:2' in d)
    p2({'type': 'attachment', 'attachment': {'type': 'queued_command', 'prompt': 'strom bude obsahovat čtení z deníku po založení znovu', 'origin': {'kind': 'peer'}}})
    chk('22. zpráva jiné session (peer) se jako ownerova nebere', Wz('k1', 'memory/x.md', lambda t, sid, **k: V2(t, sid, **k)) is None)
    io.open(kd + '/RUNAR_BACKLOG.md', 'w', encoding='utf-8').write('- uživatel případ obecně\n- jiný uživatel obnova\n')
    p2({'type': 'user', 'message': {'content': 'jinak 30 dní na smazání je dobré, třeba bude chtít uživatel svůj účet obnovit? jak se postupuje v takových případech?'}}); p2(UZ)
    chk('23. shoda jen ve 2 obecných slovech z dlouhé zprávy = šum, nezastaví', Wz('k1', 'memory/x.md', lambda t, sid, **k: V2(t, sid, **k)) is None)
    # 35–38: nový text zapisovaný skriptem (2026-10-11: DECISIONS (44) zapsán s úzkým hledáním, opraven až (45))
    io.open(kd + '/RUNAR_DECISIONS.md', 'w', encoding='utf-8').write(
        '- **Ověřeno:** útok obrácenou pákou — chyba podstrčená do čisté kopie (mrtvý klíč UI_TEXT) smoke shodí, sdílený strom ne.\n')
    def skript(sid, obsah):
        sk = os.path.join(STAV, 'Temp', 'claude', 'nt_' + sid + '.py')
        io.open(sk, 'w', encoding='utf-8').write(obsah)
        return V2('Bash', 'k1', command='python -X utf8 "' + sk.replace(chr(92), '/') + '"')   # k1 oblast už viděl (jinak první dotyk = pravidla)
    novy = ('s = cv.cti("RUNAR_DECISIONS.md", R)' + chr(10) + 's += """' + chr(10) +
            '## (44) Kontroly pod útokem: chyba podstrčená do čisté kopie repa musí kontrolu shodit, smoke ji pouští sám při změně kontroly.' + chr(10) +
            '"""' + chr(10) + 'cv.zapis("RUNAR_DECISIONS.md", s, "CODE-read", R)' + chr(10))
    d = skript('n1', novy)
    chk('35. nový text podobný řádku v kánonu → ukáže to místo', d and 'PODOBNÁ MÍSTA' in d and 'RUNAR_DECISIONS.md:1' in d)
    chk('36. týž skript podruhé projde', skript('n1', novy) is None)
    kotva = ('a = "- **Ověřeno:** útok obrácenou pákou — chyba podstrčená do čisté kopie (mrtvý klíč UI_TEXT) smoke shodí, sdílený strom ne.' +
             chr(92) + 'n"' + chr(10) + 's = cv.cti("RUNAR_DECISIONS.md", R)' + chr(10) + 'cv.zapis("RUNAR_DECISIONS.md", s.replace(a, a + "x"), "CODE-read", R)' + chr(10))
    chk('37. kotva, která už v kánonu stojí, se za nový text nebere', skript('n2', kotva) is None)
    jiny = ('s = cv.cti("RUNAR_DECISIONS.md", R)' + chr(10) + 's += """' + chr(10) +
            '## (46) Islandské skloňování přídavných jmen v nápovědě zkontrolováno korpusem; tři tvary opraveny podle Risamálheild.' + chr(10) +
            '"""' + chr(10) + 'cv.zapis("RUNAR_DECISIONS.md", s, "CODE-read", R)' + chr(10))
    chk('38. nový text bez podobného místa projde', skript('n3', jiny) is None)
    sc3 = os.path.join(STAV, 'Temp', 'claude', 'kom.js')
    io.open(sc3, 'w', encoding='utf-8').write("// Postup → RUNAR_PRIVACY.md\nfs.writeFileSync(os.tmpdir() + '/x.txt', 'a')\n")
    sc4 = os.path.join(STAV, 'Temp', 'claude', 'cvz.py')
    io.open(sc4, 'w', encoding='utf-8').write("s = cv.cti('memory/x.md', R)" + chr(10) + "cv.zapis('memory/x.md', s + 'a', 'CODE-read', R)" + chr(10))
    chk('25. zápis přes cv.zapis (commit_vlastni) hook vidí', V('Bash', sid='s10', command='python -X utf8 "' + sc4.replace(chr(92), '/') + '"') is not None)
    sd, sn = os.path.split(sc4.replace(chr(92), '/'))
    chk('39. skript za proměnnou (S=…; python $S/x.py) hook vidí taky', V('Bash', sid='s11', command='S=' + sd + '; python -X utf8 $S/' + sn + ' C:/x') is not None)
    chk('40. ${S} a S="…" taky', V('Bash', sid='s12', command='S="' + sd + '"; python -X utf8 ${S}/' + sn) is not None)
    chk('26. heredoc s \\n v těle → past', V('Bash', sid='p1', command='python - <<' + chr(39) + 'EOF' + chr(39) + chr(10) + 'print("a' + chr(92) + 'nb")' + chr(10) + 'EOF') is not None)
    chk('27. heredoc bez zpětného lomítka projde', V('Bash', sid='p2', command='cat <<EOF' + chr(10) + 'ahoj' + chr(10) + 'EOF') is None)
    chk('28. grep OK|FAIL && commit → past', V('Bash', sid='p3', command='node x.js | grep -E "^(OK|FAIL)" && git commit -m x') is not None)
    chk('30. holý cat > /dev/null → past', V('Bash', sid='p5', command='X=1; cat > /dev/null; echo a') is not None)
    chk('31. cat se souborem a cat <<EOF projdou', V('Bash', sid='p6', command='cat soubor.txt | head') is None and V('Bash', sid='p7', command='cat <<EOF' + chr(10) + 'ahoj' + chr(10) + 'EOF') is None)
    chk('31b. cat > soubor <<EOF projde, cat > soubor; bez vstupu je past', V('Bash', sid='p6b', command="cat > s.py <<'EOF'" + chr(10) + 'x=1' + chr(10) + 'EOF') is None
        and V('Bash', sid='p6c', command='cat > s.py; echo a') is not None)
    chk('32. Edit na existující sdílený doc → zastaví s návodem uprav', (lambda d: d and 'commit_vlastni.py uprav' in d)(V('Edit', sid='e1', file_path=R + '/CLAUDE.md')))
    chk('33. Write nového souboru v memory/ projde k pravidlům (ne zákaz)', (lambda d: d is None or 'nástrojem Write nepiš' not in d)(V('Write', sid='e2', file_path=R + '/memory/novy-soubor-test-xyz.md')))
    chk('29. grep -q ^OK && commit projde', V('Bash', sid='p4', command='node x.js | grep -q "^OK" && git commit -m x') is None)
    chk('24. cesta jen v komentáři skriptu se jako zápis nebere', V('Bash', sid='s9', command='node "' + sc3.replace('\\', '/') + '"') is None)
    LS = chr(0x2028)
    chk('41. Edit vkládá U+2028, který v souboru není → zastaví', (lambda d: d and 'U+2028' in d)(V('Edit', sid='z1', file_path=R + '/docs/x.txt', old_string='a', new_string='a' + LS + 'b')))
    chk('42. Edit, kde týž znak už je ve starém textu → projde', V('Edit', sid='z1', file_path=R + '/docs/x.txt', old_string='a' + LS, new_string='b' + LS) is None)
    chk('43. běžný text s diakritikou a tabulátorem → projde', V('Edit', sid='z1', file_path=R + '/docs/x.txt', old_string='a', new_string='žluťoučký\tkůň\n') is None)
    chk('44. Edit na scripts/protipriklady.py (sdílený soubor z pre-commitu) → zastaví s návodem uprav',
        (lambda d: d and 'commit_vlastni.py uprav' in d)(V('Edit', sid='e3', file_path=R + '/scripts/protipriklady.py', old_string='a', new_string='b')))
    sk5 = os.path.join(STAV, 'Temp', 'claude', 'utoky.py')
    io.open(sk5, 'w', encoding='utf-8').write("s = cv.cti('scripts/protipriklady.py', R)" + chr(10) + "s += \"('chyti', 'x.js', 'v2/runar-character.js', 'replace', 'a', 'b')\"" + chr(10) + "cv.zapis('scripts/protipriklady.py', s, 'CODE-read', R)" + chr(10))
    d = V('Bash', sid='s20', command='python -X utf8 "' + sk5.replace(chr(92), '/') + '"')
    chk('45. skript zapisuje doslova jen protipriklady.py, v2/runar-character.js má jen v datech → pravidla promptu NE', d is None or 'prompt a hlas' not in d)
    sk6 = os.path.join(STAV, 'Temp', 'claude', 'promenna.py')
    io.open(sk6, 'w', encoding='utf-8').write("f = 'v2/runar-character.js'" + chr(10) + "s = cv.cti(f, R)" + chr(10) + "cv.zapis(f, s + 'x', 'CODE-read', R)" + chr(10))
    chk('46. cíl zápisu v proměnné → celý kód jako dřív (pravidla promptu ano)', (lambda d: d and 'prompt a hlas' in d)(V('Bash', sid='s21', command='python -X utf8 "' + sk6.replace(chr(92), '/') + '"')))
    chk('47. Edit na v2/runar-reader.css (sdílený soubor appky) → zastaví s návodem uprav',
        (lambda d: d and 'commit_vlastni.py uprav' in d)(V('Edit', sid='e4', file_path=R + '/v2/runar-reader.css', old_string='a', new_string='b')))
    chk('48. Edit na nesdílený soubor appky (runar-auth.js) zákaz sdíleného nedostane',
        (lambda d: d is None or '⛔ Sdílený soubor' not in d)(V('Edit', sid='e5', file_path=R + '/v2/runar-auth.js', old_string='a', new_string='b')))
    # (48 hledalo „commit_vlastni.py uprav“ — to ale od 2026-10-11 stojí i v textu §1, který hook u JS vypíše; zákaz poznat podle jeho zprávy)
    sk7 = os.path.join(STAV, 'Temp', 'claude', 'text_s_open.py')
    io.open(sk7, 'w', encoding='utf-8').write("s = cv.cti('RUNAR_BACKLOG.md', R)" + chr(10) + 's += """' + chr(10) + "skript místo io.open(p, 'w') volá cv.zapis; v2/runar-character.js" + chr(10) + '"""' + chr(10) + "cv.zapis('RUNAR_BACKLOG.md', s, 'CODE-read', R)" + chr(10))
    d = V('Bash', sid='s22', command='python -X utf8 "' + sk7.replace(chr(92), '/') + '"')
    chk('49. „io.open(…, w)“ jen v zapisovaném textu se za zápis nepočítá → oblast promptu NE', d is None or 'prompt a hlas' not in d)
    sk8 = os.path.join(STAV, 'Temp', 'claude', 'open_promenna.py')
    io.open(sk8, 'w', encoding='utf-8').write("p = 'v2/runar-character.js'" + chr(10) + "io.open(p, 'w').write('x')" + chr(10) + "cv.zapis('RUNAR_BACKLOG.md', 'y', 'CODE-read', R)" + chr(10))
    chk('50. open(p, w) s cílem v proměnné se počítá dál → celý kód (oblast promptu ano)', (lambda d: d and 'prompt a hlas' in d)(V('Bash', sid='s23', command='python -X utf8 "' + sk8.replace(chr(92), '/') + '"')))
    def sk_(jm, obsah):
        p = os.path.join(STAV, 'Temp', 'claude', jm); io.open(p, 'w', encoding='utf-8').write(obsah)
        return V('Bash', sid='z_' + jm, command='python -X utf8 "' + p.replace(chr(92), '/') + '"')
    B = chr(92)
    chk('51. skript io.open(P, w) s P = r\'…\\v2\\runar-tree.js\' → zastaví (nahlásil CODE-tree)',
        (lambda d: d and 'přímo do sdíleného' in d)(sk_('p1.py', "P = r'" + R.replace('/', B) + B + 'v2' + B + "runar-tree.js'" + chr(10) + "io.open(P, 'w', encoding='utf-8').write('x')" + chr(10))))
    chk('52. open(R + \'/v2/runar-reader.css\', \'w\') → zastaví',
        (lambda d: d and 'v2/runar-reader.css' in d)(sk_('p2.py', "open(R + '/v2/runar-reader.css', 'w').write('x')" + chr(10))))
    chk('53. skript sdílený soubor jen čte a píše jinam → zákaz sdíleného nedostane',
        (lambda d: d is None or 'přímo do sdíleného' not in d)(sk_('p3.py', "t = open('v2/runar-tree.js').read()" + chr(10) + "open('C:/tmp/vystup.txt', 'w').write(t)" + chr(10))))
    chk('54. zápis přes cv.zapis do sdíleného → zákaz přímého zápisu nedostane',
        (lambda d: d is None or 'přímo do sdíleného' not in d)(sk_('p4.py', "s = cv.cti('v2/runar-tree.js', R)" + chr(10) + "cv.zapis('v2/runar-tree.js', s + 'x', 'CODE-read', R)" + chr(10))))
    py11 = os.path.join(STAV, 'p11.py')
    chk('55. Write .py s islandským escape (' + B + 'u00fe) → zastaví §11',
        (lambda d: d and '§11' in d)(V('Write', sid='p11a', file_path=py11, content='s = "' + B + 'u00feetta"' + chr(10))))
    chk('56. Write .py s doslovným islandským textem → §11 nezastaví',
        (lambda d: d is None or '§11' not in d)(V('Write', sid='p11b', file_path=py11, content='s = "þetta"' + chr(10))))
    js11 = os.path.join(STAV, 'p11.js')
    chk('57. escape v .js (ne Python) → §11 nezastaví',
        (lambda d: d is None or '§11' not in d)(V('Write', sid='p11c', file_path=js11, content='s = "' + B + 'u00feetta"' + chr(10))))
    for jm, v in ok: print(('OK    ' if v else 'FAIL  ') + jm)
    return 0 if all(v for _, v in ok) else 1


if __name__ == '__main__':
    sys.exit(samotest() if '--test' in sys.argv else main())
