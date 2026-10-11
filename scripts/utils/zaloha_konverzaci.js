// Noční šifrovaná kopie všech konverzací (CODE i Cowork) + hooků z ~/.claude, ať se nic neztratí.
//
// Proč (KUKY 2026-10-11): „pravidelná záloha z konverzace v jakékoliv session, ať se nic neztratí a popřípadě se dá najít, pokud nějaká
// session zapomene.“ Změřeno týž den: Claude Code mazal přepisy po 30 dnech (cleanupPeriodDays nenastaveno) — z CODE session zbylo 12
// přepisů, nejstarší 2026-08-15, květen–srpen pryč; záloha při compactu (~/.claude/compact-backup.py) vzniká jen při compactu, drží 30 session
// a ležely v ní 3. DECISIONS 2026-10-11.
// Co dělá:
//   1. přepisy *.jsonl z ~/.claude/projects/** (všechny session Claude Code) a ~/AppData/Roaming/Claude/local-agent-mode-sessions/** (Cowork);
//   2. každý přepis = jeden archiv 7z AES-256 (-mhe=on, heslo ~/.claude/runar-zaloha-heslo.txt, stejné jako záloha DB) — přepis jen přibývá,
//      takže novější archiv je nadmnožina staršího; přebalí se jen přepis, který od minula změnil velikost nebo čas;
//   3. hooky a nastavení z ~/.claude (*.py, *.sh, settings*.json) — do 2026-10-11 žily jen tam, bez kopie (BACKLOG 2026-08-17); nový archiv
//      jen když se něco změnilo (otisk);
//   4. archiv se ověří (`7z t`); NIC SE NEMAŽE — ani archiv přepisu, který Claude Code mezitím smazal (to je smysl zálohy).
// Jen lokálně (~/runar-eval/zaloha-konverzaci), ne na Drive: přepisy nesou i výpisy z DB s e-maily testerů. Pouští ji noční zaloha_db.js.
//   node scripts/utils/zaloha_konverzaci.js            · --test (samotest v dočasných složkách)
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const H = os.homedir();
const SEVENZ = process.env.RUNAR_7Z || path.join(H, 'scoop', 'shims', '7z.exe');
const HESLO = process.env.RUNAR_ZALOHA_HESLO_SOUBOR || path.join(H, '.claude', 'runar-zaloha-heslo.txt');

function soubory(dir, re, out = []) {
  let e; try { e = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return out; }
  for (const x of e) {
    const p = path.join(dir, x.name);
    if (x.isDirectory()) soubory(p, re, out); else if (re.test(x.name)) out.push(p);
  }
  return out;
}

function zalohuj(opt) {
  const { zdroje, hooky, cil } = opt;
  fs.mkdirSync(cil, { recursive: true });
  const stavP = path.join(cil, 'stav.json');
  let stav = {}; try { stav = JSON.parse(fs.readFileSync(stavP, 'utf8')); } catch (_) {}
  const h = fs.readFileSync(HESLO, 'utf8').trim();
  const pack = (archiv, vstupy) => {
    const tmp = archiv + '.tmp.7z';
    fs.rmSync(tmp, { force: true });
    execFileSync(SEVENZ, ['a', '-t7z', '-mx=3', '-mhe=on', '-p' + h, tmp, ...vstupy], { stdio: 'ignore' });
    execFileSync(SEVENZ, ['t', '-p' + h, tmp], { stdio: 'ignore' });
    fs.renameSync(tmp, archiv);                 // starý archiv se nahradí až po úspěšném ověření nového
  };
  let nove = 0, beze = 0;
  for (const z of zdroje) for (const f of soubory(z.dir, /\.jsonl$/)) {
    const st = fs.statSync(f), klic = path.relative(z.dir, f);
    const id = z.jm + '/' + klic.replace(/\\/g, '/');
    const otisk = st.size + ':' + Math.floor(st.mtimeMs);
    const jm = z.jm + '-' + path.basename(f, '.jsonl').slice(0, 36) + '-' + crypto.createHash('sha1').update(id).digest('hex').slice(0, 6) + '.7z';
    if (stav[id] && stav[id].otisk === otisk && fs.existsSync(path.join(cil, jm))) { beze++; continue; }
    pack(path.join(cil, jm), [f]);
    stav[id] = { otisk, archiv: jm, zaloha: new Date().toISOString() };
    nove++;
  }
  let hookyStav = 'beze změny';
  if (hooky) {
    const hs = fs.readdirSync(hooky).filter((n) => /\.(py|sh)$|^settings.*\.json$/.test(n)).map((n) => path.join(hooky, n)).filter((p) => fs.statSync(p).isFile());
    const otisk = crypto.createHash('sha1').update(hs.map((p) => p + fs.readFileSync(p)).join('|')).digest('hex');
    if (hs.length && stav.__hooky !== otisk) {
      const jm = 'hooky-' + new Date().toISOString().slice(0, 10) + '.7z';
      pack(path.join(cil, jm), hs);
      stav.__hooky = otisk; hookyStav = jm + ' (' + hs.length + ' souborů)';
    }
  }
  fs.writeFileSync(stavP, JSON.stringify(stav, null, 1));
  const radek = new Date().toISOString() + ' přepisy: ' + nove + ' zabaleno, ' + beze + ' beze změny · hooky: ' + hookyStav;
  fs.appendFileSync(path.join(cil, 'log.txt'), radek + '\n');
  return { nove, beze, hookyStav, radek };
}

