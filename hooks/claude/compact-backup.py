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


def main():
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
