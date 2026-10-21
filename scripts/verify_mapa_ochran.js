// MAPA OCHRAN EDGE FUNKCÍ — každá edge funkce a každý mode claude-proxy má v mapě: kdo smí, limit velikosti, limit četnosti, co jde do logu,
// a VŠECHNY své ochrany (podmínky, po kterých vrátí 4xx), každou s popisem, co hlídá.
//
// Proč (CODE-read 2026-10-21, zadání ownera přes CODE-tune bod 2: „chci kontrolovat místa, kde můžou být chyby a nebyly kontrolované“):
// mutace ochran (scripts/mutace_ochran.py) ukázala, že vypnutí ochrany v edge funkci nepozná žádná z 21 kontrol, které funkce čtou —
// ani `if (!userId) return 401` v claude-proxy. Kontroly vznikaly z toho, na co už někdo narazil; ochrany samy nehlídalo nic.
// Kontrola padá, když:
//   (a) ochrana z mapy v kódu chybí nebo je změněná (vypnutá, obrácená, smazaná) — mutace ji tím zabije;
//   (b) v kódu je ochrana, která v mapě není — nová ochrana se musí zapsat (a tím rozmyslet), ne přibýt tiše;
//   (c) edge funkce nebo mode claude-proxy, který v mapě není — nový vstup bez rozmyšleného „kdo smí, kolik, jak často“ neprojde;
//   (d) položka mapy, ke které funkce / mode už neexistuje.
// Ochrana = řádek s `if (` a návratem 4xx: na témže řádku, nebo `if` nad návratem s menším odsazením (do 7 řádků). Totéž hledání bere
// mutace (`--ochrany` vypíše seznam jako JSON) — jedno místo.
// Co NEvidí: ochranu, která 4xx nevrací (CORS, ověření podpisu uvnitř helperu, RLS v DB, fail-open větve) — ty patří do popisu funkce
// (pole `pozn`), ne do `ochrany`. Pořadí „ochrana před prací“ hlídá verify_nic_pred_prihlasenim.js.
//   node scripts/verify_mapa_ochran.js            · --ochrany = JSON nalezených ochran (pro mutace)
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
const DIR = path.join(R, 'supabase', 'functions');

const POST = 'jen POST (OPTIONS vrací CORS výš)';
const PRIHL = 'brána přihlášení — bez platné relace 401';
const HLAV = 'bez hlavičky Authorization 401 (předstupeň brány)';
const ADMIN = 'jen admin (ADMIN_EMAILS, shodu kopií hlídá verify_admin_emails.js)';

