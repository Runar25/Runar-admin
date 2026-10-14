#!/usr/bin/env bash
# ── Verzováno v repu: hooks/claude/tree-guard.sh (od 2026-10-14, DECISIONS 2026-10-14 (2)); v ~/.claude jen odkaz (exec bash …).
TG_DIR="$(cd "$(dirname "$0")" && pwd)"   # složka tohohle skriptu = hooks/claude v repu
# ── Sourozenecké skripty (runar-context.py, runar-zprava-check.py) volá z TÉHLE složky; data (markery, logy) dál v ~/.claude.
# tree-guard.sh - vynuti zapis rozhodnuti pri zmene TREE ENGINE. Plati pro KAZDOU session.
# Rezimy: "start" (SessionStart hook) | "stop" (Stop hook). Cte hook JSON na stdin.
# Klic = session_id -> marker souboru v $HOME/.claude/tree-guard/.
# Signal "zmeneno TUTO session" = soubor novejsi nez session-start marker (ne git dirty:
# pracovni strom je trvale spinavy necommitnutymi lab soubory, takze git status je k nicemu).
#
# ROZSAH (opraveno 2026-08-07): hlida JEN tree engine (CODE-tree lane), NE hlas/config.
#   Hlas (runar-character.js) ma domov RUNAR_EVAL_LOG.md, config sve misto -> §20, NEDUPLIKOVAT
#   do DECISIONS. Drive hook hlidal cele v2/runar-*.js -> nutil CODE-tune do zakazane duplicity.
# DOMOV (§20): tree rozhodnuti = RUNAR_DECISIONS.md NEBO RUNAR_TREE.md (staci jeden).
#
# OPRAVY 2026-09-27 (KUKY: "hook ano"), tri vady, vsechny zmerene:
#   1) COMPACT MAZAL PAMET. SessionStart bezi i po compactu a delal `: > $MARK`, takze Stop
#      zapomnel vse, co session zmenila pred compactem (marker 16:46 -> 19:46; za 592 markeru
#      hook nikoho nezastavil). Marker se ted zaklada JEN jednou za session.
#   2) NEPLATNY JSON PROSEL. Fallback testoval jen `[ -n "$CTX" ]`; helper vracejici rozbity
#      JSON by rozbil SessionStart. Ted se JSON overi, jinak jde staticky text.
#   3) VINIL CIZI SESSION. "Novejsi nez muj marker" plati i pro soubory, ktere zmenila JINA
#      session ve sdilenem strome (2026-08-20 zastavil CODE-tune kvuli praci CODE-tree).
#      Ted se pred zastavenim overi v transcriptu TETO session, ze na vec sahla ona sama
#      (volani nastroju Write/Edit/Bash/PowerShell). Transcript necitelny -> puvodni chovani.
set -u

REPO="${TREE_GUARD_REPO:-C:/Users/zkuku/Downloads/Runar-admin}"   # env jen pro test hooku
GUARD="$HOME/.claude/tree-guard"
mkdir -p "$GUARD" 2>/dev/null

IN="$(cat)"
SID="$(printf '%s' "$IN" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -z "$SID" ] && SID="nosid"
MARK="$GUARD/$SID.start"
NAG="$GUARD/$SID.nagged"
MODE="${1:-}"

# Vypise ty z argumentu (jmena souboru / klic COMMIT), ktere TATO session zminila ve svych
# volanich nastroju. Cte jen radky s "tool_use" (transcript muze mit stovky MB).
mine() {
  local tp
  tp="$(printf '%s' "$IN" | python -X utf8 -c "import json,sys; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null)"
  [ -n "$tp" ] && [ -f "$tp" ] || { echo "__NOTRANSCRIPT__"; return; }
  python -X utf8 - "$tp" "$@" <<'PY' 2>/dev/null || echo "__NOTRANSCRIPT__"
