# commit_vlastni.py — commit JEN vlastních kusů ve sdíleném pracovním stromě (CODE-tree 2026-10-11).
#
# Proč: pathspec commit (`git commit -- <soubor>`) vybírá soubory, ne kusy — vezme i necommitnutou práci jiné session v tomtéž
# souboru. Doloženo: b4c3f4a (CODE-tree, 2026-10-11) vzal záznam CODE-tune 2026-10-11 (5) a dvě jejich odškrtnutí v BACKLOGu;
# c81b4da (2026-10-10) totéž se třemi řádky CODE-read. Pravidlo „kontrola a commit v jednom příkazu“ (memory
# parallel-code-sessions-collision) se tím porušilo podruhé → podle CLAUDE.md §30 to dělá stroj, ne paměť session.
#
# Jak: soubor se zapisuje přes zapis() — ten si uloží obsah PŘED a PO zápisu do .git/runar-vlastni/<lane>/ (git to nevidí, nikdo to
# nesebere). commit pak vezme verzi z HEAD, každou mou změnu (před → po) na ni přiloží trojcestným `git merge-file` a výsledek commitne
# z DOČASNÉHO indexu. Cizí změny v pracovním stromě (dřívější i pozdější) do commitu nejdou a zůstanou ve stromě necommitnuté.
# Překrývá-li se moje změna s cizí necommitnutou (merge-file hlásí konflikt), necommitne nic a řekne to — pak počkej, až ta session
# commitne, a pusť commit znovu (záznamy zůstanou). cti() + zapis(): když soubor mezi mým čtením a zápisem změnil někdo jiný, zápis odmítne
# (jinak by můj text, spočítaný ze starého čtení, cizí změnu přepsal). Commitne se JEN to, co prošlo přes zapis().
#
#   z Pythonu:  sys.path.insert(0, r'C:\Users\zkuku\Downloads\Runar-admin\scripts\utils'); import commit_vlastni as cv
#               s = cv.cti('RUNAR_DECISIONS.md'); ...; cv.zapis('RUNAR_DECISIONS.md', s, 'CODE-tree')
#   python -X utf8 scripts/utils/commit_vlastni.py pridej <lane> <soubor>...       (NOVÝ soubor, který vytvořil jiný nástroj — celý je můj)
#   python -X utf8 scripts/utils/commit_vlastni.py stav <lane>
#   python -X utf8 scripts/utils/commit_vlastni.py commit <lane> <zprava.txt>     (podpis -c user.name=<lane>, jako CLAUDE.md)
#   python -X utf8 scripts/utils/commit_vlastni.py zahod <lane>
#   python -X utf8 scripts/utils/commit_vlastni.py --test                         (dočasné repo, ověří všechny stavy níž)
# Push zůstává na tobě (git push hned po commitu, CLAUDE.md §7).
import io, os, sys, json, shutil, subprocess, tempfile

NL_ = chr(10)
_CETL = {}   # cesta -> obsah, jak ho cti()/zapis() naposled viděly (kontrola zastaralého čtení v zapis())

def root():
    r = os.environ.get('RUNAR_ROOT')
    return r if r else os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

def git(args, cwd, env=None, inp=None, check=True):
    p = subprocess.run(['git'] + args, cwd=cwd, env=env, input=inp, capture_output=True)
    if check and p.returncode != 0:
        raise SystemExit('❌ git ' + ' '.join(args) + ': ' + (p.stderr or p.stdout).decode('utf8', 'replace')[-500:])
    return p

def _rel(R, path):
    return os.path.relpath(os.path.abspath(os.path.join(R, path)), R).replace(os.sep, '/')

def _store(R, lane):
    gd = git(['rev-parse', '--git-dir'], R).stdout.decode().strip()
    d = os.path.join(gd if os.path.isabs(gd) else os.path.join(R, gd), 'runar-vlastni', lane)
    os.makedirs(d, exist_ok=True)
    return d

def _load(d):
    p = os.path.join(d, 'zaznam.json')
    return json.load(io.open(p, encoding='utf8')) if os.path.exists(p) else []

def _save(d, z):
    io.open(os.path.join(d, 'zaznam.json'), 'w', encoding='utf8').write(json.dumps(z, ensure_ascii=False, indent=1))

def _lf(b):
    return b.replace(b'\r\n', b'\n')   # core.autocrlf=true: pracovní kopie od gitu má CRLF, blob v repu LF

