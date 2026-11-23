---
name: admin-ucty-nejsou-nalez
description: Data admin účtů (ownerovy a testovací účty v ADMIN_EMAILS) nejsou nález o soukromí uživatelů — nehlásit je ownerovi jako problém; rok narození u nich zůstává
metadata:
  type: feedback
---

**Účty týmu** (2 admin + 2 testovací Rune Seeker, CLAUDE.md „Účty“) nejsou uživatelé. Co v nich zbylo ze starších verzí appky (rok narození,
staré volby, ručně měněné hodnoty), **není nález o ochraně dat uživatelů** a ownerovi se nepředkládá jako otázka.

**Why:** KUKY 2026-10-10 na otázku, jestli smazat rok narození u 3 starých účtů: *„nechat, jsou to admin účty. už to někam zapiš,
tohle upřesňuju asi po desáté."* Otázka se vracela, protože odpověď nikde nebyla zapsaná — `uz_vime.js` ji nenašel. Rozhodnutí:
`RUNAR_DECISIONS.md` 2026-10-10 (35).

**How to apply:**
- Než ohlásíš „v DB je X, co zásady neslibují“, zjisti, čí to jsou účty (`ADMIN_EMAILS` v `v2/runar-config.js` + `is_tester` mimo `allowed_emails` × `auth.users`).
  Jsou-li to účty týmu → poznámka do zápisu kontroly, žádná otázka ownerovi.
- Nález o soukromí se týká **kódu a slibů** (co appka uloží novému uživateli, co zásady říkají) — ne stavu admin dat.
- Až budou v DB skuteční uživatelé, totéž měř jen na nich (filtr mimo tým — testeři z `allowed_emails` jsou uživatelé).
- Souvisí: [[ask-owner-for-checks-you-cannot-run]], [[napred-dohledej-co-uz-je]].
