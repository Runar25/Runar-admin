# -*- coding: utf-8 -*-
# ── Verzováno v repu: hooks/claude/runar-context.py (od 2026-10-14, owner „2. ano, udělej to“, DECISIONS 2026-10-14 (2)). V ~/.claude zůstal jen
# ── jednořádkový odkaz, nastavení Claude Code se nezměnilo. Měň TENHLE soubor a commituj ho; data hooku dál bydlí v ~/.claude.
# Vytiskne SessionStart `additionalContext` pro KAZDOU session (tune, tree i dalsi).
#
# PROC EXISTUJE (KUKY 2026-08-16): "po kazdem compactu jsi hloupy". Compact shrne
# konverzaci, ale ne PROJEKT — takze session po compactu navrhuje veci, ktere uz jsou
# datovane rozhodnuti. Konkretni skoda toho dne: navrh slit `DEF_CHAR` a `VOICE_PROFILES`
# zpatky dohromady, ackoli je 2026-08-14 datovane rozhodnuti, ze se maji drzet oddelene
# ("profil je cisty ton a nic vic"). Owner to musel rozsuzovat sam.
#
# SessionStart hook se spousti i po compactu (`source: "compact"`), takze tohle je to
# jedine misto, kde jde ztraceny kontext vratit AUTOMATICKY — bez souboru, ktery se musi
# udrzovat, a bez toho, aby si session musela na neco vzpomenout.
#
# ⭐ VSE SE POCITA ZA BEHU z gitu a z RUNAR_DECISIONS.md. Zadny snapshot => nemuze zastarat
# (presne ta vada, kvuli ktere se 2026-07-18 vyprazdnil `memory/runar-project.md`).
import datetime, io, json, os, subprocess, sys

REPO = r'C:\Users\zkuku\Downloads\Runar-admin'

# Hook JSON ze stdin (session_id, source, transcript_path). tree-guard.sh ho pipuje.
# isatty guard: kdyby nekdo spustil helper rucne bez pipe, at to nezablokuje na cteni.
HOOK = {}
try:
    if not sys.stdin.isatty():
        _raw = sys.stdin.read()
        if _raw.strip():
            HOOK = json.loads(_raw)
except Exception:
    HOOK = {}

PRAVIDLA = (
    'RUNAR - neprekrocitelna pravidla (hook, plati pro KAZDOU session):\n'
    '1) STROM: kazda vetev nese runu a ma vlastni koren; pramen v kmeni maji jen ramena (strana x zona) a vrchol. '
    'Kolik ceho = RUNAR_TREE.md §3 (kod slotAssign) - neopisovat. NIKDY neshlukovat vetve - musi byt rozprostrene.\n'
    '2) PIS PRUBEZNE do SPRAVNEHO DOMOVA (§20): menis-li TREE ENGINE (build_*composer.py, '
    'build_tree_production.py, runar-branch/trunk/tree-prod.js), zapis rozhodnuti do '
    'RUNAR_DECISIONS.md NEBO RUNAR_TREE.md JESTE NEZ skoncis. Hlas/prompty patri do '
    'RUNAR_EVAL_LOG.md, config do sveho mista - NEDUPLIKUJ. Refactor/CSS log nepotrebuje.\n'
    '3) Neres symptom rezanim; nerozbijej co funguje; mer, nehadej. '
    'Na konci session te zkontroluje Stop-hook.'
)


def bezpecne(fn, jinak=None):
    """Hook NESMI spadnout ani zdrzet. Kterykoli kus muze chybet a zbytek se posle dal."""
    try:
        return fn()
    except Exception:
        return jinak


def commity():
    out = subprocess.run(
        ['git', 'log', '-14', '--no-merges', '--date=short', '--format=%ad %s'],
        cwd=REPO, capture_output=True, text=True, encoding='utf-8', timeout=6)
    if out.returncode != 0:
        return None
    radky = [l.strip() for l in out.stdout.splitlines() if l.strip()]
    return radky or None


