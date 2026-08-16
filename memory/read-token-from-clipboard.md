---
name: read-token-from-clipboard
description: Admin token pro eval dávky si načti ze schránky přes read_clipboard a zapiš sám; owner ho nevkládá do souboru
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-16T19:07:49.909Z
---

Když vyprší `C:\Users\zkuku\.runar-eval-token` (Supabase JWT, platnost přesně 60 minut),
owner ho **zkopíruje do schránky** a napíše „mám". Odtud je to na mně:
`mcp__computer-use__read_clipboard` → zapsat do souboru → jet dál.

**Nikdy** ownera nežádat, aby token vkládal do souboru ručně, ani ho nevypisovat do chatu.

**Why:** KUKY 2026-08-16, podruhé týž den: *„protoze si to mas jako predtim nacist ze
schranky!! proc to zase menis?"* — poprvé jsem token vypsal místo zkopírování, podruhé
jsem chtěl, aby ho vložil sám. Obojí je práce navíc pro ownera za něco, co umím udělat.

**How to apply:** zápis bez otisku tokenu v transkriptu:
`Get-Clipboard` → `Set-Content -Path 'C:\Users\zkuku\.runar-eval-token' -Encoding ascii -NoNewline`.

Příkaz do konzole shrine dávej ten, který si klíč **najde sám** v `localStorage` — nezávisí
na `sb`, není async a vrátí potvrzení:
`(()=>{const e=Object.entries(localStorage).find(([k])=>k.startsWith('sb-')&&k.endsWith('-auth-token'));const t=JSON.parse(e[1]).access_token;copy(t);return 'zkopirovano: '+t.length;})()`

⚠️ V konzoli **nikdy** nepřiřazovat do `t` — to je překladová funkce (`runar-utils.js`),
přepsání shodí produkční stránku. Souvisí: [[ask-owner-for-checks-you-cannot-run]],
[[paste-sql-explicitly]].
