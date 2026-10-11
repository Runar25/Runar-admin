// Hlas Rúnara v ElevenLabs — JEDINÉ místo ID hlasu, modelů a nastavení hlasu (2026-10-11, owner „3. ano“).
//
// Proč: ID hlasu stálo na čtyřech místech (v2/runar-config.js EN i IS, elevenlabs-proxy, elevenlabs-static), modely na třech
// a nastavení hlasu na dvou (obě funkce); ve static navíc mrtvé ID pro IS s JINOU hodnotou. Kdo by změnil hlas v configu, nezměnil
// by nic (rozhoduje server, config četl jen shrine a proxy jeho hodnoty ignorovala), kdo v proxy, zapomněl by na static.
// Nález CODE-read (RUNAR_BACKLOG kolo 2 / 16) a část 21 (voice_settings dvakrát). Klient hlas ani model neposílá.
// Nasazení: změna tady = nasadit OBĚ funkce (elevenlabs-proxy i elevenlabs-static), jinak poběží každá s jinou verzí.

export const EL_VOICE_ID = "2UI8v2ibbwQTijaYAte1";   // týž hlas pro EN i IS — eleven_v3 islandštinu pozná z textu
export const EL_MODEL_EN = "eleven_multilingual_v2";
export const EL_MODEL_IS = "eleven_v3";
export const EL_VOICE_SETTINGS = {
  stability:         0.75,
  similarity_boost:  0.85,
  style:             0.35,
  use_speaker_boost: true,
};

export function elModel(lang: string): string { return lang === "is" ? EL_MODEL_IS : EL_MODEL_EN; }
