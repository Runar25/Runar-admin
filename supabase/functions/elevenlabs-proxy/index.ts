// Supabase Edge Function: elevenlabs-proxy
// Real-time TTS — returns base64 audio blob.
// Hlas patří ke čtení (2026-10-11, DECISIONS (61)): reading_id (text z deníku, audio se uloží, další přehrání zdarma) · podpis
// neuloženého čtení z claude-proxy (_shared/voice_ticket.ts) · admin text (Teach ve shrine). Každé čtení zazní jednou.
// Rate limit: 5 req/min per logged-in user (anonymous is rejected with 401 — 2026-10-09: „or IP for anonymous“ pryč, neplatilo)
// Deploy: supabase functions deploy elevenlabs-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { logVoice, denniSnimek, fetchQuota, saveQuota, brzdaHlasu } from "../_shared/voice_usage.ts";
// ID hlasu, modely a nastavení hlasu: JEDINÉ místo je _shared/el_voice.ts (2026-10-11) — dřív tu stály vlastní kopie (důvod tam).
import { EL_VOICE_ID, EL_VOICE_SETTINGS, elModel, kredityHlasu } from "../_shared/el_voice.ts";
import { textKHlasu, normalizuj, over } from "../_shared/voice_ticket.ts";

const EL_API_KEY     = Deno.env.get("ELEVENLABS_API_KEY");

