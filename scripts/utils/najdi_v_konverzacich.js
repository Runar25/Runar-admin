// Hledání ve všech konverzacích (CODE i Cowork) — co owner řekl, co jsme dělali, i když to žádná session nezapsala.
//
// Proč (KUKY 2026-10-11): „…ať se nic neztratí a popřípadě se dá najít, pokud nějaká session zapomene.“ Do té doby se v konverzacích
// hledat nedalo ničím naším (najdi_cteni.js hledá jen čtení). Přepisy se od 2026-10-11 nemažou (cleanupPeriodDays) a noční
// zaloha_konverzaci.js je kopíruje; tohle je jejich čtecí strana. DECISIONS 2026-10-11.
//   node scripts/utils/najdi_v_konverzacich.js "<text>"            — ownerova slova i Claude, nejnovější první, max 20
//     --kdo owner|claude   jen jedna strana        --od 2026-10-01   jen od data        --max 50
//     --nastroje           i volání nástrojů a jejich výsledky (jinak jen řeč)
//     --zalohy             i přepisy, které už na disku nejsou (rozšifruje je z ~/runar-eval/zaloha-konverzaci do dočasné složky)
//     --test               samotest
// Hledá bez ohledu na velikost písmen a diakritiku („zaloha“ najde „záloha“).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const H = os.homedir();
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function soubory(dir, out = []) {
  let e; try { e = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return out; }
  for (const x of e) { const p = path.join(dir, x.name); if (x.isDirectory()) soubory(p, out); else if (x.name.endsWith('.jsonl')) out.push(p); }
  return out;
}

function text(c, nastroje) {
  if (typeof c === 'string') return [{ druh: 'řeč', t: c }];
  if (!Array.isArray(c)) return [];
  const out = [];
  for (const b of c) {
    if (!b || typeof b !== 'object') continue;
    if (b.type === 'text' && b.text) out.push({ druh: 'řeč', t: b.text });
    else if (nastroje && b.type === 'tool_use') out.push({ druh: 'nástroj ' + b.name, t: JSON.stringify(b.input) });
    else if (nastroje && b.type === 'tool_result') out.push({ druh: 'výsledek', t: typeof b.content === 'string' ? b.content : JSON.stringify(b.content) });
  }
  return out;
}

function hledej(dotaz, opt) {
  const q = norm(dotaz), qRaw = String(dotaz).toLowerCase(), nalezy = [];
  for (const { soubor, zdroj } of opt.prepisy) {
    let data; try { data = fs.readFileSync(soubor, 'utf8'); } catch (_) { continue; }
    const sid = path.basename(soubor, '.jsonl').slice(0, 8);
    for (const line of data.split('\n')) {
      if (!line) continue;
      const lo = line.toLowerCase();
      if (!lo.includes(qRaw) && !norm(line).includes(q)) continue;
      let e; try { e = JSON.parse(line); } catch (_) { continue; }
      let typ = e.type, m = e.message || {};
      // Zpráva poslaná během práce session se ukládá jako attachment „queued_command“ (origin human = owner, peer = jiná session/agent),
      // ne jako `user` — doloženo 2026-10-11: ownerova věta „pravidelná záloha z konverzace“ by jinak nešla najít. (queue-operation = kopie, přeskočit.)
      if (typ === 'attachment' && e.attachment && e.attachment.type === 'queued_command') {
        const o = e.attachment.origin, k = o && typeof o === 'object' ? o.kind : null;
        typ = 'user'; m = { content: String(e.attachment.prompt || '') }; e = Object.assign({}, e, { _kind: k || 'system' });
      }
      if (typ !== 'user' && typ !== 'assistant') continue;
      let kdo = 'claude';
      if (typ === 'user') {
        const c = m.content, s = typeof c === 'string' ? c.trimStart() : '';
        if (Array.isArray(c) && c.some((b) => b && b.type === 'tool_result')) kdo = 'nástroj';
        else if (e.isCompactSummary) kdo = 'souhrn';
        else if (e._kind === 'peer' || /^<(cross-session-message|agent-message)/.test(s)) kdo = 'session';
        else if ((e._kind && e._kind !== 'human') || /^(<(task-notification|system-reminder|local-command|command-)|Stop hook feedback)/.test(s)) kdo = 'systém';
        else kdo = 'owner';
      }
      if ((kdo === 'systém') && !opt.nastroje) continue;
      if (opt.kdo && kdo !== opt.kdo) continue;
      if (kdo === 'nástroj' && !opt.nastroje) continue;
      const cas = e.timestamp || '';
      if (opt.od && cas && cas.slice(0, 10) < opt.od) continue;
      for (const { druh, t } of text(m.content, opt.nastroje)) {
        const i = norm(t).indexOf(q);
        if (i < 0) continue;
        const ukazka = t.slice(Math.max(0, i - 120), i + dotaz.length + 160).replace(/\s+/g, ' ').trim();
        nalezy.push({ cas, zdroj, sid, kdo, druh, ukazka });
        break;
      }
    }
  }
  nalezy.sort((a, b) => (b.cas || '').localeCompare(a.cas || ''));
  return nalezy;
}

