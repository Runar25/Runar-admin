# Security Advisor — provedené úpravy
**Datum:** 2026-07-03 · **Projekt:** pmitxjvkeovijreepror · **Výsledek:** 15 warnings → 2

Dva SQL soubory spuštěné v Supabase SQL editoru.

---

## 1. `2026-07-03_security_advisor_functions.sql`

**(A) Zafixován `search_path`** u 4 funkcí (bylo „mutable"):
`add_credits`, `use_credit`, `update_updated_at`, `check_rate_limit`
→ nastaveno `search_path = pg_catalog, public`.

**(B) Odebrán EXECUTE veřejnosti** u 3 SECURITY DEFINER funkcí:
`add_credits`, `use_credit`, `check_rate_limit`
→ `REVOKE` od `PUBLIC/anon/authenticated`, `GRANT` jen `service_role`.

> **Proč to byla reálná díra:** `add_credits` (SECURITY DEFINER) šla volat přímo přes
> veřejný anon klíč (`POST /rest/v1/rpc/add_credits`) → kdokoli si mohl přidat kredity.
> Funkce volají jen edge funkce přes service_role, takže revoke nic nerozbil.

Vyřešeno: **10 warnings** (4× search path + 6× SECURITY DEFINER).

---

## 2. `2026-07-03_security_advisor_rls.sql`

Zpřísněny RLS policies (byly `USING(true)`) podle reálného použití v kódu:

| Tabulka | Nová policy | Přístup |
|---|---|---|
| `runar_corrections` | `_public_read` (SELECT) + `_admin_write` (ALL) | Čtou všichni (reader `loadCorrections()`), zapisuje jen admin |
| `runar_character` | `_admin_all` (ALL) | Jen admin (v2 čte výhradně shrine) |
| `knowledge_base` | `_admin_all` (ALL) | Jen admin (v2 nepoužívá) |
| `bug_reports` | — beze změny — | Záměrně: anonymní insert-only formulář |

Admin = e-mail v JWT: `kukula@agndofa.is`, `info@agndofa.is` (shodně s `ADMIN_EMAILS`).
Edge funkce (service_role) obcházejí RLS → nedotčené.

Vyřešeno: **3 warnings** (runar_corrections, runar_character, knowledge_base).

---

## Zbývá (nevyřešeno záměrně / mimo SQL)

- **`bug_reports` RLS Always True** — záměrně ponecháno (anon hlášení chyb). Lze v Advisoru dismissnout.
- **Leaked Password Protection Disabled** — přepínač v dashboardu: Authentication → Attack Protection → zapnout kontrolu proti HaveIBeenPwned. Není SQL.
