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
        if not chyba:
            try:   # stopa pro ownera: každý puštěný pokus s počtem a záměrem, ať se dá zkontrolovat bez mé paměti
                with open(os.path.expanduser('~/.claude/runar-api-pokusy.log'), 'a', encoding='utf-8') as f:
                    import datetime
                    f.write(datetime.datetime.now().strftime('%Y-%m-%d %H:%M') + ' | ' + ano.group(1) + ' volání | ' + co + ' | ' + zamer + '\n')
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
