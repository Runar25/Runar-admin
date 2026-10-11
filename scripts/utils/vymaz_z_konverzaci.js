// Výmaz osobních údajů z přepisů konverzací a jejich záloh — na žádost uživatele o smazání (GDPR, do 30 dní).
//
// Proč (KUKY 2026-10-11 „ok a) a c)“, DECISIONS 2026-10-11): přepisy se od téhož dne nemažou a noční záloha je drží napořád, ale nesou i
// osobní údaje uživatelů (výpisy z DB, texty čtení, jména). Zásady slibují „Everything goes — from our encrypted backups within 30 days“.
// Tenhle nástroj ten slib drží: najde zadané údaje (e-mail, jméno…) ve všech přepisech a nahradí je značkou [VYMAZÁNO].
// Postup při žádosti o výmaz → RUNAR_PRIVACY.md.
//   node scripts/utils/vymaz_z_konverzaci.js "<e-mail>" "<jméno>"          — jen spočítá výskyty po souborech (nic nemění)
//   node scripts/utils/vymaz_z_konverzaci.js "<e-mail>" "<jméno>" --ostre  — nahradí: přepisy CODE i Cowork, zálohy při compactu
//                                                                            (~/.claude/compact-backups) a šifrované archivy noční zálohy
//   --test   samotest v dočasných složkách
// Nic osobního nevypisuje — jen počty a jména souborů. Přepis změněný v poslední hodině (běžící session) se nepřepisuje; vypíše se a pustí
// se znovu později. Hledá bez ohledu na velikost písmen.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const H = os.homedir();
const SEVENZ = process.env.RUNAR_7Z || path.join(H, 'scoop', 'shims', '7z.exe');
const ZNACKA = '[VYMAZÁNO]';

function soubory(dir, re, out = []) {
  let e; try { e = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return out; }
  for (const x of e) { const p = path.join(dir, x.name); if (x.isDirectory()) soubory(p, re, out); else if (re.test(x.name)) out.push(p); }
  return out;
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function vymaz(opt) {
  const { pojmy, zdroje, archivy, heslo, ostre, aktivniMin = 60 } = opt;
  const RE = new RegExp(pojmy.filter((p) => p.trim().length >= 3).map(esc).join('|'), 'gi');
  const vysledek = { prepisy: [], archivy: [], aktivni: [] };
  for (const dir of zdroje) for (const f of soubory(dir, /\.jsonl$/)) {
    let t; try { t = fs.readFileSync(f, 'utf8'); } catch (_) { continue; }
    const n = (t.match(RE) || []).length;
    if (!n) continue;
    const cerstvy = Date.now() - fs.statSync(f).mtimeMs < aktivniMin * 60000;
    if (ostre && cerstvy) { vysledek.aktivni.push({ f, n }); continue; }
    if (ostre) fs.writeFileSync(f, t.replace(RE, ZNACKA));
    vysledek.prepisy.push({ f, n });
  }
  if (archivy && fs.existsSync(archivy)) {
    for (const a of fs.readdirSync(archivy).filter((x) => /\.7z$/.test(x) && !/^hooky-/.test(x))) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vymaz-'));
      try {
        execFileSync(SEVENZ, ['x', '-y', '-p' + heslo, '-o' + tmp, path.join(archivy, a)], { stdio: 'ignore' });
        let n = 0; const zmenene = [];
        for (const f of soubory(tmp, /\.jsonl$/)) {
          const t = fs.readFileSync(f, 'utf8'), k = (t.match(RE) || []).length;
          if (k) { n += k; zmenene.push(f); if (ostre) fs.writeFileSync(f, t.replace(RE, ZNACKA)); }
        }
        if (!n) continue;
        if (ostre) {
          const novy = path.join(archivy, a + '.vymaz.7z');
          fs.rmSync(novy, { force: true });
          execFileSync(SEVENZ, ['a', '-t7z', '-mx=3', '-mhe=on', '-p' + heslo, novy, ...soubory(tmp, /\.jsonl$/)], { stdio: 'ignore' });
          execFileSync(SEVENZ, ['t', '-p' + heslo, novy], { stdio: 'ignore' });
          fs.renameSync(novy, path.join(archivy, a));   // původní archiv se nahradí až po ověření nového
        }
        vysledek.archivy.push({ f: a, n });
      } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
    }
  }
  return vysledek;
}

function vypis(v, ostre) {
  const sl = (x) => x.prepisy.reduce((s, r) => s + r.n, 0) + x.archivy.reduce((s, r) => s + r.n, 0);
  console.log((ostre ? 'VYMAZÁNO' : 'NALEZENO (nic se nemění; --ostre nahradí)') + ': ' + sl(v) + ' výskytů · přepisů ' + v.prepisy.length + ' · archivů ' + v.archivy.length);
  for (const r of v.prepisy) console.log('  přepis  ' + r.n + '×  ' + path.basename(r.f));
  for (const r of v.archivy) console.log('  archiv  ' + r.n + '×  ' + r.f);
  for (const r of v.aktivni) console.log('  ⏳ běžící session (změna v poslední hodině), NEpřepsáno: ' + r.n + '×  ' + path.basename(r.f) + ' — pusť znovu později');
}

