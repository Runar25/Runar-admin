# RÚNAR — segmentovaný výstup čtení (spec)

> **Cíl:** generovat čtení jako STRUKTURU `{rune, position, text, deeper_meaning}` per runa, ale uživatel pořád
> vidí/slyší JEDNO plynoucí čtení. Segmenty = metadata pod povrchem → odemyká: UI propojení runa↔text (spread-map),
> per-runa kvalitu (chytne Mannaze), hloubkovou vrstvu (Premium #1), eval, per-runa sezónu. „Zrcadlo, ne dashboard."

## Formát
Model vrací **JSON pole**, jeden objekt per runa v pořadí draws:
```json
[ { "rune": "Fehu", "text": "(beat této runy v plynoucím čtení)", "deeper_meaning": "(1-2 věty skryté hloubky, NE mluvené)" } ]
```
- Spojení všech `text` mezerou = **bezešvé plynoucí čtení** (display + hlas).
- `deeper_meaning` = skrytá vrstva, ukáže se až na tap (Premium #1). NEní součást mluveného čtení.
- `position` NEgeneruje model → doplní frontend z `SPREAD_CONFIG` podle slotu (míň co model zkazí).
- Single = pole o 1 prvku.

## Parse (reading.js `_parseSegments`)
Strip code-fence (```json) → `JSON.parse` → validace (pole + `text` string) → `reading = segments.map(text).join(' ')`,
`deeper = segments.map(deeper_meaning).join('\n')`. **Fallback:** když to není validní JSON → ber `res.text` celý jako
jedno čtení (graceful, čtení se vždy zobrazí). Display jde do `#out-short`/`s*-out` jako teď; `generateVoice()` čte
`.innerText` (viditelný text) → hlas beze změny; skrytý deeper (display:none) se do innertextu nedostane.

## Fázování (postupně, revertable)
- **Fáze A — ✅ HOTOVO (single + všechny spready, SW v109):** všechny buildery (single, Norns, Kríž, Horseshoe,
  Yggdrasil — EN+IS) → JSON; `_parseSegments` složí text (display+hlas beze změny); `deeper` drží **jen v paměti**
  (`_lastDeeper`), neukládá/nezobrazuje → neviditelné, revertable.
  - single (008d520): text=celé čtení; ověřeno 4/4 JSON, flow drží.
  - Norns (e8be1f3): per-Norn beat = past/present/future oblouk; 2/2 JSON, ne seznam.
  - Kríž/Horseshoe/Yggdrasil (aa6aacb): per-pozice beat; ověřeno Horseshoe 7/7, Yggdrasil 9/9, flow drží, tis u Eihwaz.
  - **Robustní parser:** extrahuje `[…]` od prvního `[` po poslední `]` (přežije ```json fences + okolní text) +
    připojí prózu ZA polem (model občas dá závěrečnou otázku mimo JSON). NIKDY neukáže raw JSON.
  - **Pozn. pro Fázi B:** Kríž občas vrátí +1 segment (otázka jako vlastní objekt). Pro Fázi A OK (složí se);
    ve Fázi B (tap-mapping runa↔segment) zarovnat počet segmentů na počet run (mapovat dle rune name).
- **Fáze B — spready + tap UI (= Premium #1 / spread-map):** multi-rune buildery → JSON; tap na runu zvýrazní její
  segment (barva) + odhalí `deeper_meaning` + význam pozice; geometrie per spread. Persistovat `deeper` (reuse
  `readings.deep_text` nebo nový `segments jsonb`) + rozhodnout gating (premium vs free v journalu).
- **Fáze C:** per-runa sezóna/kombinace/vztahy (napojení na tree relational model).

## Rizika / otevřené
- **Malformed JSON** (vzácně) → fallback ukáže raw (= JSON text). Riziko nízké (4/4 OK), revertable; testeři chytnou
  přes reporter. Případně zpřísnit fallback (regex extrakce `text`).
- **Velké spready (Yggdrasil 9):** 9 vynucených beatů = riziko „seznamovitosti" → ladit promptem (beaty krátké+plynulé).
- **max_tokens:** spready ve Fázi B potřebují bump (JSON+deeper). Single 700 stačí (ověřeno). EL beze změny (hlas čte jen viditelný text).
- **IS:** JSON klíče EN, hodnoty IS; 3-vrstvý IS systém drží (applyISCorrections na složený text). IS draft promptu ověřit okem.

## Další krok
Fáze A hotová (single + spready). Další = **Fáze B — tap UI / spread-map** (= Premium #1): persistovat `deeper`
(reuse `readings.deep_text` nebo `segments jsonb`), zarovnat segmenty na runy, tap → zvýraznit segment + odhalit
deeper + pozici, geometrie per spread. Před stavbou vlastní mini-rozhodnutí (persistence + gating premium/free).
