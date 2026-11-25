# -*- coding: utf-8 -*-
# ── Verzováno v repu: hooks/claude/compact-backup.py (od 2026-10-14, owner „2. ano, udělej to“, DECISIONS 2026-10-14 (2)). V ~/.claude zůstal jen
# ── jednořádkový odkaz, nastavení Claude Code se nezměnilo. Měň TENHLE soubor a commituj ho; data hooku dál bydlí v ~/.claude.
# PreCompact hook: durable zaloha CELEHO prepisu session TESNE PRED compactem.
#
# PROC (KUKY 2026-08-16): "compact prijde a co se stalo predtim neni zalohovane;
# session je pak dementni, nevi co se delo a dela si co chce mimo pravidla."
# Compact prepis fyzicky nesmaze, ale (1) nikdo na nej po compactu spolehlive
# neukaze, (2) muze ho po case smazat cleanupPeriodDays. Tahle kopie je jedno
# durable misto, ze ktereho po compactu cteme (viz runar-context.py -> vytazek
# poslednich zprav ownera).
#
# Prepis je append-only: novejsi kopie je nadmnozina starsi -> staci JEDEN soubor
# na session, ktery se prepisuje (stejny princip jako eval readings.jsonl).
# Hook NESMI spadnout ani zdrzet -> vse v try/except, vzdy exit 0.
import io, json, os, shutil, sys

BACKUP_DIR = os.path.join(os.path.expanduser('~'), '.claude', 'compact-backups')
KEEP = 30  # kolik poslednich sessions si drzet (podle mtime), zbytek smazat


# POKYNY PRO SHRNUTI (2026-11-25, CODE-read, audit docs/audit/2026-11-25-pamet-a-pravidla/): stdout PreCompact hooku se stava pokynem
# pro shrnuti pri compactu a na rozdil od ostatnich hooku nema strop 10 000 znaku (code.claude.com/docs/en/hooks.md, PreCompact).
# Bez nich shrnuti ztracelo presne to, kvuli cemu owner rika „po compactu nic nevis“: jake lane session je, ownerovy cislovane
# odpovedi a k cemu patri, co se prave dela. Karta po compactu (runar-context.py) to dopluje z prepisu, ale jen do 8 500 znaku.
POKYNY = (
    'Pokyny pro shrnuti (projekt Runar, hook compact-backup.py) — ZACHOVEJ doslova a uplne:\n'
    '1. Jmeno lane teto session (CODE-tune / CODE-read / CODE-tree / CODE-web …) a pod jakym jmenem commituje.\n'
    '2. Posledni zpravy ownera doslova a jeho cislovane odpovedi („18. ano“) VCETNE otazky, ke ktere kazda patri.\n'
    '3. Otazky, ktere session ownerovi polozila a na ktere jeste neodpovedel — doslova s cisly.\n'
    '4. Co owner schvalil nebo zamitl a co vytkl (chyby a co z nich plyne) — kazde jednou vetou s datem.\n'
    '5. Co se prave dela: dohodnuty plan s poradim kroku, ktery krok je hotovy (s commitem) a ktery je dalsi.\n'
    '6. Soubory a commity vytvorene nebo zmenene v teto session (cesty a hashe).\n'
    'Vynech: vypisy nastroju, obsah souboru, ktery lze znovu precist, a texty cteni uzivatelu (osobni udaje).\n'
)


def main():
    sys.stdout.write(POKYNY)
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    sid = (data.get('session_id') or 'nosid').replace('/', '_').replace('\\', '_')
    tp = data.get('transcript_path') or ''
    try:
        os.makedirs(BACKUP_DIR, exist_ok=True)
    except Exception:
        pass
    if tp and os.path.isfile(tp):
        try:
            shutil.copy(tp, os.path.join(BACKUP_DIR, sid + '.jsonl'))
        except Exception:
            pass
    prune()


def prune():
    """Drz jen KEEP nejnovejsich zaloh (podle mtime), starsi smaz."""
    try:
        soubory = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR)
                   if f.endswith('.jsonl')]
        soubory.sort(key=lambda p: os.path.getmtime(p), reverse=True)
        for p in soubory[KEEP:]:
            try:
                os.remove(p)
            except Exception:
                pass
    except Exception:
        pass


main()
