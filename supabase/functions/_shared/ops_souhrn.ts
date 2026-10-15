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

export type Kredity = { spotreba: number; hladina: number | null; limit: number | null; reset: string | null };
export type Zaloha = { posledniOk: string | null; bajtu: number | null; posledniChyba: string | null };

// Vstup kontroly (každých 15 min) — počty za poslední hodinu a stav zálohy.
export type Hlidka = {
  ted: string;
  chybModelu60: number; zalohModelu60: number; cteni60: number;
  brzd60: number;
  zaloha: Zaloha;
};
export type Stav = "ok" | "problem" | "unknown";
export const KLICE = ["model", "voice_brake", "backup"] as const;

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
  return { model: model ? "problem" : "ok", voice_brake: h.brzd60 > 0 ? "problem" : "ok", backup };
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
  backup: {
    problem: "Database backup missing or failed",
    resolved: "Database backup OK again",
    co: "check the backup task and its log on the PC.",   // co přesně se stalo, řekne zalohaVeta() (2026-10-15)
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
};
export type Email = { subject: string; html: string; text: string; stav: string };

export function souhrn(d: Den): Email {
  const potreba: string[] = [];
  for (const k of KLICE) if (d.otevrene[k] === "problem") potreba.push(POPIS[k].problem + " — " + POPIS[k].co + (k === "backup" ? zalohaVeta(d.zaloha) : ""));
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
  const nHlaseni = Object.values(d.hlaseni).reduce((a, b) => a + b, 0);
  if (nHlaseni || d.ulozeno) cisla.push("App reports (24 h) " + [nHlaseni ? seznam(d.hlaseni) : "", d.ulozeno ? "Keep " + d.ulozeno : ""]
    .filter(Boolean).join(" · "));
  return obal(subject, stav, potreba, cisla);
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