const MAPA = {
  'claude-proxy': {
    kdo: 'přihlášený (Visitor 401); admin = premium + nástroje s eval:true mimo počítadlo',
    velikost: 'prompt 8000 znaků, Ask 12000 (MAX_PROMPT_CHARS); stín 120 kB (_shared/prompt_stin.mjs)',
    cetnost: '10 požadavků / 60 s na účet (check_rate_limit) · jedno účtované čtení naráz (acquire_reading_lock)',
    log: 'kódy chyb a stav modelu anglicky; text čtení ani otázka ne (ops_events jen druh, model, čísla)',
    pozn: 'fail-open vědomě: zámek, měsíční strop a precheck rituálu při výpadku DB čtení pustí (komentáře u kódu)',
    mody: {
      '(bez mode)': 'běžné čtení — účtuje se (kredit / měsíční jednotka / free)',
      ask: 'doplňující otázka k vlastnímu čtení — strop Asků na čtení, neúčtuje se',
      ceremonial: 'obřadní čtení (Yggdrasil) — účtuje se jako čtení',
      founding: 'založení stromu (Norny) — jednou, jen s životní runou',
      life_rune: 'čtení životní runy — jednou (trigger trg_life_rune_immutable)',
      life_rune_reset: 'reset životní runy — jen admin',
      name_lore: 'rozbor jména — strop NAME_LORE_LIMIT, admin bez stropu',
      resave: 'uložení hotového čtení bez volání modelu',
    },
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!prompt && mode !== "resave" && mode !== "life_rune_reset") return json({ error: "Missing prompt" }, 400);': 'prázdný prompt (kromě módů bez modelu)',
      'if (String(prompt ?? "").length > MAX_PROMPT_CHARS ||': 'limit velikosti promptu a systému — náklad modelu',
      'if (!userId) return json({ error: "unauthorized" }, 401);': PRIHL,
      'if (!allowed) {': 'rate limit 10/min na účet (fail-closed: chyba RPC = odmítnout)',
      'if (!isAdmin) {': 'life_rune_reset jen admin',
      'if (mode === "ask" && askLimit < 1) {': 'tier bez Asků',
      'if (used >= askLimit) {': 'strop Asků na jedno čtení',
      'if (!userId) {': 'rituál jen přihlášený (druhá pojistka uvnitř větve)',
      '} else if (isLifeRune && pr?.life_rune_text) {': 'životní runa jen jednou',
      '} else if (isFounding && !pr?.life_rune_text) {': 'založení až po životní runě — jinak Norny zdarma',
      '} else if (isFounding && pr?.tree_founded_at) {': 'založení jen jednou',
      'if (!nn) {': 'rozbor jména bez jména',
      'if (String(pr?.name_lore_for ?? "") === nn && !isAdmin) {': 'rozbor téhož jména podruhé',
      'if (cnt >= NAME_LORE_LIMIT && !isAdmin) {': 'strop rozborů jména',
      '} else if (!vzat) {': 'zámek: jedno účtované čtení naráz',
      'if (used + cost > limit) {': 'měsíční strop předplatného',
      'if (creditsBalance < cost) {': 'kredity Rune Seekera',
      'if (freeBalance <= 0) {': 'free zůstatek',
      'if (data?.error) return json({ error: data.error.message ?? "Claude error" }, 400);': 'chyba modelu → 400 (ne ochrana vstupu; předání chyby)',
    },
  },
  'delete-account': {
    kdo: 'přihlášený — maže jen sebe (id z relace, ne z těla)', velikost: '—', cetnost: '— (bez limitu; akce je jednorázová)',
    log: 'chyby anglicky bez e-mailu',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!authHeader) return json({ error: "Not authenticated" }, 401);': HLAV,
      'if (authErr || !user) return json({ error: "Invalid session" }, 401);': PRIHL,
    },
  },
  'elevenlabs-proxy': {
    kdo: 'přihlášený; text jen z vlastního čtení (reading_id + user_id), z podepsaného lístku claude-proxy, nebo admin',
    velikost: 'text 3000 znaků', cetnost: '5 / min na účet; každé čtení zazní jednou (voice_tickets); testeři měsíční strop; brzda kvóty EL',
    log: 'kódy a čísla; text ne',
    pozn: 'fail-open vědomě: neznámá kvóta EL hlas pustí (console.error)',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!userId) return json({ error: "unauthorized" }, 401);': PRIHL,
      'if (!allowed) {': 'rate limit 5/min na účet',
      'if (pf?.founding_reading_id === r.id) return json({ error: "voice_not_offered" }, 403);': 'zakládací Norny se nečtou nahlas',
      'if (uz) {': 'čtení už jednou zaznělo → uložené audio, jinak 409',
      'if (!nonce) return json({ error: "voice_unbound" }, 403);': 'podpis lístku nesedí na účet a text',
      'if (text === null) return json({ error: "voice_unbound" }, 403);': 'text bez vazby na čtení (ne admin)',
      'if (!text) return json({ error: "text is required" }, 400);': 'prázdný text',
      'if (text.length > 3000) return json({ error: "text too long" }, 400);': 'limit délky — náklad EL',
      'if (vprof?.is_tester && vUsed >= VOICE_MONTHLY_LIMIT_TESTER) {': 'měsíční strop hlasu testera',
      'if (!brzda.pustit) {': 'brzda kvóty ElevenLabs',
      'if (zErr.code === "23505") return json({ error: "voice_used" }, 409);': 'souběh: zámek voice_tickets už existuje',
    },
  },
  'elevenlabs-static': {
    kdo: 'jen admin', velikost: '—', cetnost: '— (admin)', log: 'chyby anglicky',
    ochrany: {
      "if (!authHeader) return new Response(JSON.stringify({ error: 'unauthorized' }),": HLAV,
      'if (!caller?.email || !ADMIN_EMAILS.includes(caller.email.toLowerCase()))': ADMIN,
      'if (!brzda.pustit) {': 'brzda kvóty ElevenLabs',
    },
  },
  'list-readings': {
    kdo: 'jen admin', velikost: '—', cetnost: '— (admin)', log: '—', pozn: 'jen čte (service role za bránou admina)',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!authHeader) return json({ error: "Not authenticated" }, 401);': HLAV,
      'if (authErr || !user) return json({ error: "Invalid session" }, 401);': PRIHL,
      'if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return json({ error: "Forbidden" }, 403);': ADMIN,
    },
  },
  'list-reports': {
    kdo: 'jen admin', velikost: '—', cetnost: '— (admin)', log: '—', pozn: 'čte hlášení a mění jejich stav',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!authHeader) return json({ error: "Not authenticated" }, 401);': HLAV,
      'if (authErr || !user) return json({ error: "Invalid session" }, 401);': PRIHL,
      'if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return json({ error: "Forbidden" }, 403);': ADMIN,
      'if (!id || !["new", "triaged", "fixed"].includes(status)) return json({ error: "Bad params" }, 400);': 'stav hlášení jen z povolené trojice',
    },
  },
  'ops-watch': {
    kdo: 'jen pg_cron s tajnou hlavičkou x-ops-secret (porovnání v konstantním čase)', velikost: '—', cetnost: 'plánovač (15 min, ráno)',
    log: 'jen počty a typy (RUNAR_PRIVACY.md)',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "method" }, 405);': POST,
      'if (!stejne(req.headers.get("x-ops-secret") ?? "", Deno.env.get("OPS_CRON_SECRET") ?? "")) return json({ error: "unauthorized" }, 401);': 'tajná hlavička plánovače',
    },
  },
  'redeem-code': {
    kdo: 'přihlášený', velikost: '—', cetnost: '5 pokusů / 15 min na IP (před přihlášením — proti hádání kódů)',
    log: 'chyby anglicky', pozn: 'limit jen na IP: kdo má víc IP, hádá rychleji — síla kódů rozhoduje (bod 4 zadání, neověřeno)',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!code?.trim()) return json({ error: "Missing code" }, 400);': 'prázdný kód',
      'if (!allowed) {': 'rate limit na IP (fail-closed)',
      'if (!authHeader) return json({ error: "Not authenticated" }, 401);': HLAV,
      'if (authErr || !user) return json({ error: "Invalid session" }, 401);': PRIHL,
      'if (fetchErr || !gift) return json({ error: "Code not found" }, 404);': 'neexistující kód',
      'if (gift.used_by || gift.used_at) return json({ error: "Code already used" }, 409);': 'použitý kód',
      'if (!markedRows || markedRows.length === 0) return json({ error: "Code already redeemed" }, 409);': 'souběh: kód mezitím uplatnil jiný (CAS)',
    },
  },
  'reset-tree': {
    kdo: 'přihlášený tester — resetuje jen sebe', velikost: '—', cetnost: '—', log: 'chyby anglicky',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!authHeader) return json({ error: "Not authenticated" }, 401);': HLAV,
      'if (authErr || !user) return json({ error: "Invalid session" }, 401);': PRIHL,
      'if (!prof?.is_tester) return json({ error: "reset is for tester accounts only" }, 403);': 'jen tester (is_tester)',
    },
  },
  'send-line': {
    kdo: 'přihlášený; adresa z relace, ne z těla', velikost: 'MAX_ZNAKU', cetnost: '3 / hodinu na účet',
    log: 'chyby anglicky bez adresy', pozn: 'rate limit fail-open: chyba RPC zprávu pustí (smi === false)',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "method" }, 405);': POST,
      'if (!user || !user.email) return json({ error: "not_authenticated" }, 401);': PRIHL,
      'if (!zprava) return json({ error: "empty" }, 400);': 'prázdná zpráva',
      'if (zprava.length > MAX_ZNAKU) return json({ error: "too_long" }, 400);': 'limit délky zprávy',
      'if (smi === false) return json({ error: "rate_limited" }, 429);': 'rate limit 3/h na účet',
    },
  },
  'voice-usage': {
    kdo: 'jen admin', velikost: '—', cetnost: '— (admin)', log: '—', pozn: 'zapisuje jen snímek kvóty',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);': POST,
      'if (!authHeader) return json({ error: "Not authenticated" }, 401);': HLAV,
      'if (authErr || !user) return json({ error: "Invalid session" }, 401);': PRIHL,
      'if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return json({ error: "Forbidden" }, 403);': ADMIN,
    },
  },
  'waitlist-join': {
    kdo: 'kdokoli (veřejný formulář webu) — přihlášení z principu nemá', velikost: 'e-mail 254 znaků',
    cetnost: '5 / 15 min na IP · táž adresa 2 / h (tichý úspěch) · celkem 12 / h ve dne, 3 / h v noci (503)',
    log: 'bez adresy i domény', pozn: 'u nás se nic neukládá (Brevo dvojí opt-in); IP limit fail-open při chybě RPC (allowed === false)',
    ochrany: {
      'if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);': POST,
      'if (!email || email.length > 254 || !EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);': 'tvar a délka e-mailu',
      'if (allowed === false) return json({ error: "rate_limited" }, 429);': 'rate limit na IP',
    },
  },
};

