/* tiny dev helper: POST body (base64 jpeg) -> _tree_shot.jpg */
var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.end(); return; }
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function (c) { body += c; });
    req.on('end', function () {
      fs.writeFileSync(__dirname + '/_tree_shot.jpg', Buffer.from(body, 'base64'));
      res.end('saved ' + body.length);
    });
  } else res.end('ok');
}).listen(7799);
console.log('listening 7799');
