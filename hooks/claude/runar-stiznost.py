# -*- coding: utf-8 -*-
# Kniha selhání: ownerova stížnost „už jsme to dělali / máš to zapsané / pořád dokola“ se zapíše SAMA a session ji musí zařadit.
#
# Proč (2026-11-25, CODE-read; owner „18. ano“ k bodu 12 návrhu; audit docs/audit/2026-11-25-pamet-a-pravidla/): 116 takových stížností
# za půl roku, každá skončila novým pravidlem nebo pamětí, ale nikdo neměřil, JESTLI se tentýž druh chyby vrátil — a vracel se (48 ze 72).
# Teď: UserPromptSubmit pozná stížnost ve zprávě ownera a založí záznam docs/audit/selhani/<čas>-<session>.json (citace, lane, čas).
# Session ho musí vyplnit: co se zapomnělo, kde to bydlelo, třída (jako v auditu) a co tomu příště zabrání. Nevyplněný záznam této
# session zastaví Stop hook. Rozbor po čase = počty tříd a opakování v jedné složce, ne dojem.
#   python -X utf8 hooks/claude/runar-stiznost.py prompt   (UserPromptSubmit; stdin = hook JSON)
#   python -X utf8 hooks/claude/runar-stiznost.py stop     (Stop)
# Chyba hooku = projde (hook nesmí zastavit práci).
import datetime, io, json, os, re, sys, unicodedata

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
DIR = os.environ.get('RUNAR_SELHANI_DIR') or os.path.join(REPO, 'docs', 'audit', 'selhani')
TRIDY = ['nezapsáno', 'zapsáno-neukázáno', 'ukázáno-utopeno', 'ukázáno-přejito', 'jiné']

# Slova ownerových stížností z auditu (selhani-*.json, 116 případů) — bez diakritiky, malými písmeny.
STIZNOST = re.compile(r"uz jsme (to )?(delali|resili|zkouseli|meli|rikali)|mas (to )?(zapsan|napsan)|porad dokola|stale dokola|zase dokola|"
                      r"zapominas|zapomnel jsi|po compactu|po kompaktu|proc to nevis|nic nevis|uz (bylo|je) (to )?rozhodnut|nepamatujes|"
                      r"tocime se v kruhu|ignorujes|kolikrat (ti )?(to )?(mam|musim)|musim (to )?(stale|porad|znovu) opakovat|uz jsem (ti )?(to )?(rikal|psal)")


def bezd(t):
    return ''.join(c for c in unicodedata.normalize('NFD', (t or '').lower()) if unicodedata.category(c) != 'Mn')


def lane(sid):
    try:
        return io.open(os.path.join(os.path.expanduser('~'), '.claude', 'runar-lane', sid + '.txt'), encoding='utf-8').read().strip()
    except Exception:
        return '?'


def prompt(d):
    txt = str(d.get('prompt') or '')
    if txt.lstrip().startswith('<') or not STIZNOST.search(bezd(txt)):
        return
    sid = str(d.get('session_id') or 'nosid').replace('/', '_').replace('\\', '_')
    ted = datetime.datetime.now()
    jm = ted.strftime('%Y-%m-%d-%H%M%S') + '-' + sid[:8] + '.json'
    zaz = {'cas': ted.strftime('%Y-%m-%d %H:%M:%S'), 'session': sid, 'lane': lane(sid), 'citace': txt.strip()[:400],
           'co': '', 'kde_bydlelo': '', 'trida': '', 'zabrani': '',
           '_co': 'Založil hook runar-stiznost.py ze zprávy ownera. Vyplň co (co se zapomnělo), kde_bydlelo (soubor/§ nebo „nikde“), '
                  'trida (' + ' | '.join(TRIDY) + ') a zabrani (co to příště zachytí: kontrola, hook, oblast mapy — ne „budu pamatovat“).'}
    os.makedirs(DIR, exist_ok=True)
    io.open(os.path.join(DIR, jm), 'w', encoding='utf-8', newline='\n').write(json.dumps(zaz, ensure_ascii=False, indent=1) + '\n')
    rel = os.path.relpath(os.path.join(DIR, jm), REPO).replace(os.sep, '/')
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'UserPromptSubmit', 'additionalContext': (
        'KNIHA SELHÁNÍ: ownerova zpráva zní jako stížnost, že něco už bylo zapsané nebo uděláno. Založen záznam ' + rel + '. '
        'Než skončíš: zjisti, co se zapomnělo a kde to bydlelo (uz_vime.js, najdi_v_konverzacich.js, git log -S), vyplň co / kde_bydlelo / '
        'trida (' + ' | '.join(TRIDY) + ') / zabrani a commitni ho. Nevyplněný záznam zastaví konec tahu. Je-li to omyl (stížnost to není), '
        'trida = „jiné“ a co = proč.')}}, ensure_ascii=False))


def stop(d):
    if d.get('stop_hook_active'):
        return
    sid = str(d.get('session_id') or 'nosid').replace('/', '_').replace('\\', '_')
    chybi = []
    try:
        for f in sorted(os.listdir(DIR)):
            if not f.endswith('-' + sid[:8] + '.json'):
                continue
            z = json.load(io.open(os.path.join(DIR, f), encoding='utf-8'))
            if z.get('session') != sid:
                continue
            if z.get('trida') not in TRIDY or not str(z.get('co', '')).strip() or not str(z.get('zabrani', '')).strip():
                chybi.append(f)
    except Exception:
        return
    if chybi:
        print(json.dumps({'decision': 'block', 'reason': (
            'Kniha selhání: nevyplněný záznam ' + ', '.join('docs/audit/selhani/' + f for f in chybi) + ' (ownerova stížnost z tohoto tahu). '
            'Vyplň co / kde_bydlelo / trida (' + ' | '.join(TRIDY) + ') / zabrani, commitni ho a pak skonči.')}, ensure_ascii=False))


def main():
    try:
        d = json.load(sys.stdin)
        (stop if (sys.argv[1:] or [''])[0] == 'stop' else prompt)(d)
    except Exception:
        pass


main()
