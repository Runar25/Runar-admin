#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# hooks/pre-commit.py — Rúnar git pre-commit hook
#
# Auto-bumps sw.js version when JS/CSS files in v2/ are staged.
# INSTALL: python hooks/install-hooks.py
#
# Logic:
#   JS/CSS staged in v2/ AND sw.js not staged → auto-bump + stage sw.js
#   sw.js already staged (manually bumped)    → skip (developer handled it)
#   No JS/CSS staged                          → skip

import subprocess, re, os, sys

# Repo root = parent of this script's parent (hooks/)
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW_PATH = os.path.join(REPO, 'v2', 'sw.js')

def get_staged_files():
    r = subprocess.run(['git', 'diff', '--staged', '--name-only'],
                       capture_output=True, text=True, cwd=REPO)
    return [f.strip() for f in r.stdout.strip().split('\n') if f.strip()]

def get_staged_status():
    # (status, path) páry; status 'A' = nově přidaný, 'M' = změněný, atd.
    r = subprocess.run(['git', 'diff', '--staged', '--name-status'],
                       capture_output=True, text=True, cwd=REPO)
    out = []
    for line in r.stdout.strip().split('\n'):
        parts = line.split('\t')
        if len(parts) >= 2:
            out.append((parts[0].strip(), parts[-1].strip()))
    return out

staged = get_staged_files()

# ── ANTI-KOLIZE: nově PŘIDANÝ scratch/lab soubor nesmí do commitu ──────────
# Lab/snapshot/backup adresáře jsou pracovní plocha jedné session. 2026-07-19
# `git add -A v2` do jedné lane nastagoval 112 UNTRACKED souborů z nich.
# ⚠️ Klíč: hlídá se STAV, ne adresář. Blokuje se jen ADD ('A' = dosud untracked),
# NE modifikace ('M'). Dva lab dirs mají trackovaný zdroj (tree-lab-branch/runar-branch.js,
# tree-lab-trunk/runar-trunk.js), který CODE-tree legitimně edituje — ten projde,
# protože jeho změna je 'M'. Sebraný untracked scratch je vždy 'A'.
# První verze (2026-07-19) blokovala celý prefix `v2/tree-lab-` a byla by FALSE-POSITIVE
# na těch dvou trackovaných zdrojích. Odhaleno až kontrolou tracked/untracked.
# Guard je LANE-AGNOSTICKÝ (nezná prefix commitu) → chytí i dvě session v téže lane.
# NEřeší kolizi na SDÍLENÉM TRACKOVANÉM souboru (DECISIONS, runar-app.js) — tam git
# nepozná, čí řádky jsou čí; to kryje jen `git pull` + pathspec commit.
_SCRATCH = ('v2/tree-snapshots/', 'v2/sigil-lab/', 'v2/tree-lab-', '_backup/', '__pycache__/')
def _scratch_add(status, path):
    return status.startswith('A') and path.startswith(_SCRATCH)

bad = [p for (st, p) in get_staged_status() if _scratch_add(st, p)]
if bad:
    print('[hook] KOLIZE: nově přidané scratch/lab soubory — ty se NEcommitují')
    print('       (untracked pracovní plocha jedné session; nejspíš je sebral `git add -A`):')
    for f in bad[:12]:
        print('         ' + f)
    if len(bad) > 12:
        print('         … a dalších ' + str(len(bad) - 12))
    print('[hook] Odstaguj je:  git reset -- ' + ' '.join(sorted(set(
        p.split('/')[0] + ('/' + p.split('/')[1] if p.startswith('v2/') else '') for p in bad))))
    print('[hook] Vědomě přesto (skutečně nový lab zdroj): git commit --no-verify')
    sys.exit(1)

