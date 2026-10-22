// Hlídání provozu Rúnara — ČISTÉ funkce (bez sítě a DB): co je problém, ranní souhrn a okamžité upozornění jako e-mail.
// Proč (owner 2026-10-14, DECISIONS 2026-10-14 (12), (13)): místo Slacku (hlásil jen „přišlo hlášení“) dvě věci do runar@therunekeeper.com —
// okamžité upozornění, když se něco kazí, a jeden ranní souhrn. Owner: „dobře to v e-mailu uspořádá… bude to přehledné“. Proto: předmět
// řekne stav jedním slovem (OK / WATCH / PROBLEM), nahoře co potřebuje ownera, pod tím čísla. Texty EN (§31 — admini, společná řeč se Sigrún).
// Krátce (owner 2026-10-14 po zkušebním souhrnu: „maily nesmí zabírat moc místa. to myslím obecně.“, memory emaily-kratke): e-mail se vejde
// na jednu obrazovku telefonu — bez nadpisů a patičky (stav nese předmět, odesílatele jméno „Rúnar Ops“), čísla jen to, co nestojí
// v předmětu, jeden řádek na téma, nuly vynechané. Do té doby 14–16 řádků textu (nadpis, „Needs you“, tabulka devíti řádků, patička)
// i v klidný den. Délku hlídá smoke ㊈.
// Čisté funkce zvlášť, ať je smoke ㊈ (scripts/verify_ops_souhrn.js) protlačí známými daty (§19); síť a DB dělá ops-watch/index.ts.
// Upozornění jen při ZMĚNĚ stavu (ok → problem, problem → ok): upozornění, které chodí pořád, se přestane číst (owner: „žádný šum“).

// Prahy (2026-10-14). Historie událostí zatím není (tabulka ops_events vzniká týž den) — prahy přepočítat po 14 dnech provozu.
// Malý provoz (desítky čtení denně) → podíl sám skáče (1 z 5 = 20 %), proto vždy i absolutní minimum.
export const PRAHY = {
  chybModeluZaHodinu: 3,        // „The runes are quiet“ uživateli ≥ 3× za hodinu = problém
  zalohModeluZaHodinu: 3,       // přepnutí sol → Claude ≥ 3× za hodinu…
  podilZalohModelu: 0.3,        // …a zároveň ≥ 30 % pokusů
  zalohaDbMaxHodin: 26,         // noční záloha: bez úspěšné zálohy déle než 26 h = problém (pozná i zálohu, která vůbec neběžela)
  kredityMaloPodil: 0.1,        // do brzdy hlasu zbývá < 10 % tarifu = pozor v souhrnu
  kvotaPozor: 0.5,              // kvóta (KVOTY) od 50 % = řádek v „Needs you“ (WATCH)
  kvotaProblem: 0.8,            // od 80 % = stav „quota“ problem → upozornění e-mailem (jen při změně)
  chybAppkyZaHodinu: 10,        // chyby JS u uživatelů (client-error) ≥ 10 za hodinu = skok → upozornění (DECISIONS 2026-10-22 (11))
  domenaPozorDni: 60,           // doména vyprší do 60 dní = řádek v souhrnu (WATCH)
  domenaProblemDni: 14,         // do 14 dní = souhrn PROBLEM
};

// Domény a dostupnost (DECISIONS 2026-10-22 (11) bod 2). Proč: o vypršelé doméně nebo spadlém webu by nás dnes nic neupozornilo. Konec
// registrace z RDAP (veřejné, bez klíče; událost ověřena 2026-10-22: Verisign „expiration“ 2028-06-11, ISNIC „soft expiration“ 2027-10-16),
// čte ho ranní souhrn. Dostupnost čte kontrola po 15 min — nedostupnost pokryje DNS, certifikát i hosting najednou (lepší než číst data
// certifikátu; Let's Encrypt se obnovuje sám).
export const DOMENY = [
  { jmeno: "therunekeeper.com", rdap: "https://rdap.verisign.com/com/v1/domain/therunekeeper.com", udalost: "expiration" },
  { jmeno: "agndofa.is", rdap: "https://rdap.isnic.is/rdap/domain/agndofa.is", udalost: "soft expiration" },
];
// znacka: text, který skutečná stránka obsahuje (2026-10-22, nález CODE-read) — parkovací stránka registrátora po vypršení domény nebo cizí
// stránka vrátí 200 taky; samotný status by výpadek domény propustil. Změřeno: obě stránky „Rúnar“ obsahují, 404 GitHub Pages ne.
export const DOSTUPNOST = [
  { jmeno: "therunekeeper.com", url: "https://therunekeeper.com/", znacka: "Rúnar" },
  { jmeno: "app", url: "https://runar25.github.io/Runar-admin/v2/runar-reader.html", znacka: "Rúnar" },
];
export function stranaZije(status: number, text: string, znacka: string): boolean {
  return status >= 200 && status < 400 && text.indexOf(znacka) !== -1;
}
export const RDAP_BEZ_CTENI_DNI = 3;   // RDAP dané domény neodpovídá tolik dní po sobě = WATCH (jinak by šedý řádek visel navždy)

