# -*- coding: utf-8 -*-
# ── Verzováno v repu: hooks/claude/runar-zprava-check.py (od 2026-10-14, owner „2. ano, udělej to“, DECISIONS 2026-10-14 (2)). V ~/.claude zůstal jen
# ── jednořádkový odkaz, nastavení Claude Code se nezměnilo. Měň TENHLE soubor a commituj ho; data hooku dál bydlí v ~/.claude.
# Stop hook (volá ho ~/.claude/tree-guard.sh stop): kontrola ZÁVĚREČNÉ zprávy ownerovi. Dvě pravidla, která do 2026-10-07 visela
# na paměti session a padala „pořád dokola“ — KUKY 2026-10-07: „nikdy nic nechci, aby záviselo na tvé paměti!!“
#
# 1) ČÍSLOVÁNÍ: „všechny tvoje podněty jsou psány jako holý text bez označení. 1, 2… takže reaguju holým textem… tohle je pořád dokola!“
#    Zpráva nesmí mít odrážky na nejvyšší úrovni (odrážky jen UVNITŘ očíslovaného bodu) ani otázku ownerovi bez čísla.
# 2) NÁVRH BEZ DOHLEDÁNÍ: „teď mi hlásíš spoustu starých věcí… jak to, že nevíš, co jsme už dělali?“ — 2026-10-07 jsem znovu navrhl
#    „podobu oblasti jen jednou“, kterou owner 3. 10. zamítl (RUNAR_DECISIONS 2026-10-03 (4)). Zpráva s návrhem nebo otázkou na
#    rozhodnutí projde, jen když v témže tahu (od poslední ownerovy zprávy) běžel `node scripts/utils/uz_vime.js <pojmy>`.
# 3) HLÁŠENÍ BEZ ZÁPISU (2026-10-07): „prostě si piš po načtení reportů, co jsme udělali, protože já se pak nechci zabývat tím, že vytáhneš
#    něco 14 dní starého.“ Session, která hlášení načetla (`nacti_cteni.js`), tah neukončí, dokud každé nemá zápis (--hotovo / --backlog);
#    seznam vede nacti_cteni.js v ~/.claude/runar-hlaseni-k-zapisu.json. Jiné session tím blokované nejsou.
# 4) NEOVĚŘENÉ TVRZENÍ (2026-10-11): „kritika musí být vyřešena. proto se necháváš kontrolovat, aby se ti nestávalo.“ Týž den dvakrát
#    tvrzení o kódu/souboru bez ověření: „nejspíš vektorová předloha“ (favicon.svg byl obal kolem PNG — CODE-tune změřil) a „server z
#    tree_state skládá prompt“ (stálo za vypnutým přepínačem). Věta se slovem nejspíš/pravděpodobně/zřejmě, která mluví o kódu nebo
#    souboru, projde jen s „neověřeno“/„nevím“; citace v „…“ se nepočítají. Sebejisté nepravdivé tvrzení stroj nechytí — to zůstává na
#    ověření (otevřít soubor, najít volajícího, zkontrolovat přepínač).
#
# 5) PŘÍKAZY OWNEROVI (2026-10-13): „proč mi posíláš ty funkce, co já s tím?“ — ownerovi jsem ke kontrole poslal `node …` a `git log | grep`
#    (spadly mu: jiná složka, PowerShell bez grep). Pravidlo stálo v paměti od 2026-08-18 (working-style „Ownerovi se neposílají příkazy“)
#    a padlo potřetí. Blok kódu s příkazem node/git/python/npm/npx ve zprávě projde, jen když zpráva říká, proč ho owner musí spustit
#    SÁM („musíš spustit sám“, „spusť to ty“). Bloky ```sql (SQL v Supabase smí jen owner) se nepočítají.
# 6) SCHOVANÁ OTÁZKA (2026-10-14): „pokud máš na mě dvě otázky, tak to napiš jako otázky. pokud je to nějak schované v textu, tak to
#    můžu přehlédnout.“ Ve zprávě stálo „tvé odpovědi čekají i dvě otázky k islandštině…“ — bez jediné položené otázky; pravidlo 1 chytá
#    jen otazník bez čísla. Zpráva, která říká, že na ownera čeká otázka, odpověď nebo rozhodnutí, projde, jen když aspoň jednu otázku
#    POLOŽÍ: řádek s číslem (nebo odsazený pod číslem) a otazníkem. Citace v „…“ se nepočítají. I v krátké odpovědi.
# Zastaví jen jednou za sebou (stop_hook_active) — přepsaná zpráva už projde. Chyba čtení = nic neblokuje.
import json, os, re, sys

