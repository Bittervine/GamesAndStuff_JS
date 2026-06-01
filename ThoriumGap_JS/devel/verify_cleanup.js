const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

const { chromium } = require('C:/Portable/Playwright/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const filesToScan = [
  path.join(root, 'ThoriumGap.js'),
  path.join(root, 'ThoriumGap.html'),
  path.join(root, 'sw.js'),
];

const assetDirs = [
  path.join(root, 'assets'),
  path.join(root, 'models'),
];

function collectRefs(text) {
  const refs = new Set();
  const re = /(?:['"`])((?:assets|models)\/[^'"` \t\r\n)]+)(?:['"`])/g;
  let m;
  while ((m = re.exec(text))) refs.add(m[1]);
  return refs;
}

function isConcreteRef(ref) {
  return /\.(?:png|glb|jpg|jpeg|gif|webp|svg|mp3|wav|ogg|json|css|js)$/i.test(ref);
}

function existsInGame(rel) {
  const abs = path.join(root, rel);
  return fs.existsSync(abs);
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.glb') return 'model/gltf-binary';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

function serveStatic(req, res) {
  const u = new URL(req.url, 'http://127.0.0.1');
  let rel = decodeURIComponent(u.pathname);
  if (rel === '/') rel = '/ThoriumGap.html';
  rel = rel.replace(/^\/+/, '');
  const abs = path.join(root, rel);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  fs.readFile(abs, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeFor(abs) });
    res.end(data);
  });
}

async function run() {
  const contents = filesToScan.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const refs = [...collectRefs(contents)].filter(isConcreteRef).sort();
  const missing = refs.filter((ref) => !existsInGame(ref));

  console.log('Static reference scan:');
  if (missing.length) {
    console.log('Missing referenced files:');
    for (const ref of missing) console.log('  ' + ref);
  } else {
    console.log('  OK - every referenced asset/model exists in ThoriumGap_JS');
  }

  const server = http.createServer(serveStatic);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/ThoriumGap.html`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const requests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('console: ' + msg.text());
  });
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
  page.on('requestfailed', (req) => {
    requests.push(`failed: ${req.url()} :: ${req.failure() ? req.failure().errorText : 'unknown'}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) requests.push(`http ${res.status()}: ${res.url()}`);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(5000);
  } catch (err) {
    errors.push('goto: ' + err.message);
  }

  await browser.close();
  server.close();

  console.log('Browser smoke test:');
  if (requests.length) {
    console.log('Network issues:');
    for (const line of requests) console.log('  ' + line);
  }
  if (errors.length) {
    console.log('Runtime issues:');
    for (const line of errors) console.log('  ' + line);
  }
  if (!requests.length && !errors.length) {
    console.log('  OK - page loaded cleanly with no console/network errors');
  }

  if (missing.length || requests.length || errors.length) process.exitCode = 1;
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