// Kvóty služeb, které jdou změřit strojem (owner 2026-10-22 „1. ano, schvaluji, připomínkou v souhrnu“, DECISIONS 2026-10-22 (6)). Proč: o
// přetažení egressu Supabase Free jsme se dozvěděli až z banneru. Limity = Supabase Free (supabase.com/pricing, čteno 2026-10-22: databáze
// 500 MB, soubory 1 GB) v desítkových jednotkách, tedy o kus přísněji. Čísla dodá SQL funkce public.ops_kvoty() (zdroj). Egress Supabase
// veřejné API neukazuje → pondělní připomínka v souhrnu (EGRESS_PRIPOMINKA). ElevenLabs hlídá brzda hlasu (kredity), modely stropy v konzolích.
// Brevo (e-maily) zatím ne: počet e-mailů je malý a pole odpovědi /v3/account nejsou ověřená naživo (BACKLOG).
export const KVOTY: Record<string, { kratce: string; limit: number; zdroj: string }> = {
  db: { kratce: "DB", limit: 500e6, zdroj: "sql/2026-10-22_kvoty.sql" },
  storage: { kratce: "storage", limit: 1e9, zdroj: "sql/2026-10-22_kvoty.sql" },
};
// Staré klíče Supabase (anon, service_role) končí „do konce roku 2026“ (supabase.com/docs/guides/api/api-keys, čteno 2026-10-22; přesné datum
// docs neuvádí) — krok 9 plánu infrastruktury. Odpočet v souhrnu od pozorOd, od problemOd stav souhrnu PROBLEM. Po výměně klíčů vymeneno: true.
export const KLICE_SUPABASE = { vymeneno: false, konec: "2026-12-31", pozorOd: "2026-11-01", problemOd: "2026-12-01" };
export const EGRESS_PRIPOMINKA = "Monday check: Supabase egress has no API — look at Usage in the Supabase dashboard (Free 5 GB).";

// Automatická mazání — JEDINÉ místo, kde stojí, co se kde samo maže (owner 2026-10-16: „chci vždy potvrzení, že úloha … proběhla, kde
// a co smazala. musíme mít kontroly! to platí pro všechna podobné příkazy“). Každý běh zapíše do ops_events událost kind „purge“
// { job, ok, deleted, items } — i když nesmazal nic: bez záznamu nejde poznat úlohu, která vůbec neběžela (táž past jako noční záloha
// 2026-10-12 až 15). Souhrn z nich skládá řádek „Deleted (24 h)“, stav „purge“ hlásí úlohu, která se v lhůtě neozvala nebo selhala.
// lhutaH = do kdy se má úloha znovu ozvat (běh + rezerva); null = maže se po každé události (hlas), hlídá se jen selhání.
// zdroj = soubor, který maže a zapisuje „purge“. Nová mazací úloha = řádek tady + zápis v jejím kódu; hlídá smoke (scripts/verify_mazani.js).
export const MAZANI: Record<string, { kratce: string; lhutaH: number | null; zdroj: string }> = {
  messages_db: { kratce: "messages DB", lhutaH: 26, zdroj: "sql/2026-10-16_mazani_hlasi.sql" },
  backups_pc: { kratce: "backups PC+Drive", lhutaH: 26, zdroj: "scripts/utils/zaloha_db.js" },
  gmail_messages: { kratce: "Gmail Messages", lhutaH: 8 * 24 + 2, zdroj: "scripts/utils/zpravy_gmail.js" },
  el_history: { kratce: "ElevenLabs", lhutaH: null, zdroj: "supabase/functions/elevenlabs-proxy/index.ts" },
  // 2026-10-18 (CODE-tune, na dotaz CODE-read): zkouška obnovy maže po sobě kopii produkce ve zkušebním projektu — nese skutečné osobní
  // údaje, takže „proběhlo a je pryč“ musí být vidět stejně jako u ostatních mazání. Běží jednou za 4 týdny → lhůta 35 dní.
  restore_copy: { kratce: "restore copy", lhutaH: 35 * 24, zdroj: "scripts/utils/obnova_db.js" },
  // 2026-10-22 (DECISIONS 2026-10-22 (10)): data, která jinak rostou bez konce — jedna denní funkce, tři úlohy, každá hlásí sama.
  cron_history: { kratce: "cron history", lhutaH: 26, zdroj: "sql/2026-10-22_mazani_provoz.sql" },
  ops_events: { kratce: "ops events", lhutaH: 26, zdroj: "sql/2026-10-22_mazani_provoz.sql" },
  reports_db: { kratce: "reports DB", lhutaH: 26, zdroj: "sql/2026-10-22_mazani_provoz.sql" },
};

