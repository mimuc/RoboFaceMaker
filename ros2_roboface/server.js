const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const PRESETS_DIR = path.join(__dirname, '..', 'presets');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const urlPathname = new URL(req.url, 'http://localhost').pathname;

  if (req.method === 'POST') {
    const match = urlPathname.match(/^\/presets\/([^/]+)$/);
    if (!match) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const id = match[1].replace(/\.json$/, '');
    if (!/^[\w-]+$/.test(id)) {
      res.writeHead(400);
      res.end('Invalid face ID');
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { JSON.parse(body); } catch {
        res.writeHead(400);
        res.end('Invalid JSON');
        return;
      }
      fs.writeFile(path.join(PRESETS_DIR, `${id}.json`), body, (err) => {
        if (err) { res.writeHead(500); res.end('Server error'); return; }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id }));
      });
    });
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET, POST' });
    res.end('Method Not Allowed');
    return;
  }

  let filePath;
  if (urlPathname === '/presets/') {
    fs.readdir(PRESETS_DIR, (err, files) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      const faces = files
        .filter(f => f.endsWith('.json'))
        .map(f => f.slice(0, -5));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(faces));
    });
    return;
  } else if (urlPathname.startsWith('/presets/')) {
    filePath = path.join(PRESETS_DIR, urlPathname.slice('/presets/'.length));
  } else {
    const urlPath = urlPathname === '/' ? '/index.html' : urlPathname;
    filePath = path.join(PUBLIC_DIR, urlPath);
  }

  // Prevent path traversal
  const resolvedPublic = path.resolve(PUBLIC_DIR);
  const resolvedPresets = path.resolve(PRESETS_DIR);
  const resolvedFile = path.resolve(filePath);

  if (!resolvedFile.startsWith(resolvedPublic + path.sep) && !resolvedFile.startsWith(resolvedPresets + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`RoboFace server running at http://localhost:${PORT}`);
  console.log(`Serving faces from: ${PRESETS_DIR}`);
});

module.exports = server;
