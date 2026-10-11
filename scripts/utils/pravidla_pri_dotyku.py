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
# 4. Oblast s "uz_vime": zápis projde, jen když v session (od posledního compactu) běžel `node scripts/utils/uz_vime.js <pojmy>` —
#    dohledání, jestli to pravidlo / rozhodnutí už neexistuje.
# Mez (pojmenovaná): Bash vidí jen cesty v příkazu a v obsahu spouštěného skriptu ze scratchpadu nebo scripts/_patch*.py; zápis jiným
# nástrojem, který cestu v textu nemá, neuvidí. Chyba hooku = projde (fail-open) a zapíše se do chyby.log — hook nesmí zastavit práci.
#   python -X utf8 scripts/utils/pravidla_pri_dotyku.py --test      (samotest všech stavů)
import io, json, os, re, sys

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


ZAPISUJE = re.compile(r"""writeFileSync|appendFileSync|copyFileSync|renameSync|rmSync|unlinkSync|createWriteStream|\.write\(|open\([^)]*['"][wa]['"]|shutil\.|os\.remove|os\.rename|Path\([^)]*\)\.write_""")


def cil_z_prikazu(cmd):
    """Text, ve kterém se hledají cesty: jen CÍLE zápisu (přesměrování, cp/mv/rm/sed -i/tee…, PowerShell zápis) + obsah spouštěných
    patch/scratch skriptů. Celý příkaz ne — commit s `> msg.txt` by jinak „zapisoval“ do všech souborů v pathspecu."""
    c = cmd.replace(chr(92), '/')
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
                if ZAPISUJE.search(obsah): text += chr(10) + obsah.replace(chr(92), '/')
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

def kanon_hity(km, maxn=8):
    soubory = ['CLAUDE.md'] + sorted(f for f in os.listdir(KANON) if re.match(r'^RUNAR_.*\.md$', f))
    try: soubory += ['memory/' + f for f in sorted(os.listdir(KANON + '/memory')) if f.endswith('.md')]
    except Exception: pass
    hity = []
    potreba = 2 if len(km) >= 2 else 1
    for f in soubory:
        try: radky = cti(KANON + '/' + f).split('\n')
        except Exception: continue
        for i, l in enumerate(radky):
            b = bezd(l)
            shoda = [k for k in km if re.search(r'(?<![^\W\d_])' + re.escape(k), b)]
            if len(shoda) >= potreba: hity.append((len(shoda), f, i + 1, shoda, l.strip()))
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
    for raw in data[:konec + 1].split(b'\n'):
        if not raw: continue
        line = raw.decode('utf-8', 'replace')
        if 'compact_boundary' in line and re.search(r'"subtype"\s*:\s*"compact_boundary"', line):
            s['uz_vime'] = False; s['shown'] = {}; s['need_read'] = {}; s['reads'] = []; s['kanon_pro'] = None
            continue
        if 'queued_command' in line or re.search(r'"type"\s*:\s*"user"', line):
            t = text_ownera(line)
            if t: s['owner'] = {'text': t[:4000], 'id': s['scanned'] + len(raw)}
        if '"tool_use"' not in line: continue
        try: msg = json.loads(line).get('message', {})
        except Exception: continue
        for c in msg.get('content') or []:
            if not isinstance(c, dict) or c.get('type') != 'tool_use': continue
            inp = c.get('input') or {}
            if c.get('name') in SHELL and 'uz_vime.js' in str(inp.get('command', '')): s['uz_vime'] = True
            if c.get('name') == 'Read' and inp.get('file_path'):
                r = rel(inp['file_path'])
                if r and r not in s['reads']: s['reads'].append(r)
    s['scanned'] += konec + 1