// Pravidelné úlohy, které nic nemažou, ale je dobré vidět, že proběhly (owner 2026-10-18: „všechna a jakákoliv další důležité zálohy
// a cokoliv, co je třeba neviditelné, ale je dobré vidět, že to proběhlo, zapisovat emailem“). Klíč = kind v ops_events, detail
// { ok, chyba? }. Selhání nebo neozvání do lhutaH → stav „runs“ problem a e-mail; ranní souhrn je dá na řádek „Checks“. Nová úloha =
// řádek tady + zápis v jejím kódu (zdroj musí kind obsahovat — hlídá smoke ㊈).
export const BEHY: Record<string, { kratce: string; lhutaH: number; zdroj: string }> = {
  restore_test: { kratce: "restore test", lhutaH: 35 * 24, zdroj: "scripts/utils/obnova_db.js" },   // jednou za 4 týdny + týden rezerva
  // 2026-10-19: týdenní aktualizace GreynirCorrect (úloha Windows, neděle → pondělí 4:30). Ten den aktualizace rozbila nástroj a návrat
  // selhal — věděl to jen log na PC; kontroly islandštiny (§2) by tiše padaly. Týden + 2 h rezerva jako Gmail.
  greynir_update: { kratce: "Greynir update", lhutaH: 8 * 24 + 2, zdroj: "is-greynir.py" },
  // 2026-10-22 (DECISIONS 2026-10-22 (11) bod 3): nasazené edge funkce proti origin/main — pondělní krok noční zálohy; rozdíl = ok:false
  // s „Deployed ≠ repo: …“. Týden + 2 h rezerva jako Gmail.
  deploy_drift: { kratce: "deploy vs repo", lhutaH: 8 * 24 + 2, zdroj: "scripts/utils/nasazene_vs_repo.py" },
};
export type BehPosledni = { kdy: string | null; ok: boolean | null; chyba: string | null; info: string | null };
// Poslední záznam úlohy (kontrola každých 15 min) a součty za 24 h (ranní souhrn).
export type MazaniPosledni = { kdy: string | null; ok: boolean | null; chyba: string | null };
export type MazaniDen = { behu: number; smazano: number; polozky: string[]; chyb: number; posledni: string | null };

export type Kredity = { spotreba: number; hladina: number | null; limit: number | null; reset: string | null };
export type Zaloha = { posledniOk: string | null; bajtu: number | null; posledniChyba: string | null };

// Vstup kontroly (každých 15 min) — počty za poslední hodinu a stav zálohy.
export type Hlidka = {
  ted: string;
  chybModelu60: number; zalohModelu60: number; cteni60: number;
  brzd60: number;
  zaloha: Zaloha;
  mazani: Record<string, MazaniPosledni>;      // poslední záznam „purge“ každé úlohy z MAZANI
  behy?: Record<string, BehPosledni>;          // poslední záznam každé úlohy z BEHY
  zpravyPoLhute: number;                        // zprávy čtenářů v DB déle než 6 měsíců + 2 dny po poslední odpovědi (nezávislá kontrola výsledku)
  kvoty?: Record<string, number | null>;       // bajty podle KVOTY (public.ops_kvoty); null = funkce ještě není / selhala
  chybAppky60?: number;                        // chyby JS u uživatelů za hodinu (ops_events client_error)
  nedostupne?: string[];                       // DOSTUPNOST.jmeno, které neodpověděly (2 pokusy); undefined = nekontrolováno
};
export type Stav = "ok" | "problem" | "unknown";
export const KLICE = ["model", "voice_brake", "backup", "purge", "runs", "quota", "app_errors", "uptime"] as const;

