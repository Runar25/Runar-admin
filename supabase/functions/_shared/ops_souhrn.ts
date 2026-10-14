// Hlídání provozu Rúnara — ČISTÉ funkce (bez sítě a DB): co je problém, ranní souhrn a okamžité upozornění jako e-mail.
// Proč (owner 2026-10-14, DECISIONS 2026-10-14 (12), (13)): místo Slacku (hlásil jen „přišlo hlášení“) dvě věci do runar@therunekeeper.com —
// okamžité upozornění, když se něco kazí, a jeden ranní souhrn. Owner: „dobře to v e-mailu uspořádá… bude to přehledné“. Proto: předmět
// řekne stav jedním slovem (OK / WATCH / PROBLEM), nahoře „Needs you“, pod tím čísla. Texty EN (§31 — admini, společná řeč se Sigrún).
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
  let backup: Stav = "unknown";   // dokud záloha nezapsala první úspěch, nehlásí se nic (jinak by po nasazení hned přišel poplach)
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
    co: "Readers see “The runes are quiet” or readings fall back to Claude. Check the claude-proxy logs in Supabase.",
  },
  voice_brake: {
    problem: "Voice hit the ElevenLabs credit brake",
    resolved: "Voice brake released",
    co: "Read-aloud is paused until credits are topped up or the ElevenLabs cycle resets.",
  },
  backup: {
    problem: "Database backup missing or failed",
    resolved: "Database backup OK again",
    co: "No successful nightly backup in the last " + PRAHY.zalohaDbMaxHodin + " h. Check the backup task on the PC.",
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
  for (const k of nove) radky.push("PROBLEM — " + POPIS[k].problem + ". " + POPIS[k].co + detail(k, h));
  for (const k of vyresene) radky.push("RESOLVED — " + POPIS[k].resolved + ".");
  return obal(subject, slovo, radky, [], h.ted);
}

function detail(k: string, h: Hlidka): string {
  if (k === "model") return " Last hour: " + h.chybModelu60 + " failed, " + h.zalohModelu60 + " fell back to Claude, " + h.cteni60 + " readings saved.";
  if (k === "backup") return " Last successful backup: " + (h.zaloha.posledniOk ? kdy(h.zaloha.posledniOk) : "none recorded") + ".";
  return "";
}

// Vstup ranního souhrnu — posledních 24 h (počítá ops-watch/index.ts z DB).
export type Den = {
  od: string; do: string;
  cteni: number; spready: number; asky: number;
  modely: Record<string, number>;              // usage.model × počet (čtení i Asky)
  cenaModelu: number; bezCeny: number;          // USD; volání, jejichž model nemá cenu v MODEL_PRICES
  hlasy: number; znakyHlasu: number; cenaHlasu: number;
  hlaseni: Record<string, number>;             // nová hlášení z appky podle typu, bez „keep“
  ulozeno: number;                              // ✦ Keep — uložené věty, ne problém
  chybModelu: number; zalohModelu: number; brzd: number;
  kredity: Kredity | null;
  zaloha: Zaloha;
  otevrene: Record<string, Stav>;               // stav upozornění teď (ops_alert_state)
};
export type Email = { subject: string; html: string; text: string; stav: string };

