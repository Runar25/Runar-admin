// Validační sada srozumitelnosti — ručně podle ownerových vlastních reakcí v Asku (ne podle regexu, ten minul zmatek bez značek).
const fs = require('fs'), path = require('path');
let t = fs.readFileSync(path.join(__dirname, 'prod_cteni.txt'), 'utf8'); t = t.slice(t.indexOf('{'));
const rows = JSON.parse(t).rows;
const JAS = { '5ac22ca3': 'nice reading. tell me more!', '8e14af02': 'nice reading! thanky you. tell me more!', 'cbf3e383': 'nice picture. how far the pabbles can go?',
  'f63fb1e6': 'yes. make sence!', '2ce7c5b5': 'What can I give the other person?', 'c88c1ab6': 'What does it say about my relationship?' };
const NEJ = ['de1e3b16', 'ea8afea0', '4cea1b44', '5c1c6b93', '79223a99', 'a30a54c9'];
const pick = id => { const r = rows.find(x => x.id.startsWith(id)); return { id, runa: r.rune_name, text: r.txt, q: (JSON.parse(r.fu || '[]')[0] || {}).q }; };
const sada = [...Object.keys(JAS).map(id => ({ ...pick(id), skupina: 'jasne' })), ...NEJ.map(id => ({ ...pick(id), skupina: 'nejasne' }))];
fs.writeFileSync(path.join(__dirname, 'sada2.json'), JSON.stringify(sada, null, 1));
sada.forEach(s => console.log(s.skupina.padEnd(8) + s.id + ' ' + s.runa.padEnd(8) + (s.text || '').split(/\s+/).length + ' slov · Q: ' + (s.q || '').slice(0, 60)));
