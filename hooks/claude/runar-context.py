# -*- coding: utf-8 -*-
# ── Verzováno v repu: hooks/claude/runar-context.py (od 2026-10-14, DECISIONS 2026-10-14 (2)). V ~/.claude jen odkaz; data hooku v ~/.claude.
# SessionStart `additionalContext` pro KAZDOU session (start, compact, resume): KARTA „kde jsem a co delam“.
#
# PROC (KUKY 2026-08-16): "po kazdem compactu jsi hloupy" — compact shrne konverzaci, ne projekt ani to, co owner prave chtel.
#
# ⭐ PREPSANO 2026-11-25 (CODE-read, owner „18. ano … jde to jeste lepe? tak to udelej“; audit docs/audit/2026-11-25-pamet-a-pravidla/):
#   1) LIMIT. Claude Code vlozi do kontextu nejvys 10 000 znaku; co je navic, ulozi do souboru a ukaze jen NAHLED 2 000 znaku, ktery nikdo
#      necte (code.claude.com/docs/en/hooks.md, „JSON output“). Stary vystup mel 16–23 tis. znaku → po compactu dosly jen citace ownera,
#      pravidla, fakta ani rozdelana prace NE. Ted ma kazda cast svuj strop a celek tvrdy strop STROP (hlida verify_hooky_claude.py).
#   2) CIZI PRACE. `rozdelane()` bralo `max(x[:10])` pres jmena snapshotu → nedatovane memory/snapshots/runar-tree-*.md vyhraly nad
#      „2026-…“ a kazda session dostala ~7,5 kB cervnove prace stromu jako „rozdelanou praci“. Snapshoty jsou od 2026-10-11 dobrovolne
#      (DECISIONS 2026-10-11 (21)) → karta je necte vubec; rozdelanou praci nese prepis (zpravy ownera + moje otevrene otazky).
#   3) LANE. Hook nevedel, jaka session bezi. Ted ji pozna z prepisu (jmeno, pod kterym session commituje: user.name='CODE-…' nebo
#      commit_vlastni.py … CODE-…) a ulozi do ~/.claude/runar-lane/<session>.txt.
#   4) DUPLIKATY PRYC: rozcestnik z MEMORY.md (MEMORY.md Claude Code vklada sam, i po compactu), dlouhe bloky o datech a postupu
#      (zkraceny na odkazy), pravidla stromu jen pro CODE-tree a neznamou lane.
import datetime, io, json, os, re, subprocess, sys

REPO = os.environ.get('RUNAR_ROOT') or r'C:\Users\zkuku\Downloads\Runar-admin'
STROP = 8500          # tvrdy strop celeho textu (limit Claude Code 10 000; rezerva na JSON a hlavicky)
LANE_DIR = os.environ.get('RUNAR_LANE_DIR') or os.path.join(os.path.expanduser('~'), '.claude', 'runar-lane')

HOOK = {}
try:
    if not sys.stdin.isatty():
        _raw = sys.stdin.read()
        if _raw.strip():
            HOOK = json.loads(_raw)
except Exception:
    HOOK = {}
ZDROJ = (HOOK.get('source') or 'startup')
SID = str(HOOK.get('session_id') or '').replace('/', '_').replace('\\', '_')


def bezpecne(fn, jinak=None):
    """Hook NESMI spadnout ani zdrzet. Kterykoli kus muze chybet a zbytek se posle dal."""
    try:
        return fn()
    except Exception:
        return jinak


def orez(t, n):
    t = (t or '').strip()
    return t if len(t) <= n else t[:n - 12].rstrip() + ' …(zkraceno)'


def _prepis_cesta():
    tp = HOOK.get('transcript_path')
    if tp and os.path.isfile(tp):
        return tp
    if SID:
        zal = os.path.join(os.path.expanduser('~'), '.claude', 'compact-backups', SID + '.jsonl')
        if os.path.isfile(zal):
            return zal
    return None


def _text(content):
    if isinstance(content, str):
        return content, False
    kusy, tool = [], False
    for it in content or []:
        if isinstance(it, dict):
            if it.get('type') == 'text':
                kusy.append(it.get('text') or '')
            elif it.get('type') == 'tool_result':
                tool = True
    return '\n'.join(kusy), tool


