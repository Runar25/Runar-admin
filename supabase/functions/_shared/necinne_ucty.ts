// Opuštěné účty — kdy upozornit a kdy smazat (owner 2026-10-19, DECISIONS 2026-10-19 (3) a (6); stavba 2026-11-01 „připravit. udělat.“).
// Čisté funkce bez sítě a databáze: volá je edge funkce inactive-accounts a na známých datech je zkouší smoke (scripts/verify_necinne_ucty.js).
// Pravidla: účet 3 roky bez přihlášení se smaže; 30 dní a 7 dní předem přijde e-mail (EN, IS nebo oba). Přihlášení v lhůtě smazání zruší
// (poslední aktivita se změní → odpočet začne znovu). Nemaže se: admin, účet s nevyčerpanými kredity (credits_balance > 0) a běžící
// předplatné (standard / premium mimo testery — testerům dává premium seznam testerů, ne platba).
// Lhůty se počítají od ODESLÁNÍ upozornění, ne jen od data: kdyby úloha začala běžet pozdě (nebo e-mail neodešel), nikdo nesmí přijít
// o účet dřív než 30 dní po prvním a 7 dní po druhém upozornění.

export const ROKY_NECINNOSTI = 3;
export const PRVNI_DNI = 30;
export const DRUHE_DNI = 7;
const DEN = 24 * 3600 * 1000;

export type Ucet = {
  id: string;
  email: string | null;
  posledni: string;            // coalesce(last_sign_in_at, created_at) — ISO
  admin: boolean;
  kredity: number;             // user_profiles.credits_balance
  tier: string | null;
  tester: boolean;
};
export type Zaznam = { posledni: string; prvni: string | null; druhe: string | null } | null;   // public.inactive_notices
export type Akce = "none" | "first" | "second" | "delete" | "protected" | "reset";

export function terminSmazani(posledni: string): Date {
  const d = new Date(posledni);
  d.setUTCFullYear(d.getUTCFullYear() + ROKY_NECINNOSTI);
  return d;
}

export function chranen(u: Ucet): string | null {
  if (u.admin) return "admin";
  if ((u.kredity || 0) > 0) return "credits";
  if ((u.tier === "standard" || u.tier === "premium") && !u.tester) return "subscription";
  return null;
}

// Jedna akce za běh. „obnovit“ = od posledního upozornění se přihlásil → záznam smazat (a ve stejném běhu už nic).
export function rozhodni(u: Ucet, z: Zaznam, ted: Date): Akce {
  if (z && new Date(z.posledni).getTime() !== new Date(u.posledni).getTime()) return "reset";
  const termin = terminSmazani(u.posledni).getTime();
  const t = ted.getTime();
  if (t < termin - PRVNI_DNI * DEN) return "none";
  if (chranen(u)) return "protected";
  if (!u.email) return "none";                                  // bez adresy nejde upozornit → nemazat
  if (!z || !z.prvni) return "first";
  const prvni = new Date(z.prvni).getTime();
  if (!z.druhe) {
    if (t >= termin - DRUHE_DNI * DEN && t >= prvni + (PRVNI_DNI - DRUHE_DNI) * DEN) return "second";
    return "none";
  }
  const druhe = new Date(z.druhe).getTime();
  if (t >= termin && t >= prvni + PRVNI_DNI * DEN && t >= druhe + DRUHE_DNI * DEN) return "delete";
  return "none";
}

// Den smazání, jak ho uvidí uživatel: nejpozdější z termínu a lhůt od upozornění (stejná pravidla jako rozhodni).
export function denSmazani(u: Ucet, prvni: Date, druhe: Date | null): Date {
  const t = Math.max(terminSmazani(u.posledni).getTime(), prvni.getTime() + PRVNI_DNI * DEN,
    druhe ? druhe.getTime() + DRUHE_DNI * DEN : 0);
  return new Date(t);
}