# ── Sdílené docy jen přes scripts/utils/commit_vlastni.py (owner 2026-10-11 „5. ano“, DECISIONS 2026-10-11) ──
# Proč: pathspec commit (`git commit -- RUNAR_BACKLOG.md`) bere celý soubor i s necommitnutou prací jiné session. Stalo se třikrát
# (c81b4da CODE-tune ← CODE-read, b4c3f4a CODE-tree ← CODE-tune, dfac200 CODE-read ← CODE-tune) a pravidlo v paměti to nezastavilo
# → CLAUDE.md §30: dělá to stroj. commit_vlastni.py commitne jen vlastní kusy a nastaví RUNAR_VLASTNI=1.
# Výjimka (smazání souboru, které commit_vlastni neumí; vědomý případ): RUNAR_SDILENE_OK="<důvod>" — zapíše se do .git/runar-sdilene.log.
# scripts/protipriklady.py od 2026-10-11: píšou do něj všechny tři session; za den dvě kolize (c3dfd49 smazal cizí útoky, 1c37d3e přibalil
# cizí necommitnutý útok). JEDINÉ místo vzoru — hook pravidla_pri_dotyku.py si ho odsud čte (zastaví na nich nástroj Edit).
# smoke.py (CODE-tree 2026-10-11): kontroly do něj přidávají všechny session (㊵ CODE-read, ㊶ ㊷ CODE-tree…) — pathspec by bral cizí.
# Soubory appky od 2026-10-11 (CODE-read; owner: „technická otázka, vyřešte“): jen ty, do kterých píše víc session — commit 4eb6905
# vzal necommitnuté kusy CODE-tree v runar-reading.js a runar-translations.js. Zbytek appky dál pathspec (kolize tam nejsou).
_SDILENE = re.compile(r'^(CLAUDE\.md|RUNAR_[^/]*\.md|memory/.+\.md|scripts/protipriklady\.py|smoke\.py'
                      r'|v2/runar-(reading|translations|tree)\.js|v2/runar-reader\.(html|css))$')
_sd = [p for p in staged if _SDILENE.match(p)]
if _sd and os.environ.get('RUNAR_VLASTNI') != '1':
    _duvod = os.environ.get('RUNAR_SDILENE_OK', '').strip()
    if _duvod:
        try:
            _g = subprocess.run(['git', 'rev-parse', '--git-dir'], capture_output=True, text=True).stdout.strip()
            import datetime
            with open(os.path.join(_g, 'runar-sdilene.log'), 'a', encoding='utf-8') as _f:
                _f.write(datetime.datetime.now().isoformat(timespec='seconds') + ' ' + ', '.join(_sd) + ' | ' + _duvod + '\n')
        except Exception:
            pass
        print('[hook] sdílené docy bez commit_vlastni — výjimka: ' + _duvod)
    else:
        print('[hook] Sdílený doc (' + ', '.join(_sd) + ') commituj přes commit_vlastni.py, ne pathspec commitem —')
        print('       ten by vzal i necommitnutou práci jiné session v tomtéž souboru (stalo se 3×).')
        print('       Zápis: s = cv.cti(soubor); …; cv.zapis(soubor, s, "<lane>")  · commit: python -X utf8 scripts/utils/commit_vlastni.py commit <lane> <zprava.txt>')
        print('       Nový soubor: …commit_vlastni.py pridej <lane> <soubor> · výjimka: RUNAR_SDILENE_OK="<důvod>" git commit …')
        sys.exit(1)

