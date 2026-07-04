# Snapshot 2026-06-09 — Token analysis + prompt caching

## SW verze: v73
## Poslední commit: 7bb6a55

---

## Kontext

Session zaměřená výhradně na analýzu tokenů a optimalizaci nákladů. Žádné změny UI/JS.
Tree of life POC (fraktal, Bezier) dokončen v předchozí session, předán Cowork.

---

## 1. Analýza tokenů — všechna čtení

### Model v produkci: claude-sonnet-4-5 ($3/$15 per 1M in/out)
(uloženo v `supabase/functions/claude-proxy/index.ts` — nikde ve frontendovém kódu)

### System prompt (buildSysPrompt, focused profile)
| Jazyk | Tokeny |
|-------|--------|
| EN | ~960 |
| IS | ~1 045 |

System prompt tvoří **75–80 % každého input volání** — nejdůležitější místo pro optimalizaci.

### Input + output tokeny per čtení (typický uživatel s area/seeking/question/lifeRune)

| Spread | Input EN | Input IS | Output (věty) | Cena EN | Cena IS |
|--------|----------|----------|---------------|---------|---------|
| Single | ~1 210 | ~1 355 | 5–7 = ~275 | ~$0.008 | ~$0.008 |
| Life Rune | ~1 230 | ~1 365 | 6–9 = ~345 | ~$0.009 | ~$0.009 |
| Norns | ~1 240 | ~1 375 | 7–9 = ~365 | ~$0.009 | ~$0.009 |
| Kříž | ~1 265 | ~1 405 | 6–8 = ~320 | ~$0.009 | ~$0.010 |
| Horseshoe | ~1 280 | ~1 420 | 9–12 = ~480 | ~$0.011 | ~$0.011 |
| Yggdrasil | ~1 355 | ~1 500 | 13–16 = ~660 | ~$0.014 | ~$0.014 |

### Proč se "do not name positions" liší napříč spready
- **Single**: žádné pozice → instrukce není potřeba
- **Norns**: pozice = mytologické postavy (Urðr/Verðandi/Skuld) → "nevolej je jménem, bav hlas"
- **Kříž/Horseshoe/Yggdrasil**: pozice = strukturální štítky (Past/Present/Above…) → "nezmiňuj štítky"
Různé instrukce pro různý problém — **nelze sloučit do system promptu**.

---

## 2. Rozhodnutí: model zůstává Sonnet 4-5

Cowork: "Rúnarův hlas je definovaný system promptem, charakterem a strukturou promptu — ne tím jestli model je Sonnet nebo Opus. Opus 4-8 ti nedá 60% lepší poetiku. Dá ti možná 10–15% na okrajích. To nestojí za cenu ani za riziko změny chování při upgradu."

Závěr: **zůstat na claude-sonnet-4-5**, testovat konkrétní čtení pokud pochybnosti.

---

## 2. Implementace: prompt caching — claude-proxy/index.ts

### Co se změnilo (deploy hotov)

**Soubor:** `supabase/functions/claude-proxy/index.ts`

**Před:**
```typescript
let systemWithContext = system || "";
// ... append Vrstvy A/B/C to systemWithContext ...
body: JSON.stringify({
  model:    "claude-sonnet-4-5",
  system:   systemWithContext,   // string
  ...
})
```

**Po:**
```typescript
let dynamicContext = "";
// ... append Vrstvy A/B/C to dynamicContext ...

const baseSystem = system || "";
const systemParts = [];
if (baseSystem)     systemParts.push({ type: "text", text: baseSystem, cache_control: { type: "ephemeral" } });
if (dynamicContext) systemParts.push({ type: "text", text: dynamicContext });

body: JSON.stringify({
  model:   "claude-sonnet-4-5",
  system:  systemParts.length > 0 ? systemParts : undefined,  // array
  ...
})
```

### Logika caching
- **baseSystem** (~960 tokenů EN) = system prompt z frontendu = identický pro všechny uživatele stejného lang → **cached s ephemeral**
- **dynamicContext** = Vrstva A (tree memory) + Vrstva B (session state) + Vrstva C (voice scale) = mění se per user/session → **není cached**

### Úspora
- 1. volání v sezení: normální cena + cache-write ($3.75/1M)
- Každé další volání kde cache žije (5 min TTL, obnovuje se): ~960 tokenů za $0.30/1M místo $3.00/1M = **~$0.0026 úspora / volání**
- Při paralelním provozu více uživatelů: cache se sdílí → každý uživatel ve stejném okně profituje

---

## Soubory vytvořeny tuto session (pomocné skripty)

- `compare_models.py` — volá Haiku/Sonnet/Opus paralelně se stejným promptem, vypisuje tokeny + cenu
  (vyžaduje ANTHROPIC_API_KEY v prostředí)
- `patch_caching.py` — skript který aplikoval caching patch (jednorázový, lze smazat)

---

## Stav na konci dne

SW: v73 | Commit: 7bb6a55
Caching: ✅ deployed

### Co zbývá (prioritní)
- 🔴 Resend SMTP, Shopify webhook, DPA Supabase
- 🟡 Norns axis → zapojit `_moodContext`/`_intentionContext` do buildReadingPromptEN/IS
- 🟡 runar-help.html — hardcoded strings v help content sekci
- 🟢 Tree of life vizuální strom — předáno Cowork