function vsechnyPrepisy() {
  return [...soubory(path.join(H, '.claude', 'projects')).map((s) => ({ soubor: s, zdroj: 'CODE' })),
          ...soubory(path.join(H, 'AppData', 'Roaming', 'Claude', 'local-agent-mode-sessions')).map((s) => ({ soubor: s, zdroj: 'Cowork' }))];
}

function zeZaloh(cil, tmp) {
  // Jen přepisy, které už na disku nejsou — živé se hledají přímo.
  let stav = {}; try { stav = JSON.parse(fs.readFileSync(path.join(cil, 'stav.json'), 'utf8')); } catch (_) { return []; }
  const h = fs.readFileSync(path.join(H, '.claude', 'runar-zaloha-heslo.txt'), 'utf8').trim();
  const zive = new Set(vsechnyPrepisy().map((p) => path.basename(p.soubor, '.jsonl').slice(0, 36)));
  const out = [];
  for (const [id, v] of Object.entries(stav)) {
    if (id.startsWith('__')) continue;
    const jm = path.basename(id, '.jsonl');
    if (zive.has(jm.slice(0, 36))) continue;
    const kam = path.join(tmp, jm);
    try { execFileSync(path.join(H, 'scoop', 'shims', '7z.exe'), ['x', '-y', '-p' + h, '-o' + kam, path.join(cil, v.archiv)], { stdio: 'ignore' }); } catch (_) { continue; }
    for (const s of soubory(kam)) out.push({ soubor: s, zdroj: (id.startsWith('cowork/') ? 'Cowork' : 'CODE') + ' (záloha)' });
  }
  return out;
}