export function stavy(h: Hlidka): Record<string, Stav> {
  const pokusy = Math.max(1, h.cteni60 + h.chybModelu60);
  const model = h.chybModelu60 >= PRAHY.chybModeluZaHodinu
    || (h.zalohModelu60 >= PRAHY.zalohModeluZaHodinu && h.zalohModelu60 / pokusy >= PRAHY.podilZalohModelu);
  // unknown jen bez jakéhokoli záznamu (po nasazení ještě žádná záloha neběžela — bez poplachu); chyba bez předchozího úspěchu = problem.
  // (Do 2026-10-15 tu stálo „dokud záloha nezapsala první úspěch, nehlásí se nic“ — opak kódu; CODE-read podle toho usoudila, že pád
  // zálohy v 00:38 prošel tiše, ač upozornění v 00:45 odešlo.)
  let backup: Stav = "unknown";
  if (h.zaloha.posledniOk) {
    const hodin = (Date.parse(h.ted) - Date.parse(h.zaloha.posledniOk)) / 3.6e6;
    const chybaPo = h.zaloha.posledniChyba && Date.parse(h.zaloha.posledniChyba) > Date.parse(h.zaloha.posledniOk);
    backup = hodin > PRAHY.zalohaDbMaxHodin || chybaPo ? "problem" : "ok";
  } else if (h.zaloha.posledniChyba) backup = "problem";
  return { model: model ? "problem" : "ok", voice_brake: h.brzd60 > 0 ? "problem" : "ok", backup, purge: stavMazani(h, backup),
    runs: vadyBehu(h).length ? "problem" : Object.values(h.behy ?? {}).some((p) => p && p.kdy) ? "ok" : "unknown",
    quota: kvotyNad(h.kvoty, PRAHY.kvotaProblem).length ? "problem" : Object.values(h.kvoty ?? {}).some((v) => v != null) ? "ok" : "unknown",
    app_errors: (h.chybAppky60 ?? 0) >= PRAHY.chybAppkyZaHodinu ? "problem" : "ok",
    uptime: h.nedostupne === undefined ? "unknown" : h.nedostupne.length ? "problem" : "ok" };
}

// Kvóty nad podílem: [„DB 410 MB of 500 MB (82 %)“, …]. Neznámé číslo (null) se přeskočí — bez poplachu, dokud SQL funkce není.
export function kvotyNad(kv: Record<string, number | null> | undefined, podil: number): string[] {
  return Object.entries(KVOTY).filter(([k, q]) => kv?.[k] != null && kv[k]! / q.limit >= podil)
    .map(([k, q]) => q.kratce + " " + mb(kv![k]!) + " of " + mb(q.limit) + " (" + Math.round(100 * kv![k]! / q.limit) + " %)");
}
function mb(b: number): string { return b >= 1e9 ? (b / 1e9).toFixed(b % 1e9 ? 1 : 0) + " GB" : Math.round(b / 1e6) + " MB"; }

// Co je s úlohami z BEHY špatně — stejné pravidlo jako u mazání: bez záznamu nic (ještě neběžela), pak selhání nebo neozvání do lhůty.
export function vadyBehu(h: Hlidka): string[] {
  const vady: string[] = [];
  for (const [kind, b] of Object.entries(BEHY)) {
    const p = h.behy?.[kind];
    if (!p || !p.kdy) continue;
    const jm = b.kratce.charAt(0).toUpperCase() + b.kratce.slice(1);
    if (p.ok === false) vady.push(jm + ": last run failed at " + kdy(p.kdy) + (p.chyba ? " (" + p.chyba + ")" : ""));
    else if ((Date.parse(h.ted) - Date.parse(p.kdy)) / 3.6e6 > b.lhutaH) vady.push(jm + ": no report since " + kdy(p.kdy));
  }
  return vady;
}
// Úlohy z BEHY do ranního souhrnu: „restore test OK 2026-10-18 (9/9)“ · „… FAILED 2026-10-18“ · „… no run yet“.
export function behyVeta(behy: Record<string, BehPosledni> | undefined): string {
  return Object.entries(BEHY).map(([kind, b]) => {
    const p = behy?.[kind];
    if (!p || !p.kdy) return b.kratce + " no run yet";
    return b.kratce + (p.ok === false ? " FAILED " : " OK ") + p.kdy.slice(0, 10) + (p.info ? " (" + p.info + ")" : "");
  }).join(" · ");
}

// Co je s mazacími úlohami špatně (prázdné = nic). Úloha bez jediného záznamu se nehlásí (po nasazení ještě neběžela — jako záloha);
// po prvním záznamu je problém: poslední běh selhal, nebo se neozvala déle než lhutaH. Staré zálohy se mažou jen po úspěšné záloze —
// když je problém se zálohou, neozvání „backups PC“ se nehlásí podruhé (tatáž příčina, jeden řádek).
export function vadyMazani(h: Hlidka, backup: Stav): string[] {
  const vady: string[] = [];
  for (const [job, m] of Object.entries(MAZANI)) {
    const p = h.mazani?.[job];
    if (!p || !p.kdy) continue;
    if (p.ok === false) vady.push(m.kratce + ": last run failed at " + kdy(p.kdy) + (p.chyba ? " (" + p.chyba + ")" : ""));
    else if (m.lhutaH != null && (Date.parse(h.ted) - Date.parse(p.kdy)) / 3.6e6 > m.lhutaH && !(job === "backups_pc" && backup === "problem"))
      vady.push(m.kratce + ": no report since " + kdy(p.kdy));
  }
  if (h.zpravyPoLhute > 0) vady.push(h.zpravyPoLhute + " reader message" + (h.zpravyPoLhute > 1 ? "s are" : " is") + " still in the database past 6 months");
  return vady;
}
function stavMazani(h: Hlidka, backup: Stav): Stav {
  if (vadyMazani(h, backup).length) return "problem";
  return Object.values(h.mazani ?? {}).some((p) => p && p.kdy) ? "ok" : "unknown";
}

