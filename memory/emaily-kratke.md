---
name: emaily-kratke
description: Každý e-mail, který Rúnar posílá (provoz, přihlašovací kód, web), musí být krátký — vejde se na jednu obrazovku telefonu
metadata:
  type: feedback
---
Owner 2026-10-14 po zkušebním ranním souhrnu hlídání provozu: *„maily nesmí zabírat moc místa. to myslím obecně.“*
Platí pro každý e-mail, který posíláme: hlídání provozu (`supabase/functions/_shared/ops_souhrn.ts`), přihlašovací kód
(`supabase/templates/prihlaseni-kod.html`), potvrzení registrace z webu (šablona v Brevu, CODE-web) i budoucí e-maily k platbám.

**Why:** zkušební souhrn měl 14–16 řádků i v klidný den — nadpis se stavem, „Needs you“, tabulka devíti řádků, patička — a owner ho
četl na telefonu. Stav přitom nesl už předmět a odesílatele jméno.

**How to apply:**
- e-mail se vejde na jednu obrazovku telefonu bez posouvání; nadpis, který opakuje předmět, patička ani tabulka tam nepatří
- jeden řádek na téma, nuly a „none“ vynechat; co stojí v předmětu, se v těle neopakuje
- e-maily hlídání provozu měří smoke ㊈ (`scripts/verify_ops_souhrn.js`) — mez je tam, sem se neopisuje
- e-mail mimo repo (šablona v Brevu, Shopify) žádná kontrola nevidí: řádky spočítej sám, než ho owner schválí
- jazyk e-mailů → CLAUDE.md §31; třídění příchozí pošty → [[schranka-runar-gmail]]
