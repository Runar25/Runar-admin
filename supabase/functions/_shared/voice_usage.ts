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

export async function saveQuota(sb: any, raw: Record<string, unknown>, source: "weekly" | "admin"): Promise<void> {
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

// Týdenní řada bez plánovače (pg_cron v projektu není zapnutý): po úspěšném hlasu se podívá na poslední snímek
// a nejvýš jednou za 7 dní uloží nový. Týden bez hlasu ve čtení snímek nemá; čítač EL ale počítá dál (statické audio,
// pokusy na webu EL), takže další snímek to dožene — mezera je jen v časové řadě, ne v součtu.
export async function weeklyQuota(sb: any, key: string): Promise<void> {
  try {
    const { data } = await sb.from("voice_quota_snapshots").select("taken_at")
      .order("taken_at", { ascending: false }).limit(1);
    const last = data?.[0]?.taken_at ? Date.parse(data[0].taken_at) : 0;
    if (Date.now() - last < 7 * 24 * 3600 * 1000) return;
    const raw = await fetchQuota(key);
    if (raw) await saveQuota(sb, raw, "weekly");
  } catch (e) {
    console.error("weeklyQuota threw:", (e as Error).message);
  }
}