# ── Commit nesmí tiše smazat ČERSTVOU práci jiné session (CODE-read 2026-10-11) ──
# Proč: c3dfd49 (CODE-read) smazal čtyři útoky CODE-tune z scripts/protipriklady.py — „svou verzi“ souboru jsem sestavil z pracovního
# stromu bez cizího bloku, který mezitím už byl v HEAD (8f0bf93). Nepushnuto, vráceno 80240e9; všiml jsem si jen díky statistice
# „5 deletions“. Táž třída jako tři pathspec commity výš (práce jedné session zmizí v commitu druhé) — tady u kódu a u commitnutých řádků.
# Co: řádky, které commit maže nebo mění, se porovnají s řádky, které do téhož souboru za posledních 24 h přidaly commity JINÉHO autora
# (jméno z -c user.name). Shoda = zastavit. Vědomá úprava cizího čerstvého řádku: RUNAR_CIZI_OK="<důvod>" (loguje .git/runar-cizi.log;
# commit_vlastni ji předá dál) — a řekni to té session.
def _cizi_cerstve():
    try:
        ja = subprocess.run(['git', 'var', 'GIT_AUTHOR_IDENT'], capture_output=True, text=True).stdout.split('<')[0].strip()
        if not ja:   # git var selže bez e-mailu — jméno pak z prostředí / configu (-c user.name se předává i sem)
            ja = os.environ.get('GIT_AUTHOR_NAME', '').strip() or subprocess.run(['git', 'config', 'user.name'], capture_output=True, text=True).stdout.strip()
        st = subprocess.run(['git', 'diff', '--cached', '--name-only', '--diff-filter=MD'], capture_output=True, text=True).stdout.split()
        nalezy = []
        for f in st:
            d = subprocess.run(['git', 'diff', '--cached', '-U0', '--no-color', '--', f], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
            smaz = {l[1:].strip() for l in d.split('\n') if l.startswith('-') and not l.startswith('---') and len(l[1:].strip()) >= 20}
            if not smaz: continue
            lg = subprocess.run(['git', 'log', '--since=24 hours ago', '--no-color', '-U0', '--format=@@C %h %an', '-p', 'HEAD', '--', f],
                                capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
            kdo, pridali = None, {}   # řádek → [(hash, autor)] všech, kdo ho za 24 h přidali
            for l in lg.split('\n'):
                if l.startswith('@@C '):
                    p = l.split(' ', 2); kdo = (p[1], p[2].strip() if len(p) > 2 else '')
                elif kdo and l.startswith('+') and not l.startswith('+++') and l[1:].strip() in smaz:
                    pridali.setdefault(l[1:].strip(), []).append(kdo)
            # Cizí = přidal ho jen někdo jiný. Přidal-li ho za 24 h i autor tohohle commitu (třeba ho vracel), je i jeho
            # (2026-10-11: řádky CODE-tune vrácené commitem CODE-read by jinak CODE-tune nesměl smazat jako „cizí“).
            for t, kdo_vse in pridali.items():
                if not any(a == ja for _, a in kdo_vse):
                    nalezy.append((f, kdo_vse[0][0], kdo_vse[0][1], t))
        return ja, nalezy
    except Exception as e:
        print('[hook] kontrola cizích čerstvých řádků selhala (pouštím dál): ' + repr(e)[:120])
        return '', []

_ja, _cizi = _cizi_cerstve()
if _cizi:
    _duvod = os.environ.get('RUNAR_CIZI_OK', '').strip()
    if _duvod:
        try:
            _g = subprocess.run(['git', 'rev-parse', '--git-common-dir'], capture_output=True, text=True).stdout.strip()
            import datetime
            with open(os.path.join(_g, 'runar-cizi.log'), 'a', encoding='utf-8') as _f:
                _f.write(datetime.datetime.now().isoformat(timespec='seconds') + ' ' + _ja + ' | ' + _duvod + ' | '
                         + '; '.join(f + ' ' + h + ' ' + a for f, h, a, _ in _cizi[:10]) + '\n')
        except Exception:
            pass
        print('[hook] mažeš/měníš čerstvé řádky jiné session — výjimka: ' + _duvod)
    else:
        print('[hook] Commit maže nebo mění řádky, které za posledních 24 h přidala JINÁ session (ty jsi ' + (_ja or '?') + '):')
        for f, h, a, t in _cizi[:12]:
            print('         ' + f + '  ' + h + ' ' + a + ':  ' + t[:110])
        if len(_cizi) > 12: print('         … a dalších ' + str(len(_cizi) - 12))
        print('       Omyl (verze souboru bez cizí práce)? Vezmi soubor z HEAD a přidej jen svou změnu — commit_vlastni.py to dělá sám.')
        print('       Vědomě (opravuješ její řádek)? RUNAR_CIZI_OK="<důvod>" před příkazem commitu, a řekni to té session.')
        sys.exit(1)

# ── IS source-linter gate (§9): block if a staged v2 source file has a bad IS literal ──
is_src = [f for f in staged if f.startswith('v2/') and f.endswith(('.js', '.html'))]
if is_src:
    _r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(REPO, 'check-is.py')], cwd=REPO)
    if _r.returncode != 0:
        print('[hook] check-is: bad IS literal in staged source -> commit blocked (fix or update BAD_PATTERNS).')
        sys.exit(1)

# ── Rychlé textové kontroly (CODE-tune 2026-10-14, domluveno s CODE-read) ──
# Proč: 2026-10-12, -13 a -14 šel commit bez kontroly, která čte měněný soubor (㊽ ㊱ shodily pre-push, ㊸ prošel na server, 49db492
# zablokoval push i CODE-read). Strom je sdílený → zastaví JEN vada na staged souboru; cizí vadu jen vypíše (chytí ji pre-push v čisté
# kopii, DECISIONS 2026-10-10 (40)). Seznam kontrol a pravidlo umístění: scripts/utils/rychle_kontroly.py; hlídá smoke ㊆. ~1 s.
if staged:
    _r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(REPO, 'scripts', 'utils', 'rychle_kontroly.py')],
                        input='\n'.join(staged), text=True, encoding='utf-8', cwd=REPO)
    if _r.returncode != 0:
        sys.exit(1)