function samotest() {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-')), src = path.join(t, 'src'), arch = path.join(t, 'arch'), stage = path.join(t, 'st');
  fs.mkdirSync(src); fs.mkdirSync(arch); fs.mkdirSync(stage);
  const heslo = 'test-heslo-123';
  const radek = (s) => JSON.stringify({ type: 'user', message: { content: s } }) + '\n';
  fs.writeFileSync(path.join(src, 'stary.jsonl'), radek('mail Jana@Example.com a jméno Jana Nováková') + radek('nic'));
  fs.writeFileSync(path.join(src, 'bezny.jsonl'), radek('bez údajů'));
  const stary = Date.now() / 1000 - 7200; fs.utimesSync(path.join(src, 'stary.jsonl'), stary, stary); fs.utimesSync(path.join(src, 'bezny.jsonl'), stary, stary);
  fs.writeFileSync(path.join(src, 'aktivni.jsonl'), radek('jana@example.com teď'));
  fs.writeFileSync(path.join(stage, 'a.jsonl'), radek('archiv: jana@example.com'));
  execFileSync(SEVENZ, ['a', '-t7z', '-mhe=on', '-p' + heslo, path.join(arch, 'code-a.7z'), path.join(stage, 'a.jsonl')], { stdio: 'ignore' });
  const o = { pojmy: ['jana@example.com', 'Jana Nováková'], zdroje: [src], archivy: arch, heslo };
  const ok = [], chk = (jm, v) => ok.push([jm, !!v]);
  let v = vymaz(o);
  chk('1. bez --ostre jen spočítá (nic nemění)', v.prepisy.length === 2 && fs.readFileSync(path.join(src, 'stary.jsonl'), 'utf8').includes('Jana@Example.com'));
  chk('2. najde i v šifrovaném archivu', v.archivy.length === 1 && v.archivy[0].n === 1);
  v = vymaz(Object.assign({}, o, { ostre: true }));
  const st = fs.readFileSync(path.join(src, 'stary.jsonl'), 'utf8');
  chk('3. --ostre: e-mail i jméno pryč (bez ohledu na velikost písmen), JSON zůstal platný', !/jana@example\.com|Jana Nováková/i.test(st) && st.includes('[VYMAZÁNO]') && st.trim().split('\n').every((l) => { try { JSON.parse(l); return true; } catch (_) { return false; } }));
  chk('4. běžící session (změna < 1 h) se nepřepíše, jen ohlásí', v.aktivni.length === 1 && fs.readFileSync(path.join(src, 'aktivni.jsonl'), 'utf8').includes('jana@example.com'));
  chk('5. soubor bez údajů beze změny', fs.readFileSync(path.join(src, 'bezny.jsonl'), 'utf8').includes('bez údajů'));
  const ven = path.join(t, 'ven');
  execFileSync(SEVENZ, ['x', '-y', '-p' + heslo, '-o' + ven, path.join(arch, 'code-a.7z')], { stdio: 'ignore' });
  chk('6. archiv přebalený, rozšifrovatelný a bez údaje', !/jana@example\.com/i.test(fs.readFileSync(path.join(ven, 'a.jsonl'), 'utf8')));
  chk('7. druhý průchod už nic nenajde (kromě běžící session)', (() => { const w = vymaz(o); return w.prepisy.length === 1 && w.prepisy[0].f.endsWith('aktivni.jsonl') && w.archivy.length === 0; })());
  fs.rmSync(t, { recursive: true, force: true });
  for (const [jm, x] of ok) console.log((x ? 'OK    ' : 'FAIL  ') + jm);
  return ok.every(([, x]) => x) ? 0 : 1;
}

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.includes('--test')) process.exit(samotest());
  const pojmy = a.filter((x) => !x.startsWith('--'));
  if (!pojmy.length || pojmy.some((p) => p.trim().length < 3)) { console.log('Použití: node scripts/utils/vymaz_z_konverzaci.js "<e-mail>" ["<jméno>" …] [--ostre]  (každý údaj aspoň 3 znaky)'); process.exit(1); }
  const ostre = a.includes('--ostre');
  const v = vymaz({ pojmy, ostre,
    zdroje: [path.join(H, '.claude', 'projects'), path.join(H, 'AppData', 'Roaming', 'Claude', 'local-agent-mode-sessions'), path.join(H, '.claude', 'compact-backups')],
    archivy: path.join(H, 'runar-eval', 'zaloha-konverzaci'),
    heslo: fs.readFileSync(path.join(H, '.claude', 'runar-zaloha-heslo.txt'), 'utf8').trim() });
  vypis(v, ostre);
}
module.exports = { vymaz };
