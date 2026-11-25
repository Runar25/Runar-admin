# -*- coding: utf-8 -*-
# ── Verzováno v repu: hooks/claude/runar-api-guard.py (od 2026-10-14, owner „2. ano, udělej to“, DECISIONS 2026-10-14 (2)). V ~/.claude zůstal jen
# ── jednořádkový odkaz, nastavení Claude Code se nezměnilo. Měň TENHLE soubor a commituj ho; data hooku dál bydlí v ~/.claude.
# PreToolUse hook (Bash | PowerShell): pokus přes API modelu se nespustí bez dvou kroků, které do 2026-10-07 visely jen na paměti.
#
# KUKY 2026-10-07: „nikdy nic nechci, aby záviselo na tvé paměti… cokoliv se týče hledání něčeho ve čteních, tak jako první max koukat
# do čtení, která jsi udělal a která jsem já udělal. Pokud tam není nebo vzorek je příliš malý, tak mi řekneš a vymyslíme to.“
# Doklad: 2026-10-06 jsem bez ptaní pustil 480 volání (owner zastavil); 2026-10-07 jsem navrhl 18 volání na otázku, kterou už
# zodpověděla uložená čtení. Pravidlo v paměti to nezastavilo ani jednou — proto hook, který běží sám.
#
# Co dělá: když příkaz volá API modelu (adresa api.openai.com / api.anthropic.com, nebo pouští skript, který ji obsahuje nebo čte
# klíč ~/.claude/runar-*-key.txt), zablokuje ho, dokud příkaz nenese RUNAR_API_ANO=<počet volání>. To se píše AŽ po dvou krocích:
#   1) data, která už máme: node scripts/utils/najdi_cteni.js … (produkce + záloha pokusů + laby),
#   2) ownerovo výslovné ano k tomu pokusu a jeho velikosti (do ~50 volání smí CODE sám jen s ohlášeným počtem a cenou).
# Neblokuje nic jiného. Při chybě hooku (nečitelný vstup) pustí příkaz — hook nesmí zastavit práci, která s API nesouvisí.
import json, os, re, sys

API = re.compile(r'api\.openai\.com|api\.anthropic\.com|runar-openai-key|runar-api-key')