const norm = (s) => s.replace(/\s+/g, ' ').trim();

function ochranyVKodu() {
  const out = [];
  for (const fn of fs.readdirSync(DIR).sort()) {
    const f = path.join(DIR, fn, 'index.ts');
    if (fn.startsWith('_') || !fs.existsSync(f)) continue;
    const rr = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n').split('\n');
    const odsaz = (l) => l.match(/^\s*/)[0].length;
    const videno = new Set();
    rr.forEach((l, i) => {
      if (!/(json\(.*,\s*4\d\d\)\s*;?\s*$|\}\s*,\s*4\d\d\)\s*;?\s*$|status:\s*4\d\d)/.test(l)) return;
      for (let j = i; j >= Math.max(0, i - 7); j--) {
        if (!/\bif\s*\(/.test(rr[j])) continue;
        if (j !== i && odsaz(rr[j]) >= odsaz(l) && !/\bif\s*\(.*\)\s*return\b/.test(rr[j]) && !/^\s*if\s*\(.*[^{]\s*$/.test(rr[j])) continue;
        if (j !== i && odsaz(rr[j]) >= odsaz(l) && /\)\s*return\b/.test(rr[j])) continue;   // jiný jednořádkový if s vlastním návratem
        if (!videno.has(j)) { videno.add(j); out.push({ fn, radek: j + 1, text: norm(rr[j]) }); }
        break;
      }
    });
  }
  return out;
}