const POPIS: Record<string, { problem: string; resolved: string; co: string }> = {
  model: {
    problem: "Reading model is failing",
    resolved: "Reading model is working again",
    co: "readers may see “The runes are quiet”; check the claude-proxy logs in Supabase.",
  },
  voice_brake: {
    problem: "Voice hit the ElevenLabs credit brake",
    resolved: "Voice brake released",
    co: "read-aloud is paused until credits are topped up or the ElevenLabs cycle resets.",
  },
  purge: {
    problem: "A deletion job failed or did not report",
    resolved: "Deletion jobs reporting again",
    co: "",   // co přesně, řekne vadyMazani() (která úloha a od kdy)
  },
  backup: {
    problem: "Database backup missing or failed",
    resolved: "Database backup OK again",
    co: "check the backup task and its log on the PC.",   // co přesně se stalo, řekne zalohaVeta() (2026-10-15)
  },
  runs: {
    problem: "A scheduled check failed or did not report",
    resolved: "Scheduled checks reporting again",
    co: "",   // která a od kdy, řekne vadyBehu()
  },
  quota: {
    problem: "Supabase Free limit nearly used",
    resolved: "Supabase usage back under 80 %",
    co: "free space (old data, files) or move to the Pro plan before the limit is hit.",   // která kvóta a kolik, řekne kvotyNad()
  },
  app_errors: {
    problem: "App errors are piling up in readers' browsers",
    resolved: "App errors back to normal",
    co: "something in the app is breaking for readers; the most frequent errors are in the morning digest (ops_events client_error).",
  },
  uptime: {
    problem: "Website or app not reachable",
    resolved: "Website and app reachable again",
    co: "check hosting (GitHub Pages), the domain and its certificate.",
  },
};

// Změny stavu → jeden e-mail (víc změn najednou = jeden e-mail). Bez změny → null (nic se neposílá).
export function upozorneni(predtim: Record<string, Stav>, ted: Record<string, Stav>, h: Hlidka): Email | null {
  const nove: string[] = [], vyresene: string[] = [];
  for (const k of KLICE) {
    if (ted[k] === "problem" && predtim[k] !== "problem") nove.push(k);
    if (ted[k] === "ok" && predtim[k] === "problem") vyresene.push(k);
  }
  if (!nove.length && !vyresene.length) return null;
  const slovo = nove.length ? "PROBLEM" : "RESOLVED";
  const subject = "Rúnar Ops · " + slovo + " · " + (nove.length ? nove : vyresene).map((k) => POPIS[k][nove.length ? "problem" : "resolved"]).join(" · ");
  const radky: string[] = [];
  for (const k of nove) radky.push(POPIS[k].problem + " — " + POPIS[k].co + detail(k, h));
  for (const k of vyresene) radky.push(POPIS[k].resolved + ".");
  return obal(subject, slovo, radky, []);
}

function detail(k: string, h: Hlidka): string {
  if (k === "model") return " Last hour: " + h.chybModelu60 + " failed, " + h.zalohModelu60 + " fell back to Claude, " + h.cteni60 + " readings saved.";
  if (k === "backup") return zalohaVeta(h.zaloha);
  if (k === "purge") return " " + vadyMazani(h, stavy(h).backup).join("; ") + ".";
  if (k === "runs") return " " + vadyBehu(h).join("; ") + ".";
  if (k === "quota") return " " + kvotyNad(h.kvoty, PRAHY.kvotaProblem).join("; ") + ".";
  if (k === "app_errors") return " Last hour: " + (h.chybAppky60 ?? 0) + " errors.";
  if (k === "uptime") return " Not answering: " + (h.nedostupne ?? []).join(", ") + ".";
  return "";
}

// Co se zálohou je: poslední pokus selhal (a kdy), nebo kdy byl poslední úspěch. Proč (2026-10-15): text „no successful nightly backup
// in the last 26 h“ stál i u zálohy, která v 00:38 běžela a selhala — owner z něj usoudil, že vinu má noční restart počítače.
function zalohaVeta(z: Zaloha): string {
  const chybaPo = !!z.posledniChyba && (!z.posledniOk || Date.parse(z.posledniChyba) > Date.parse(z.posledniOk));
  return chybaPo ? " Last attempt failed at " + kdy(z.posledniChyba!) + "."
    : " Last successful backup: " + (z.posledniOk ? kdy(z.posledniOk) : "none recorded") + ".";
}