def precti(cesta):
    try:
        with open(cesta, encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception:
        return ''

def skripty(prikaz, cwd):
    """Cesty ke skriptům, které příkaz spouští (node/python), absolutně."""
    out = []
    for m in re.finditer(r'(?:node|python3?|py)(?:\s+-X\s+\S+)?(?:\s+--?\S+)*\s+["\']?([^\s"\';|&]+\.(?:js|py|mjs|cjs))', prikaz):
        p = m.group(1).replace('\\', '/')
        if not re.match(r'^[A-Za-z]:/|^/', p):
            p = os.path.join(cwd or '.', p)
        out.append(os.path.normpath(p))
    # node -e "require('…/x.js')" a bash/sh wrapper — obchvat nalezený vlastním útokem na guard 2026-10-07
    for m in re.finditer(r'require\(\s*["\']([^"\']+\.(?:js|cjs|mjs))["\']|\b(?:bash|sh)\s+["\']?([^\s"\';|&]+\.sh)', prikaz):
        p = (m.group(1) or m.group(2)).replace('\\', '/')
        if not re.match(r'^[A-Za-z]:/|^/', p):
            p = os.path.join(cwd or '.', p)
        out.append(os.path.normpath(p))
    # cd <dir> && node x.js — vezmi i adresář z cd
    m = re.search(r'\bcd\s+["\']?([^"\';&|]+?)["\']?\s*(?:&&|;)', prikaz)
    if m:
        d = m.group(1).strip().replace('/c/', 'C:/', 1) if m.group(1).strip().startswith('/c/') else m.group(1).strip()
        for m2 in re.finditer(r'(?:node|python3?)(?:\s+-X\s+\S+)?\s+["\']?([^\s"\';|&]+\.(?:js|py))', prikaz):
            p = m2.group(1)
            if not re.match(r'^[A-Za-z]:/|^/', p):
                out.append(os.path.normpath(os.path.join(d, p)))
    return out

def rozvin(prikaz):
    """Dosadí jednoduchá přiřazení v témže příkazu (D=…; node "$D/x.js" · $D = '…'; node "$D\\x.js").
    Proč (2026-10-07, pipe-test): CODE-read pouštěl API běhy tvarem D=<adresář>; node "$D/ask_zdroj.js" — guard je PUSTIL,
    protože cestu ke skriptu hledal jen doslova v textu příkazu. Ta díra byla otevřená po celou dobu, co guard existoval."""
    hodnoty = {}
    for m in re.finditer(r'(?:^|[;&|\s])(?:export\s+)?\$?([A-Za-z_]\w*)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s;&|]+))', prikaz):
        hodnoty[m.group(1)] = next(g for g in m.groups()[1:] if g is not None)
    for k in sorted(hodnoty, key=len, reverse=True):
        prikaz = re.sub(r'\$\{?' + k + r'\}?(?!\w)', lambda _m, v=hodnoty[k]: v, prikaz)
    return prikaz

def vola_api(prikaz, cwd, hloubka=0):
    prikaz = rozvin(prikaz)
    if API.search(prikaz) and re.search(r'curl|fetch|https?://', prikaz):
        return 'příkaz volá API přímo'
    for s in skripty(prikaz, cwd):
        t = precti(s)
        if API.search(t):
            return os.path.basename(s)
        if s.endswith('.sh') and hloubka < 2:   # wrapper: jeho obsah je další příkaz
            v = vola_api(t, os.path.dirname(s), hloubka + 1)
            if v:
                return os.path.basename(s) + ' → ' + v
        # o úroveň hlouběji: lokální require/import
        for m in re.finditer(r'require\(\s*["\'](\.{1,2}/[^"\']+)["\']\s*\)', t):
            dep = os.path.normpath(os.path.join(os.path.dirname(s), m.group(1)))
            for kand in (dep, dep + '.js'):
                if API.search(precti(kand)):
                    return os.path.basename(s) + ' → ' + os.path.basename(kand)
    return ''

# Číslo pokusu (KUKY 2026-11-23: „zkouška by měla mít jméno nebo verzi či číslo pro lepší orientaci a s lepší možností zachovat nebo vyřadit“;
# 2026-11-24 „7. ano“ k návrhu „povinné číslo pokusu ve skriptu, který volá sol“). Volání modelu nese RUNAR_POKUS=<Pxx> z rejstříku
# docs/kostra/pokusy.json, nebo RUNAR_POKUS="mimo: <proč>" (volání, které není pokus na čtení — např. kontrola islandštiny).
# Rejstřík nečitelný → pustí (hook nesmí zastavit práci kvůli vlastní chybě), ale zapíše to do logu.
POKUSY = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs', 'kostra', 'pokusy.json'))

def chyba_pokusu(prikaz):
    m = re.search(r'RUNAR_POKUS=(?:"([^"]*)"|\'([^\']*)\'|(\S+))', prikaz)
    if not m:
        return ('Chybí RUNAR_POKUS=<Pxx> — číslo pokusu z docs/kostra/pokusy.json (owner 2026-11-23: „zkouška by měla mít číslo“). '
                'Nový pokus napřed zapiš do rejstříku (nejdřív node scripts/verify_kostra.js --hledej "<slova>" — není už tam?). '
                'Volání, které není pokus na čtení: RUNAR_POKUS="mimo: <proč>".')
    hod = (m.group(1) or m.group(2) or m.group(3) or '').strip()
    if hod.lower().startswith('mimo'):
        return '' if len(hod) >= 15 else 'RUNAR_POKUS="mimo: <proč>" — napiš, proč to není pokus na čtení (aspoň pár slov).'
    try:
        with open(POKUSY, encoding='utf-8') as f:
            znama = {x.get('id') for x in json.load(f).get('pokusy', [])}
    except Exception:
        return ''
    return '' if hod in znama else ('RUNAR_POKUS=' + hod + ' v rejstříku docs/kostra/pokusy.json není — zapiš pokus napřed (číslo, části, hypotéza, stav).')

# ── 2026-11-25 (CODE-read, owner „18. ano … jde to ještě lépe? tak to udělej“; audit docs/audit/2026-11-25-pamet-a-pravidla/) ──
# (a) JEDEN POKUS = JEDEN PŘÍKAZ. 2026-11-24 šly P17, P10 a P20 jedním příkazem (; mezi nimi): hlídač četl jen první RUNAR_API_ANO/POKUS,
#     zapsal „P17 | 5 volání“ a 7 volání P10 a P20 v logu chybí — „kdy a jak“ se pak nedalo dohledat a strop 50 se dal obejít součtem.
# (b) ZÁZNAM BĚHU PÍŠE STROJ: každý puštěný pokus → docs/kostra/behy/<čas>-<pokus>.json (příkaz, skripty s otiskem obsahu, úlohy, lane,
#     HEAD, verze promptu). Owner: „pokud něco uděláme a pak se k tomu vrátíme později, tak nevíš, kdy a jak jsi to dělal“.
# (c) ZDROJE: pokus z rejstříku se zdrojem „neověřeno“ (kostra.json zdroje_stav) neprojde bez RUNAR_ZDROJ_OK="<proč>"; pokus od
#     2026-11-25 bez pole zdroje neprojde (P20 vzal moderní významy z tabulky vedené jako neověřená).
# (d) SLOVA: text skriptů a úloh se porovná s docs/kostra/slova.json (slova se známým účinkem, stav „platí“); shoda → ukáže, co to slovo
#     dělá a kdy pokus naposled běžel, a pustí až s RUNAR_SLOVA_OK="<proč to tady nevadí>" (P17: „holds“ opsáno 3/5 — bylo známo od 10-06).
# (e) LOG jen ze skutečného repa: samotest hooků běží z dočasné kopie bez rejstříku a psal „P999“ mezi skutečné pokusy.
REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
KOSTRA = os.path.join(REPO, 'docs', 'kostra')

def _env(prikaz, jm, minimum=1):
    m = re.search(jm + r'=(?:"([^"]*)"|\'([^\']*)\'|(\S+))', prikaz)
    h = ((m.group(1) or m.group(2) or m.group(3) or '') if m else '').strip()
    return h if len(h) >= minimum else ''

def _json(cesta):
    try:
        with open(cesta, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None

def log_cesta():
    if os.environ.get('RUNAR_API_LOG'):
        return os.environ['RUNAR_API_LOG']
    if os.path.isfile(POKUSY):
        return os.path.expanduser('~/.claude/runar-api-pokusy.log')
    import tempfile
    return os.path.join(tempfile.gettempdir(), 'runar-api-pokusy-test.log')

def ulohy(prikaz, cwd):
    """Malé .json argumenty příkazu (úlohy pokusu) — obsah jde do záznamu běhu a do kontroly slov."""
    out = {}
    for m in re.finditer(r'["\']?([^\s"\';|&]+\.json)["\']?', prikaz):
        c = m.group(1).replace('\\', '/')
        if not re.match(r'^[A-Za-z]:/|^/', c):
            c = os.path.join(cwd or '.', c)
        c = os.path.normpath(c)
        t = precti(c)
        if t and len(t) <= 30000:
            out[c] = t
    return out

def texty_skriptu(prikaz, cwd):
    out = {}
    for sk in skripty(prikaz, cwd):
        t = precti(sk)
        if not t:
            continue
        out[sk] = t
        for m in re.finditer(r'require\(\s*["\'](\.{1,2}/[^"\']+)["\']\s*\)', t):
            dep = os.path.normpath(os.path.join(os.path.dirname(sk), m.group(1)))
            for kand in (dep, dep + '.js'):
                tt = precti(kand)
                if tt:
                    out[kand] = tt
                    break
    return out

def kontrola_zdroju(pokus, prikaz):
    reg = _json(POKUSY) or {}
    x = next((y for y in reg.get('pokusy', []) if y.get('id') == pokus), None)
    if not x:
        return ''
    if (x.get('datum') or '') >= '2026-11-25' and not isinstance(x.get('zdroje'), list):
        return ('Pokus ' + pokus + ' nemá v docs/kostra/pokusy.json pole „zdroje“ — vyjmenuj soubory, ze kterých bere obsah vstupu '
                '(významy, popisy, obrazy; [] = jen produkce). Owner 2026-11-25: P20 vzal moderní významy z neověřené tabulky.')
    stav = {z.get('cesta'): z for z in (_json(os.path.join(KOSTRA, 'kostra.json')) or {}).get('zdroje_stav', [])}
    spatne = [z for z in x.get('zdroje') or [] if (stav.get(z) or {}).get('stav') != 'ověřeno']
    if spatne and not _env(prikaz, 'RUNAR_ZDROJ_OK', 15):
        return ('Pokus ' + pokus + ' bere obsah z neověřeného zdroje: ' + ', '.join(spatne) + ' (stav v docs/kostra/kostra.json „zdroje_stav“). '
                'Napřed zdroj ověř a změň mu stav — nebo, je-li pokus právě o tom zdroji, přidej RUNAR_ZDROJ_OK="<proč to tady smí>".')
    return ''

def predchozi_behy(pokus):
    out = []
    try:
        for f in sorted(os.listdir(os.path.join(KOSTRA, 'behy'))):
            if f.endswith('-' + pokus + '.json'):
                b = _json(os.path.join(KOSTRA, 'behy', f)) or {}
                out.append(str(b.get('cas', f[:19])) + ' · ' + str(b.get('volani', '?')) + ' volání · ' + str(b.get('zamer', ''))[:90])
    except Exception:
        pass
    for b in (_json(os.path.join(KOSTRA, 'behy-zpetne.json')) or {}).get('behy', []):
        if b.get('pokus') == pokus:
            out.append(str(b.get('cas', '?')) + ' · ' + str(b.get('volani', '?')) + ' volání (zpětně) · ' + str(b.get('zamer', ''))[:90])
    return out[-5:]

def kontrola_slov(pokus, prikaz, texty):
    if _env(prikaz, 'RUNAR_SLOVA_OK', 10):
        return ''
    slova = [w for w in (_json(os.path.join(KOSTRA, 'slova.json')) or {}).get('slova', []) if w.get('stav') == 'platí']
    nalezy = []
    for w in slova:
        try:
            rx = re.compile(w['vzor'], re.I)
        except Exception:
            continue
        for cesta, t in texty.items():
            m = rx.search(t)
            if m:
                a = max(0, m.start() - 50)
                ukazka = t[a:m.end() + 50].replace('\n', ' ')
                nalezy.append(w['id'] + ' „' + m.group(0) + '“ v ' + os.path.basename(cesta) + ': …' + ukazka + '…\n    → ' + w['co_dela'] + ' (' + w['model'] + '; ' + w['doklad'] + ')')
                break
    if not nalezy:
        return ''
    pb = predchozi_behy(pokus)
    return ('V textu, který jde modelu (skripty a úlohy pokusu ' + pokus + '), stojí slova se ZNÁMÝM účinkem (docs/kostra/slova.json):\n  '
            + '\n  '.join(nalezy)
            + ('\nPokus ' + pokus + ' už běžel: ' + ' | '.join(pb) if pb else '')
            + '\nJe-li to tvoje NOVÉ znění: přepiš ho (RUNAR_DESIGN.md „Slova, která dáváme modelu“). Je-li to text produkce, kód skladače '
              'nebo slovo, jehož účinek právě měříš: přidej RUNAR_SLOVA_OK="<proč to tady nevadí>" — důvod se zapíše do záznamu běhu.')

def zapis_behu(d, prikaz, pokus, ano, zamer, co, texty, ul):
    import datetime, hashlib, subprocess
    cil = os.environ.get('RUNAR_BEHY_DIR') or (os.path.join(KOSTRA, 'behy') if os.path.isdir(KOSTRA) else '')
    if not cil:
        return
    ted = datetime.datetime.now()
    sid = str(d.get('session_id') or '')
    lane = precti(os.path.join(os.path.expanduser('~'), '.claude', 'runar-lane', sid.replace('/', '_').replace('\\', '_') + '.txt')).strip()
    def rel(c):
        c = c.replace('\\', '/'); r = REPO.replace('\\', '/') + '/'
        return c[len(r):] if c.lower().startswith(r.lower()) else c
    try:
        head = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=REPO, capture_output=True, text=True, timeout=4).stdout.strip()
    except Exception:
        head = ''
    verze = re.search(r"RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'", precti(os.path.join(REPO, 'v2', 'runar-config.js')))
    zaznam = {
        'cas': ted.strftime('%Y-%m-%d %H:%M:%S'), 'pokus': pokus, 'volani': int(ano), 'zamer': zamer, 'co_vola': co,
        'lane': lane or '?', 'session': sid, 'head': head, 'prompt': verze.group(1) if verze else '?',
        'prikaz': prikaz[:4000],
        'skripty': [{'cesta': rel(c), 'sha1': hashlib.sha1(t.encode('utf-8')).hexdigest()[:12]} for c, t in texty.items()],
        'ulohy': {rel(c): t for c, t in ul.items()},
        'slova_ok': _env(prikaz, 'RUNAR_SLOVA_OK'), 'zdroj_ok': _env(prikaz, 'RUNAR_ZDROJ_OK'),
        '_co': 'Zapsal hlídač API (hooks/claude/runar-api-guard.py) při puštění volání. Výsledky leží tam, kam je skript uložil (úlohy / složka pokusu).',
    }
    try:
        os.makedirs(cil, exist_ok=True)
        jm = ted.strftime('%Y-%m-%d-%H%M%S') + '-' + re.sub(r'[^A-Za-z0-9]+', '_', pokus)[:40] + '.json'
        with open(os.path.join(cil, jm), 'w', encoding='utf-8', newline='\n') as f:
            f.write(json.dumps(zaznam, ensure_ascii=False, indent=1) + '\n')
    except Exception:
        pass

def main():
    try:
        d = json.load(sys.stdin)
    except Exception:
        return
    if d.get('tool_name') not in ('Bash', 'PowerShell'):
        return
    prikaz = str((d.get('tool_input') or {}).get('command') or '')
    if not prikaz or '--dry-run' in prikaz:   # nanečisto API nevolá
        return
    co = vola_api(prikaz, d.get('cwd') or '')
    if not co:
        return
    if prikaz.count('RUNAR_API_ANO=') > 1:
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny', 'permissionDecisionReason': (
            'Jeden pokus = jeden příkaz. V příkazu je víc RUNAR_API_ANO — hlídač by zkontroloval a zapsal jen první (2026-11-24: P17, P10 a P20 '
            'jedním příkazem → v logu jen „P17 | 5 volání“, 7 volání chybí). Pusť každý pokus zvlášť.')}}, ensure_ascii=False))
        return
    if 'RUNAR_API_ANO=' in prikaz:
        # KUKY 2026-10-07: „ZÁMĚR, co má z toho měření vyjít… PŘEDPOKLAD! ne jen že si udělám 480 čtení… vždycky se udělá malý vzorek.“
        # Do té doby stačilo napsat RUNAR_API_ANO=<cokoli> a guard pustil i 480 volání bez jediné věty proč.
        ano = re.search(r'RUNAR_API_ANO=["\']?(\d+)', prikaz)
        zamer = re.search(r'RUNAR_API_ZAMER=(?:"([^"]*)"|\'([^\']*)\')', prikaz)
        zamer = (zamer.group(1) or zamer.group(2) or '') if zamer else ''
        chyba = ''
        if not ano:
            chyba = 'RUNAR_API_ANO musí být číslo = počet volání.'
        elif len(zamer) < 40 or not re.search(r'když|kdyz|jinak|-> |→', zamer):
            chyba = ('Chybí RUNAR_API_ZAMER="…" — jedna věta: jakou otázku pokus rozhodne, co čekám a co udělám, když vyjde tak / onak '
                     '(např. RUNAR_API_ZAMER="rozhodne, jestli X mizí bez rámce; když X < P0, navrhnu znění, jinak rámec není příčina").')
        elif int(ano.group(1)) > 50 and 'RUNAR_API_OWNER=' not in prikaz:
            chyba = ('Nad 50 volání jen s ownerovým výslovným ano k TÉHLE velikosti (2026-10-06: 480 bez ptaní). Začni malým vzorkem; '
                     'když owner větší vzorek schválil, přidej RUNAR_API_OWNER="<jeho slova doslova>".')
        else:
            chyba = chyba_pokusu(prikaz)
        pokus = _env(prikaz, 'RUNAR_POKUS') or '?'
        texty, ul = {}, {}
        if not chyba and re.match(r'^P\d+$', pokus):
            chyba = kontrola_zdroju(pokus, prikaz)
            if not chyba:
                texty, ul = texty_skriptu(prikaz, d.get('cwd') or ''), ulohy(prikaz, d.get('cwd') or '')
                chyba = kontrola_slov(pokus, prikaz, dict(list(texty.items()) + list(ul.items())))
        if not chyba:
            zapis_behu(d, prikaz, pokus, ano.group(1), zamer, co, texty or texty_skriptu(prikaz, d.get('cwd') or ''), ul or ulohy(prikaz, d.get('cwd') or ''))
            try:   # stopa pro ownera: každý puštěný pokus s počtem a záměrem, ať se dá zkontrolovat bez mé paměti
                with open(log_cesta(), 'a', encoding='utf-8') as f:
                    import datetime
                    _pk = re.search(r'RUNAR_POKUS=(?:"([^"]*)"|\'([^\']*)\'|(\S+))', prikaz)
                    _pk = (_pk.group(1) or _pk.group(2) or _pk.group(3)) if _pk else '?'
                    f.write(datetime.datetime.now().strftime('%Y-%m-%d %H:%M') + ' | ' + _pk + ' | ' + ano.group(1) + ' volání | ' + co + ' | ' + zamer + '\n')
            except Exception:
                pass
            return
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                                 'permissionDecisionReason': chyba}}, ensure_ascii=False))
        return
    duvod = ('Pokus přes API modelu (' + co + ') je zablokovaný, dokud neproběhnou dva kroky — KUKY 2026-10-07: „jako první koukat '
             'do čtení, která jsi udělal a která jsem já udělal. Pokud tam není nebo vzorek je příliš malý, tak mi řekneš a vymyslíme to.“ '
             '1) Napřed data, která už máme: node scripts/utils/najdi_cteni.js (filtry --model, --runa, --text, --draws). '
             '2) Když odpověď v datech není nebo je vzorek malý: řekni to ownerovi (co v datech je, kolik, proč nestačí) a domluvte se. '
             'Teprve s jeho výslovným ano spusť příkaz s RUNAR_API_ANO=<počet volání> a RUNAR_API_ZAMER="<co pokus rozhodne; když tak → …, '
             'jinak → …>" na začátku. Malý vzorek; nad 50 volání navíc RUNAR_API_OWNER="<ownerova slova>".')
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                             'permissionDecisionReason': duvod}}, ensure_ascii=False))

main()