def cti(path, R=None):
    """Text souboru s konci řádků LF. Proč LF: core.autocrlf=true dá souborům vybaleným gitem CRLF, kdežto kotvy v patch skriptech se píšou
    s chr(10) — víceřádková kotva pak nesedí (2026-10-11: memory/runar-tree-engine-lab.md, 239 × CRLF, kotva „0×“). Blob v repu je stejně LF."""
    R = R or root(); rel = _rel(R, path)
    b = io.open(os.path.join(R, rel), 'rb').read()
    _CETL[rel] = b   # kontrola zastaralého čtení porovnává surové bajty
    return _lf(b).decode('utf8')

def zapis(path, text, lane, R=None):
    R = R or root(); rel = _rel(R, path); full = os.path.join(R, rel)
    old = io.open(full, 'rb').read() if os.path.exists(full) else None
    if rel in _CETL and old != _CETL[rel]:
        raise SystemExit('❌ ' + rel + ': od mého čtení ho změnil někdo jiný — nezapisuji (přepsal bych cizí změnu). Přečti znovu a zopakuj.')
    new = text.encode('utf8') if isinstance(text, str) else text
    d = _store(R, lane); z = _load(d); i = (max([e['i'] for e in z]) + 1) if z else 0
    if old is not None: io.open(os.path.join(d, '%03d.pred' % i), 'wb').write(old)
    io.open(os.path.join(d, '%03d.po' % i), 'wb').write(new)
    io.open(full, 'wb').write(new)
    _CETL[rel] = new
    z.append({ 'path': rel, 'i': i, 'novy': old is None }); _save(d, z)

def pridej(path, lane, R=None):
    """Nový (netrackovaný) soubor, který vytvořil jiný nástroj (Write, builder): celý je můj. Trackovaný odmítne — tam by
    „celý rozdíl proti HEAD“ mohl nést cizí necommitnuté řádky; ten se zapisuje přes zapis()."""
    R = R or root(); rel = _rel(R, path)
    if git(['ls-files', '--error-unmatch', '--', rel], R, check=False).returncode == 0:
        raise SystemExit('❌ ' + rel + ': je v gitu — pridej je jen pro nové soubory; změny trackovaného souboru zapiš přes zapis()')
    d = _store(R, lane); z = _load(d); i = (max([e['i'] for e in z]) + 1) if z else 0
    io.open(os.path.join(d, '%03d.po' % i), 'wb').write(io.open(os.path.join(R, rel), 'rb').read())
    z.append({ 'path': rel, 'i': i, 'novy': True }); _save(d, z)

def stav(lane, R=None):
    R = R or root(); z = _load(_store(R, lane))
    if not z: return print(lane + ': nic zapsaného přes zapis()')
    for e in z: print(lane + ': ' + e['path'] + (' (nový soubor)' if e['novy'] else '') + ' · zápis ' + str(e['i']))

def zahod(lane, R=None):
    R = R or root(); shutil.rmtree(_store(R, lane), ignore_errors=True); print(lane + ': záznamy zahozeny (soubory ve stromě beze změny)')

def commit(lane, msgfile, R=None):
    R = R or root(); d = _store(R, lane); z = _load(d)
    if not z: raise SystemExit('❌ ' + lane + ': nic zapsaného přes zapis() — není co commitnout')
    paths = []
    for e in z:
        if e['path'] not in paths: paths.append(e['path'])
    tmp = tempfile.mkdtemp(prefix='vlastni_'); res = {}; mody = {}
    try:
        for pth in paths:
            lt = git(['ls-tree', 'HEAD', '--', pth], R).stdout.decode().split()
            cur = _lf(git(['show', 'HEAD:' + pth], R).stdout) if lt else b''
            mody[pth] = lt[0] if lt else '100644'
            for e in [x for x in z if x['path'] == pth]:
                pred = b'' if e['novy'] else _lf(io.open(os.path.join(d, '%03d.pred' % e['i']), 'rb').read())
                po = _lf(io.open(os.path.join(d, '%03d.po' % e['i']), 'rb').read())
                if pred == cur: cur = po; continue   # v souboru nebylo nic cizího: po = HEAD + moje změna
                fc, fb, fo = [os.path.join(tmp, n) for n in ('cur', 'pred', 'po')]
                for f, b in ((fc, cur), (fb, pred), (fo, po)): io.open(f, 'wb').write(b)
                m = subprocess.run(['git', 'merge-file', '-p', fc, fb, fo], capture_output=True)
                if m.returncode != 0:
                    raise SystemExit('❌ ' + pth + ': moje změna se překrývá s cizí necommitnutou (merge-file ' + str(m.returncode) +
                                     ') — nic necommitnuto. Počkej, až ta session commitne, pak commit pusť znovu.')
                cur = m.stdout
            res[pth] = cur
        env = dict(os.environ); env['GIT_INDEX_FILE'] = os.path.join(tmp, 'index')
        # Značka pro pre-commit: sdílené docy (RUNAR_*.md, CLAUDE.md, memory/) smí commitnout jen tenhle nástroj — pathspec commit by
        # vzal i cizí necommitnuté kusy (c81b4da, b4c3f4a, dfac200). Owner 2026-10-11 „5. ano“; hooks/pre-commit.py.
        env['RUNAR_VLASTNI'] = '1'
        git(['read-tree', 'HEAD'], R, env=env)
        for pth, b in res.items():
            sha = git(['hash-object', '-w', '--no-filters', '--stdin'], R, inp=b).stdout.decode().strip()
            git(['update-index', '--add', '--cacheinfo', mody[pth] + ',' + sha + ',' + pth], R, env=env)
        if git(['write-tree'], R, env=env).stdout == git(['rev-parse', 'HEAD^{tree}'], R).stdout:
            shutil.rmtree(d, ignore_errors=True)
            return print('✅ ' + lane + ': moje změny už v HEAD jsou (commitnul je někdo jiný) — nic nového, záznamy zahozeny')
        git(['-c', 'user.name=' + lane, 'commit', '-q', '-F', os.path.abspath(msgfile)], R, env=env)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    zm = [x for x in git(['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'], R).stdout.decode().splitlines() if x]
    git(['reset', '-q', '--'] + zm, R)   # skutečný index = nový HEAD (i soubory, které přidal hook, např. sw.js)
    shutil.rmtree(d, ignore_errors=True)
    h = git(['log', '-1', '--format=%h %an %s'], R).stdout.decode().strip()
    cizi = git(['diff', '--stat', '--'] + paths, R).stdout.decode().strip()
    print('✅ ' + h + NL_ + '   soubory: ' + ', '.join(zm) + NL_ + ('   ve stromě zůstává cizí necommitnuté:' + NL_ + cizi if cizi else '   cizí necommitnuté v nich nic'))

