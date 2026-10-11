// Sdílené pro elevenlabs-proxy, elevenlabs-static a voice-usage (2026-09-25, handoff CODE-read 2026-09-24 „náklady na hlas").
// Proč a tabulky: sql/2026-09-25_voice_usage.sql. Dnes se ukládal jen voice_month_count — hlas nešel rozdělit na
// admin / tester / uživatel ani ocenit podle modelu, a ElevenLabs ukazuje spotřebu jen za aktuální období.
// deno-lint-ignore-file no-explicit-any
// ⚠️ Nic tady nesmí shodit hlas, který už se ozval: každá chyba se jen zaloguje (edge logs).

// Jeden řádek na úspěšné generování. chars = délka textu = to, co ElevenLabs účtuje.
export async function logVoice(sb: any, row: {
  user_id: string | null; source: "dynamic" | "static"; lang: string | null; model: string; chars: number;
}): Promise<void> {
  try {
    const { error } = await sb.from("voice_usage").insert(row);
    if (error) console.error("voice_usage insert failed:", error.message);
  } catch (e) {
    console.error("voice_usage threw:", (e as Error).message);
  }
}

// Stav předplatného EL. Vrací celou odpověď (null při chybě) — názvy polí se neopisují, `raw` je nese všechny.
export async function fetchQuota(key: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key } });
    if (!res.ok) { console.error("EL subscription:", res.status, (await res.text().catch(() => "")).slice(0, 200)); return null; }
    return await res.json();
  } catch (e) {
    console.error("EL subscription threw:", (e as Error).message);
    return null;
  }
}

const num = (x: unknown) => (typeof x === "number" && isFinite(x) ? x : null);

// ── Brzda hlasu (2026-10-11, owner — DECISIONS 2026-10-11 (48)) ─────────────────────────────────────────────────────────────
// „máme hodně kreditů, tak je může vyčerpat, ale potřebuju to hlídat! jakmile vyčerpáme nebo vyprší jejich platnost, tak omezíme
// na 30.000“ → převod kreditů EL se smí vyčerpat, dobití ne. character_limit = kredity tarifu + převod + dobití a EL čerpá dobití až
// nakonec (DECISIONS (43)), takže hladina = character_limit − dobití: dokud je převod, pustí i ten; když ho EL vyčerpá nebo propadne,
// limit klesne a brzda je sama na kreditech tarifu — bez ručního kroku (CLAUDE.md §30). Do 2026-10-11 hladina 0,7 × character_limit
// (VOICE_SAFE_SHARE), která přičítala znaky ke kreditům a při malém převodu sahala do dobití (kontrola CODE-read 2026-10-11).
// ⚠️ Velikost dobití EL v odpovědi neposílá: koupí-li owner další dobití nebo zapne automatické dobíjení, ZVÝŠIT tuhle konstantu, jinak
// by brzda nové dobití čerpala. Dnes $2.76 = 13 800 kreditů (limit 103 807 = strop převodu Starteru 90 000 + dobití).
export const EL_DOBITI_KREDITY = 13800;
// Kredity tarifu za měsíc (ceník API v ownerově účtu 2026-10-11: znaky v3 × 0,4). Jen pro výpis stavu (VOICE ve shrine,
// scripts/utils/plytvani.js) — brzda je nepotřebuje, bere limit od EL.
export const EL_TARIF_KREDITY: Record<string, number> = {
  starter: 30000, creator: 110000, pro: 495000, scale: 1495000, business: 4950000,
};
// Cena kreditu v USD — u všech tarifů API táž ($6 / 30 000 = $22 / 110 000 = $0.0002; DECISIONS 2026-10-11 (43)). Pro cenu hlasu
// v záložce TESTERS (voice-usage); sazba za 1000 znaků ve scripts/utils/stats.js je kredity na znak × tohle × 1000 (hlídá smoke ⑨).
export const EL_KREDIT_USD = 0.0002;

// novych = kredity nového hlasu (kredityHlasu v el_voice.ts). Stav účtu neznámý → pustit (fail open): osobní strop testera platí dál
// a jde o jednotlivé hlasy (CODE-read 2026-10-11 bod 3). Smoke ⑨ tuhle funkci spouští na známých vstupech — měň ji i s kontrolou.
export function brzdaHlasu(raw: any, novych: number) {
  const used = num(raw?.character_count), lim = num(raw?.character_limit);
  if (used === null || lim === null) return { pustit: true, spotreba: used, hladina: null, novych };
  const hladina = lim - EL_DOBITI_KREDITY;
  return { pustit: used + novych <= hladina, spotreba: used, hladina, novych };
}

// source: weekly (do 2026-10-11) · admin (otevření VOICE ve shrine) · daily (při hlasu nejvýš 1× denně) · brake (zastavení brzdou).
// daily a brake potřebují sql/2026-10-11_voice_quota_snapshots_zdroje.sql — bez něj se snímek jen zaloguje jako chyba.
export async function saveQuota(sb: any, raw: Record<string, unknown>, source: "weekly" | "admin" | "daily" | "brake"): Promise<void> {
  try {
    const reset = num(raw.next_character_count_reset_unix);
    const { error } = await sb.from("voice_quota_snapshots").insert({
      source,
      tier: typeof raw.tier === "string" ? raw.tier : null,
      status: typeof raw.status === "string" ? raw.status : null,
      character_count: num(raw.character_count),
      character_limit: num(raw.character_limit),
      next_reset_at: reset !== null ? new Date(reset * 1000).toISOString() : null,
      raw,
    });
    if (error) console.error("voice_quota_snapshots insert failed:", error.message);
  } catch (e) {
    console.error("voice_quota_snapshots threw:", (e as Error).message);
  }
}

// Snímek stavu EL nejvýš jednou denně (2026-10-11, DECISIONS (48) — owner to musí vidět; do té doby jednou za 7 dní a poslední snímek byl
// z 2026-10-05). Bez plánovače (pg_cron v projektu není zapnutý): po úspěšném hlasu. Ukládá se stav, který proxy přečetla kvůli brzdě —
// žádné volání EL navíc. Den bez hlasu snímek nemá; čítač EL ale počítá dál (audio Kolekce, web EL) a další snímek to dožene.
export async function denniSnimek(sb: any, raw: Record<string, unknown> | null): Promise<void> {
  if (!raw) return;
  try {
    const { data } = await sb.from("voice_quota_snapshots").select("taken_at")
      .order("taken_at", { ascending: false }).limit(1);
    const last = data?.[0]?.taken_at ? Date.parse(data[0].taken_at) : 0;
    if (Date.now() - last < 24 * 3600 * 1000) return;
    await saveQuota(sb, raw, "daily");
  } catch (e) {
    console.error("denniSnimek threw:", (e as Error).message);
  }
}