def text_bloku(c):
    if isinstance(c, str):
        return c
    if isinstance(c, list):
        return '\n'.join(x.get('text', '') for x in c if isinstance(x, dict) and x.get('type') == 'text')
    return ''

def je_ownerova(rec):
    if rec.get('type') != 'user' or rec.get('isMeta') or rec.get('isCompactSummary'):
        return False
    c = (rec.get('message') or {}).get('content')
    if isinstance(c, list) and any(isinstance(x, dict) and x.get('type') == 'tool_result' for x in c):
        return False
    t = text_bloku(c).strip()
    if not t:
        return False
    return not re.match(r'^(<task-notification>|\[SYSTEM|<system-reminder>|This session is being continued|<command-|Caveat:)', t)

def main():
    try:
        d = json.load(sys.stdin)
    except Exception:
        return
    if d.get('stop_hook_active'):
        return
    tp = d.get('transcript_path') or ''
    try:
        with open(tp, encoding='utf-8', errors='replace') as f:
            zaznamy = [json.loads(l) for l in f if l.strip()]
    except Exception:
        return
    # od poslední ownerovy zprávy
    start = 0
    for i, r in enumerate(zaznamy):
        if je_ownerova(r):
            start = i
    tah = zaznamy[start + 1:]
    # závěrečná zpráva = text asistenta po posledním volání nástroje
    posledni_nastroj = -1
    for i, r in enumerate(tah):
        c = (r.get('message') or {}).get('content')
        if r.get('type') == 'assistant' and isinstance(c, list) and any(isinstance(x, dict) and x.get('type') == 'tool_use' for x in c):
            posledni_nastroj = i
    zprava = '\n'.join(text_bloku((r.get('message') or {}).get('content')) for r in tah[posledni_nastroj + 1:] if r.get('type') == 'assistant').strip()
    vady = []
    # 3) hlášení načtená v TÉHLE session bez zápisu — platí bez ohledu na délku zprávy
    try:
        with open(os.path.expanduser('~/.claude/runar-hlaseni-k-zapisu.json'), encoding='utf-8') as f:
            k_zapisu = json.load(f) or {}
    except Exception:
        k_zapisu = {}
    # 2026-10-10 (upozornil CODE-read): soubor je sdílený pro všechny session. Záznam od 2026-10-10 nese `session` (CLAUDE_CODE_SESSION_ID
    # z nacti_cteni.js = session_id tady) → zastaví se JEN session, která hlášení načetla. Záznam bez `session` (starší) jde dál po
    # staru, ale „načetla“ = opravdu SPUSTILA `node …nacti_cteni.js`, ne jakýkoli příkaz s tím jménem (grep/sed nad souborem zastavil
    # i session, která hlášení nikdy nenačetla).
    sid = d.get('session_id') or ''
    cizi = {k: v for k, v in k_zapisu.items() if v.get('session') and v.get('session') != sid}
    for k in cizi:
        k_zapisu.pop(k, None)
    if k_zapisu:
        import datetime
        def cas(t):
            try:
                return datetime.datetime.fromisoformat(str(t).replace('Z', '')[:19])
            except Exception:
                return None
        nacetla = any(v.get('session') == sid for v in k_zapisu.values())
        bez_session = [v for v in k_zapisu.values() if not v.get('session')]
        casy = [cas(v.get('nacteno')) for v in bez_session]
        nejstarsi = min([c for c in casy if c] or [None]) if any(casy) else None
        spusteni = re.compile(r'(^|[\s;&|(])node\s+(\S*[\\/])?nacti_cteni\.js(\s|$)')
        for r in (zaznamy if bez_session and not nacetla else []):
            c = (r.get('message') or {}).get('content')
            if r.get('type') == 'assistant' and isinstance(c, list):
                for x in c:
                    if isinstance(x, dict) and x.get('type') == 'tool_use':
                        cmd = str((x.get('input') or {}).get('command') or '')
                        if spusteni.search(cmd) and '--hotovo' not in cmd and '--backlog' not in cmd:
                            t = cas(r.get('timestamp'))
                            # bez časů (staré přepisy, testy) se počítá každé načtení; jinak jen to, ze kterého seznam vznikl
                            if nejstarsi is None or t is None or t >= nejstarsi - datetime.timedelta(minutes=5):
                                nacetla = True
        if nacetla:
            vady.append('HLÁŠENÍ BEZ ZÁPISU: ' + str(len(k_zapisu)) + ' načtených hlášení nemá zapsáno, co se s nimi stalo ('
                        + ', '.join(k[:8] + ' „' + str(v.get('zprava', ''))[:40] + '“' for k, v in list(k_zapisu.items())[:4])
                        + '). Ke každému: node scripts/nacti_cteni.js --hotovo <id8> "<co se udělalo>", nebo --backlog <id8> "<položka>" '
                        '(i „čeká na ownera: …“). Owner se ke starým hlášením nechce vracet (CLAUDE.md §29).')
    # 4) NEOVĚŘENÉ TVRZENÍ — i v krátké odpovědi, proto před hranicí 400 znaků (2026-10-11).
    bez_citaci = re.sub(r'„[^“]*“|"[^"\n]*"', ' ', re.sub(r'```.*?```', '', zprava, flags=re.S))
    for veta in re.split(r'(?<=[.!?])\s+|\n', bez_citaci):
        if re.search(r'\b(nejspíš|pravděpodobně|zřejmě)\b', veta, re.I) \
           and re.search(r'\.(js|py|md|svg|html|ts|json|css)\b|\b(soubor|kód|funkc|server|skript|hook|tabulk|sloup|přepínač)', veta, re.I) \
           and not re.search(r'neověř|nevím', veta, re.I):
            vady.append('NEOVĚŘENÉ TVRZENÍ: „' + veta.strip()[:90] + '“ — tvrzení o kódu/souboru s „nejspíš/pravděpodobně“. Ověř (otevři soubor, '
                        'najdi volajícího, zkontroluj přepínač), nebo napiš výslovně „neověřeno“ (CLAUDE.md §24).')
            break
    # 5) PŘÍKAZY OWNEROVI — i v krátké odpovědi (2026-10-13)
    for blok in re.findall(r'```([a-zA-Z]*)\n(.*?)```', zprava, flags=re.S):
        if blok[0].lower() == 'sql':
            continue
        if re.search(r'^\s*(node|git|python3?|py|npm|npx|deno|supabase)\b', blok[1], re.M) \
           and not re.search(r'(musíš|musí[šs]?)\s[^.\n]{0,40}(spustit|pustit)\s+sám|spusť (to|ho) ty|pusť (to|ho) ty', zprava, re.I):
            vady.append('PŘÍKAZY OWNEROVI: zpráva mu dává ke spuštění „' + blok[1].strip().split(chr(10))[0][:60] + '“. Owner příkazy nespouští — '
                        'pusť to sám a ukaž výsledek nebo soubor:řádek (memory neposilej-ownerovi-prikazy / working-style). Musí-li to opravdu '
                        'spustit on, napiš proč („musíš spustit sám, protože …“).')
            break
    # 6) SCHOVANÁ OTÁZKA — i v krátké odpovědi (2026-10-14)
    bez_cit6 = re.sub(r'„[^“]*“|"[^"\n]*"', ' ', re.sub(r'```.*?```', '', zprava, flags=re.S))
    # Jen obraty mířené na ownera: „odpověď“ a „čeká“ samy znamenají i odpověď API a čekání kódu (2 plané poplachy ze 40 zpráv).
    CEKA = re.compile(r'(tvé|tvou|tvoje|tvého)\s+(odpověd\w*|rozhodnutí|ano)\W+(?:\w+\W+){0,6}?(ček\w*|zůstáv\w*|visí)\b'
                      r'|(ček\w*|zůstáv\w*|visí)\W+(?:\w+\W+){0,6}?(tvé|tvou|tvoje|tvého)\s+(odpověd\w*|rozhodnutí|ano)\b'
                      r'|ček\w*\s+na\s+(tebe|tvé|tvou|tvoje|tvůj|ownera)\b'
                      r'|otázk\w*\W+(?:\w+\W+){0,6}?(ček\w*|zůstáv\w*|visí)\b|(ček\w*|visí)\W+(?:\w+\W+){0,6}?otázk\w*', re.I)
    # Otázka se musí položit V TOM BODU, který čekající věc zmiňuje (první verze pustila „5. … čekají i dvě otázky…“, protože bod 4
    # nesl jinou otázku — přesně to owner přehlédl). Úvod a nadpisy nad body: stačí otázka kdekoli v číslovaném bodu.
    body = re.split(r'\n(?=\d+[.)]\s)', '\n' + bez_cit6)
    polozena = any('?' in l and re.match(r'^\s*(\d+[.)]\s|\s+([-*•]|\d+[.)])\s)', l) for l in bez_cit6.split('\n'))
    for bod in body:
        ceka = CEKA.search(bod)
        if ceka and ('?' not in bod if re.match(r'\d+[.)]\s', bod) else not polozena):
            vady.append('SCHOVANÁ OTÁZKA: „' + ceka.group(0)[:60] + '“ — zpráva říká, že na ownera něco čeká, ale v tom bodu otázku nepoloží. '
                        'Polož každou zvlášť: „N. <otázka>?“ s vlastním číslem (owner 2026-10-14: „schované v textu můžu přehlédnout“).')
            break
    if len(zprava) < 400:
        if vady:
            print(json.dumps({'decision': 'block', 'reason': 'Než skončíš — ' + ' · '.join(vady)}, ensure_ascii=False))
        return
    bez_kodu = re.sub(r'```.*?```', '', zprava, flags=re.S)
    radky = bez_kodu.split('\n')
    odrazky = [l for l in radky if re.match(r'^[-*•]\s+\S', l)]
    if len(odrazky) >= 2:
        vady.append('ČÍSLOVÁNÍ: ' + str(len(odrazky)) + ' odrážek na nejvyšší úrovni (např. „' + odrazky[0][:60] + '“). Každý bod hlášení má '
                    'číslo 1, 2, 3… průběžně přes celou zprávu; odrážky jen odsazené uvnitř bodu (memory full-path-and-numbered-lists).')
    otazky = [l for l in radky if l.strip().endswith('?') and not re.match(r'^\s*(\d+[.)]|[-*•>]|\*?„|")', l) and not l.startswith(' ')]
    if otazky and len(zprava) >= 700:
        vady.append('ČÍSLOVÁNÍ: otázka ownerovi bez čísla („' + otazky[0].strip()[:70] + '“). Otázky a návrhy mají vlastní čísla.')
    if re.search(r'\bnávrh|\bnavrhuj|\bnavrhnu|\bMám\b[^\n?]{0,140}\?', bez_kodu, re.I):
        prikazy = []
        for r in tah:
            c = (r.get('message') or {}).get('content')
            if r.get('type') == 'assistant' and isinstance(c, list):
                for x in c:
                    if isinstance(x, dict) and x.get('type') == 'tool_use':
                        prikazy.append(json.dumps(x.get('input', {}), ensure_ascii=False))
        if not any('uz_vime.js' in p for p in prikazy):
            vady.append('NÁVRH BEZ DOHLEDÁNÍ: zpráva ownerovi něco navrhuje nebo se ptá na rozhodnutí, ale v tomhle tahu neběžel '
                        '`node scripts/utils/uz_vime.js <pojmy>`. Dohledej, jestli to už není hotové, zamítnuté nebo zapsané '
                        '(RUNAR_DECISIONS, RUNAR_BACKLOG, EVAL_LOG, hlášení v DB) — hotové a zamítnuté znovu nenavrhuj, zapsané jen připomeň s odkazem.')
    if vady:
        print(json.dumps({'decision': 'block', 'reason': 'Zprávu ownerovi přepiš, než skončíš — ' + ' · '.join(vady)}, ensure_ascii=False))

main()
