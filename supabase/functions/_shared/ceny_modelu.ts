// @ts-nocheck — GENEROVÁNO scripts/utils/gen_ceny_server.js, NEEDITOVAT: MODEL_PRICES z v2/runar-config.js a readingCostUsd
// z v2/runar-utils.js, doslova. Změna ceníku = v2/runar-config.js, pak `node scripts/utils/gen_ceny_server.js`. Hlídá smoke ㊇.

const MODEL_PRICES = {
  anthropic: {   // [vstup, zápis cache 5 min, zápis cache 1 h, čtení cache, výstup]
    'claude-opus-5':   [5, 6.25, 10, 0.5, 25],
    'claude-opus-4-8': [5, 6.25, 10, 0.5, 25],
    'claude-opus-4-7': [5, 6.25, 10, 0.5, 25],
  },
  openai: {      // [vstup, vstup z cache, výstup]; zápis do cache = vstup × openaiCacheWrite
    'gpt-6-sol':  [2, 0.2, 10],
    'gpt-6.1-sol': [2, 0.1, 10],   // 2026-10-02 ověřeno developers.openai.com/api/docs/pricing (Standard, short context; cache write 2,50 = 1,25×)
    'gpt-6-luna': [0.1, 0.01, 0.5],
  },
  openaiCacheWrite: 1.25,
  usGeo: 1.1,    // Anthropic inference_geo 'us' = +10 %
};

function readingCostUsd(u) {
  if (!u || typeof MODEL_PRICES === 'undefined') return null;
  if (u.prompt_tokens != null || u.input_tokens_details) {
    var o = MODEL_PRICES.openai[u.model]; if (!o) return null;
    var vstup = u.prompt_tokens != null ? u.prompt_tokens : (u.input_tokens || 0);
    var det = u.prompt_tokens_details || u.input_tokens_details || {};
    var ca = det.cached_tokens || 0, zap = det.cache_write_tokens || 0;
    var vystup = u.completion_tokens != null ? u.completion_tokens : (u.output_tokens || 0);
    return ((vstup - ca - zap) * o[0] + ca * o[1] + zap * o[0] * MODEL_PRICES.openaiCacheWrite + vystup * o[2]) / 1e6;
  }
  var c = MODEL_PRICES.anthropic[u.model]; if (!c) return null;
  var cc = u.cache_creation || {};
  var w5 = cc.ephemeral_5m_input_tokens != null ? cc.ephemeral_5m_input_tokens : (u.cache_creation_input_tokens || 0);
  return (u.inference_geo === 'us' ? MODEL_PRICES.usGeo : 1) * ((u.input_tokens || 0) * c[0] + w5 * c[1]
    + (cc.ephemeral_1h_input_tokens || 0) * c[2] + (u.cache_read_input_tokens || 0) * c[3] + (u.output_tokens || 0) * c[4]) / 1e6;
}

export { MODEL_PRICES, readingCostUsd };
