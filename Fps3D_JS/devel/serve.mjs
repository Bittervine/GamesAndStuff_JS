import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const port = Number.parseInt(process.env.PORT || '4173', 10);

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8']
]);

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let requestPath = decodeURIComponent(url.pathname);

    if (requestPath === '/') {
      requestPath = '/Fps3D_JS.html';
    }

    const resolvedPath = path.resolve(rootDir, '.' + requestPath);
    if (!resolvedPath.startsWith(rootDir)) {
      send(res, 403, 'Forbidden');
      return;
    }

    let filePath = resolvedPath;
    let stat = null;

    try {
      stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'Fps3D_JS.html');
      }
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }

    let body = await readFileIfExists(filePath);
    if (!body) {
      send(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES.get(ext) || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    });
    res.end(body);
  } catch (error) {
    send(res, 500, error && error.stack ? error.stack : String(error));
  }
});

server.listen(port, () => {
  console.log(`Fps3D_JS server running at http://127.0.0.1:${port}/`);
});
