---
name: edit-tool-escapes-new-text
description: "Edit tool na řádku s \\uXXXX (runar-translations.js) přepíše i NOVÝ text na escape sekvence; řádek se smíšenými escape a hotovými písmeny nenajde vůbec — tam patch skriptem"
metadata:
  type: feedback
---

V `runar-translations.js` stojí část IS textů jako `á…` a část jako hotová písmena, často na jednom řádku. Edit tool
při hledání zkouší obě podoby — a když najde shodu přes escape, **zapíše i new_string jako escape sekvence**. 2026-10-10:
můj český komentář za novým klíčem se uložil jako `// dřív natvrdo…` (v komentáři se escape nerozvine, čte se
doslova). Řádek, kde se obě podoby míchají (`Engar skráðar … Dragðu`), Edit nenašel vůbec.

**Why:** v řetězci by escape fungoval, v komentáři ne — a kontroly IS (check-is) i čtenář pak vidí něco jiného než jsem psal.

**How to apply:** po každém Edit v souboru s `\uXXXX` přečti diff (`git diff -U0`) a hledej nové `\u0` v přidaných řádcích;
kotvu se smíšenými escape vlož patch skriptem (raw string `r"…✦…"` pro kotvu, nový text literálním UTF-8, §11).
Souvisí: [[heredoc-mangles-backslash-escapes]], [[one-patch-script-path]].

**Opačný směr, 2026-10-11 (CODE-read, třikrát za hodinu):** `\u2028` napsané v parametru Edit/Write se už při předání (JSON) změní na
SKUTEČNÝ znak — v `scripts/protipriklady.py` útok pak hledal znak místo textu, v regexu JS byl U+2028 konec řádku (SyntaxError), a jednou
v komentáři, který tu vadu popisoval. Text `\uXXXX` do souboru jen skriptem: `chr(92) + 'u2028'`.
🔒 **Neviditelný znak zastaví hook (od 2026-10-11):** `pravidla_pri_dotyku.py` zastaví Edit/Write, který vkládá neviditelný znak, jenž v souboru ještě není.