def rozhodnuti(n=8):
    p = os.path.join(REPO, 'RUNAR_DECISIONS.md')
    nadpisy = []
    with io.open(p, encoding='utf-8') as f:
        for l in f:
            if l.startswith('## '):
                nadpisy.append(l[3:].strip())
    return nadpisy[-n:] or None


def _prepis_cesta():
    """Kde je prepis teto session: nejdriv z hook JSON, pak z compact-backups zalohy."""
    tp = HOOK.get('transcript_path')
    if tp and os.path.isfile(tp):
        return tp
    sid = HOOK.get('session_id')
    if sid:
        zal = os.path.join(os.path.expanduser('~'), '.claude', 'compact-backups',
                           str(sid).replace('/', '_').replace('\\', '_') + '.jsonl')
        if os.path.isfile(zal):
            return zal
    return None


def _je_sum(txt):
    """Preskoc compact-souhrn a systemove/command wrappery — to nejsou slova ownera."""
    z = txt.lstrip()
    return (z.startswith('This session is being continued')
            or z.startswith('Analysis:') or z.startswith('<'))


def konverzace(limit=12, per_cap=500, total_cap=5000):
    """Posledni zpravy OWNERA doslova z prepisu. Compact prave tohle ztrati a model pak
    dela veci mimo to, co mu owner rekl. Je to VYTAZEK (kopie), ne domysleni."""
    if (HOOK.get('source') or '') not in ('compact', 'resume'):
        return None
    cesta = _prepis_cesta()
    if not cesta:
        return None
    zpravy = []
    with io.open(cesta, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except Exception:
                continue
            if rec.get('type') != 'user':
                continue
            if rec.get('isSidechain') or rec.get('isMeta') or rec.get('isCompactSummary'):
                continue
            msg = rec.get('message') or {}
            if msg.get('role') != 'user':
                continue
            content = msg.get('content')
            if isinstance(content, str):
                txt = content
            elif isinstance(content, list):
                kusy, tool = [], False
                for it in content:
                    if not isinstance(it, dict):
                        continue
                    if it.get('type') == 'text':
                        kusy.append(it.get('text') or '')
                    elif it.get('type') == 'tool_result':
                        tool = True
                if tool and not any(k.strip() for k in kusy):
                    continue  # cisty tool_result, ne owner
                txt = '\n'.join(kusy)
            else:
                continue
            txt = (txt or '').strip()
            if not txt or _je_sum(txt):
                continue
            zpravy.append(txt)
    if not zpravy:
        return None
    zpravy = zpravy[-limit:]
    vybrane, delka = [], 0
    for z in reversed(zpravy):  # od nejnovejsi (ta je nejdulezitejsi)
        zz = z if len(z) <= per_cap else z[:per_cap] + ' …(zkraceno)'
        if vybrane and delka + len(zz) > total_cap:
            break
        vybrane.append(zz)
        delka += len(zz)
    vybrane.reverse()  # chronologicky pro cteni
    hlavicka = (
        '⚠️ PRAVE PROBEHL COMPACT — prisel jsi o pamet konverzace. TOHLE TI OWNER REKL '
        'PRED NIM (doslova, chronologicky). Ber to jako AKTUALNI INSTRUKCE, ne pozadi. '
        'Nez zacnes cokoli delat, srovnej se s tim; kdyz nevis, co jsi rozdelal, precti '
        'cely prepis: ' + cesta)
    telo = '\n\n'.join('  • ' + z.replace('\n', '\n    ') for z in vybrane)
    return hlavicka + '\n\n' + telo


# ⭐ DNESNI DATUM JAKO PRVNI VEC. 2026-08-17 jsem napsal 19 zaznamu s datem o den zpet,
# protoze jsem ho OPSAL z tohohle kontextu — ten po compactu nese VCEREJSI snapshot a jeho
# hlavicku jsem vzal za dnesek. Datum se tedy rekne nahlas a zvlast; hlida to smoke ㉗.
def _radek(cesta, vzor):
    import re
    try:
        t = io.open(os.path.join(REPO, cesta), encoding='utf-8').read()
    except Exception:
        return None
    m = re.search(vzor, t)
    return m.group(1) if m else None


def tvrda_fakta():
    # Cte se ZE ZDROJE, neopisuje (§20). Kdyz zdroj zmizi, radka proste nebude.
    verze = _radek('v2/runar-config.js', r"RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'")
    sw = _radek('v2/sw.js', r'(v\d+)')
    hlava = 'TVRDA FAKTA (nedovozuj si je, tady jsou):'
    radky = []
    if verze:
        radky.append('  prompt: ' + verze + '   (menis prompt? bumpni to, jinak ㉜ odmitne zapsat registr)')
    if sw:
        radky.append('  SW: ' + sw)
    # Rozcestnik se BERE z MEMORY.md, aby existoval jen jednou.
    try:
        mem = io.open(os.path.join(REPO, 'memory', 'MEMORY.md'), encoding='utf-8').read()
        i = mem.index('## Rozcestnik') if '## Rozcestnik' in mem else mem.index('## Rozcest')
        j = mem.index(chr(10) + '## ', i + 3)
        tabulka = [r for r in mem[i:j].split(chr(10)) if r.startswith('|')]
        if len(tabulka) > 2:
            radky.append('  ROZCESTNIK (kde co bydli) — vlastnik memory/MEMORY.md:')
            for r in tabulka[2:]:
                radky.append('    ' + r.strip())
    except Exception:
        pass
    radky.append('  Co je o PACE zmereno: rejstrik pak v RUNAR_EVAL_LOG.md — cti ho DRIV,')
    radky.append('  nez o pace neco tvrdis. 21. 8. jsem to dvakrat neudelal a dvakrat')
    radky.append('  tvrdil neco, co vlastni drivejsi mereni vyvracelo.')
    return hlava + chr(10) + chr(10).join(radky) if radky else None


casti = ['DNES JE ' + datetime.date.today().isoformat()
         + '. Datovany zaznam, ktery dnes vznikne (RUNAR_DECISIONS.md, novy snapshot), musi'
         + ' nest TOHLE datum — ne datum ze snapshotu nize, ten je z vcerejska.', PRAVIDLA]

tf = bezpecne(tvrda_fakta)
if tf:
    casti.append(tf)

# Nejsalientnejsi nahoru: co ti owner rekl pred compactem (jen po compactu/resume).
k = bezpecne(konverzace)
if k:
    casti.insert(0, k)

c = bezpecne(commity)
if c:
    casti.append(
        'CO SE V REPU STALO NAPOSLED (git log = akcni log, viz CLAUDE.md; prefix = lane):\n  '
        + '\n  '.join(c))

r = bezpecne(rozhodnuti)
if r:
    casti.append(
        'POSLEDNI DATOVANA ROZHODNUTI (RUNAR_DECISIONS.md - pri sporu vyhrava novejsi):\n  - '
        + '\n  - '.join(r))

casti.append(
    '⭐ NEZ NAVRHNES ZMENU ARCHITEKTURY, PROMPTU NEBO HLASU: dohledej, jestli uz to neni '
    'rozhodnute - `grep -n "<termin>" RUNAR_DECISIONS.md`. Rozhodnutou a datovanou vec '
    'ownerovi neprednasej znovu jako novy napad; kdyz s ni nesouhlasis, odkaz se na ni '
    'a navrhni ZMENU rozhodnuti (§21: rozhodnuti = smer, ne zamek).')

# Do 2026-10-11 tu stala mapa „SAHAS NA TUHLE PLOCHU? PRECTI NAPRED TENHLE DOC“ — tiskla se jen na startu, nic nevynutila
# a mela opsane kusy pravidel a cisla radku, ktere zastaraly (mrtvy is-grammar-qa, BACKLOG ~r. 251-263). Ted pravidla ukazuje
# hook pri dotyku (scripts/utils/pravidla_pri_dotyku.py, mapa scripts/utils/pravidla_mapa.json), DECISIONS 2026-10-11 (17).
casti.append(
    'PRAVIDLA K PLOCHAM: ukaze je hook pri prvnim doteku souboru (zastavi jednou a vypise aktualni zneni; po compactu znovu).\n'
    '  Ktera pravidla patri ke kteremu souboru = scripts/utils/pravidla_mapa.json (jedine misto). Zapis do CLAUDE.md, memory/\n'
    '  a RUNAR_*.md projde az po `node scripts/utils/uz_vime.js <pojmy>`.')
casti.append(
    'ZAPOMNEL JSI, CO OWNER REKL NEBO CO SE DELALO? Konverzace se nemazou a zalohuji (DECISIONS 2026-10-11 (21)):\n'
    '  node scripts/utils/najdi_v_konverzacich.js "<text>" [--kdo owner] [--od RRRR-MM-DD] [--zalohy] — vsechny session CODE i Cowork.\n'
    '  Napred DECISIONS/BACKLOG (uz_vime.js), pak tohle, teprve pak se ptej ownera.')

# Obe pravidla JSOU zapsana (memory/break-your-own-work-before-reporting.md · CLAUDE.md §21),
# a presto obe 2026-08-16 padla. U prvniho to bylo PODRUHE — v tom memory souboru stoji
# "KUKY 2026-08-14: driv jsi rozbijel a prestal jsi to zase delat". Zapsane pravidlo, ktere
# se po compactu necte, je pravidlo, ktere neplati. Proto sem, k tomu, co session VIDI.
# KUKY 2026-08-16: „ty mas nekde ulozene cteni ktera jsi sam generoval… je mi to fakt blby,
# ze tohle musim rikat a ty to nemas nekde, kde si to zjistit." Archiv jsem tyz den POSTAVIL
# a pak na nej zapomnel — je gitignorovany, takze ho nevidi ani `git log`, ani doc.
# PODRUHE 2026-10-07 — KUKY: „vsechna cteni, ktera udelame, musime zalohovat… ty za nejakou dobu stejne budes hledat
# pokus nekde jinde na API, i kdyz ho mas primo pod nosem.“ Vystupy pokusu zase lezely jen ve scratchpadech (%TEMP%)
# a otazku, na kterou jsem navrhl 18 volani, zodpovedela uz ulozena data. Proto: zaloha bezi SAMA (Stop-hook) a hledani
# ve vsech zdrojich je JEDEN prikaz — a ten stoji v tomhle bloku jako prvni.
casti.append(
    'DATA, KTERA UZ MAME — NEZ NECO VYGENERUJES NEBO NAVRHNES POKUS PRES API, PODIVEJ SE:\n'
    '  node scripts/utils/najdi_cteni.js [--model sol] [--runa X] [--text <regex>] [--vypis 5]\n'
    '      JEDNA cesta ke vsemu: produkce (cteni + Asky) · ~/runar-eval/zaloha · ~/runar-eval ·\n'
    '      eval_out · docs/eval. 2026-10-07 tak vysla zadarmo otazka, na kterou jsem chtel 18 volani.\n'
    '  Vystupy pokusu se zalohuji SAMY (Stop-hook → scripts/utils/zaloha_cteni.js → ~/runar-eval/zaloha).\n'
    '  node scripts/utils/archive_batches.js --list   — starsi davky (srpen)\n'
    '      vsechny drive vygenerovane davky (GENEROVANA, jmeno „Anna") i vyexportovana ZIVA\n'
    '      cteni. Pridat davku: `archive_batches.js <soubor.jsonl> <nazev>`.\n'
    '      ⚠️ Archiv je GITIGNOROVANY (eval_out/archive) — zije na jednom disku, git o nem\n'
    '      nevi. Kam patri natrvalo = otevrene rozhodnuti ownera (RUNAR_BACKLOG.md).\n'
    '  ~/runar-eval/*.jsonl  — exporty realnych cteni (osobni udaje, MIMO repo)\n'
    '      `export_readings.js --testers-only` vytahne jen testery.\n'
    '  Hodnoceni cteni: `measure_readings.js` (metoda) · `lint_readings.js` (zakazy na\n'
    '      vystupu) · `is-grammar-qa.py` (IS, E001 = prepsat). „Pusobi to presne?" NENI\n'
    '      metrika — Barnum zaruci vysoke skore bez ohledu na kvalitu (RUNAR_DESIGN.md).')

casti.append(
    'JAK SAHNOUT NA CIZI VEC (poradi, ne nova pravidla — working-style.md):\n'
    '  1) co to je a PROC to tam je · kdo to cte · co se rozbije bez toho\n'
    '  2) existuje uz reseni nebo zaznam? DOHLEDEJ (grep RUNAR_DECISIONS.md, tools.js,\n'
    '     archive_batches.js --list) — nenavrhuj, dokud jsi nehledal\n'
    '  3) zaznam je a stav mu neodpovida? selhal ZAPIS, nebo NASLEDNA OPRAVA? ruzne vady\n'
    '  4) nez navrhnes nastroj: resi MUJ problem, nebo jiny, ktery se mi lip stavi?\n'
    '  5) teprve pak sahni — a hotovy kus rozbij, nez ho ohlasis\n'
    '  Dolozeno na `mood`: zaznam EXISTOVAL i s Affected doc(s); selhala az ta oprava.')

casti.append(
    'DVE VECI, KTERE SE ZAPOMINAJI NEJCASTEJI:\n'
    '  1) HOTOVY KUS ROZBIJ SAM, teprve pak hlas. Ne "hotovo, overeno" — napred na to zautoc\n'
    '     (podstrc vadu, vypni zavislost, pusti to na hranicni vstup) a ukaz, co drzelo a co ne.\n'
    '     Nespoleha se na vyzvu ownera. -> memory/break-your-own-work-before-reporting.md\n'
    '  2) OWNERUV NAPAD = SMER, NE ZADANI (§21). Napred kritika a proveditelnost: kde to drhne,\n'
    '     co je slabe, co uz je rozhodnute jinak. Souhlas bez kritiky ownerovi NEPOMAHA —\n'
    '     vyslovne ji chce slyset. Teprve pak stav.')

# ⭐ ROZDELANA PRACE. Vsechno vyse je USAZENY stav (git, DECISIONS) — tohle je to jedine,
# co po compactu chybelo nejvic: cim jsme se zrovna zabyvali. Owner nemusi napsat nic.
# (KUKY 2026-08-16: "kde to mam porad hledat?" -> nikde.)
#
# ⚠️ OPRAVA 2026-08-17 — JEDEN SLOT PRO TRI SESSION BYLA TICHA ZTRATA.
# Puvodne: `sorted(...)[-1]` = jeden snapshot, vybrany ABECEDNE. Jakmile maji dve session
# snapshot z tehoz dne, rozhodne prvni pismeno ZA datem, ne cas. Doslo k tomu tyz den:
#   2026-08-17-audit-promptu-bloky.md          (CODE-tune, rozdelana prace)
#   2026-08-17-first-static-readings-...md     (druha session)
# 'f' > 'a' -> tune session by po compactu dostala CIZI kontext a svoji praci uz NIKDY,
# at ji zapisuje jakkoli casto. Slot se nedal "vyhrat" prepsanim.
# Ted: vypisou se VSECHNY dnesni snapshoty (max 3), kazdy popsany svym souborem, aby
# session poznala svuj. Neni-li dnes zadny, vypise se posledni existujici (a rekne se to).
MAX_SNAP = 3


def rozdelane():
    d = os.path.join(REPO, 'memory', 'snapshots')
    f = sorted(x for x in os.listdir(d) if x.endswith('.md'))
    if not f:
        return None
    # Neni to "dnesni vs posledni", ale VSECHNY z NEJNOVEJSIHO DNE, ktery v slozce je.
    # Prvni verze brala dnesni, a kdyz zadny nebyl, spadla na `f[-1]` = abecedne posledni —
    # cimz se kolize tri session vratila, jen o den pozdeji (rano, nez nekdo neco zapise).
    dnes = datetime.date.today().isoformat()
    posledni_den = max(x[:10] for x in f)
    vyber = [x for x in f if x.startswith(posledni_den)][-MAX_SNAP:]
    out = []
    for jm in vyber:
        txt = io.open(os.path.join(d, jm), encoding='utf-8').read()
        radky = [l.rstrip() for l in txt.splitlines()[:40]]
        out.append((jm, chr(10).join(radky), posledni_den == dnes))
    return out


# UKOLY OD OSTATNICH SESSION (owner 2026-10-11 „6. ano“): otevrene polozky „Pro CODE-…“ v RUNAR_BACKLOG.md po lanes. Ptal se, jestli mi
# ostatni session nenechaly neco k oprave — to ma rict start session sam. Hotove = ✅, [x] nebo preskrtnute „~~Pro CODE-…~~“; text bydli v BACKLOGu.
def _hotovo_nad(radky, k, hloubka=6):
    # polozka je hotova i tehdy, kdyz v jejim bloku NAD ni stoji radek zacinajici ✅ (tvar CODE-tune: „✅ *(CODE-tune …)*“ + pokracovani).
    # Blok konci prazdnym radkem, nadpisem nebo jinou polozkou seznamu („- …“) — hotova SOUSEDNI polozka „- ✅ …“ se nepocita.
    for j in range(k - 1, max(-1, k - 1 - hloubka), -1):
        t = radky[j].strip()
        if t.startswith('✅'):
            return True
        if not t or t.startswith('#') or t.startswith('- '):
            return False
    return False

def ukoly_pro_session(delka=150):
    import re
    radky = io.open(os.path.join(REPO, 'RUNAR_BACKLOG.md'), encoding='utf-8').read().splitlines()
    vzor, lane = re.compile(r'^\s*(?:-\s*)?(?:\[ \]\s*)?(?:⚪\s*)?(?:\*\*)?\s*Pro (CODE-(?:tune|tree|read|web))'), {}   # adresat na zacatku polozky, ne odkaz v textu
    for i, l in enumerate(radky, 1):
        m = vzor.match(l)
        if not m or '✅' in l or l.lstrip().startswith('- [x]') or _hotovo_nad(radky, i - 1):   # i je od 1, radky od 0
            continue
        if l[:m.start()].count('~~') % 2 == 1:   # „Pro CODE-…“ je preskrtnute = hotove
            continue
        t = ' '.join(l.strip().lstrip('-').split())
        lane.setdefault(m.group(1), []).append('r. ' + str(i) + ': ' + t[:delka] + ('…' if len(t) > delka else ''))
    return lane


u = bezpecne(ukoly_pro_session)
if u:
    txt = ['UKOLY OD OSTATNICH SESSION — otevrene polozky „Pro CODE-…“ v RUNAR_BACKLOG.md. Najdi svou lane a precti je v BACKLOGu cele,'
           ' nez zacnes; hotove oznac ✅ (s commitem), at se nevraci.']
    for ln in sorted(u):
        L = u[ln]
        txt.append(ln + ' (' + str(len(L)) + '):' + ''.join(chr(10) + '  - ' + x for x in L[:5])
                   + ((chr(10) + '  - … a dalsich ' + str(len(L) - 5)) if len(L) > 5 else ''))
    casti.append(chr(10).join(txt))

r = bezpecne(rozdelane)
if r:
    if len(r) > 1:
        kdy = 'DNES' if r[0][2] else 'v posledni pracovni den'
        casti.append('KDE JSME SKONCILI — POZOR, ' + str(len(r)) + ' SESSION MELA ' + kdy
                     + ' ROZDELANOU PRACI. Najdi mezi nimi SVOJI (podle toho, co jsi delal);'
                     ' ostatni patri jine lane a NESAHAT na ne.')
    for jm, telo, je_dnesni in r:
        hlav = 'ROZDELANA PRACE (memory/snapshots/' + jm + ')'
        if not je_dnesni:
            hlav += ' — ⚠️ NENI Z DNESKA, jen posledni existujici; ber jako historii, ne stav'
        casti.append(hlav + ':' + chr(10) + telo)

sys.stdout.write(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': 'SessionStart',
        'additionalContext': '\n\n'.join(casti),
    }
}, ensure_ascii=False))
