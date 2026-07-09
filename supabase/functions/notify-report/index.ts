// Supabase Edge Function: notify-report
// Pushes each new in-app bug report (public.bug_reports INSERT) to Slack, so the
// owner never has to open the Supabase dashboard to read reports.
//
// Trigger: a Supabase Database Webhook on public.bug_reports (event: INSERT) -> this function.
// Secrets: SLACK_WEBHOOK_URL (required) · WEBHOOK_SECRET (optional shared secret).
// Deploy:  supabase functions deploy notify-report --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TYPE_EMOJI: Record<string, string> = {
  replace: "✏️", rephrase: "✏️", pattern: "🔁", visual: "🎨", crash: "💥", other: "🚩",
};

function clip(s: unknown, n: number): string {
  const t = (s ?? "").toString().trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function buildSlackMessage(r: Record<string, any>) {
  const emoji  = TYPE_EMOJI[r.type] ?? "🚩";
  const header = `${emoji} New Rúnar report · *${r.type ?? "other"}*`;

  const lines: string[] = [];
  if (r.message) lines.push(`> ${clip(r.message, 500)}`);
  if (r.flagged_text) {
    const arrow = r.suggested_replacement ? ` → *${clip(r.suggested_replacement, 200)}*` : "";
    lines.push(`*flagged:* “${clip(r.flagged_text, 240)}”${arrow}`);
  }
  const meta: string[] = [];
  if (r.tester)         meta.push(`👤 ${clip(r.tester, 40)}`);
  if (r.locale)         meta.push(`🌐 ${clip(r.locale, 12)}`);
  if (r.app_version)    meta.push(`⚙︎ ${clip(r.app_version, 16)}`);
  if (r.screen_context) meta.push(`🖥 ${clip(r.screen_context, 40)}`);
  if (r.flagged_source) meta.push(`✎ ${clip(r.flagged_source, 16)}`);
  if (r.i18n_key)       meta.push(`🔑 ${clip(r.i18n_key, 48)}`);
  if (meta.length) lines.push(meta.join("  ·  "));

  return {
    text: `${header}\n${lines.join("\n")}`, // fallback + notification text
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: header } },
      ...(lines.length ? [{ type: "section", text: { type: "mrkdwn", text: lines.join("\n") } }] : []),
    ],
  };
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!slackUrl) return new Response("SLACK_WEBHOOK_URL not set", { status: 500 });

  // Optional shared-secret gate: set WEBHOOK_SECRET and have the DB webhook send
  // header `x-webhook-secret`. If WEBHOOK_SECRET is unset, no check is enforced.
  const wantSecret = Deno.env.get("WEBHOOK_SECRET");
  if (wantSecret && req.headers.get("x-webhook-secret") !== wantSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

  // Supabase DB webhook payload shape: { type, table, record, schema, old_record }.
  // Accept a bare row too (manual test). Only act on inserts.
  const rec = body?.record ?? body;
  if (!rec || (body?.type && body.type !== "INSERT")) {
    return new Response("Ignored", { status: 200 });
  }

  const resp = await fetch(slackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildSlackMessage(rec)),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return new Response(`Slack post failed: ${resp.status} ${detail}`, { status: 502 });
  }
  return new Response("OK", { status: 200 });
});