def _test():
    R = tempfile.mkdtemp(prefix='vlastni_test_'); ok = []
    def sh(*a): return git(list(a), R)
    def wt(p, s): io.open(os.path.join(R, p), 'w', encoding='utf8', newline='').write(s)
    def rd(p): return io.open(os.path.join(R, p), encoding='utf8').read()
    def head(p): return sh('show', 'HEAD:' + p).stdout.decode()
    def check(c, msg):
        if not c: raise SystemExit('❌ test: ' + msg)
        ok.append(msg)
    try:
        sh('init', '-q'); sh('config', 'user.email', 't@t'); sh('config', 'user.name', 't'); sh('config', 'core.autocrlf', 'false')
        wt('a.md', 'A\nB\nC\n'); wt('b.md', 'X\nY\n'); wt('c.md', 'P\nQ\nR\nS\nT\nU\nV\n'); sh('add', '.'); sh('commit', '-q', '-m', 'zaklad')
        msg = os.path.join(R, '.git', 'zprava.txt'); io.open(msg, 'w', encoding='utf8').write('[t] moje\n')
        # 1) cizí změna PŘED mou (necommitnutá) + moje + cizí PO mně; nový soubor; dvě moje změny v jednom souboru
        wt('a.md', 'A\nF1\nB\nC\n')
        s = cti('a.md', R); zapis('a.md', s.replace('C\n', 'C2\n'), 'T', R)
        wt('a.md', rd('a.md') + 'F2\n')
        zapis('n.md', 'nove\n', 'T', R)
        s = cti('c.md', R); zapis('c.md', s.replace('P\n', 'P1\n'), 'T', R); s = cti('c.md', R); zapis('c.md', s.replace('V\n', 'V1\n'), 'T', R)
        commit('T', msg, R)
        check(head('a.md') == 'A\nB\nC2\n', 'commit nese jen mou změnu (cizí před i po mně zůstaly venku)')
        check(rd('a.md') == 'A\nF1\nB\nC2\nF2\n', 'cizí změny zůstaly v pracovním stromě')
        check(sh('diff', '--cached', '--name-only').stdout.decode().strip() == '', 'skutečný index srovnaný s novým HEAD')
        check('F1' in sh('diff', '--', 'a.md').stdout.decode(), 'cizí změna je dál necommitnutá (git diff ji ukáže)')
        check(head('n.md') == 'nove\n', 'nový soubor commitnut celý')
        check(head('c.md') == 'P1\nQ\nR\nS\nT\nU\nV1\n', 'dvě mé změny v jednom souboru obě v commitu')
        check(sh('log', '-1', '--format=%an').stdout.decode().strip() == 'T', 'podpis = lane')
        # 2) překryv s cizí necommitnutou na konci souboru -> nic necommitnout, záznam zůstane
        wt('b.md', 'X\nY\nF\n'); s = cti('b.md', R); zapis('b.md', s + 'M\n', 'T', R)
        h0 = sh('rev-parse', 'HEAD').stdout
        try:
            commit('T', msg, R); check(False, 'překryv měl commit odmítnout')
        except SystemExit as e:
            check('překrývá' in str(e), 'překryv s cizí změnou: commit odmítnut')
        check(sh('rev-parse', 'HEAD').stdout == h0, 'při překryvu žádný commit')
        check(len(_load(_store(R, 'T'))) == 1, 'při překryvu záznam zůstal (jde zopakovat)')
        # 3) cizí session commitne JEN svoje F (strom pak zase s mým M) -> můj commit teď projde a nese jen M
        wt('b.md', 'X\nY\nF\n'); sh('add', 'b.md'); git(['-c', 'user.name=cizi', 'commit', '-q', '-m', 'cizi', '--', 'b.md'], R); wt('b.md', 'X\nY\nF\nM\n')
        commit('T', msg, R)
        check(head('b.md') == 'X\nY\nF\nM\n' and sh('log', '-1', '--format=%an').stdout.decode().strip() == 'T', 'po cizím commitu projde můj (jen M, můj podpis)')
        # 4) cizí commit vzal i moje řádky -> nic nového, bez prázdného commitu
        s = cti('a.md', R); zapis('a.md', s + 'M3\n', 'T', R); sh('add', 'a.md'); git(['-c', 'user.name=cizi', 'commit', '-q', '-m', 'cizi2', '--', 'a.md'], R)
        h1 = sh('rev-parse', 'HEAD').stdout; commit('T', msg, R)
        check(sh('rev-parse', 'HEAD').stdout == h1 and not _load(_store(R, 'T')), 'moje změny už v HEAD: žádný prázdný commit, záznamy zahozeny')
        # 5) pridej: nový soubor od jiného nástroje projde celý, trackovaný odmítne
        wt('w.md', 'od Write' + NL_); pridej('w.md', 'T', R); commit('T', msg, R)
        check(head('w.md') == 'od Write' + NL_, 'pridej: nový soubor od jiného nástroje commitnut celý')
        try:
            pridej('a.md', 'T', R); check(False, 'pridej měl trackovaný soubor odmítnout')
        except SystemExit as e:
            check('je v gitu' in str(e), 'pridej: trackovaný soubor odmítnut')
        # 6) soubor s CRLF (jak ho vybalí git s autocrlf): cti vrátí LF, víceřádková kotva sedí, commit projde
        io.open(os.path.join(R, 'crlf.md'), 'wb').write(b'X1\r\nX2\r\nX3\r\n'); sh('add', 'crlf.md'); sh('commit', '-q', '-m', 'crlf')
        s = cti('crlf.md', R); check(s == 'X1' + NL_ + 'X2' + NL_ + 'X3' + NL_, 'cti vrací LF i ze souboru s CRLF')
        zapis('crlf.md', s.replace('X1' + NL_ + 'X2', 'X1' + NL_ + 'Y2'), 'T', R); commit('T', msg, R)
        check(head('crlf.md').replace(chr(13), '') == 'X1' + NL_ + 'Y2' + NL_ + 'X3' + NL_, 'víceřádková kotva v souboru s CRLF zapsána a commitnuta')
        # 7) zastaralé čtení: cti, cizí zápis, zapis -> odmítnout
        s = cti('a.md', R); wt('a.md', rd('a.md') + 'F3\n')
        try:
            zapis('a.md', s + 'M2\n', 'T', R); check(False, 'zastaralé čtení mělo zápis odmítnout')
        except SystemExit as e:
            check('od mého čtení' in str(e), 'zastaralé čtení: zápis odmítnut')
        check(rd('a.md').endswith('F3\n'), 'cizí zápis po mém čtení nepřepsán')
    finally:
        shutil.rmtree(R, ignore_errors=True)
    print('✅ commit_vlastni --test: ' + str(len(ok)) + ' kontrol' + NL_ + NL_.join('   · ' + x for x in ok))

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['--test']: _test()
    elif len(a) >= 3 and a[0] == 'pridej': [pridej(f, a[1]) for f in a[2:]]; print(a[1] + ': přidáno ' + str(len(a) - 2) + ' nových souborů')
    elif len(a) >= 2 and a[0] == 'stav': stav(a[1])
    elif len(a) >= 2 and a[0] == 'zahod': zahod(a[1])
    elif len(a) >= 3 and a[0] == 'commit': commit(a[1], a[2])
    else: print('pouziti: pridej <lane> <soubor>... | stav <lane> | commit <lane> <zprava.txt> | zahod <lane> | --test'); sys.exit(2)