function modyVKodu() {
  const f = path.join(DIR, 'claude-proxy', 'index.ts');
  if (!fs.existsSync(f)) return [];
  return [...new Set([...fs.readFileSync(f, 'utf8').matchAll(/mode\s*[!=]==\s*"([a-z_]+)"/g)].map((m) => m[1]))].sort();
}

if (process.argv.includes('--ochrany')) { console.log(JSON.stringify(ochranyVKodu())); process.exit(0); }

const vady = [];
const nalezene = ochranyVKodu();
const funkce = fs.readdirSync(DIR).filter((fn) => !fn.startsWith('_') && fs.existsSync(path.join(DIR, fn, 'index.ts'))).sort();
for (const fn of funkce) if (!MAPA[fn]) vady.push(`FAIL  supabase/functions/${fn}/index.ts — funkce není v mapě (kdo smí, velikost, četnost, log, ochrany)`);
for (const fn of Object.keys(MAPA)) {
  if (!funkce.includes(fn)) { vady.push(`FAIL  scripts/verify_mapa_ochran.js — mapa jmenuje funkci ${fn}, která neexistuje`); continue; }
  const src = norm(fs.readFileSync(path.join(DIR, fn, 'index.ts'), 'utf8'));
  for (const k of Object.keys(MAPA[fn].ochrany))
    if (!src.includes(norm(k))) vady.push(`FAIL  supabase/functions/${fn}/index.ts — ochrana z mapy chybí nebo je změněná: ${k.slice(0, 100)} (${MAPA[fn].ochrany[k]})`);
}
for (const o of nalezene) {
  const m = MAPA[o.fn];
  if (m && !Object.keys(m.ochrany).some((k) => norm(k) === o.text))
    vady.push(`FAIL  supabase/functions/${o.fn}/index.ts:${o.radek} ochrana není v mapě: ${o.text.slice(0, 100)} — zapiš ji do MAPA s popisem`);
}
const mody = modyVKodu(), mapaMody = Object.keys((MAPA['claude-proxy'] || {}).mody || {}).filter((m) => m !== '(bez mode)');
for (const m of mody) if (!mapaMody.includes(m)) vady.push(`FAIL  supabase/functions/claude-proxy/index.ts — mode "${m}" není v mapě (kdo smí, účtuje se?)`);
for (const m of mapaMody) if (!mody.includes(m)) vady.push(`FAIL  scripts/verify_mapa_ochran.js — mapa jmenuje mode "${m}", který claude-proxy nezná`);

if (vady.length) {
  vady.forEach((v) => console.log(v));
  console.log(`FAIL  mapa ochran: ${vady.length} nález(ů)`);
  process.exit(1);
}
const n = Object.values(MAPA).reduce((a, m) => a + Object.keys(m.ochrany).length, 0);
console.log(`OK    mapa ochran: ${funkce.length} edge funkcí, ${mody.length} módů claude-proxy, ${n} ochran — všechny v kódu i v mapě`);
