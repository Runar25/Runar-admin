# -*- coding: utf-8 -*-
# Hooky Claude Code (hooks/claude/) pod zkouškou: každý dostane známý vstup a musí dát očekávaný výsledek — ne jen „parsuje se“ (§19).
#
# Proč (2026-10-14, CODE-read, owner „pokračuj“ po přesunu hooků do repa, DECISIONS 2026-10-14 (2)): hooky hlídají naši práci (pokusy přes
# API, zprávy ownerovi, kontext po compactu), ale smoke je nepouštělo — kdo by hook při úpravě rozbil (překlep v regexu, výjimka), zjistil by
# to až z toho, že hlídání přestalo hlídat. Hook, který spadne, nic nezastaví: Claude Code chybu hooku jen zaloguje a pustí dál.
# Co hlídá (v kopii, kterou pouští — RUNAR_ROOT, v pre-push tedy pushovaný commit):
#   hlídač API      — příkaz na API modelu bez souhlasu zablokuje, běžný příkaz pustí
#   kontrola zpráv  — blok příkazu ownerovi zastaví (pravidlo 5), SQL a příkaz s důvodem pustí, dvě odrážky na nejvyšší úrovni zastaví
#                     + pravidlo 6 (CODE-tune 2026-10-14): schovanou otázku zastaví, položenou pustí, „otázku runy“ z obsahu čtení pustí
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
        # 2026-11-24 (CODE-read, owner „zkouška by měla mít číslo“ · „7. ano“): souhlas a záměr bez čísla pokusu nestačí; neznámé číslo taky ne
        zamer = 'RUNAR_API_ANO=3 RUNAR_API_ZAMER="rozhodne, jestli protipříklad projde hlídačem; když ano, je díra, jinak drží" '
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'tool_input': {'command': zamer + api}})
        ok('hlídač API chce číslo pokusu (RUNAR_POKUS)', 'RUNAR_POKUS' in r.stdout and 'deny' in r.stdout, r.stdout[:160])
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'tool_input': {'command': 'RUNAR_POKUS=P999 ' + zamer + api}})
        ok('hlídač API odmítne neznámé číslo pokusu', 'P999' in r.stdout and 'deny' in r.stdout, r.stdout[:160])
        # 2026-11-25 (CODE-read, audit paměti): jeden pokus = jeden příkaz · slova se známým účinkem · záznam běhu píše hlídač sám
        tmpd = tempfile.mkdtemp(prefix='verify-guard-')
        genv = dict(os.environ, RUNAR_API_LOG=os.path.join(tmpd, 'log.txt'), RUNAR_BEHY_DIR=os.path.join(tmpd, 'behy'))
        sk = os.path.join(tmpd, 'zkouska.js')
        open(sk, 'w', encoding='utf-8').write("const U = 'https://api.openai" + ".com/v1/responses'; const t = 'End on one line: This holds if the road leads on.';\n")
        zam17 = 'RUNAR_API_ANO=3 RUNAR_POKUS=P17 RUNAR_API_ZAMER="rozhodne, jestli protipříklad projde hlídačem; když ano, je díra, jinak drží" '
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'tool_input': {'command': zam17 + 'node "' + sk.replace(chr(92), '/') + '"; ' + zam17 + api}}, env=genv)
        ok('hlídač API nepustí dva pokusy jedním příkazem', 'deny' in r.stdout and 'Jeden pokus' in r.stdout, r.stdout[:160])
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'tool_input': {'command': zam17 + 'node "' + sk.replace(chr(92), '/') + '"'}}, env=genv)
        ok('hlídač API ukáže slovo se známým účinkem (S01 holds)', 'deny' in r.stdout and 'S01' in r.stdout, r.stdout[:200])
        r = py(d, 'runar-api-guard.py', {'tool_name': 'Bash', 'session_id': SID, 'tool_input': {'command': 'RUNAR_SLOVA_OK="test: slovo měřím" ' + zam17 + 'node "' + sk.replace(chr(92), '/') + '"'}}, env=genv)
        zaz = glob.glob(os.path.join(tmpd, 'behy', '*-P17.json'))
        ok('hlídač API s RUNAR_SLOVA_OK pustí a zapíše záznam běhu', not r.stdout.strip() and len(zaz) == 1
           and json.load(open(zaz[0], encoding='utf-8')).get('slova_ok') == 'test: slovo měřím' if zaz else False, r.stdout[:160] + str(zaz))
        shutil.rmtree(tmpd, ignore_errors=True)

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
        # pravidlo 6 (CODE-tune 2026-10-14): otázka zmíněná, ale nepoložená — přesně tahle věta owner přehlédl
        r = zprava('1. Hotovo.\n2. Ještě otevřené: tvé odpovědi čekají i dvě otázky k islandštině z dřívějška.')
        ok('kontrola zpráv zastaví schovanou otázku', 'SCHOVANÁ OTÁZKA' in r.stdout, r.stdout[:150] + r.stderr[-150:])
        r = zprava('1. Hotovo.\n2. Na tebe čekají dvě otázky:\n   1. Mám postavit krok s Greynirem?\n   2. Mám pustit test?')
        ok('kontrola zpráv pustí položenou otázku', 'SCHOVANÁ OTÁZKA' not in r.stdout, r.stdout[:150])
        r = zprava('4. Otázka: mám to zapsat jako pravidlo?\n5. Ještě otevřené: tvé odpovědi čekají i dvě otázky k islandštině.')
        ok('kontrola zpráv zastaví schovanou otázku i vedle jiné položené', 'SCHOVANÁ OTÁZKA' in r.stdout, r.stdout[:150])
        r = zprava('1. Otázka runy z Kolekce opsaná ve 2 ze 4 čtení, vstup se vrací v poslední větě.')
        ok('kontrola zpráv pustí „otázku runy“ z obsahu čtení', 'SCHOVANÁ OTÁZKA' not in r.stdout, r.stdout[:150])

        p = prepis('1. Hotovo.'); soubory.append(p)
        r = py(d, 'runar-context.py', {'session_id': SID, 'transcript_path': p, 'source': 'startup'})
        ok('kontext po startu vrátí pravidla', r.returncode == 0 and len(r.stdout) > 500 and 'RUNAR' in r.stdout, str(len(r.stdout)) + ' zn. ' + r.stderr[-150:])

        # 2026-11-25 (CODE-read, audit docs/audit/2026-11-25-pamet-a-pravidla/): karta po compactu se musí vejít pod strop Claude Code
        # (10 000 znaků, jinak jen náhled 2 000 a soubor, který nikdo nečte), poznat lane z přepisu a nenést cizí snapshoty stromu.
        dlouhe = [{'type': 'user', 'message': {'role': 'user', 'content': ('%d. ano, ' % i) + 'slovo ' * 900}} for i in range(14)]
        dlouhe += [{'type': 'assistant', 'message': {'content': [{'type': 'tool_use', 'name': 'Bash', 'input': {
                    'command': "git -c user.name='CODE-read' commit -F m.txt -- x"}}]}},
                   {'type': 'assistant', 'message': {'content': [{'type': 'text', 'text': 'Výsledek. ' * 40 + '\n\n18. Mám to udělat takhle?'}]}}]
        t = tempfile.NamedTemporaryFile('w', suffix='.jsonl', delete=False, encoding='utf-8')
        t.write('\n'.join(json.dumps(z, ensure_ascii=False) for z in dlouhe)); t.close(); soubory.append(t.name)
        r = py(d, 'runar-context.py', {'session_id': SID, 'transcript_path': t.name, 'source': 'compact'})
        try:
            karta = json.loads(r.stdout)['hookSpecificOutput']['additionalContext']
        except Exception:
            karta = ''
        ok('karta po compactu se vejde pod strop 10 000 znaků', 0 < len(karta) <= 9000, str(len(karta)) + ' zn. ' + r.stderr[-150:])
        ok('karta po compactu pozná lane z přepisu', 'MOJE LANE: CODE-read' in karta, karta[:120])
        ok('karta po compactu nese otevřenou otázku ownerovi', '18. Mám to udělat takhle?' in karta, karta[-200:])
        ok('karta nenese nedatované snapshoty stromu', 'runar-tree-' not in karta and 'ROZDELANA PRACE (memory/snapshots' not in karta, '')
        for m in glob.glob(os.path.expanduser('~/.claude/runar-lane/' + SID + '*')):
            try: os.remove(m)
            except OSError: pass
        r = py(d, 'compact-backup.py', {'transcript_path': 'C:/neexistuje-verify-hooky.jsonl', 'session_id': SID})
        ok('před compactem dostane shrnutí pokyn zachovat lane a otevřené otázky', 'lane' in r.stdout and 'Otazky' in r.stdout, r.stdout[:120])

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
        # karta bez stropů (stará vada: 16–23 tis. znaků) musí shodit případ „pod strop“ — jinak hlídá jen to, že karta existuje
        p = os.path.join(tmp, 'runar-context.py')
        s = open(p, encoding='utf-8').read()
        open(p, 'w', encoding='utf-8').write(s.replace('strop=3200, per=900', 'strop=10 ** 9, per=10 ** 9', 1).replace('STROP = 8500', 'STROP = 10 ** 9', 1))
        spatne = [j for j, o, _ in over(tmp.replace('\\', '/')) if not o]
        if not any('kontrola zpráv' in j for j in spatne):
            print('FAIL  samotest: kontrola zpráv s vypnutým main() prošla — kontrola nic nehlídá')
            sys.exit(1)
        if not any('pod strop' in j for j in spatne):
            print('FAIL  samotest: karta bez stropů prošla případem „pod strop“ — kontrola délku nehlídá')
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
