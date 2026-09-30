---
name: heredoc-mangles-backslash-escapes
description: "V Git Bash tohoto stroje heredoc (i s 'EOF') udělá z `\\\\n` skutečný konec řádku — skript s escape sekvencemi piš nástrojem Write"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-09-30T02:45:46.575Z
---

Heredoc v Bash nástroji tady nedrží zpětná lomítka: `'\\n'.join(...)` v Python kódu z `<<'EOF'` dorazí jako
skutečný konec řádku. Kotva patche pak nesedí (assert count == 0), nebo se do souboru zapíše rozbitý kód.

**Why:** 2026-09-29 to rozbilo `smoke.py` (SyntaxError, pre-push stál); 2026-09-30 znovu — kotva pro registraci
smoke kontroly nenašla `'\n'.join` a první pokus nic nezapsal jen díky assertu v `rep()`.

**How to apply:** Python/JS skript, který obsahuje `\\n`, `\\'` nebo jiné escape sekvence → napsat nástrojem Write
(do scratchpadu nebo do svého patch slotu, [[one-patch-script-path]]) a spustit soubor. Heredoc jen pro text bez
zpětných lomítek (commit message, jednoduché SQL). Patch vždy s `rep()` a assertem na počet výskytů — ten tuhle
vadu chytil dřív, než něco zapsal.
