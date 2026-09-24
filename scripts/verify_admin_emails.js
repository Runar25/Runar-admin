// verify_admin_emails.js — všechny kopie seznamu adminů musí být shodné s v2/runar-config.js.
// Proč (2026-09-23): ADMIN_EMAILS je natvrdo v configu klienta a v každé edge funkci, která pouští jen
// admina (claude-proxy, list-readings, list-reports, elevenlabs-static, tree-update, gpt-review). Edge
// funkce config klienta načíst nemůžou, takže kopie jsou nutné — ale nic nehlídalo, že jsou stejné.
// Rozejdou-li se, admin v jedné funkci projde a v jiné ne (nebo naopak projde někdo, kdo už admin není).
// Mimo záběr: SQL migrace v sql/ (RLS politiky s e-maily) — to jsou historické soubory, ne běžící kód.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const vytahni = (src) => {
  const m = src.match(/ADMIN_EMAILS\s*=\s*\[([^\]]*)\]/);
  if (!m) return null;
  return (m[1].match(/['"]([^'"]+)['"]/g) || []).map((s) => s.slice(1, -1).toLowerCase()).sort();
};
const kanon = vytahni(fs.readFileSync(path.join(ROOT, 'v2', 'runar-config.js'), 'utf8'));
if (!kanon || !kanon.length) { console.log('FAIL  ADMIN_EMAILS v v2/runar-config.js nenalezen'); process.exit(1); }
const FN = path.join(ROOT, 'supabase', 'functions');
let chyby = 0, kopie = 0;
for (const d of fs.readdirSync(FN)) {
  const f = path.join(FN, d, 'index.ts');
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (src.indexOf('ADMIN_EMAILS') === -1) continue;
  const s = vytahni(src);
  kopie++;
  if (!s || s.join(',') !== kanon.join(',')) {
    chyby++;
    console.log('  ✘ ' + d + ': ' + (s ? s.join(', ') : '(seznam nečitelný)') + '  ≠  config: ' + kanon.join(', '));
  }
}
if (chyby) { console.log('FAIL  ADMIN_EMAILS: ' + chyby + ' z ' + kopie + ' kopií se liší od v2/runar-config.js'); process.exit(1); }
console.log('OK    ADMIN_EMAILS: ' + kopie + ' kopií v edge funkcích = v2/runar-config.js (' + kanon.length + ' adres)');