// Vstup ranního souhrnu — posledních 24 h (počítá ops-watch/index.ts z DB).
export type Den = {
  od: string; do: string;
  cteni: number; spready: number; asky: number;
  modely: Record<string, number>;              // usage.model × počet (čtení i Asky)
  cenaModelu: number; bezCeny: number;          // USD; volání, jejichž model nemá cenu v MODEL_PRICES
  hlasy: number; znakyHlasu: number; cenaHlasu: number;
  hlaseni: Record<string, number>;             // hlášení z appky za 24 h podle typu, bez „keep“ (jen čísla)
  neprectena: number;                          // hlášení ve stavu new (nikdo je nenačetl), bez „keep“ — jen tohle jde do „Needs you“
  ulozeno: number;                              // ✦ Keep — uložené věty, ne problém
  chybModelu: number; zalohModelu: number; brzd: number;
  kredity: Kredity | null;
  zaloha: Zaloha;
  otevrene: Record<string, Stav>;               // stav upozornění teď (ops_alert_state)
  mazani: Record<string, MazaniDen>;           // „purge“ za 24 h podle úlohy (+ poslední běh vůbec)
  vadyMazani: string[];                        // vadyMazani() z kontroly — do „Needs you“, když je stav purge problem
  behy?: Record<string, BehPosledni>;          // poslední běh úloh z BEHY (z kontroly)
  vadyBehu?: string[];                         // vadyBehu() z kontroly — do „Needs you“, když je stav runs problem
  cekatele?: number;                           // nové registrace čekatelů za 24 h (ops_events waitlist_signup, bez adres) — 2026-10-21 (7)
  kvoty?: Record<string, number | null>;       // z kontroly (KVOTY) — 2026-10-22
  chybyAppky?: { pocet: number; top: [string, number][] };   // chyby JS u uživatelů za 24 h: počet a nejčastější („text (soubor:řádek)“, kolikrát)
  domeny?: Record<string, string | null>;      // konec registrace z RDAP (ISO), null = dotaz selhal; undefined = nečteno
  domenyNaposledy?: Record<string, string | null>;   // u selhaného dotazu: kdy RDAP té domény naposledy odpověděl (ops_events rdap_ok); null = nikdy
};
export type Email = { subject: string; html: string; text: string; stav: string };

