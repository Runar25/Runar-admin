# -*- coding: utf-8 -*-
# Hooky Claude Code (hooks/claude/) pod zkouškou: každý dostane známý vstup a musí dát očekávaný výsledek — ne jen „parsuje se“ (§19).
#
# Proč (2026-10-14, CODE-read, owner „pokračuj“ po přesunu hooků do repa, DECISIONS 2026-10-14 (2)): hooky hlídají naši práci (pokusy přes
# API, zprávy ownerovi, kontext po compactu), ale smoke je nepouštělo — kdo by hook při úpravě rozbil (překlep v regexu, výjimka), zjistil by
# to až z toho, že hlídání přestalo hlídat. Hook, který spadne, nic nezastaví: Claude Code chybu hooku jen zaloguje a pustí dál.
# Co hlídá (v kopii, kterou pouští — RUNAR_ROOT, v pre-push tedy pushovaný commit):
#   hlídač API      — příkaz na API modelu bez souhlasu zablokuje, běžný příkaz pustí
#   kontrola zpráv  — blok příkazu ownerovi zastaví (pravidlo 5), SQL a příkaz s důvodem pustí, dvě odrážky na nejvyšší úrovni zastaví
#   kontext         — po startu vrátí kontext s pravidly (neprázdný, s hlavičkou RUNAR)
#   tree-guard      — start i stop doběhnou bez chyby a stop předá zastavení z kontroly zpráv
#   záloha přepisu  — bez přepisu nespadne
# Testovací session nechá v ~/.claude/tree-guard markery — na konci se smažou.
#   python -X utf8 scripts/verify_hooky_claude.py      · --test = kontrola sama sebe (rozbitý hook musí padnout)
import json, os, subprocess, sys, tempfile, glob, shutil

R = (os.environ.get('RUNAR_ROOT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')).replace('\\', '/')
SID = 'verify-hooky-test'
F = '`' * 3


def prepis(text):
    zaz = [{'type': 'user', 'message': {'role': 'user', 'content': 'co jsi udělal?'}},
           {'type': 'assistant', 'message': {'content': [{'type': 'text', 'text': text}]}}]
    t = tempfile.NamedTemporaryFile('w', suffix='.jsonl', delete=False, encoding='utf-8')
    t.write('\n'.join(json.dumps(z, ensure_ascii=False) for z in zaz))
    t.close()
    return t.name


def py(d, jm, vstup, env=None):
    return subprocess.run([sys.executable, '-X', 'utf8', d + '/' + jm], input=json.dumps(vstup, ensure_ascii=False), capture_output=True,
                          text=True, encoding='utf-8', env=env, timeout=60)


def sh(d, arg, vstup):
    env = dict(os.environ, TREE_GUARD_REPO=R)
    return subprocess.run(['bash', d + '/tree-guard.sh', arg], input=json.dumps(vstup, ensure_ascii=False), capture_output=True,
                          text=True, encoding='utf-8', env=env, timeout=60)