def _je_sum(txt):
    z = txt.lstrip()
    return z.startswith('This session is being continued') or z.startswith('Analysis:') or z.startswith('<') or z.startswith('Stop hook feedback')


_LANE_RE = re.compile(r"user\.name=\\?['\"]?(CODE-(?:tune|read|tree|web|dverg))|commit_vlastni\.py\s+(?:uprav|commit|pridej)\s+(CODE-(?:tune|read|tree|web|dverg))")


def precti_prepis():
    """Jeden pruchod prepisem (muze mit stovky MB): zpravy ownera, moje posledni zprava, lane. json.loads jen na radcich, ktere jsou potreba."""
    cesta = _prepis_cesta()
    out = {'owner': [], 'ja': None, 'lane': None, 'cesta': cesta}
    if not cesta:
        return out
    # Binarne a jen podretezce: prepis teto session mel 2026-11-25 300 MB a textove cteni + json.loads kazdeho radku trvalo 5,4 s
    # (SessionStart ma timeout 10 s a tree-guard pousti i dalsi veci). Vysledky nastroju (tool_use_id) jsou nejvetsi a nikdy to nejsou slova ownera.
    # Zpravy staci z konce prepisu (poslednich OKNO bajtu); lane z celeho souboru jednim regexem nad bajty (bez deleni na radky).
    # Cteni celych 300 MB trva ~4 s (disk), proto jen konec; cely soubor jen jednou, kdyz lane jeste neni v cache.
    OKNO = 40 * 1024 * 1024
    LRE = re.compile(_LANE_RE.pattern.encode('utf-8'))
    with io.open(cesta, 'rb') as f:
        f.seek(0, 2)
        vel = f.tell()
        f.seek(max(0, vel - OKNO))
        data = f.read()
        if vel > OKNO:
            data = data[data.find(b'\n') + 1:]
        for m in LRE.finditer(data):
            out['lane'] = (m.group(1) or m.group(2)).decode('ascii')
        if not out['lane'] and vel > OKNO and not lane_z_cache():
            f.seek(0)
            for m in LRE.finditer(f.read()):
                out['lane'] = (m.group(1) or m.group(2)).decode('ascii')
    if True:
        for bl in data.split(b'\n'):
            if b'"isSidechain":true' in bl:
                continue
            bz = bl.replace(b'": "', b'":"').replace(b'": t', b'":t')   # prepis Claude Code je kompaktni JSON; jiny zapis (test, zaloha) at projde taky
            if b'"isSidechain":true' in bz:
                continue
            je_user = b'"type":"user"' in bz and b'"tool_use_id"' not in bz
            je_ja = b'"type":"assistant"' in bz and b'"type":"text"' in bz
            if not (je_user or je_ja):
                continue
            try:
                rec = json.loads(bl.decode('utf-8', 'replace'))
            except Exception:
                continue
            if rec.get('isSidechain') or rec.get('isMeta') or rec.get('isCompactSummary'):
                continue
            msg = rec.get('message') or {}
            txt, tool = _text(msg.get('content'))
            txt = (txt or '').strip()
            if not txt:
                continue
            if rec.get('type') == 'user' and msg.get('role') == 'user' and not _je_sum(txt):
                out['owner'].append(txt)
            elif rec.get('type') == 'assistant' and len(txt) > 200:
                out['ja'] = txt
    return out


def lane_z_cache():
    try:
        return io.open(os.path.join(LANE_DIR, SID + '.txt'), encoding='utf-8').read().strip() or None
    except Exception:
        return None


def lane_uloz(lane):
    try:
        os.makedirs(LANE_DIR, exist_ok=True)
        io.open(os.path.join(LANE_DIR, SID + '.txt'), 'w', encoding='utf-8').write(lane)
    except Exception:
        pass