function samotest() {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'zk-')), src = path.join(t, 'src'), cil = path.join(t, 'cil'), hk = path.join(t, 'hk');
  fs.mkdirSync(path.join(src, 'a'), { recursive: true }); fs.mkdirSync(hk);
  fs.writeFileSync(path.join(src, 'a', 's1.jsonl'), '{"x":1}\n'); fs.writeFileSync(path.join(src, 's2.jsonl'), '{"y":2}\n');
  fs.writeFileSync(path.join(hk, 'hook.py'), 'print(1)\n');
  const o = { zdroje: [{ jm: 'code', dir: src }], hooky: hk, cil };
  const ok = [], chk = (jm, v) => ok.push([jm, !!v]);
  let r = zalohuj(o); chk('1. první běh zabalí oba přepisy a hooky', r.nove === 2 && /hooky-/.test(r.hookyStav));
  r = zalohuj(o); chk('2. druhý běh nic nepřebaluje', r.nove === 0 && r.beze === 2 && r.hookyStav === 'beze změny');
  fs.appendFileSync(path.join(src, 's2.jsonl'), '{"y":3}\n'); const t0 = Date.now(); while (Date.now() - t0 < 20);
  r = zalohuj(o); chk('3. přepis, který narostl, se přebalí (jen on)', r.nove === 1);
  fs.rmSync(path.join(src, 'a', 's1.jsonl'));
  r = zalohuj(o); chk('4. smazaný zdroj: jeho archiv zůstane', fs.readdirSync(cil).filter((f) => /^code-s1-/.test(f)).length === 1);
  const h = fs.readFileSync(HESLO, 'utf8').trim(), ven = path.join(t, 'ven');
  const a2 = fs.readdirSync(cil).find((f) => /^code-s2-/.test(f));
  execFileSync(SEVENZ, ['x', '-y', '-p' + h, '-o' + ven, path.join(cil, a2)], { stdio: 'ignore' });
  chk('5. archiv jde rozšifrovat a nese poslední stav přepisu', fs.readFileSync(path.join(ven, 's2.jsonl'), 'utf8') === '{"y":2}\n{"y":3}\n');
  fs.writeFileSync(path.join(hk, 'hook.py'), 'print(2)\n');
  r = zalohuj(o); chk('6. změněný hook → nová záloha hooků', /hooky-/.test(r.hookyStav));
  fs.rmSync(t, { recursive: true, force: true });
  for (const [jm, v] of ok) console.log((v ? 'OK    ' : 'FAIL  ') + jm);
  return ok.every(([, v]) => v) ? 0 : 1;
}

if (require.main === module) {
  if (process.argv.includes('--test')) process.exit(samotest());
  try {
    const r = zalohuj({
      zdroje: [{ jm: 'code', dir: path.join(H, '.claude', 'projects') },
               { jm: 'cowork', dir: path.join(H, 'AppData', 'Roaming', 'Claude', 'local-agent-mode-sessions') }],
      hooky: path.join(H, '.claude'),
      cil: process.env.RUNAR_ZALOHA_KONV_CIL || path.join(H, 'runar-eval', 'zaloha-konverzaci'),
    });
    console.log('OK    ' + r.radek);
  } catch (e) { console.log('FAIL  záloha konverzací: ' + String(e.message).slice(0, 300)); process.exit(1); }
}
module.exports = { zalohuj };