import json, sys
tp, keys = sys.argv[1], sys.argv[2:]
found = set()
with open(tp, encoding="utf-8", errors="replace") as f:
    for line in f:
        if '"tool_use"' not in line:
            continue
        try:
            msg = json.loads(line).get("message", {})
        except Exception:
            continue
        for c in (msg.get("content") or []):
            if not isinstance(c, dict) or c.get("type") != "tool_use":
                continue
            if c.get("name") not in ("Write", "Edit", "Bash", "PowerShell", "NotebookEdit"):
                continue
            s = json.dumps(c.get("input", {}), ensure_ascii=False)
            for k in keys:
                if k == "COMMIT":
                    if "git" in s and "commit" in s:
                        found.add(k)
                elif k.rsplit("/", 1)[-1] in s:
                    found.add(k)
for k in keys:
    if k in found:
        print(k)
PY
}

if [ "$MODE" = "start" ]; then
  # Oprava 1: jen PRVNI start session zaklada marker; compact/resume ho nechava byt.
  if [ ! -f "$MARK" ]; then
    : > "$MARK"
    rm -f "$NAG" "$GUARD/$SID.memnag" "$GUARD/$SID.snapnag" 2>/dev/null
  fi
  # Kontext se pocita ZA BEHU (git log + RUNAR_DECISIONS.md) — viz runar-context.py.
  # Spousti se i po COMPACTU (source: "compact"), a prave tam je nejpotrebnejsi.
  # Kdyz helper chybi, spadne NEBO vrati neplatny JSON (oprava 2), jde staticky text.
  CTX="$(printf '%s' "$IN" | python -X utf8 "$TG_DIR/runar-context.py" 2>/dev/null)"
  if [ -n "$CTX" ] && printf '%s' "$CTX" | python -X utf8 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
    printf '%s' "$CTX"
    exit 0
  fi
  printf '%s' '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"RUNAR - neprekrocitelna pravidla (hook, plati pro KAZDOU session):\n1) STROM/ZAKON: 1 pramen = 1 runa = vetev nahoru + koren dolu (zrcadlo, NE fotokopie). Max 25 = 25 run. NIKDY neshlukovat vetve - musi byt rozprostrene. Detaily: RUNAR_TREE.md.\n2) PIS PRUBEZNE do SPRAVNEHO DOMOVA (§20): menis-li TREE ENGINE (build_*composer.py, build_tree_production.py, runar-branch/trunk/tree-prod.js), zapis rozhodnuti do RUNAR_DECISIONS.md NEBO RUNAR_TREE.md JESTE NEZ skoncis. Hlas/prompty patri do RUNAR_EVAL_LOG.md, config do sveho mista - NEDUPLIKUJ. Refactor/CSS log nepotrebuje.\n3) Neres symptom rezanim; nerozbijej co funguje; mer, nehadej. Na konci session te zkontroluje Stop-hook."}}'
  exit 0
fi