# ---------- rozhodnutí ----------
def rozhodni(vstup):
    tool = vstup.get('tool_name', '')
    inp = vstup.get('tool_input') or {}
    if tool in PISE:
        r = rel(inp.get('file_path') or inp.get('notebook_path'))
        cesty, volny = ([r] if r else []), ''
    elif tool in SHELL:
        cesty, volny = [], cil_z_prikazu(str(inp.get('command', '')))
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
    for o in hit:
        jm = o['oblast']
        if o.get('uz_vime') and not s['uz_vime']:
            zpravy.append('⛔ „' + jm + '“: zápis projde, až v téhle session poběží `node scripts/utils/uz_vime.js <pojmy>` — dohledej, jestli to, co '
                          'píšeš, už neexistuje (pravidlo, rozhodnutí, položka). Jedno místo pro jednu informaci (CLAUDE.md §20).')
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
    chk('1. první dotyk v2/*.js zastaví a vypíše §1', (lambda d: d and 'PRAVIDLA PRO OBLAST „JS ve v2“' in d and '### §1' in d)(V('Edit', file_path=js)))
    chk('2. druhý dotyk projde', V('Edit', file_path=js) is None)
    chk('3. soubor mimo mapu projde', V('Edit', file_path=R + '/docs/x.txt') is None)
    chk('4. jiná session dostane pravidla znovu', V('Edit', sid='s2', file_path=js) is not None)
    prepis({'type': 'system', 'subtype': 'compact_boundary'})
    chk('5. po compactu znovu', V('Edit', file_path=js) is not None)
    d = V('Edit', file_path=R + '/memory/x.md')
    chk('6. paměť bez uz_vime: zastaví s požadavkem uz_vime', d and 'uz_vime.js' in d and '§20' in d)
    chk('7. paměť dál bez uz_vime: pořád zastaví', (lambda d: d and 'uz_vime.js' in d)(V('Edit', file_path=R + '/memory/x.md')))
    prepis(tu('Bash', command='node scripts/utils/uz_vime.js pravidla'))
    chk('8. po uz_vime projde', V('Edit', file_path=R + '/memory/x.md') is None)
    d = V('Edit', file_path=R + '/v2/runar-character.js')
    chk('9. dlouhá sekce: chce Read a vypíše rozsah', d and 'Read RUNAR_DESIGN.md' in d)
    chk('10. bez Read pořád zastaví', (lambda d: d and 'napřed si přečti' in d)(V('Edit', file_path=R + '/v2/runar-character.js')))
    prepis(tu('Read', file_path=R + '/RUNAR_DESIGN.md'))
    chk('11. po Read projde', V('Edit', file_path=R + '/v2/runar-character.js') is None)
    chk('12. Bash jen čte (grep, 2>/dev/null) → projde', V('Bash', sid='s3', command='grep -n x supabase/functions/a/index.ts 2>/dev/null | head') is None)
    chk('13. Bash zapisuje do sql/ → zastaví', V('Bash', sid='s3', command='echo x > sql/2026-10-11_x.sql') is not None)
    sc = os.path.join(STAV, 'Temp', 'claude', 'p.py'); os.makedirs(os.path.dirname(sc), exist_ok=True)
    io.open(sc, 'w', encoding='utf-8').write("s = 'x'\nio.open('v2/runar-reader.css', 'w').write(s)\n")
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
    d = V2('Edit', 'k1', file_path=R + '/RUNAR_BACKLOG.md')
    chk('18. nová zpráva ownera s pokynem → první zápis do docs ukáže, kde to už stojí', d and 'RUNAR_TREE.md:2' in d and 'KÁNONU' in d)
    chk('19. druhý zápis k téže zprávě projde', V2('Edit', 'k1', file_path=R + '/RUNAR_BACKLOG.md') is None)
    p2({'type': 'user', 'message': {'content': 'pokračuj v kontrole dalších částí'}})
    chk('20. „pokračuj v kontrole“ kánon nehledá', V2('Edit', 'k1', file_path=R + '/RUNAR_BACKLOG.md') is None)
    p2({'type': 'attachment', 'attachment': {'type': 'queued_command', 'prompt': 'strom bude obsahovat čtení z deníku po založení', 'origin': {'kind': 'human'}}})
    d = V2('Edit', 'k1', file_path=R + '/memory/x.md')
    chk('21. zpráva poslaná během práce (queued_command) se počítá taky', d and 'RUNAR_TREE.md:2' in d)
    p2({'type': 'attachment', 'attachment': {'type': 'queued_command', 'prompt': 'strom bude obsahovat čtení z deníku po založení znovu', 'origin': {'kind': 'peer'}}})
    chk('22. zpráva jiné session (peer) se jako ownerova nebere', V2('Edit', 'k1', file_path=R + '/memory/x.md') is None)
    for jm, v in ok: print(('OK    ' if v else 'FAIL  ') + jm)
    return 0 if all(v for _, v in ok) else 1


if __name__ == '__main__':
    sys.exit(samotest() if '--test' in sys.argv else main())