def over(d):
    vysl, soubory = [], []
    def ok(jm, podm, info=''):
        vysl.append((jm, bool(podm), info))
    try:
        api = 'curl https://api.openai' + '.com/v1/responses'
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'tool_input': {'command': api}})
        ok('hlídač API zablokuje volání API bez souhlasu', r.returncode == 0 and 'RUNAR_API_ANO' in r.stdout, r.stdout[:120] + r.stderr[-120:])
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'tool_input': {'command': 'ls -la'}})
        ok('hlídač API pustí běžný příkaz', r.returncode == 0 and not r.stdout.strip(), r.stdout[:120] + r.stderr[-120:])

        def zprava(text):
            p = prepis(text); soubory.append(p)
            return py(d, 'runar-zprava-check.py', {'transcript_path': p, 'session_id': SID})
        r = zprava('1. Hotovo.\n' + F + 'bash\nnode scripts/x.js\n' + F + '\n')
        ok('kontrola zpráv zastaví příkaz ownerovi', 'PŘÍKAZY OWNEROVI' in r.stdout, r.stdout[:150] + r.stderr[-150:])
        r = zprava('1. Pusť v Supabase:\n' + F + 'sql\nselect 1;\n' + F + '\n')
        ok('kontrola zpráv pustí SQL', 'PŘÍKAZY OWNEROVI' not in r.stdout and r.returncode == 0, r.stdout[:150] + r.stderr[-150:])
        r = zprava('1. Tohle musíš spustit sám, protože jde o tvůj účet.\n' + F + 'bash\nnode x.js\n' + F + '\n')
        ok('kontrola zpráv pustí příkaz s důvodem', 'PŘÍKAZY OWNEROVI' not in r.stdout and r.returncode == 0, r.stdout[:150])
        dlouha = 'Úvod. ' * 80 + '\n- první odrážka bez čísla\n- druhá odrážka bez čísla\n'
        r = zprava(dlouha)
        ok('kontrola zpráv zastaví odrážky bez čísel', 'ČÍSLOVÁNÍ' in r.stdout, r.stdout[:150] + r.stderr[-150:])

        p = prepis('1. Hotovo.'); soubory.append(p)
        r = py(d, 'runar-context.py', {'session_id': SID, 'transcript_path': p, 'source': 'startup'})
        ok('kontext po startu vrátí pravidla', r.returncode == 0 and len(r.stdout) > 500 and 'RUNAR' in r.stdout, str(len(r.stdout)) + ' zn. ' + r.stderr[-150:])

        r = sh(d, 'start', {'session_id': SID, 'transcript_path': p, 'source': 'startup'})
        ok('tree-guard start doběhne a vrátí kontext', r.returncode == 0 and len(r.stdout) > 500, str(r.returncode) + ' ' + r.stderr[-150:])
        p2 = prepis('1. Hotovo.\n' + F + 'bash\nnode x.js\n' + F + '\n'); soubory.append(p2)
        r = sh(d, 'stop', {'session_id': SID, 'transcript_path': p2, 'stop_hook_active': False})
        ok('tree-guard stop předá zastavení z kontroly zpráv', r.returncode == 0 and 'PŘÍKAZY OWNEROVI' in r.stdout, r.stdout[:150] + r.stderr[-150:])

        r = py(d, 'compact-backup.py', {'transcript_path': 'C:/neexistuje-verify-hooky.jsonl', 'session_id': SID})
        ok('záloha přepisu bez přepisu nespadne', r.returncode == 0, r.stderr[-150:])
    except Exception as e:
        ok('hooky doběhly bez výjimky', False, repr(e)[:200])
    finally:
        for p in soubory:
            try: os.unlink(p)
            except OSError: pass
        for m in glob.glob(os.path.expanduser('~/.claude/tree-guard/' + SID + '*')):
            try: os.remove(m)
            except OSError: pass
    return vysl


if '--test' in sys.argv:
    # rozbitý hook (výjimka hned na začátku) musí kontrolu shodit — jinak by hlídala jen to, že soubory existují
    tmp = tempfile.mkdtemp(prefix='verify-hooky-')
    try:
        for f in glob.glob(R + '/hooks/claude/*'):
            if os.path.isfile(f):
                shutil.copy(f, tmp)
        p = os.path.join(tmp, 'runar-zprava-check.py')
        s = open(p, encoding='utf-8').read()
        open(p, 'w', encoding='utf-8').write(s.replace('def main():', 'def main():\n    raise SystemExit(0)', 1))
        spatne = [j for j, o, _ in over(tmp.replace('\\', '/')) if not o]
        if not any('kontrola zpráv' in j for j in spatne):
            print('FAIL  samotest: kontrola zpráv s vypnutým main() prošla — kontrola nic nehlídá')
            sys.exit(1)
        print('OK    samotest hooků: vypnutá kontrola zpráv padá (' + str(len(spatne)) + ' případů)')
        sys.exit(0)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

vysl = over(R + '/hooks/claude')
for jm, o, info in vysl:
    if not o:
        print('FAIL  ' + jm + (' — ' + info.strip().replace('\n', ' ') if info.strip() else ''))
zle = [v for v in vysl if not v[1]]
if zle:
    print('FAIL  hooky Claude Code: ' + str(len(zle)) + ' z ' + str(len(vysl)) + ' případů nesedí (hooks/claude/)')
    sys.exit(1)
print('OK    hooky Claude Code: ' + str(len(vysl)) + ' případů — hlídač API, kontrola zpráv, kontext, tree-guard, záloha dělají, co mají')