def blok_owner(zpravy, strop=3200, per=900):
    if not zpravy:
        return None
    vybrane, delka = [], 0
    for z in reversed(zpravy[-10:]):            # od nejnovejsi — ta je nejdulezitejsi
        zz = orez(z, per)
        if vybrane and delka + len(zz) > strop:
            break
        vybrane.append(zz)
        delka += len(zz)
    vybrane.reverse()
    return ('CO TI OWNER REKL NAPOSLED (doslova, chronologicky, posledni dole) — AKTUALNI ZADANI, ne pozadi:\n'
            + '\n'.join('  • ' + z.replace('\n', '\n    ') for z in vybrane))


def blok_ja(txt, strop=1300):
    """Moje posledni zprava ownerovi: jeji otevrene otazky (cislovane, s otaznikem) = na co owner odpovida / co ceka."""
    if not txt:
        return None
    otazky = [l.strip() for l in txt.splitlines() if re.match(r'^\s*\d+\.\s.*\?\s*$', l)]
    if otazky:
        telo = '\n'.join('  ' + orez(o, 300) for o in otazky[-6:])
        return orez('MOJE POSLEDNI OTAZKY OWNEROVI (jeho cislovane odpovedi „N. ano“ se vztahuji k nim):\n' + telo, strop)
    return orez('MOJE POSLEDNI ZPRAVA OWNEROVI (konec):\n  …' + txt[-900:].replace('\n', '\n  '), strop)


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=REPO, capture_output=True, text=True, encoding='utf-8', timeout=6)
    return r.stdout if r.returncode == 0 else ''


def blok_lane(lane):
    radky = []
    if lane:
        c = [l for l in git('log', '-6', '--no-merges', '--date=short', '--author=' + lane, '--format=%ad %h %s').splitlines() if l.strip()]
        if c:
            radky.append('  moje posledni commity:\n' + '\n'.join('    ' + orez(l, 150) for l in c))
        u = bezpecne(lambda: ukoly_lane(lane)) or []
        if u:
            radky.append('  ukoly pro me v RUNAR_BACKLOG.md (' + str(len(u)) + '): ' + ' | '.join(orez(x, 110) for x in u[:4]))
        if lane in ('CODE-read', 'CODE-tune'):
            p = bezpecne(lambda: [x['id'] + ' ' + orez(x.get('nazev', ''), 45) for x in json.load(io.open(
                os.path.join(REPO, 'docs', 'kostra', 'pokusy.json'), encoding='utf-8'))['pokusy'] if x.get('stav') == 'čeká na ownera']) or []
            if p:
                radky.append('  pokusy cekajici na ownera (docs/kostra/pokusy.json): ' + '; '.join(p))
        hlava = 'MOJE LANE: ' + lane + ' — commituj jen pod timhle jmenem, sahej jen do sve domeny (CLAUDE.md „N paralelních session“).'
    else:
        hlava = ('MOJE LANE: NEZNAMA — urci ji z toho, co owner chce (tune · read · tree · web); prvni commit `git -c user.name=\'CODE-…\'` '
                 'ji hooku prozradi. Nesahej do cizi domeny.')
        c = [l for l in git('log', '-8', '--no-merges', '--date=short', '--format=%ad %h %s').splitlines() if l.strip()]
        if c:
            radky.append('  posledni commity vsech lane:\n' + '\n'.join('    ' + orez(l, 140) for l in c))
    return hlava + ('\n' + '\n'.join(radky) if radky else '')


def ukoly_lane(lane):
    t = io.open(os.path.join(REPO, 'RUNAR_BACKLOG.md'), encoding='utf-8').read().splitlines()
    vzor = re.compile(r'^\s*(?:-\s*)?(?:\[ \]\s*)?(?:⚪\s*)?(?:\*\*)?\s*Pro ' + re.escape(lane) + r'\b')
    out = []
    for i, l in enumerate(t, 1):
        if vzor.match(l) and '✅' not in l and not l.lstrip().startswith('- [x]') and l[:l.find('Pro ')].count('~~') % 2 == 0:
            out.append('r. ' + str(i) + ' ' + ' '.join(l.strip().lstrip('-').split()))
    return out