export function souhrn(d: Den): Email {
  const potreba: string[] = [];
  for (const k of KLICE) if (d.otevrene[k] === "problem") potreba.push(POPIS[k].problem + " — " + POPIS[k].co
    + (k === "backup" ? zalohaVeta(d.zaloha) : k === "purge" ? (d.vadyMazani.join("; ") || "see the next check.")
      : k === "runs" ? ((d.vadyBehu ?? []).join("; ") || "see the next check.")
      : k === "quota" ? kvotyNad(d.kvoty, PRAHY.kvotaProblem).join("; ") + "." : ""));
  // Kvóty 50–80 % (nad 80 % už stojí výš jako problém) · odpočet starých klíčů Supabase · pondělní připomínka egressu (2026-10-22)
  if (d.otevrene.quota !== "problem") { const nad = kvotyNad(d.kvoty, PRAHY.kvotaPozor); if (nad.length) potreba.push("Supabase Free: " + nad.join("; ") + "."); }
  const dnes = d.do.slice(0, 10);
  const klicePozde = !KLICE_SUPABASE.vymeneno && dnes >= KLICE_SUPABASE.problemOd;
  // Domény (RDAP): pod 60 dní řádek, pod 14 dní PROBLEM; selhaný dotaz jen šedě mezi čísly (veřejné RDAP občas neodpoví)
  let domenaPozde = false;
  const domenySelhaly: string[] = [];
  for (const dm of DOMENY) {
    const iso = d.domeny?.[dm.jmeno];
    if (iso === undefined) continue;
    if (iso === null) {
      domenySelhaly.push(dm.jmeno);
      const nap = d.domenyNaposledy?.[dm.jmeno];
      const dniBez = nap ? Math.floor((Date.parse(d.do) - Date.parse(nap)) / 864e5) : null;
      if (dniBez != null && dniBez >= RDAP_BEZ_CTENI_DNI)
        potreba.push("Domain " + dm.jmeno + ": expiry not checked for " + dniBez + " days — the RDAP lookup keeps failing; check the date by hand.");
      continue;
    }
    const dni = Math.floor((Date.parse(iso) - Date.parse(d.do)) / 864e5);
    if (dni <= PRAHY.domenaProblemDni) domenaPozde = true;
    if (dni <= PRAHY.domenaPozorDni) potreba.push("Domain " + dm.jmeno + " expires " + iso.slice(0, 10) + " (" + dni + " days) — renew it.");
  }
  if (!KLICE_SUPABASE.vymeneno && dnes >= KLICE_SUPABASE.pozorOd)
    potreba.push("Supabase legacy API keys end by " + KLICE_SUPABASE.konec + " (" + Math.ceil((Date.parse(KLICE_SUPABASE.konec + "T23:59:59Z") - Date.parse(d.do)) / 864e5)
      + " days) — swap them (infrastructure plan, step 9).");
  if (new Date(d.do).getUTCDay() === 1) potreba.push(EGRESS_PRIPOMINKA);
  // 2026-10-14: jen nepřečtená (stav new) — první souhrn posílal ownera načítat hlášení, které session týž den uzavřela.
  if (d.neprectena) potreba.push(d.neprectena + " unread app report" + (d.neprectena > 1 ? "s" : "") + " — ask CODE to load " + (d.neprectena > 1 ? "them." : "it."));
  const doBrzdy = d.kredity && d.kredity.hladina != null ? d.kredity.hladina - d.kredity.spotreba : null;
  if (doBrzdy != null && d.kredity!.limit && doBrzdy < PRAHY.kredityMaloPodil * d.kredity!.limit)
    potreba.push("ElevenLabs: only " + cislo(doBrzdy) + " credits left before the voice brake.");
  if (d.bezCeny) potreba.push(d.bezCeny + " model call" + (d.bezCeny > 1 ? "s have" : " has") + " no price in MODEL_PRICES — cost below is incomplete.");
  // Jen když záloha ještě není hlášená jako problém — jinak by o ní stály dva řádky (souhrn 2026-10-15).
  if (!d.zaloha.posledniOk && d.otevrene.backup !== "problem") potreba.push("No database backup has reported yet — check the nightly backup task on the PC.");
  const problem = KLICE.some((k) => d.otevrene[k] === "problem") || klicePozde || domenaPozde;
  const stav = problem ? "PROBLEM" : (potreba.length || d.chybModelu || d.zalohModelu || d.brzd ? "WATCH" : "OK");

  const celkem = d.cenaModelu + d.cenaHlasu;
  const subject = "Rúnar Ops · " + stav + " · " + d.cteni + " reading" + (d.cteni === 1 ? "" : "s") + " · " + d.hlasy + " voice"
    + (d.hlasy === 1 ? "" : "s") + " · $" + celkem.toFixed(2);
  // Čísla jen to, co nestojí v předmětu, jeden řádek na téma, nuly vynechané (owner 2026-10-14: „maily nesmí zabírat moc místa“).
  // Záloha bez záznamu tu není — tu už hlásí řádek nahoře.
  const cisla: string[] = [];
  const model = [seznam(d.modely) ? "Models " + seznam(d.modely) : "", d.asky ? "Asks " + d.asky : "", d.spready ? "spreads " + d.spready : "",
    d.zalohModelu ? "fallbacks " + d.zalohModelu : "", d.chybModelu ? "failures " + d.chybModelu : ""].filter(Boolean).join(" · ");
  if (model) cisla.push(model);
  const cena = [d.cenaModelu ? "models $" + d.cenaModelu.toFixed(2) : "",
    d.cenaHlasu ? "voice $" + d.cenaHlasu.toFixed(2) + (d.znakyHlasu ? " (" + cislo(d.znakyHlasu) + " characters)" : "") : ""].filter(Boolean);
  if (cena.length) cisla.push("Cost " + cena.join(" + "));
  cisla.push((d.kredity ? "ElevenLabs " + cislo(d.kredity.spotreba) + (d.kredity.limit ? " of " + cislo(d.kredity.limit) : "") + " used"
    + (doBrzdy != null ? " · " + cislo(doBrzdy) + " to the brake" : "") + (d.kredity.reset ? " · resets " + d.kredity.reset.slice(0, 10) : "")
    : "ElevenLabs status unavailable") + (d.brzd ? " · brake hits " + d.brzd : ""));
  // Kvóty na řádku zálohy (velikost DB patří k záloze; vlastní řádek by e-mail prodloužil — ㊈)
  const kv = Object.entries(KVOTY).filter(([k]) => d.kvoty?.[k] != null).map(([k, q]) => q.kratce + " " + mb(d.kvoty![k]!) + " of " + mb(q.limit)).join(" · ");
  if (d.zaloha.posledniOk || kv) cisla.push([d.zaloha.posledniOk ? "Backup " + kdy(d.zaloha.posledniOk) + (d.zaloha.bajtu ? " · " + (d.zaloha.bajtu / 1e6).toFixed(1) + " MB" : "") : "",
    kv ? "Supabase " + kv : ""].filter(Boolean).join(" · "));
  // Úlohy z BEHY na jednom řádku (2026-10-19). Den předtím jela zkouška obnovy na řádku zálohy, aby e-mail nenarostl; s aktualizací
  // Greyniru tam už nepatří — jeden řádek navíc, vždy (owner 2026-10-18: „je dobré vidět, že to proběhlo“).
  const behy = behyVeta(d.behy);
  if (behy) cisla.push("Checks " + behy);
  const nHlaseni = Object.values(d.hlaseni).reduce((a, b) => a + b, 0);
  if (nHlaseni || d.ulozeno) cisla.push("App reports (24 h) " + [nHlaseni ? seznam(d.hlaseni) : "", d.ulozeno ? "Keep " + d.ulozeno : ""]
    .filter(Boolean).join(" · "));
  // Registrace čekatelů (DECISIONS 2026-10-21 (7)): jen počet, adresy jen v Brevu; nula vynechaná jako ostatní čísla.
  if (d.cekatele) cisla.push("Waitlist +" + d.cekatele + " (24 h)");
  // Chyby appky u uživatelů (DECISIONS 2026-10-22 (11)): počet a nejčastější 3, nula vynechaná
  if (d.chybyAppky && d.chybyAppky.pocet) cisla.push("App errors (24 h) " + d.chybyAppky.pocet + " · "
    + d.chybyAppky.top.slice(0, 3).map(([m, n]) => (m.length > 60 ? m.slice(0, 59) + "…" : m) + " ×" + n).join("; "));
  if (domenySelhaly.length) cisla.push("Domain lookup failed: " + domenySelhaly.join(", "));
  cisla.push(mazaniVeta(d.mazani));
  return obal(subject, stav, potreba, cisla);
}

