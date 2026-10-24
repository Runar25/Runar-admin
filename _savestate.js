/* dev helper: POST tree-lab state (JSON) -> _tree_state.json in repo root.
   Lets Code read the exact reading log KUKY is looking at (shared repo), so we
   consult bugs by reading number instead of screenshots. Runs on 7798.
   Start:  node _savestate.js   (serve.bat may add it later). */
var http = require('http');
var fs = require('fs');
var path = require('path');
var OUT = path.join(__dirname, '_tree_state.json');
http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.end(); return; }
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function (c) { body += c; });
    req.on('end', function () {
      try { fs.writeFileSync(OUT, body); res.end('saved ' + body.length); }
      catch (e) { res.statusCode = 500; res.end('err ' + e.message); }
    });
  } else { res.end('state helper ok -> ' + OUT); }
}).listen(7798);
console.log('state helper on 7798 ->', OUT);
