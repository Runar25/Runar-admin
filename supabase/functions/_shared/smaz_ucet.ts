// Smazání účtu se vším, co k němu patří — JEDINÁ cesta (2026-11-01): smazání na žádost (delete-account) i smazání opuštěného účtu
// (inactive-accounts, DECISIONS 2026-10-19 (3)). Do té doby stál postup jen v delete-account; druhá kopie by se rozešla se zásadami,
// které slibují, že s účtem zmizí vše (§18).
// ON DELETE CASCADE v DB smaže user_profiles, readings, voice_tickets, inactive_notices. Ručně: gift_codes.used_by, zprávy „Send Rúnar
// a line“, e-mail v allowed_emails, soubory hlasu v úložišti. Selže-li kterýkoli krok, účet se NEMAŽE (vrátí chybu) — zkusí se znovu a slib platí.
// deno-lint-ignore-file no-explicit-any

export async function smazUcet(sb: any, id: string, email: string | null): Promise<{ ok: true } | { ok: false; chyba: string }> {
  // gift_codes.used_by nemá ON DELETE CASCADE — nullovat ručně
  await sb.from("gift_codes").update({ used_by: null }).eq("used_by", id);

  // Zprávy „Send Rúnar a line“ (2026-10-15, send-line): v bug_reports nesou e-mail účtu (sloupec tester), vazbu na auth.users nemají.
  if (email) {
    const { error } = await sb.from("bug_reports").delete().eq("type", "message").eq("tester", email);
    if (error) return { ok: false, chyba: "Failed to delete messages: " + error.message };
  }

  // E-mail ze seznamu testerů (allowed_emails) — bez vazby na auth.users (2026-10-10, CODE-read část 32 (j)). Přesná shoda bez ohledu na
  // velikost písmen, NE ilike (%, _ a * jsou v něm zástupné znaky a „a_b@x“ by smazal i „acb@x“).
  if (email) {
    const { data: radky, error: selErr } = await sb.from("allowed_emails").select("email");
    if (selErr) return { ok: false, chyba: "Failed to read allowlist: " + selErr.message };
    const moje = (radky || []).map((r: { email: string | null }) => r.email)
      .filter((e: unknown): e is string => typeof e === "string" && e.toLowerCase() === email.toLowerCase());
    if (moje.length) {
      const { error } = await sb.from("allowed_emails").delete().in("email", moje);
      if (error) return { ok: false, chyba: "Failed to remove email from allowlist: " + error.message };
    }
  }

  // Uložený hlas čtení (2026-10-11, DECISIONS (61)) — soubory v úložišti CASCADE nesmaže.
  for (let kolo = 0; kolo < 200; kolo++) {
    const { data: soubory, error: lsErr } = await sb.storage.from("reading-voice").list(id, { limit: 100 });
    if (lsErr) {
      if (/not found/i.test(lsErr.message)) break;
      return { ok: false, chyba: "Failed to list voice files: " + lsErr.message };
    }
    if (!soubory || !soubory.length) break;
    const { error: rmErr } = await sb.storage.from("reading-voice").remove(soubory.map((f: { name: string }) => `${id}/${f.name}`));
    if (rmErr) return { ok: false, chyba: "Failed to remove voice files: " + rmErr.message };
    if (soubory.length < 100) break;
  }

  const { error: deleteErr } = await sb.auth.admin.deleteUser(id);
  if (deleteErr) return { ok: false, chyba: "Failed to delete account: " + deleteErr.message };
  return { ok: true };
}