// Řádek „Deleted (24 h)“ — VŽDY, i s nulami (owner 2026-10-16: „chci vždy potvrzení, že úloha … proběhla, kde a co smazala“). Vědomá
// výjimka z memory emaily-kratke („nuly vynechat“): nula tu nese zprávu „proběhla, nebylo co mazat“, „no run“ = neproběhla.
// Kde = krátký název úlohy z MAZANI, co = počet a nejvýš 3 položky (id zpráv, názvy archivů — žádné texty ani adresy).
// Úloha, která za 24 h neběžela: týdenní napíše poslední běh, denní „no run“, hlas (lhutaH null) nulu — maže jen, když se čte nahlas.
export function mazaniVeta(mz: Record<string, MazaniDen>): string {
  const casti = Object.entries(MAZANI).map(([job, m]) => {
    const s = mz?.[job];
    if (!s || !s.behu) {
      if (m.lhutaH == null) return m.kratce + " 0";
      if (m.lhutaH > 26) return m.kratce + (s && s.posledni ? " last run " + s.posledni.slice(0, 10) : " no run yet");
      return m.kratce + (s && s.posledni ? " no run" : " no run yet");
    }
    const pol = s.polozky.length ? " (" + s.polozky.slice(0, 3).join(", ") + (s.polozky.length > 3 ? ", …" : "") + ")" : "";
    return m.kratce + " " + s.smazano + pol + (s.chyb ? ", " + s.chyb + " failed" : "");
  });
  return "Deleted (24 h) " + casti.join(" · ");
}

function seznam(o: Record<string, number>): string {
  return Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + " " + n).join(", ");
}
function cislo(n: number): string { return Math.round(n).toLocaleString("en-US"); }
function kdy(iso: string): string { return iso.slice(0, 16).replace("T", " ") + " UTC"; }
function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const BARVA: Record<string, string> = { OK: "#1e7e34", WATCH: "#a46a21", PROBLEM: "#b3261e", RESOLVED: "#1e7e34" };

// Tělo: nahoře co potřebuje ownera (barva podle stavu), pod ním čísla šedě — žádný nadpis, tabulka ani patička (2026-10-14).
function obal(subject: string, stav: string, potreba: string[], cisla: string[]): Email {
  const nahore = potreba.length ? potreba.map((r) => (potreba.length > 1 ? "• " : "") + r) : ["Nothing needs you."];
  const html = '<div style="font:14px/1.45 Arial,Helvetica,sans-serif;color:' + (potreba.length ? BARVA[stav] || "#1f1f1f" : "#1f1f1f") + '">'
    + nahore.map(esc).join("<br>") + "</div>"
    + (cisla.length ? '<div style="font:13px/1.45 Arial,Helvetica,sans-serif;color:#555;margin-top:8px">' + cisla.map(esc).join("<br>") + "</div>" : "");
  const text = nahore.join("\n") + (cisla.length ? "\n\n" + cisla.join("\n") : "");
  return { subject, html, text, stav };
}
