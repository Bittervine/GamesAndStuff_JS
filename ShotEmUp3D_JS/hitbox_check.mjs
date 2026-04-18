import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'C:/Portable/Playwright/node_modules/playwright/index.js';

function startServer() {
  const proc = spawn('C:/Portable/WinPython/python/python.exe', ['serve.py'], {
    cwd: 'C:/Portable/0Networkshare/GitHub/GamesAndStuff_JS/ShotEmUp3D_JS',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  let ready = false;
  proc.stdout.on('data', (buf) => {
    if (String(buf).includes('Serving ')) ready = true;
  });
  return { proc, isReady: () => ready };
}

async function waitForServer(isReady) {
  for (let i = 0; i < 60; i++) {
    if (isReady()) return;
    await delay(250);
  }
  throw new Error('Server did not start');
}

async function run() {
  const server = startServer();
  await waitForServer(server.isReady);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://127.0.0.1:8000/ShotEmUp3D_JS.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__shotemup?.state?.player);

  const results = await page.evaluate(() => {
    const state = window.__shotemup.state;
    const p = state.player;
    const ship = window.__ShotEmUp3D;
    const box = ship?.player3dBox || null;
    const visibleW = box ? box.w : null;
    const visibleH = box ? box.h : null;
    const hitRadius = p.r;
    const scenarios = [
      { name: 'edge_touch', dx: hitRadius - 1, dy: 0 },
      { name: 'outside_touch', dx: hitRadius + 1, dy: 0 },
      { name: 'diagonal_edge', dx: Math.round(hitRadius * 0.7), dy: Math.round(hitRadius * 0.7) }
    ];
    const checks = scenarios.map((s) => ({
      name: s.name,
      dist: Math.hypot(s.dx, s.dy),
      collides: Math.hypot(s.dx, s.dy) < (hitRadius + 18)
    }));
    return {
      playerRadius: hitRadius,
      visibleBox: { w: visibleW, h: visibleH },
      checks
    };
  });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  server.proc.kill();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
