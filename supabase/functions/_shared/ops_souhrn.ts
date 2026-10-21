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
};

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
};
export type Stav = "ok" | "problem" | "unknown";
export const KLICE = ["model", "voice_brake", "backup", "purge", "runs"] as const;

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
    runs: vadyBehu(h).length ? "problem" : Object.values(h.behy ?? {}).some((p) => p && p.kdy) ? "ok" : "unknown" };
}

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
};
export type Email = { subject: string; html: string; text: string; stav: string };

export function souhrn(d: Den): Email {
  const potreba: string[] = [];
  for (const k of KLICE) if (d.otevrene[k] === "problem") potreba.push(POPIS[k].problem + " — " + POPIS[k].co
    + (k === "backup" ? zalohaVeta(d.zaloha) : k === "purge" ? (d.vadyMazani.join("; ") || "see the next check.")
      : k === "runs" ? ((d.vadyBehu ?? []).join("; ") || "see the next check.") : ""));
  // 2026-10-14: jen nepřečtená (stav new) — první souhrn posílal ownera načítat hlášení, které session týž den uzavřela.
  if (d.neprectena) potreba.push(d.neprectena + " unread app report" + (d.neprectena > 1 ? "s" : "") + " — ask CODE to load " + (d.neprectena > 1 ? "them." : "it."));
  const doBrzdy = d.kredity && d.kredity.hladina != null ? d.kredity.hladina - d.kredity.spotreba : null;
  if (doBrzdy != null && d.kredity!.limit && doBrzdy < PRAHY.kredityMaloPodil * d.kredity!.limit)
    potreba.push("ElevenLabs: only " + cislo(doBrzdy) + " credits left before the voice brake.");
  if (d.bezCeny) potreba.push(d.bezCeny + " model call" + (d.bezCeny > 1 ? "s have" : " has") + " no price in MODEL_PRICES — cost below is incomplete.");
  // Jen když záloha ještě není hlášená jako problém — jinak by o ní stály dva řádky (souhrn 2026-10-15).
  if (!d.zaloha.posledniOk && d.otevrene.backup !== "problem") potreba.push("No database backup has reported yet — check the nightly backup task on the PC.");
  const problem = KLICE.some((k) => d.otevrene[k] === "problem");
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
  if (d.zaloha.posledniOk) cisla.push("Backup " + kdy(d.zaloha.posledniOk) + (d.zaloha.bajtu ? " · " + (d.zaloha.bajtu / 1e6).toFixed(1) + " MB" : ""));
  // Úlohy z BEHY na jednom řádku (2026-10-19). Den předtím jela zkouška obnovy na řádku zálohy, aby e-mail nenarostl; s aktualizací
  // Greyniru tam už nepatří — jeden řádek navíc, vždy (owner 2026-10-18: „je dobré vidět, že to proběhlo“).
  const behy = behyVeta(d.behy);
  if (behy) cisla.push("Checks " + behy);
  const nHlaseni = Object.values(d.hlaseni).reduce((a, b) => a + b, 0);
  if (nHlaseni || d.ulozeno) cisla.push("App reports (24 h) " + [nHlaseni ? seznam(d.hlaseni) : "", d.ulozeno ? "Keep " + d.ulozeno : ""]
    .filter(Boolean).join(" · "));
  // Registrace čekatelů (DECISIONS 2026-10-21 (7)): jen počet, adresy jen v Brevu; nula vynechaná jako ostatní čísla.
  if (d.cekatele) cisla.push("Waitlist +" + d.cekatele + " (24 h)");
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