const MESICE_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MESICE_IS = ["janúar", "febrúar", "mars", "apríl", "maí", "júní", "júlí", "ágúst", "september", "október", "nóvember", "desember"];
export function datum(d: Date, jazyk: "en" | "is"): string {
  return jazyk === "is"
    ? `${d.getUTCDate()}. ${MESICE_IS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
    : `${d.getUTCDate()} ${MESICE_EN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const ODKAZ = "https://runar25.github.io/Runar-admin/v2/runar-reader.html";

// Text e-mailu. lang z user_metadata (appka ho zapisuje, jako u e-mailu s kódem): „en“ → anglicky, „is“ → islandsky, jinak oba (IS napřed).
// IS ověřeno 2026-11-01 nástroji z CLAUDE.md §2 (Greynir + korpus), viz DECISIONS 2026-11-01 (3).
const TEXT = {
  en: {
    predmet: (d: string) => `Rúnar · your account will be deleted on ${d}`,
    odstavce: (d: string, druhe: boolean) => [
      (druhe ? "A last reminder. " : "") + "You have not signed in to Rúnar for almost three years.",
      `We keep your data only as long as it is needed, so your account and all your readings will be deleted on ${d}.`,
      "If you want to keep them, simply sign in before that day.",
      "If you do nothing, everything is deleted and you will not hear from us again.",
    ],
    tlacitko: "OPEN RÚNAR",
    dotaz: "Questions? Write to runar@therunekeeper.com — please do not reply to this email.",
  },
  is: {
    predmet: (d: string) => `Rúnar · reikningnum þínum verður eytt ${d}`,
    odstavce: (d: string, druhe: boolean) => [
      (druhe ? "Síðasta áminning. " : "") + "Þú hefur ekki skráð þig inn hjá Rúnari í nærri þrjú ár.",
      `Við geymum gögnin þín aðeins eins lengi og þörf er á, og því verður reikningnum þínum eytt ${d}, ásamt öllu sem honum fylgir.`,
      "Ef þú vilt halda honum skaltu einfaldlega skrá þig inn fyrir þann dag.",
      "Ef þú gerir ekkert verður öllu eytt og þú heyrir ekki aftur frá okkur.",
    ],
    tlacitko: "OPNA RÚNAR",
    dotaz: "Spurningar? Skrifaðu á runar@therunekeeper.com — vinsamlegast ekki svara þessum tölvupósti.",
  },
};

export function email(lang: string | null | undefined, kdy: Date, druhe: boolean): { subject: string; html: string; text: string } {
  const jazyky: ("en" | "is")[] = lang === "en" ? ["en"] : lang === "is" ? ["is"] : ["is", "en"];
  const subject = jazyky.map((j) => TEXT[j].predmet(datum(kdy, j))).join(" / ");
  const bloky = jazyky.map((j) => {
    const x = TEXT[j];
    const p = x.odstavce(datum(kdy, j), druhe);
    return {
      html: p.map((s) => `<p style="margin:0 0 12px">${s}</p>`).join("") +
        `<p style="margin:18px 0"><a href="${ODKAZ}" style="color:#a07a2c;font-weight:bold;letter-spacing:.06em">${x.tlacitko}</a></p>` +
        `<p style="font-size:14px;color:#555;margin:0">${x.dotaz}</p>`,
      text: p.join("\n\n") + "\n\n" + x.tlacitko + ": " + ODKAZ + "\n\n" + x.dotaz,
    };
  });
  const html = `<div style="font-family:Georgia,'Times New Roman',serif;max-width:460px;margin:0 auto;padding:28px 24px;color:#1b1f2a;line-height:1.6">` +
    bloky.map((b) => b.html).join(`<hr style="border:0;border-top:1px solid #e6dfcc;margin:26px 0">`) + `</div>`;
  return { subject, html, text: bloky.map((b) => b.text).join("\n\n———\n\n") };
}