// Měsíční strop 5 pro všechny (od 2026-09-11) ZRUŠEN 2026-10-11 — byl to ownerův pokyn pro testery, omylem pro všechny (DECISIONS
// 2026-10-11 (49)); owner: „žádný měsíční strop 5 hlasů není!!!“. Hlas teď drží ČTENÍ: jednou ke každému čtení, a čtení drží jednotky
// tarifu (DECISIONS 2026-10-11 (61), níž „K čemu hlas patří“).
// Testeři (is_tester) 15 hlasů měsíčně, dokud jedeme Starter — ZRCADLÍ v2/runar-config.js VOICE_MONTHLY_LIMIT_TESTER (důvod tam; owner
// 2026-10-11, BACKLOG část 43). Shodu hlídá scripts/verify_monthly_limits.js. Hladinu kvóty VOICE_SAFE_SHARE 2026-10-11 nahradila brzda
// kreditů (brzdaHlasu v _shared/voice_usage.ts, DECISIONS (48)).
const VOICE_MONTHLY_LIMIT_TESTER = 15;
// Admin smí nechat přečíst text bez čtení — Teach ve shrine (text tam upravuje ručně, podpis mít nemůže). Kopie seznamu z configu
// jako v ostatních funkcích; shodu hlídá scripts/verify_admin_emails.js.
const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];
// Úložiště hlasu uložených čtení — soukromé (sql/2026-10-11_hlas_ke_cteni.sql); přehrání přes podepsaný odkaz na hodinu.
const BUCKET = "reading-voice";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function monthKey(d = new Date()): string { return d.toISOString().slice(0, 7); }

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// 2026-10-13 (owner „ano udělej“, DECISIONS 2026-10-13 (6)): ElevenLabs drží v historii našeho účtu text i zvuk každého vygenerování
// (enable_logging je výchozí, vypnout smí jen Enterprise — ověřeno v jejich dokumentaci 2026-10-12) a smazání účtu v Rúnaru tam
// nedosáhne. Po vygenerování proto položku smažeme. Odpověď streamu id položky nenese → hledá se v posledních položkách našeho hlasu
// podle textu; nenajde-li se ani na třetí pokus, jen se zaloguje (položka pak zůstane, jak tomu bylo dosud).
// 2026-10-14: první skutečný hlas (14. 10. 08:25:56 UTC) v historii ZŮSTAL — log „EL history item not found“ po 3 pokusech za ~5 s;
// výpis prošel, klíč historii číst smí. Jestli položka ještě nebyla zapsaná, nebo nesouhlasil text (posíláme ho normalizovaný), log
// nerozliší → teď se hledá podle request_id (hlavička `request-id`, kterou ElevenLabs vrací pro navazování požadavků; položka historie
// ho nese), text je záloha (normalizovaný na obou stranách), a čeká se ~50 s (na pozadí, čtenář nečeká). Bez „nejnovější položky
// našeho hlasu“ jako zálohy: smazala by i ownerův pokus na webu ElevenLabs. Log říká, čím se našlo, nebo co bylo vidět (počty, ne text).
const CEKANI_HISTORIE_MS = [2000, 3000, 5000, 8000, 12000, 20000];
async function smazHistorii(text: string, odUnix: number, reqId: string | null): Promise<void> {
  const hlavicky = { "xi-api-key": EL_API_KEY! };
  let videno = 0;
  try {
    for (let pokus = 0; pokus <= CEKANI_HISTORIE_MS.length; pokus++) {
      const r = await fetch(`https://api.elevenlabs.io/v1/history?voice_id=${EL_VOICE_ID}&date_after_unix=${odUnix}&page_size=50`,
        { headers: hlavicky });
      if (!r.ok) { console.warn(`EL history list ${r.status}: ${(await r.text()).slice(0, 200)}`); return; }
      const d: any = await r.json();
      const pol: any[] = d?.history || [];
      videno = pol.length;
      const podleId = reqId ? pol.find((h) => h?.request_id === reqId) : undefined;
      const naj = podleId || pol.find((h) => normalizuj(h?.text ?? "") === normalizuj(text));
      if (naj?.history_item_id) {
        const del = await fetch(`https://api.elevenlabs.io/v1/history/${naj.history_item_id}`, { method: "DELETE", headers: hlavicky });
        if (!del.ok) console.warn(`EL history delete ${del.status}: ${(await del.text()).slice(0, 200)}`);
        else console.log(`EL history deleted (match: ${podleId ? "request_id" : "text"}, try ${pokus + 1})`);
        return;
      }
      if (pokus < CEKANI_HISTORIE_MS.length) await new Promise((ok) => setTimeout(ok, CEKANI_HISTORIE_MS[pokus]));
    }
    console.warn(`EL history item not found — left in history (request-id ${reqId ? "present" : "missing"}, items of our voice since start: ${videno})`);
  } catch (e) {
    console.warn("EL history cleanup failed:", (e as Error).message);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    if (!EL_API_KEY) return json({ error: "ELEVENLABS_API_KEY not set" }, 500);

    // ── Auth (required — anonymous gets 401 below; until 2026-10-09 this said „optional“) ──
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let email = "";

    if (authHeader) {
      const { data: { user } } = await sb().auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) { userId = user.id; email = (user.email ?? "").toLowerCase(); }
    }

    // SECURITY: require a logged-in user. Visitor has only the static Rune Collection,
    // no live voice -> anonymous is rejected here before any ElevenLabs cost.
    if (!userId) return json({ error: "unauthorized" }, 401);

    // ── Rate limit: 5 req/60s per user ──
    const rlKey = `elevenlabs:user:${userId}`;
    const { data: allowed } = await sb().rpc("check_rate_limit", {
      p_key:            rlKey,
      p_window_seconds: 60,
      p_max_requests:   5,
    });
    if (!allowed) {
      return json({ error: "rate_limited", message: "Too many requests. Please wait a moment." }, 429);
    }

    // ── Parse body ──
    const body = await req.json().catch(() => ({}));
    const { reading_id, ticket, voice_text } = body ?? {};
    let lang: string = body?.lang === "is" ? "is" : "en";

    // ── K čemu hlas patří (2026-10-11, DECISIONS (61)) ──
    // Do té doby se přečetl JAKÝKOLI text do 3 000 znaků, 5× za minutu — „jedno čtení = jeden hlas“ hlídalo jen tlačítko v prohlížeči
    // a kdo poslal požadavek sám, spálil 6 000 kreditů ElevenLabs za minutu. Teď:
    //   1) uložené čtení: text z deníku (bez řádku ✦, jako appka), jednou; audio se uloží a další přehrání je zdarma,
    //   2) neuložené čtení: podpis z claude-proxy — přesně ten text, tomu uživateli, jednou,
    //   3) admin: text bez čtení (Teach ve shrine),
    //   jinak nic.
    let text: string | null = null;
    let zamek: string | null = null;    // id ve voice_tickets: „tohle už jednou zaznělo“ (admin bez zámku)
    let ulozit: string | null = null;   // cesta audia v úložišti (jen uložené čtení)
    if (typeof reading_id === "string" && UUID.test(reading_id)) {
      const { data: r } = await sb().from("readings")
        .select("id, lang, area, short_text, deep_text").eq("id", reading_id).eq("user_id", userId).maybeSingle();
      if (r) {
        // Zakládací Norny se nečtou nahlas — textový rituál, jeho bezplatnost stojí na tom, že se hlas nekoná (runar-reading.js).
        // Do 2026-10-11 to hlídalo jen skryté tlačítko („EL proxy o typu čtení neví“).
        const { data: pf } = await sb().from("user_profiles").select("founding_reading_id").eq("id", userId).maybeSingle();
        if (pf?.founding_reading_id === r.id) return json({ error: "voice_not_offered" }, 403);
        zamek  = "r:" + r.id;
        ulozit = `${userId}/${r.id}.mp3`;
        lang   = r.lang === "is" ? "is" : "en";
        text   = normalizuj(textKHlasu(r.area === "spread" ? r.deep_text : r.short_text));
        const { data: uz } = await sb().from("voice_tickets").select("path").eq("id", zamek).maybeSingle();
        if (uz) {
          // Už jednou zaznělo → pustit uložené (ElevenLabs nic nestojí, nic se nepočítá).
          if (uz.path) {
            const { data: u } = await sb().storage.from(BUCKET).createSignedUrl(uz.path, 3600);
            if (u?.signedUrl) return json({ audio_url: u.signedUrl, stored: true });
          }
          return json({ error: "voice_used" }, 409);
        }
      }
    }
    if (text === null && ticket) {
      const vt = typeof voice_text === "string" ? voice_text : "";
      const nonce = await over(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", ticket, userId, vt);
      if (!nonce) return json({ error: "voice_unbound" }, 403);
      zamek = "t:" + nonce;
      text  = normalizuj(vt);
    }
    if (text === null && ADMIN_EMAILS.includes(email) && typeof body?.text === "string") text = body.text;
    if (text === null) return json({ error: "voice_unbound" }, 403);
    if (!text) return json({ error: "text is required" }, 400);
    // Text is billed per character — clamp it. Longest legit narration (Yggdrasil) ~1661.
    if (text.length > 3000) return json({ error: "text too long" }, 400);

    // ── Měsíční strop — jen testeři (15, dokud jedeme Starter) ──
    // Čtené PŘED voláním ElevenLabs: když je vyčerpáno, nesmí se nic zaplatit. Započítává se až PO úspěšné odpovědi (níž) — když
    // ElevenLabs spadne, tester nemá přijít o hlas kvůli cizí chybě. Počítadlo se vede všem (statistika), strop jen testerům.
    const vKey = monthKey();
    const { data: vprof } = await sb()
      .from("user_profiles").select("voice_month_key, voice_month_count, is_tester")
      .eq("id", userId).maybeSingle();
    const vUsed = vprof?.voice_month_key === vKey ? (vprof?.voice_month_count ?? 0) : 0;
    if (vprof?.is_tester && vUsed >= VOICE_MONTHLY_LIMIT_TESTER) {
      return json({ error: "voice_monthly_limit", used: vUsed, limit: VOICE_MONTHLY_LIMIT_TESTER }, 429);
    }

    // lang determines model — NEVER trust frontend for voice/model selection. Model je potřeba už pro brzdu (kredity na znak).
    const resolvedModel = elModel(lang);

    // ── Brzda kreditů ElevenLabs (2026-10-11, DECISIONS (48): převod se smí vyčerpat, dobití ne) ──
    // Podle JEJICH počítadla (vidí i audio Kolekce a pokusy na webu EL), v kreditech. Pravidlo a důvod: brzdaHlasu v _shared/voice_usage.ts.
    // Stav nezjištěn → pustit (fail open); osobní strop výš platí dál.
    const kvota = await fetchQuota(EL_API_KEY);
    const brzda = brzdaHlasu(kvota, kredityHlasu(resolvedModel, text.length));
    if (!brzda.pustit) {
      console.warn(`voice brake: ${brzda.spotreba} + ${brzda.novych} > ${brzda.hladina}`);
      await saveQuota(sb(), kvota!, "brake");   // každé zastavení brzdou = snímek — owner to musí vidět (48)
      return json({ error: "voice_quota_rest", used: brzda.spotreba, safe: brzda.hladina }, 429);
    }
    if (brzda.hladina === null) console.error("ElevenLabs quota unknown — allowing voice (brake not checked)");

    // ── Zámek „jednou“ — PŘED voláním ElevenLabs: dvě souběžná ťuknutí nezaplatí hlas dvakrát. Selže-li ElevenLabs níž, zámek se
    // smaže (člověk o hlas nepřijde kvůli cizí chybě). Bez tabulky voice_tickets (SQL nespuštěno) radši nic než hlas bez hlídání.
    if (zamek) {
      const { error: zErr } = await sb().from("voice_tickets").insert({ id: zamek, user_id: userId });
      if (zErr) {
        if (zErr.code === "23505") return json({ error: "voice_used" }, 409);
        console.error("voice lock failed:", zErr.message);
        return json({ error: "voice_lock_failed" }, 500);
      }
    }
    const pustZamek = async () => { if (zamek) await sb().from("voice_tickets").delete().eq("id", zamek); };

    // ── Call ElevenLabs ──
    // Od kdy hledat položku historie ke smazání (smazHistorii). Rezerva 60 s (do 2026-10-14 jen 5 s) proti rozdílu hodin u ElevenLabs;
    // cizí položku nesmaže — hledá se podle request_id, záložně podle celého textu.
    const odUnix = Math.floor(Date.now() / 1000) - 60;
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key":   EL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: resolvedModel,
          voice_settings: EL_VOICE_SETTINGS,
        }),
      },
    ).catch(async (e) => { await pustZamek(); throw e; });

    if (!elRes.ok) {
      const err = await elRes.text();
      await pustZamek();
      return json({ error: `ElevenLabs ${elRes.status}: ${err}` }, 502);
    }
    const reqId = elRes.headers.get("request-id");   // ke smazání položky z historie (smazHistorii), 2026-10-14
    const buf = await elRes.arrayBuffer().catch(async (e) => { await pustZamek(); throw e; });

    // Zapocitat az ted — hlas se opravdu ozval. Server-owned sloupce, klient je psat nesmi.
    // Zapis se vedome NEHLIDA: kdyby selhal, clovek hlas uz dostal a shodit mu odpoved kvuli
    // ucetnictvi by bylo horsi nez o jeden nezapocitany hlas prijit.
    await sb().from("user_profiles")
      .update({ voice_month_key: vKey, voice_month_count: vUsed + 1 }).eq("id", userId);

    // Evidence hlasu (2026-09-25, handoff CODE-read): znaky × model × jazyk × uživatel — bez ní nejde hlas rozdělit na
    // admin / tester / uživatel ani ocenit podle modelu. Plus nejvýš jednou denně snímek stavu EL (od 2026-10-11, do té doby týdně —
    // DECISIONS (48), owner to musí vidět); uloží se stav, který proxy přečetla kvůli brzdě. Obojí jen loguje chyby, hlas už se ozval.
    await logVoice(sb(), { user_id: userId, source: "dynamic", lang: lang === "is" ? "is" : "en", model: resolvedModel, chars: text.length });
    await denniSnimek(sb(), kvota);

    // Convert to base64
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);

    // Hlas uloženého čtení se uloží — v deníku i ve čtení se pak pouští odsud a ElevenLabs už nic nestojí (DECISIONS (61)).
    // Když uložení selže, hlas člověk stejně dostal; zámek zůstane bez cesty (podruhé „voice_used“) — radši než platit znovu.
    if (ulozit && zamek) {
      const { error: upErr } = await sb().storage.from(BUCKET).upload(ulozit, bytes, { contentType: "audio/mpeg", upsert: true });
      if (upErr) console.error("voice store failed:", upErr.message);
      else await sb().from("voice_tickets").update({ path: ulozit }).eq("id", zamek);
    }

    // Položka z historie ElevenLabs pryč — na pozadí (EdgeRuntime.waitUntil), čtenář na hlas nečeká.
    const uklid = smazHistorii(text, odUnix, reqId);
    const er = (globalThis as any).EdgeRuntime;
    if (er?.waitUntil) er.waitUntil(uklid); else await uklid;

    return json({ audio_url: `data:audio/mpeg;base64,${b64}` });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
