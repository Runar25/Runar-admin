// Čtení pro analýzu kvality bez odhlášených uživatelů — vrací SQL poddotaz pojmenovaný `readings`, použij místo `from readings`.
// Zdroj filtru je JEDEN: scripts/utils/cteni_analyza.sql (důvod tam). 2026-10-10, kontrola architektury část 31 (CODE-read).
'use strict';
const fs = require('fs'), path = require('path');
module.exports = fs.readFileSync(path.join(__dirname, 'cteni_analyza.sql'), 'utf8')
  .split('\n').filter((l) => l.trim() && !l.trim().startsWith('--')).join(' ').trim();