# ── Skládání promptu pro server (CODE-tune 2026-10-21, krok 1 plánu infrastruktury — prompt na server, owner „ok začni“) ──
# supabase/functions/_shared/prompt_skladani.mjs je GENEROVANÝ z pěti souborů appky (scripts/build_prompt_skladani.js). Když commit
# nese některý z nich, balíček se přegeneruje z INDEXU (ne z pracovního stromu — ten nese cizí necommitnutou práci) a jde do téhož
# commitu. Bez toho by server po změně překladů nebo builderu skládal starý prompt. Shodu s prohlížečem hlídá smoke (verify_prompt_skladani.js).
_PROMPT_ZDROJE = ['v2/runar-config.js', 'v2/runar-runes.js', 'v2/runar-translations.js', 'v2/runar-utils.js', 'v2/runar-character.js']
if any(f in staged for f in _PROMPT_ZDROJE):
    _cil = 'supabase/functions/_shared/prompt_skladani.mjs'
    _g = subprocess.run(['node', os.path.join(REPO, 'scripts', 'build_prompt_skladani.js'), '--z-indexu'],
                        cwd=REPO, capture_output=True, text=True, encoding='utf-8')
    if _g.returncode != 0 or not _g.stdout:
        print('[hook] prompt_skladani.mjs: generátor selhal — commit zastaven (' + (_g.stderr or '').strip()[:300] + ')')
        sys.exit(1)
    with open(os.path.join(REPO, _cil), 'w', encoding='utf-8', newline='\n') as _f:
        _f.write(_g.stdout)
    _h = subprocess.run(['git', 'hash-object', '-w', _cil], cwd=REPO, capture_output=True, text=True).stdout.strip()
    subprocess.run(['git', 'update-index', '--add', '--cacheinfo', '100644,' + _h + ',' + _cil], cwd=REPO)
    print('[hook] prompt_skladani.mjs přegenerován ze staged zdrojů a přidán do commitu')

# Je změněno JS/CSS v v2/?
js_css = [f for f in staged
          if (f.startswith('v2/') or f == 'v2/sw.js')
          and f.endswith(('.js', '.css'))
          and 'sw.js' not in f]

if not js_css:
    sys.exit(0)  # Žádné JS/CSS změny → OK

# ── Verze běžícího kódu (CODE-tune 2026-10-11, DECISIONS 2026-10-11 (68)): v2/runar-verze.js nese TUTÉŽ verzi jako sw.js ──────────
# Proč: hlášení z appky bralo verzi z čerstvého sw.js, tedy NASAZENOU — ne tu, která v telefonu běží (JS jde ze cache service workeru,
# cache-first; hlášení 24c6c548 neslo v564 a popisovalo chybu opravenou ve v564). runar-verze.js leží v precache s ostatním JS, takže okno
# zná verzi kódu, který opravdu běží. Píše ho JEN tenhle hook (jako číslo v sw.js), takže commit nesebere cizí rozdělanou práci — to by
# hrozilo, kdyby verze stála v runar-reporter.js (návrh BACKLOG 2026-10-09). Shodu se sw.js hlídá smoke ㊼ (verify_verze_hlaseni.js).
VERZE_PATH = os.path.join(REPO, 'v2', 'runar-verze.js')
def _sync_verze(v):
    obsah = ('// GENEROVÁNO hooks/pre-commit.py při každém bumpu sw.js — ručně needitovat (shodu se sw.js hlídá smoke ㊼).\n'
             '// Verze kódu, který v okně opravdu běží: soubor jde ze stejné cache service workeru jako ostatní JS, kdežto čerstvý sw.js\n'
             '// říká jen nasazenou. Čte ji runar-reporter.js do hlášení. CODE-tune 2026-10-11, DECISIONS 2026-10-11 (68).\n'
             "var RUNAR_VERZE = 'v%d';\n" % v)
    try:
        with open(VERZE_PATH, 'r', encoding='utf-8') as _f:
            _stary = _f.read()
    except Exception:
        _stary = None
    if _stary != obsah:
        with open(VERZE_PATH, 'w', encoding='utf-8', newline='\n') as _f:
            _f.write(obsah)
        print('[hook] SW: runar-verze.js → v%d' % v)
    subprocess.run(['git', 'add', VERZE_PATH], cwd=REPO)

