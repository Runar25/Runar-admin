# 2026-08-17 — kde jsme skončili (session CODE-tune, model chain)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**sonnet-5 pryč z fallback řetězce čtení.** Owner rozhodl (28526b3 to už předpověděl):
`claude-proxy` MODELS `["opus-4-8","opus-4-7","sonnet-5"]` → `["opus-4-8","opus-4-7"]`.
Odebrání, ne náhrada. Hotovo, na `origin/main` (commit `4a0de56`).

**Proč / čísla nejsou tady** (mají vlastníka): rozhodnutí → `RUNAR_DECISIONS.md` 2026-08-17
„sonnet-5 zrušen jako poslední fallback" · měření per model → `RUNAR_PRICING.md` „Volba
modelu čtení — měření per model (2026-08-17)".

## Nasazeno (deploy git nevidí — proto tady)

Owner mě požádal, ať deployuju sám. `supabase functions deploy claude-proxy
--project-ref pmitxjvkeovijreepror --no-verify-jwt` → **claude-proxy v58 → v59**,
`verify_jwt` zůstal `false` (klient volá anon klíčem, ne user JWT — bez toho flagu by se
JWT zaplo a rozbilo každé čtení). Ověřeno stažením ŽIVÉ funkce: deployed source má
2-model chain, `claude-sonnet-5` 0×. Produkce teď jede čistě Opus.

⚠️ **Verifikace fallbacku NEPOTŘEBUJE vyvolat pád** — sonnet-5 v kódu prostě není, takže
při pádu být povolán nemůže. Statický fakt, ne živý test. (Owner se ptal přesně na tohle.)

## Past bez vlastníka jinde — HLÍDAT

**Main checkout `C:\Users\zkuku\Downloads\Runar-admin` má lokální `main` POZADU za origin/main**
(nedělal `git pull`). Jeho working tree drží STARÝ 3-model `index.ts`. Kdo odtud znovu
deployne claude-proxy BEZ `git pull`, přepíše produkci zpátky na 3-model chain a vrátí
sonnet-5. Deploy jsem dělal ZE session worktree, kde je nový kód. → před příštím deployem
odtamtud: `git pull`.

## Co dnes viselo a je pryč
- Nic dalšího k téhle úloze. Task uzavřen (kód + doc sync + DECISIONS + deploy + verify).