def blok_pravidla(lane):
    r = ['JAK PRACOVAT (podrobnosti ukaze hook pri zapisu do souboru — mapa scripts/utils/pravidla_mapa.json):',
         '  • Nez navrhnes, zmeris nebo zapises: `node scripts/utils/uz_vime.js <pojmy>` (rozhodnuto? vyrazeno?) · co owner rekl drive:',
         '    `node scripts/utils/najdi_v_konverzacich.js "<text>" --kdo owner` · data, ktera uz mame: `node scripts/utils/najdi_cteni.js`.',
         '  • Pokus a text pro model: napred docs/kostra/ (KOSTRA.md, pokusy.json) a RUNAR_DESIGN.md „Slova, ktera davame modelu“;',
         '    API jen s RUNAR_POKUS — hlidac ukaze, co uz o slovech a znenich vime.',
         '  • Hotovy kus rozbij sam, teprve pak hlas · ownerovy napady = smer (§21) · stav zapsany v datech („neovereno“) respektuj.',
         '  • Zprava ownerovi: cesky, body i otazky cislovane, otazky s „?“; vysledek, ne proces (kontroluje Stop hook).']
    if lane in (None, 'CODE-tree'):
        r.append('  • STROM: kazda vetev nese runu a vlastni koren; vetve neshlukovat; zmena tree engine → zaznam do DECISIONS nebo RUNAR_TREE.md.')
    return '\n'.join(r)


def blok_fakta():
    def radek(cesta, vzor):
        try:
            m = re.search(vzor, io.open(os.path.join(REPO, cesta), encoding='utf-8').read())
            return m.group(1) if m else None
        except Exception:
            return None
    verze = radek('v2/runar-config.js', r"RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'")
    sw = radek('v2/sw.js', r'(v\d+)')
    roz = []
    try:
        for l in io.open(os.path.join(REPO, 'RUNAR_DECISIONS.md'), encoding='utf-8'):
            if l.startswith('## '):
                roz.append(l[3:].strip())
    except Exception:
        pass
    t = 'FAKTA: prompt ' + (verze or '?') + ' · SW ' + (sw or '?') + ' (menis prompt → bump verze).'
    if roz:
        t += '\nPOSLEDNI ROZHODNUTI (RUNAR_DECISIONS.md, pri sporu vyhrava novejsi):\n' + '\n'.join('  - ' + orez(x, 140) for x in roz[-5:])
    return t


def sestav():
    p = bezpecne(precti_prepis) or {'owner': [], 'ja': None, 'lane': None, 'cesta': None}
    lane = p.get('lane') or lane_z_cache()
    if p.get('lane') and SID:
        lane_uloz(p['lane'])
    if SID:   # „viděno“ pro oznámení změn systému (runar-oznameni.py): karta ukazuje poslední rozhodnutí → od teď hlásí jen novější
        bezpecne(lambda: (os.makedirs(LANE_DIR, exist_ok=True),
                          io.open(os.path.join(LANE_DIR, SID + '.videno'), 'w', encoding='utf-8').write(git('rev-parse', 'HEAD').strip())))
    dnes = datetime.date.today().isoformat()
    hlava = 'RUNAR — KARTA SESSION (' + ZDROJ + '). DNES JE ' + dnes + ' (datovany zaznam nese TOHLE datum).'
    if ZDROJ in ('compact', 'resume'):
        hlava += ('\n⚠️ PRAVE PROBEHL COMPACT/RESUME: srovnej se s tim, co owner rekl a na co jsem se ptal (nize), DRIV nez cokoli udelas.'
                  + (' Cely prepis: ' + p['cesta'] if p.get('cesta') else ''))
    casti = [hlava]
    if ZDROJ in ('compact', 'resume'):
        casti += [bezpecne(lambda: blok_owner(p['owner'])), bezpecne(lambda: blok_ja(p['ja']))]
    casti += [bezpecne(lambda: blok_lane(lane)), blok_pravidla(lane), bezpecne(blok_fakta)]
    text = '\n\n'.join(c for c in casti if c)
    if len(text) > STROP:                      # posledni pojistka: radsi urizni konec (fakta) nez nechat Claude Code schovat vse do souboru
        text = text[:STROP - 40] + '\n…(karta zkracena na strop)'
    return text


sys.stdout.write(json.dumps({'hookSpecificOutput': {'hookEventName': 'SessionStart', 'additionalContext': sestav()}}, ensure_ascii=False))