function samotest() {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'nk-')), f = path.join(t, 'abc12345.jsonl');
  const rad = (o) => JSON.stringify(o);
  fs.writeFileSync(f, [
    rad({ type: 'user', timestamp: '2026-10-10T10:00:00Z', message: { content: 'chci, ať záloha konverzací běží' } }),
    rad({ type: 'attachment', timestamp: '2026-10-11T09:28:00Z', attachment: { type: 'queued_command', prompt: 'pravidelná zaloha z konverzace', origin: { kind: 'human' } } }),
    rad({ type: 'attachment', timestamp: '2026-10-11T09:29:00Z', attachment: { type: 'queued_command', prompt: '<agent-message> zaloha od agenta', origin: { kind: 'peer' } } }),
    rad({ type: 'queue-operation', timestamp: '2026-10-11T09:28:00Z', operation: 'enqueue', content: 'pravidelná zaloha z konverzace' }),
    rad({ type: 'user', timestamp: '2026-10-11T09:30:00Z', message: { content: '<cross-session-message from="x">zaloha od CODE-tune</cross-session-message>' } }),
    rad({ type: 'assistant', timestamp: '2026-10-10T10:01:00Z', message: { content: [{ type: 'text', text: 'Záloha běží každou noc.' }, { type: 'tool_use', name: 'Bash', input: { command: 'echo zaloha' } }] } }),
    rad({ type: 'user', timestamp: '2026-10-10T10:02:00Z', message: { content: [{ type: 'tool_result', content: 'zaloha hotova' }] } }),
    rad({ type: 'user', timestamp: '2026-09-01T10:00:00Z', message: { content: 'stará záloha' } }),
  ].join('\n') + '\n');
  const P = [{ soubor: f, zdroj: 'CODE' }], ok = [], chk = (jm, v) => ok.push([jm, !!v]);
  let r = hledej('zaloha', { prepisy: P });
  chk('1. bez diakritiky najde owner i Claude', r.some((x) => x.kdo === 'owner') && r.some((x) => x.kdo === 'claude'));
  chk('2. nejnovější první', r[0].cas >= r[r.length - 1].cas);
  chk('3. výsledky nástrojů jen s --nastroje', !r.some((x) => x.kdo === 'nástroj') && hledej('zaloha', { prepisy: P, nastroje: true }).some((x) => x.kdo === 'nástroj'));
  const own = hledej('zaloha', { prepisy: P, kdo: 'owner' });
  chk('4. --kdo owner: jen ownerova slova (2 + 1 stará), i zpráva poslaná během práce', own.length === 3 && own.some((x) => /pravidelná/.test(x.ukazka)));
  chk('5. --od vynechá starší', hledej('zaloha', { prepisy: P, od: '2026-10-01' }).length === r.length - 1);
  chk('7. zpráva od agenta i jiné session = „session“, ne owner', r.filter((x) => x.kdo === 'session').length === 2);
  chk('8. queue-operation se nepočítá dvakrát', own.filter((x) => /pravidelná/.test(x.ukazka)).length === 1);
  chk('6. nic nenajde → prázdno', hledej('neexistujicislovo', { prepisy: P }).length === 0);
  fs.rmSync(t, { recursive: true, force: true });
  for (const [jm, v] of ok) console.log((v ? 'OK    ' : 'FAIL  ') + jm);
  return ok.every(([, v]) => v) ? 0 : 1;
}

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.includes('--test')) process.exit(samotest());
  const val = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const skip = new Set(); ['--kdo', '--od', '--max'].forEach((k) => { const i = a.indexOf(k); if (i >= 0) { skip.add(i); skip.add(i + 1); } });
  const dotaz = a.filter((x, i) => !skip.has(i) && !x.startsWith('--')).join(' ');
  if (!dotaz) { console.log('Použití: node scripts/utils/najdi_v_konverzacich.js "<text>" [--kdo owner|claude] [--od RRRR-MM-DD] [--max N] [--nastroje] [--zalohy]'); process.exit(1); }
  let prepisy = vsechnyPrepisy(), tmp = null;
  if (a.includes('--zalohy')) { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nk-z-')); prepisy = prepisy.concat(zeZaloh(path.join(H, 'runar-eval', 'zaloha-konverzaci'), tmp)); }
  try {
    const r = hledej(dotaz, { prepisy, kdo: val('--kdo'), od: val('--od'), nastroje: a.includes('--nastroje') });
    const max = Number(val('--max') || 20);
    console.log('„' + dotaz + '“: ' + r.length + ' nálezů v ' + prepisy.length + ' přepisech' + (r.length > max ? ' (ukazuji ' + max + ' nejnovějších)' : ''));
    for (const x of r.slice(0, max)) console.log('\n' + (x.cas || '?').slice(0, 16).replace('T', ' ') + ' · ' + x.zdroj + ' ' + x.sid + ' · ' + x.kdo + (x.druh !== 'řeč' ? ' (' + x.druh + ')' : '') + '\n  …' + x.ukazka + '…');
  } finally { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }); }
}
module.exports = { hledej };
