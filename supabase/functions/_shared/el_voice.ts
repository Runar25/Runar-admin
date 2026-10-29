// Hlas Rúnara v ElevenLabs — JEDINÉ místo ID hlasu, modelů a nastavení hlasu (2026-10-11, owner „3. ano“).
//
// Proč: ID hlasu stálo na čtyřech místech (v2/runar-config.js EN i IS, elevenlabs-proxy, elevenlabs-static), modely na třech
// a nastavení hlasu na dvou (obě funkce); ve static navíc mrtvé ID pro IS s JINOU hodnotou. Kdo by změnil hlas v configu, nezměnil
// by nic (rozhoduje server, config četl jen shrine a proxy jeho hodnoty ignorovala), kdo v proxy, zapomněl by na static.
// Nález CODE-read (RUNAR_BACKLOG kolo 2 / 16) a část 21 (voice_settings dvakrát). Klient hlas ani model neposílá.
// Nasazení: změna tady = nasadit OBĚ funkce (elevenlabs-proxy i elevenlabs-static), jinak poběží každá s jinou verzí.

export const EL_VOICE_ID = "2UI8v2ibbwQTijaYAte1";   // týž hlas pro EN i IS — eleven_v3 islandštinu pozná z textu
// 2026-10-29 (owner: „v4 Turbo je dobré i pro IS. Použijeme“): oba jazyky eleven_v4_turbo — islandštinu umí, stojí polovinu v2/v3
// (/v1/models: character_cost_multiplier 0,5). Do té doby EN eleven_multilingual_v2, IS eleven_v3. Recept čtení: _shared/voice_direction.ts.
export const EL_MODEL_EN = "eleven_v4_turbo";
export const EL_MODEL_IS = "eleven_v4_turbo";
// 2026-10-29: stabilita 0,75 → 0,5 a rychlost 0,9 = recept R3/R5 (RUNAR_EVAL_LOG 2026-10-28 (1)); nižší stabilita nechá hlas reagovat na značky.
export const EL_VOICE_SETTINGS = {
  stability:         0.5,
  similarity_boost:  0.85,
  style:             0.35,
  use_speaker_boost: true,
  speed:             0.9,
};

export function elModel(lang: string): string { return lang === "is" ? EL_MODEL_IS : EL_MODEL_EN; }

// Kredity ElevenLabs na znak podle modelu (2026-10-11, DECISIONS 2026-10-11 (43) a (48)). Počítadlo účtu (character_count /
// character_limit) je v KREDITECH, ne ve znacích: ceník API $0.08 / 1000 znaků pro v2 i v3, kredit = $0.0002 → 0,4 kreditu na znak.
// Ověřeno proti přehledu účtu (2026-10-11: v3 1 933 zn. = 773 kreditů, v2 1 651 zn. = 661). Model, který tu chybí, se počítá 1 kredit
// na znak — brzda pak počítá víc, ne míň. Nový model nebo změna ceníku → řádek sem i sazba EL_PRECERPANI ve scripts/utils/stats.js
// (shodu hlídá smoke ⑨, scripts/verify_monthly_limits.js).
// v4 a v4 Turbo 2026-10-29: v4 změřeno z přehledu účtu (399 zn. = 160 kr.), Turbo = ½ (násobek ceny 0,5 z /v1/models).
export const EL_KREDITY_NA_ZNAK: Record<string, number> = {
  eleven_multilingual_v2: 0.4,
  eleven_v3:              0.4,
  eleven_v4:              0.4,
  eleven_v4_turbo:        0.2,
};
export function kredityHlasu(model: string, znaku: number): number {
  return Math.ceil(znaku * (EL_KREDITY_NA_ZNAK[model] ?? 1));
}