export function souhrn(d: Den): Email {
  const potreba: string[] = [];
  for (const k of KLICE) if (d.otevrene[k] === "problem") potreba.push(POPIS[k].problem + ". " + POPIS[k].co);
  const nHlaseni = Object.values(d.hlaseni).reduce((a, b) => a + b, 0);
  if (nHlaseni) potreba.push(nHlaseni + " new app report" + (nHlaseni > 1 ? "s" : "") + " (" + seznam(d.hlaseni) + "). Ask CODE to load the reports.");
  const doBrzdy = d.kredity && d.kredity.hladina != null ? d.kredity.hladina - d.kredity.spotreba : null;
  if (doBrzdy != null && d.kredity!.limit && doBrzdy < PRAHY.kredityMaloPodil * d.kredity!.limit)
    potreba.push("ElevenLabs: only " + cislo(doBrzdy) + " credits left before the voice brake.");
  if (d.bezCeny) potreba.push(d.bezCeny + " model call" + (d.bezCeny > 1 ? "s have" : " has") + " no price in MODEL_PRICES — costs below are incomplete.");
  if (!d.zaloha.posledniOk) potreba.push("No database backup has reported in yet. Check that the nightly backup task runs.");
  const problem = KLICE.some((k) => d.otevrene[k] === "problem");
  const stav = problem ? "PROBLEM" : (potreba.length || d.chybModelu || d.zalohModelu || d.brzd ? "WATCH" : "OK");

  const celkem = d.cenaModelu + d.cenaHlasu;
  const subject = "Rúnar Ops · " + stav + " · " + d.cteni + " reading" + (d.cteni === 1 ? "" : "s") + " · " + d.hlasy + " voice"
    + (d.hlasy === 1 ? "" : "s") + " · $" + celkem.toFixed(2);
  const cisla: [string, string][] = [
    ["Readings", d.cteni + (d.spready ? " (spreads " + d.spready + ")" : "") + " · Asks " + d.asky + " (on these readings)"],
    ["Models", seznam(d.modely) || "—"],
    ["Model fallbacks / failures", d.zalohModelu + " / " + d.chybModelu],
    ["Voices", d.hlasy + " (" + cislo(d.znakyHlasu) + " characters)"],
    ["Cost", "models $" + d.cenaModelu.toFixed(2) + " · voice $" + d.cenaHlasu.toFixed(2) + " · total $" + celkem.toFixed(2)],
    ["App reports", (nHlaseni ? seznam(d.hlaseni) : "none") + (d.ulozeno ? " · saved lines (Keep) " + d.ulozeno : "")],
    ["ElevenLabs credits", d.kredity ? "used " + cislo(d.kredity.spotreba) + (d.kredity.limit ? " of " + cislo(d.kredity.limit) : "")
      + (doBrzdy != null ? " · " + cislo(doBrzdy) + " left before the brake" : "") + (d.kredity.reset ? " · resets " + d.kredity.reset.slice(0, 10) : "")
      : "status unavailable"],
    ["Voice brake hits", String(d.brzd)],
    ["Database backup", d.zaloha.posledniOk ? kdy(d.zaloha.posledniOk) + (d.zaloha.bajtu ? " · " + (d.zaloha.bajtu / 1e6).toFixed(1) + " MB" : "")
      : "none recorded yet"],
  ];
  return obal(subject, stav, potreba, cisla, d.do, "Last 24 hours: " + kdy(d.od) + " – " + kdy(d.do));
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

function obal(subject: string, stav: string, potreba: string[], cisla: [string, string][], ted: string, pod?: string): Email {
  const nahore = potreba.length ? potreba : ["Nothing needs you."];
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f1f1f;max-width:640px">'
    + '<div style="font-size:18px;font-weight:bold;color:' + (BARVA[stav] || "#1f1f1f") + '">' + esc(stav) + "</div>"
    + (pod ? '<div style="color:#555;margin:2px 0 12px">' + esc(pod) + "</div>" : "")
    + '<div style="font-weight:bold;margin:12px 0 4px">Needs you</div><ul style="margin:0 0 12px;padding-left:20px">'
    + nahore.map((r) => "<li>" + esc(r) + "</li>").join("") + "</ul>"
    + (cisla.length ? '<table style="border-collapse:collapse">' + cisla.map(([k, v]) =>
      '<tr><td style="padding:3px 12px 3px 0;color:#555;vertical-align:top">' + esc(k) + '</td><td style="padding:3px 0">' + esc(v) + "</td></tr>").join("")
      + "</table>" : "")
    + '<div style="color:#888;font-size:12px;margin-top:16px">Sent by ops-watch (Supabase) · ' + esc(kdy(ted)) + "</div></div>";
  const text = stav + (pod ? "\n" + pod : "") + "\n\nNeeds you:\n" + nahore.map((r) => "- " + r).join("\n")
    + (cisla.length ? "\n\n" + cisla.map(([k, v]) => k + ": " + v).join("\n") : "") + "\n\nSent by ops-watch (Supabase) · " + kdy(ted);
  return { subject, html, text, stav };
}