if [ "$MODE" = "stop" ]; then
  # ── ZALOHA CTENI (2026-10-07, KUKY: "vsechna cteni, ktera udelame, musime zalohovat, protoze se nam budou hodit"):
  # vystupy pokusu ze scratchpadu VSECH session (+ eval_out/) -> ~/runar-eval/zaloha. Do te doby lezely jen v %TEMP%
  # a pravidlo z 2026-08-16 viselo na pameti session. Tise, jen nove soubory (~0,3 s), NIKDY neblokuje — chyba zalohy
  # nesmi zastavit session. Skript a duvod: scripts/utils/zaloha_cteni.js.
  timeout 8 node "$REPO/scripts/utils/zaloha_cteni.js" --tichy >/dev/null 2>&1 || true
  # ── ZPRAVA OWNEROVI (2026-10-07, KUKY: "nikdy nic nechci, aby zaviselo na tve pameti!!"): cislovani bodu a "nez navrhnes,
  # dohledej, co uz je hotove" (uz_vime.js). Obe pravidla padala "porad dokola" — ted je hlida stroj. Skript: runar-zprava-check.py.
  ZPRAVA="$(printf '%s' "$IN" | timeout 8 python -X utf8 "$TG_DIR/runar-zprava-check.py" 2>/dev/null)"
  if [ -n "$ZPRAVA" ]; then printf '%s' "$ZPRAVA"; exit 0; fi
  [ -f "$MARK" ] || exit 0

  # ── MEMORY: vznikl v teto session soubor v memory/, ktery neni v gitu?
  # §17: memory/ je verzovana gitem — neverzovany soubor pro ostatni NEEXISTUJE.
  # Auto-pamet je zapisuje sama (junction), takze session o tom casto nevi. Smoke ⑪ to
  # chyta az u toho, kdo zrovna pushuje neco jineho; tady se to rekne tomu, komu to vzniklo.
  MEM_NAG="$GUARD/$SID.memnag"
  if [ ! -f "$MEM_NAG" ]; then
    NOVE_MEM="$(cd "$REPO" && git ls-files --others --exclude-standard -- memory/ 2>/dev/null \
      | while read -r f; do [ "$REPO/$f" -nt "$MARK" ] && echo "$f"; done | head -3)"
    if [ -n "$NOVE_MEM" ]; then
      M="$(mine $NOVE_MEM)"
      if [ "$M" = "__NOTRANSCRIPT__" ]; then M="$NOVE_MEM"; fi
      if [ -n "$M" ]; then
        : > "$MEM_NAG"
        printf '%s' '{"decision":"block","reason":"V memory/ lezi neverzovany soubor, ktery vznikl v teto session: '"$(echo $M | tr '\n' ' ')"'. §17: memory/ je verzovana gitem, takze pro ostatni session (a po compactu i pro tebe) NEEXISTUJE. Commitni ho — python -X utf8 scripts/utils/commit_vlastni.py pridej CODE-<lane> <soubor> a pak ...commit_vlastni.py commit CODE-<lane> <zprava.txt> (pathspec commit memory/ pre-commit nepusti, 2026-10-11). Kdyz tam nepatri, smaz ho. Pak skonci znovu; hook uz te podruhe nezastavi."}'
        exit 0
      fi
    fi
  fi

  # ── SNAPSHOT: povinnost ZRUSENA 2026-10-11 (KUKY „11. zrusit povinnost“, DECISIONS 2026-10-11).
  # Proc: (1) blokovalo „jednou za session“ a session bezi nekolik dni pres compacty -> posledni snapshot 2026-10-07, tj. pravidlo
  # vypadalo jako platne a nic nevynucovalo; (2) snapshot je prevypraveni, ktere zastara a opakuje BACKLOG/DECISIONS (§20).
  # Misto nej: prepisy konverzaci se nemazou (cleanupPeriodDays), nocni sifrovana kopie (scripts/utils/zaloha_konverzaci.js)
  # a hledani v nich (scripts/utils/najdi_v_konverzacich.js). Snapshot zustava dobrovolny. Puvodni blok: tree-guard.sh.pred-snapshot-2026-10-11.

  [ -f "$NAG" ]  && exit 0
  CHANGED="$(find "$REPO" -maxdepth 3 -not -path '*tree-snapshots*' \( -name 'build_*composer.py' -o -name 'build_tree_production.py' -o -name 'runar-tree-prod.js' -o -name 'runar-branch.js' -o -name 'runar-trunk.js' \) -newer "$MARK" 2>/dev/null)"
  [ -z "$CHANGED" ] && exit 0
  if find "$REPO/RUNAR_DECISIONS.md" "$REPO/RUNAR_TREE.md" -newer "$MARK" 2>/dev/null | grep -q .; then
    exit 0
  fi
  # Oprava 3: sahla na engine TATO session? (runar-branch.js = i builder, ktery ho vyrabi)
  M="$(mine $CHANGED)"
  if [ "$M" = "__NOTRANSCRIPT__" ]; then M="$CHANGED"; fi
  [ -z "$M" ] && exit 0
  : > "$NAG"
  printf '%s' '{"decision":"block","reason":"Tato session zmenila TREE ENGINE ('"$(for f in $M; do basename "$f"; done | tr '\n' ' ')"'), ale neaktualizovala jeho domov (§20). Nez skoncis: zapis rozhodnuti do RUNAR_DECISIONS.md NEBO RUNAR_TREE.md. (Hlas patri do RUNAR_EVAL_LOG.md, ne sem - neduplikuj.) Pokud slo jen o refactor/CSS bez zmeny chovani, proste skonci znovu - hook uz te podruhe nezastavi."}'
  exit 0
fi

exit 0