# Je sw.js už staged?
sw_staged = any('sw.js' in f for f in staged)
if sw_staged:
    # DOWNGRADE GUARD (2026-08-02): sw.js verze je monotonni cache-buster. Bary `git commit`
    # (misto `git commit -- <cesty>`) sebere cely index vcetne cizi STALE staged sw.js jine
    # session -> verze jde dolu -> klienti servuji stare cteni. Chyti to KAZDOU session:
    # staged sw.js musi byt > HEAD, jinak auto-oprav dopredu. (Discipline: viz memory
    # parallel-code-sessions-collision + CLAUDE.md N-session.)
    def _swver(text):
        mm = re.search(r"CACHE\s*=\s*'runar-v(\d+)'", text or '')
        return int(mm.group(1)) if mm else None
    try:
        _sv = _swver(subprocess.run(['git', 'show', ':v2/sw.js'], cwd=REPO, capture_output=True, text=True).stdout)
        _hv = _swver(subprocess.run(['git', 'show', 'HEAD:v2/sw.js'], cwd=REPO, capture_output=True, text=True).stdout)
        if _sv is not None and _hv is not None and _sv <= _hv:
            _fix = _hv + 1
            with open(SW_PATH, 'r', encoding='utf-8') as _f:
                _c = _f.read()
            _c = re.sub(r'(Service Worker[^\n]*?v)\d+', lambda m: m.group(1) + str(_fix), _c, count=1)
            _c = re.sub(r"(CACHE\s*=\s*'runar-v)\d+(')", lambda m: m.group(1) + str(_fix) + m.group(2), _c, count=1)
            with open(SW_PATH, 'w', encoding='utf-8') as _f:
                _f.write(_c)
            subprocess.run(['git', 'add', SW_PATH], cwd=REPO)
            print('[hook] SW: staged v%s <= HEAD v%s (DOWNGRADE) -> auto-fixed forward to v%s' % (_sv, _hv, _fix))
            _sync_verze(_fix)
            sys.exit(0)
    except Exception as _e:
        print('[hook] SW: downgrade-guard skipped (%s)' % _e)
    try:   # ručně staged sw.js: runar-verze.js dostane jeho verzi (jinak by rozdíl našel až smoke ㊼ v pre-push)
        _sv2 = _swver(subprocess.run(['git', 'show', ':v2/sw.js'], cwd=REPO, capture_output=True, text=True).stdout)
        if _sv2 is not None:
            _sync_verze(_sv2)
    except Exception as _e:
        print('[hook] SW: runar-verze.js nesrovnán se sw.js (%s)' % _e)
    print('[hook] SW: sw.js already staged — skipping auto-bump')
    sys.exit(0)

# Přečti aktuální verzi
if not os.path.exists(SW_PATH):
    print('[hook] SW: sw.js not found — skipping bump')
    sys.exit(0)

with open(SW_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

m_comment = re.search(r'(Service Worker[^\n]*?v)(\d+)', content)
m_cache   = re.search(r"(CACHE\s*=\s*'runar-v)(\d+)(')", content)

if not m_comment or not m_cache:
    print('[hook] SW: version pattern not found in sw.js — skipping bump')
    sys.exit(0)

v     = int(m_comment.group(2))
new_v = v + 1

# Zastav pokud verze nesouhlasí (ruční změna mimo vzor)
if int(m_cache.group(2)) != v:
    print(f'[hook] SW: comment=v{v} cache=v{m_cache.group(2)} — mismatch, skipping')
    sys.exit(0)

# Bump
content = re.sub(
    r'(Service Worker[^\n]*?v)\d+',
    lambda m: m.group(1) + str(new_v),
    content, count=1
)
content = re.sub(
    r"(CACHE\s*=\s*'runar-v)\d+(')",
    lambda m: m.group(1) + str(new_v) + m.group(2),
    content, count=1
)

with open(SW_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

# Stage sw.js
subprocess.run(['git', 'add', SW_PATH], cwd=REPO)
_sync_verze(new_v)

print(f'[hook] SW: auto-bumped v{v} → v{new_v}  ({len(js_css)} JS/CSS file(s) staged)')
sys.exit(0)
