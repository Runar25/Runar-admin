// verify_bez_storage.js — appka (v2/) ani web (web/site/) nebere statické soubory přímo ze Supabase Storage (…/storage/v1/object/public/…).
//
// Proč (owner 2026-10-22 „6. ano, předej to“ — pojistka po přesunu portrétu; DECISIONS 2026-10-22 (6)): Supabase Free přetáhl „Cached Egress“
// 11,4 / 5 GB. Rúnarův portrét (2,1 MB PNG) šel ze Storage s `Cache-Control: private, no-cache` a stahoval se při každém otevření — i každou
// kontrolou v prohlížeči. Statické soubory patří k appce / na web (GitHub Pages, později Cloudflare Pages s dlouhým cachováním); Storage
// jen data uživatelů (hlasy čtení — soukromý bucket přes podepsanou adresu, tu kontrola nehlídá, ta „/object/public/“ nemá).
// Zvuky run (runar-audio) mají adresu v databázi (runar_static_audio.audio_url), ne v kódu — tahle kontrola je nevidí; řeší je CODE-tune
// (BACKLOG „Plán infrastruktury“).
// Co hlídá: adresa „/storage/v1/object/public/“ v HTML, JS a CSS appky a webu (bez tree-snapshots — historické kopie, nenasazují se).
//   node scripts/verify_bez_storage.js
'use strict';
const fs = require('fs'), path = require('path');
const R = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..')).replace(/\\/g, '/');
const VZOR = /\/storage\/v1\/object\/public\//;
const vady = [];
function projdi(d, rel) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = d + '/' + f, r = rel + '/' + f;
    if (fs.statSync(p).isDirectory()) { if (!/^(tree-snapshots|node_modules|vendor)$/.test(f)) projdi(p, r); continue; }
    if (!/\.(html|js|mjs|css)$/.test(f)) continue;
    fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => { if (VZOR.test(l)) vady.push(r.slice(1) + ':' + (i + 1) + ' ' + l.trim().slice(0, 110)); });
  }
}
projdi(R + '/v2', '/v2');
projdi(R + '/web/site', '/web/site');
if (vady.length) {
  vady.forEach((v) => console.log('FAIL  ' + v));
  console.log('FAIL  statické soubory ze Supabase Storage: ' + vady.length + '× — patří do repa appky / webu (egress, DECISIONS 2026-10-22 (6))');
  process.exit(1);
}
console.log('OK    statické soubory ze Supabase Storage: appka ani web je přímo nebere');
