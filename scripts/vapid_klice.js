// vapid_klice.js — klíče pro upozornění (web push, VAPID): vytvoří pár, SOUKROMÝ klíč uloží rovnou jako secret v Supabase
// a nikam ho nevypíše; vypíše jen VEŘEJNÝ klíč (ten patří do appky, není tajný). CODE-tune 2026-11-17.
//
// Proč takhle (owner 2026-11-17 „ok udělej pro android“ — upozornění na runu dne, RUNAR_BACKLOG „Upozornění na runu dne“):
// Code hodnoty tajných klíčů nevidí ani nezadává. Skript pouští OWNER ve svém terminálu; soukromý klíč jde jen do
// `supabase secrets set` přes dočasný soubor, který se hned smaže. Bez závislostí (Node crypto, křivka P-256 jako web-push).
//
//   node scripts/vapid_klice.js            vytvoří klíče a uloží secrety VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
//   node scripts/vapid_klice.js --zkouska  jen ukáže, že vytvoření funguje (veřejný klíč), nic neukládá
// ⚠️ Nový běh = nové klíče: odběry upozornění vytvořené se starým veřejným klíčem přestanou fungovat. Pouštět jednou.
'use strict';
const crypto = require('crypto'), fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const PROJEKT = 'pmitxjvkeovijreepror';
const SUBJECT = 'https://therunekeeper.com';   // VAPID chce kontakt (mailto: nebo https:) — web, ne e-mail v kódu

const b64u = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const jwkPub = publicKey.export({ format: 'jwk' }), jwkPriv = privateKey.export({ format: 'jwk' });
const verejny = b64u(Buffer.concat([Buffer.from([4]), Buffer.from(jwkPub.x, 'base64'), Buffer.from(jwkPub.y, 'base64')]));   // 65 B, nekomprimovaný bod
const soukromy = jwkPriv.d;   // už base64url, 32 B
if (Buffer.from(verejny, 'base64').length !== 65 || Buffer.from(soukromy, 'base64').length !== 32) { console.error('CHYBA: klíč nemá správnou délku'); process.exit(1); }

if (process.argv.includes('--zkouska')) { console.log('zkouška OK — veřejný klíč by byl:', verejny); process.exit(0); }

const tmp = path.join(os.tmpdir(), 'runar-vapid-' + crypto.randomBytes(6).toString('hex') + '.env');
try {
  fs.writeFileSync(tmp, 'VAPID_PUBLIC_KEY=' + verejny + '\nVAPID_PRIVATE_KEY=' + soukromy + '\nVAPID_SUBJECT=' + SUBJECT + '\n', { mode: 0o600 });
  const r = cp.spawnSync('supabase', ['secrets', 'set', '--env-file', tmp, '--project-ref', PROJEKT], { stdio: ['ignore', 'pipe', 'pipe'], shell: true, encoding: 'utf8' });
  if (r.status !== 0) { console.error('CHYBA: supabase secrets set selhal:', String(r.stderr || '').replace(soukromy, '***').slice(0, 300)); process.exit(1); }
} finally {
  try { fs.unlinkSync(tmp); } catch (e) {}
}
console.log('Hotovo: VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY a VAPID_SUBJECT jsou uložené v Supabase (soukromý klíč se nikde nevypsal).');
console.log('Veřejný klíč (patří do appky, není tajný) — pošli ho Claudovi:');
console.log(verejny);
