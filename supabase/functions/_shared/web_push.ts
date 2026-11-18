// web_push.ts — upozornění přes Web Push bez knihovny (2026-11-18, upozornění na runu dne, owner „11. ok udělej pro android“).
// Posílá se BEZ obsahu (žádné šifrování těla): text upozornění drží telefon sám — appka ho při zapnutí uloží do Cache Storage v jazyce
// uživatele z UI_TEXT (runar-runa-dne.js) a service worker ho při push ukáže (sw.js). Server tak nenese žádný text ani jazyk a odpadá
// celé šifrování RFC 8291 (víc kódu, který tu bez Deno nejde vyzkoušet). Podpis VAPID (RFC 8292) = JWT ES256 přes WebCrypto.
// Čisté funkce bez Deno API — kontrola scripts/verify_web_push.js je pouští v Node (podpis ověří veřejným klíčem).

// Push služby, kam smí jít požadavek. Endpoint posílá klient; bez seznamu by funkce s naším podpisem volala libovolnou adresu.
// Totéž hlídá CHECK v tabulce (sql/2026-11-18_push_odbery.sql) — tohle je druhá vrstva, kdyby se řádek dostal dovnitř jinudy.
const SLUZBY = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^[a-z0-9.-]+\.notify\.windows\.com$/, /^web\.push\.apple\.com$/];
export function sluzbaOk(endpoint: string): boolean {
  try {
    const u = new URL(endpoint);
    return u.protocol === "https:" && !u.port && !u.username && SLUZBY.some((r) => r.test(u.hostname));
  } catch { return false; }
}

const b64u = (b: Uint8Array): string => {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const zB64u = (s: string): Uint8Array => {
  const t = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(t + "===".slice((t.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

// Soukromý klíč (d) + veřejný (65 B nekomprimovaný bod) → klíč pro podpis. Veřejný dává x a y, jak je chce JWK.
export async function vapidKlic(verejny: string, soukromy: string): Promise<CryptoKey> {
  const p = zB64u(verejny);
  if (p.length !== 65 || p[0] !== 4) throw new Error("VAPID public key: expected 65-byte uncompressed point");
  return await crypto.subtle.importKey("jwk",
    { kty: "EC", crv: "P-256", d: soukromy, x: b64u(p.slice(1, 33)), y: b64u(p.slice(33, 65)), ext: true },
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

// Hlavička Authorization pro jeden endpoint: aud = origin push služby, platnost 12 h (strop RFC 8292 je 24 h).
export async function vapidHlavicka(endpoint: string, klic: CryptoKey, verejny: string, subject: string, tedS: number): Promise<string> {
  const enc = new TextEncoder();
  const h = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const c = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: tedS + 12 * 3600, sub: subject })));
  const podpis = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, klic, enc.encode(h + "." + c)));
  return "vapid t=" + h + "." + c + "." + b64u(podpis) + ", k=" + verejny;
}

// Komu ráno poslat: odběry s povolenou službou, jejichž člověk dnes runu ještě netáhl. Vrací i počty pro záznam běhu.
export type Odber = { endpoint: string; user_id: string };
export function komuPoslat(odbery: Odber[], dnesTahli: Set<string>): { poslat: Odber[]; uzTahli: number; spatnaSluzba: Odber[] } {
  const poslat: Odber[] = [], spatnaSluzba: Odber[] = [];
  let uzTahli = 0;
  for (const o of odbery) {
    if (!sluzbaOk(o.endpoint)) { spatnaSluzba.push(o); continue; }
    if (dnesTahli.has(o.user_id)) { uzTahli++; continue; }
    poslat.push(o);
  }
  return { poslat, uzTahli, spatnaSluzba };
}

// Co odpověď push služby znamená: 2xx doručeno („ok“) · 404/410 odběr zanikl („gone“: telefon ho zrušil, appka pryč) → smazat ·
// ostatní („error“) nesmazat — výpadek služby nesmí mazat odběry.
export function vysledekPush(status: number): "ok" | "gone" | "error" {
  if (status >= 200 && status < 300) return "ok";
  if (status === 404 || status === 410) return "gone";
  return "error";
}
