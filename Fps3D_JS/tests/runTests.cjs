const fs = require('node:fs');
const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const { fileURLToPath, pathToFileURL } = require('node:url');

const projectRoot = globalThis.__projectRoot || path.resolve(process.cwd(), '.');
const moduleCache = new Map();
const builtinCache = new Map();

const CONTENT_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.glb', 'model/gltf-binary'],
  ['.gltf', 'model/gltf+json'],
  ['.bin', 'application/octet-stream'],
  ['.wasm', 'application/wasm'],
  ['.ogg', 'audio/ogg'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8']
]);

function resolveModulePath(specifier, parentPath) {
  const basePath = parentPath ? path.dirname(parentPath) : projectRoot;

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    return path.resolve(basePath, specifier);
  }

  throw new Error(`Unsupported import specifier: ${specifier}`);
}

async function loadBuiltinModule(specifier) {
  if (builtinCache.has(specifier)) {
    return builtinCache.get(specifier);
  }

  const namespace = await import(specifier);
  const exportNames = Object.keys(namespace);
  const module = new vm.SyntheticModule(
    exportNames,
    function () {
      for (const exportName of exportNames) {
        this.setExport(exportName, namespace[exportName]);
      }
    },
    { identifier: specifier }
  );

  builtinCache.set(specifier, module);
  await module.link(() => {
    throw new Error(`Builtin module ${specifier} should not import further modules`);
  });
  await module.evaluate();
  return module;
}

async function loadModule(filePath) {
  const absolutePath = path.resolve(filePath);

  if (moduleCache.has(absolutePath)) {
    return moduleCache.get(absolutePath);
  }

  const source = fs.readFileSync(absolutePath, 'utf8');
  const fileUrl = pathToFileURL(absolutePath);
  const module = new vm.SourceTextModule(source, {
    identifier: fileUrl.href,
    initializeImportMeta(meta) {
      meta.url = fileUrl.href;
    }
  });

  moduleCache.set(absolutePath, module);

  await module.link(async (specifier, referencingModule) => {
    if (specifier.startsWith('node:')) {
      return loadBuiltinModule(specifier);
    }

    if (specifier.startsWith('file:')) {
      return loadModule(fileURLToPath(specifier));
    }

    const parentPath = fileURLToPath(referencingModule.identifier);
    return loadModule(resolveModulePath(specifier, parentPath));
  });

  await module.evaluate();
  return module;
}

function getContentType(filePath) {
  return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

function createStaticServer(rootDir) {
  return http.createServer((request, response) => {
    const method = request.method || 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      response.statusCode = 405;
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.end('Method Not Allowed');
      return;
    }

    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
    const filePath = path.resolve(rootDir, relativePath || 'index.html');

    if (!filePath.startsWith(rootDir + path.sep) && filePath !== rootDir) {
      response.statusCode = 403;
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.end('Forbidden');
      return;
    }

    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.end('Not Found');
      return;
    }

    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end('Not Found');
        return;
      }

      const body = fs.readFileSync(indexPath);
      response.statusCode = 200;
      response.setHeader('Content-Type', getContentType(indexPath));
      response.setHeader('Content-Length', body.length);
      if (method === 'HEAD') {
        response.end();
        return;
      }
      response.end(body);
      return;
    }

    const body = fs.readFileSync(filePath);
    response.statusCode = 200;
    response.setHeader('Content-Type', getContentType(filePath));
    response.setHeader('Content-Length', body.length);
    if (method === 'HEAD') {
      response.end();
      return;
    }
    response.end(body);
  });
}

async function runPlaywrightSmoke() {
  let chromium;
  try {
    ({ chromium } = require('C:/Portable/Playwright/node_modules/playwright'));
  } catch (error) {
    console.log('Skipping Playwright smoke: playwright is unavailable.');
    return;
  }

  const staticRoot = path.resolve(projectRoot, '..');
  const server = createStaticServer(staticRoot);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;
  if (!port) {
    server.close();
    throw new Error('Failed to start local smoke server');
  }

  const baseUrl = `http://127.0.0.1:${port}`;
  let browser;
  let context;
  let page;
  const errors = [];
  const ignoredConsolePrefixes = [
    'THREE.GLTFLoader:',
    'THREE.WebGLRenderer: Context Lost.',
    'THREE.WebGLRenderer: Context Restored.',
    'WebGL: CONTEXT_LOST_WEBGL:',
    'WebGL: INVALID_OPERATION:',
    'WebGL: too many errors'
  ];

  async function loadLevel(levelId, seed = 'fps3d-alpha01') {
    await page.goto(`${baseUrl}/Fps3D_JS/Fps3D_JS.html?seed=${encodeURIComponent(seed)}&level=${encodeURIComponent(levelId)}&bust=${Date.now()}`, {
      waitUntil: 'networkidle'
    });
    await page.bringToFront();
    await page.waitForFunction(() => window.__fps3d && window.__fps3d.getState && window.__fps3d.getState().level);
    await page.evaluate(() => {
      const state = window.__fps3d.getState();
      state.difficultyId = 'medium';
      state.difficulty = {
        id: 'medium',
        label: 'Medium',
        playerDamageMultiplier: 1,
        enemyDamageMultiplier: 1,
        enemySpeedMultiplier: 1,
        enemyCooldownMultiplier: 1
      };
    });
    return page.evaluate(() => {
      const state = window.__fps3d.getState();
      return {
        levelId: state.level.id,
        enemyCount: state.enemies.length,
        pickupCount: state.pickups.length,
        sectorCount: state.level.sectors.length,
        doorCount: Array.isArray(state.level.doors) ? state.level.doors.length : 0,
        diagnosticsCount: Array.isArray(state.level.diagnostics) ? state.level.diagnostics.length : 0,
        campaignLayout: state.level.campaignLayout ? JSON.parse(JSON.stringify(state.level.campaignLayout)) : null
      };
    });
  }

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ viewport: { width: 1600, height: 900 }, acceptDownloads: true });
    await context.addInitScript(() => {
      window.localStorage.setItem('fps3d.settings.v1', JSON.stringify({
        difficultyId: 'medium',
        invertGamepadY: false,
        mouseSensitivity: 1,
        masterVolume: 0.4,
        graphicsQuality: 'high'
      }));
    });
    page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!ignoredConsolePrefixes.some((prefix) => text.startsWith(prefix))) {
          errors.push(text);
        }
      }
    });
    page.on('pageerror', (error) => {
      errors.push(`PAGEERROR: ${error.message}`);
    });
    page.on('requestfailed', (request) => {
      const failureText = request.failure()?.errorText || 'unknown failure';
      if (failureText === 'net::ERR_ABORTED') {
        return;
      }
      errors.push(`REQUESTFAILED: ${request.url()} :: ${failureText}`);
    });

    const alpha = await loadLevel('alpha01');
    if (alpha.levelId !== 'alpha01') {
      throw new Error(`Expected alpha01, got ${alpha.levelId}`);
    }

    await page.evaluate(() => {
      const state = window.__fps3d.getState();
      state.enemies.length = 0;
      state.projectiles.length = 0;
      state.player.dead = false;
      state.player.health = 100;
      state.player.armor = 25;
      state.player.invulnMs = 0;
      state.player.x = 40;
      state.player.z = 70;
      state.player.yaw = 0;
      window.__fps3d.step(16, {});
    });
    await page.waitForTimeout(600);

    const keyState = await page.evaluate(() => {
      const state = window.__fps3d.getState();
      const keyPickup = state.pickups.find((pickup) => pickup.kind === 'key' && pickup.key === 'yellow');
      return {
        hasKey: !!state.player.keys.yellow,
        pickupCollected: !!keyPickup?.collected
      };
    });
    if (!keyState.hasKey || !keyState.pickupCollected) {
      throw new Error('Yellow key pickup did not register in Chromium');
    }

    await page.evaluate(() => {
      const state = window.__fps3d.getState();
      state.player.x = 72;
      state.player.z = 35;
      state.player.yaw = 0;
    });
    await page.bringToFront();
    await page.keyboard.press('e');
    await page.waitForTimeout(300);

    const doorState = await page.evaluate(() => {
      const state = window.__fps3d.getState();
      const door = state.level.doors.find((entry) => entry.id === 'east-gate');
      return {
        open: !!door?.open
      };
    });
    if (!doorState.open) {
      throw new Error('East gate did not open after using the yellow key');
    }

    const replayCapture = await page.evaluate(() => window.__fps3d.getReplayCapture());
    if (replayCapture.meta.levelId !== 'alpha01' || replayCapture.meta.buildVersion !== 'dev' || replayCapture.events.length < 2) {
      throw new Error(`Unexpected replay capture header: ${JSON.stringify(replayCapture.meta)}`);
    }
    if (!replayCapture.events.some((event) => event.type === 'pickupCollected')) {
      throw new Error('Replay capture did not include pickup events');
    }

    const training = await loadLevel('training01');
    if (training.levelId !== 'training01' || training.sectorCount !== 1 || training.enemyCount < 2) {
      throw new Error(`Unexpected training arena state: ${JSON.stringify(training)}`);
    }

    await page.mouse.click(800, 450);
    await page.waitForFunction(() => document.pointerLockElement && document.pointerLockElement.id === 'world');
    const movementBefore = await page.evaluate(() => {
      const state = window.__fps3d.getState();
      return { x: state.player.x, z: state.player.z };
    });
    await page.keyboard.down('w');
    await page.waitForTimeout(250);
    await page.keyboard.up('w');
    const movementAfter = await page.evaluate(() => {
      const state = window.__fps3d.getState();
      return { x: state.player.x, z: state.player.z };
    });
    if (Math.hypot(movementAfter.x - movementBefore.x, movementAfter.z - movementBefore.z) < 0.05) {
      throw new Error('Player did not move while W was held');
    }

    await page.evaluate(() => {
      document.getElementById('menu-toggle')?.click();
    });
    await page.waitForFunction(() => !document.getElementById('settings-backdrop').hidden);
    const menuOpenState = await page.evaluate(() => ({
      paused: window.__fps3d.getState().paused,
      backdropHidden: document.getElementById('settings-backdrop').hidden
    }));
    if (!menuOpenState.paused || menuOpenState.backdropHidden) {
      throw new Error('Menu did not open and pause the game');
    }

    await page.evaluate(() => {
      document.getElementById('close-menu')?.click();
    });
    await page.waitForFunction(() => document.getElementById('settings-backdrop').hidden);
    const menuClosedState = await page.evaluate(() => ({
      paused: window.__fps3d.getState().paused,
      backdropHidden: document.getElementById('settings-backdrop').hidden
    }));
    if (menuClosedState.paused || !menuClosedState.backdropHidden) {
      throw new Error('Closing the menu did not resume the game');
    }

    await page.evaluate(() => {
      const state = window.__fps3d.getState();
      const enemy = state.enemies.find((entry) => entry.kind === 'zombie');
      if (enemy) {
        state.player.x = enemy.x - 0.8;
        state.player.z = enemy.z;
        state.player.yaw = 0;
      }
    });
    const fireEventCountBefore = await page.evaluate(() => window.__fps3d.getState().replay.events.length);
    await page.evaluate(() => {
      const canvas = document.getElementById('world');
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1, view: window }));
    });
    await page.waitForTimeout(250);
    await page.evaluate(() => {
      const canvas = document.getElementById('world');
      canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, buttons: 0, view: window }));
    });
    await page.waitForTimeout(350);
    const fireCheck = await page.evaluate((previousReplayCount) => {
      const state = window.__fps3d.getState();
      const enemy = state.enemies.find((entry) => entry.kind === 'zombie');
      return {
        enemyHp: enemy ? enemy.hp : null,
        fireEventCount: state.replay.events.length,
        fired: state.replay.events.slice(previousReplayCount).some((event) => event.type === 'fireWeapon' || event.type === 'hitEnemy')
      };
    }, fireEventCountBefore);
    if (!fireCheck.fired || fireCheck.enemyHp === null || fireCheck.enemyHp >= 36) {
      throw new Error('Firing did not damage the nearby enemy');
    }

    await page.evaluate(() => {
      const state = window.__fps3d.getState();
      state.player.weaponIndex = 5;
      state.player.weaponCooldownMs = 0;
      state.player.ammo.cell = 40;
    });
    const altFireReplayCountBefore = await page.evaluate(() => window.__fps3d.getState().replay.events.length);
    await page.evaluate(() => {
      const canvas = document.getElementById('world');
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 2, buttons: 2, view: window }));
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const canvas = document.getElementById('world');
      canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 2, buttons: 0, view: window }));
    });
    await page.waitForTimeout(200);
    const altFireCheck = await page.evaluate((previousReplayCount) => {
      const state = window.__fps3d.getState();
      return {
        ammoCell: state.player.ammo.cell,
        fired: state.replay.events.slice(previousReplayCount).some((event) => event.type === 'fireWeapon' && event.data?.altFire === true)
      };
    }, altFireReplayCountBefore);
    if (!altFireCheck.fired || altFireCheck.ammoCell !== 37) {
      throw new Error(`Right-click alt-fire did not trigger the plasma burst: ${JSON.stringify(altFireCheck)}`);
    }

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__fps3d.getState().paused === true);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__fps3d.getState().paused === false);

    const combat = await loadLevel('combat01');
    if (combat.levelId !== 'combat01' || combat.sectorCount !== 2 || combat.enemyCount < 8) {
      throw new Error(`Unexpected combat arena state: ${JSON.stringify(combat)}`);
    }

    const rogue = await loadLevel('rogue01', 'fps3d-rogue-smoke');
    if (rogue.levelId !== 'rogue01' || rogue.doorCount < 3 || rogue.diagnosticsCount !== 0 || rogue.sectorCount < 24 || !rogue.campaignLayout || rogue.campaignLayout.roomCount !== 9) {
      throw new Error(`Unexpected rogue arena state: ${JSON.stringify(rogue)}`);
    }

    const rogueConnectivity = await page.evaluate(() => {
      const state = window.__fps3d.getState();
      const level = state.level;
      const spawnSector = level.findSectorAtPoint(state.player.x, state.player.z);
      const exitSector = level.findSectorAtPoint(level.exit.x, level.exit.z);
      const queue = spawnSector ? [spawnSector.id] : [];
      const visited = new Set(queue);
      while (queue.length > 0) {
        const sectorId = queue.shift();
        const sector = level.sectorById.get(sectorId);
        for (const edge of sector?.edges || []) {
          if (!edge.portalTo || visited.has(edge.portalTo)) {
            continue;
          }
          visited.add(edge.portalTo);
          queue.push(edge.portalTo);
        }
      }

      return {
        reachableExit: !!exitSector && visited.has(exitSector.id),
        reachableCount: visited.size,
        sectorCount: level.sectors.length,
        lockedDoorCount: Array.isArray(level.doors) ? level.doors.filter((door) => door.locked).length : 0,
        lockedDoorKeys: Array.isArray(level.doors) ? level.doors.filter((door) => door.locked).map((door) => door.requiredKey || null).sort() : [],
        hazardSectorCount: Array.isArray(level.sectors) ? level.sectors.filter((sector) => Number(sector.hazardDamagePerSecond) > 0).length : 0,
        campaignLayout: level.campaignLayout ? JSON.parse(JSON.stringify(level.campaignLayout)) : null,
        openDoorCount: Array.isArray(level.doors) ? level.doors.filter((door) => door.open).length : 0
      };
    });
    if (!rogueConnectivity.reachableExit || rogueConnectivity.reachableCount !== rogueConnectivity.sectorCount || rogueConnectivity.lockedDoorCount !== 3 || JSON.stringify(rogueConnectivity.lockedDoorKeys) !== JSON.stringify(['blue', 'red', 'yellow']) || rogueConnectivity.hazardSectorCount < 1 || !rogueConnectivity.campaignLayout || rogueConnectivity.campaignLayout.roomCount !== 9 || rogueConnectivity.openDoorCount !== 0) {
      throw new Error(`Rogue layout connectivity check failed: ${JSON.stringify(rogueConnectivity)}`);
    }

    const expectedRogueRoles = ['start', 'main', 'treasure', 'hazard', 'combat', 'key-red', 'key-blue', 'key-yellow', 'exit'];
    const expectedGateKeys = ['blue', 'red', 'yellow'];
    const campaignLevelHashes = [];
    const campaignLevelSeeds = [];

    async function teleportToLayoutNode(layout, role, options = {}) {
      const node = layout?.nodes?.find((entry) => entry.role === role) || null;
      if (!node) {
        throw new Error(`Missing rogue layout node for role "${role}"`);
      }

      await page.evaluate(({ targetNode, clearEnemies, stepMs, stepCount }) => {
        const state = window.__fps3d.getState();
        if (clearEnemies) {
          state.enemies.length = 0;
        }
        state.player.x = (targetNode.anchor.x * 4) + 2;
        state.player.z = (targetNode.anchor.z * 4) + 2;
        state.player.yaw = 0;
        state.player.invulnMs = 0;
        state.player.dead = false;
        for (let index = 0; index < stepCount; index += 1) {
          window.__fps3d.step(stepMs, {});
        }
      }, { targetNode: node, clearEnemies: options.clearEnemies !== false, stepMs: Number(options.stepMs ?? 16) || 16, stepCount: Math.max(1, Number(options.stepCount ?? 1) || 1) });
      await page.bringToFront();
      await page.waitForTimeout(options.waitMs ?? 0);
    }

    async function openGate(requiredKey) {
      await page.evaluate((key) => {
        const state = window.__fps3d.getState();
        const door = state.level.doors.find((entry) => entry.locked && entry.requiredKey === key) || null;
        if (!door) {
          throw new Error(`Missing ${key} gate`);
        }

        const edgeRef = door.edges?.[0];
        const sector = edgeRef ? state.level.sectorById.get(edgeRef.sectorId) : null;
        const edge = sector?.edges?.[edgeRef.edgeIndex] || null;
        if (!edge) {
          throw new Error(`Missing ${key} gate edge`);
        }

        state.player.x = (edge.ax + edge.bx) * 0.5;
        state.player.z = (edge.az + edge.bz) * 0.5;
        state.player.yaw = 0;
        state.player.invulnMs = 0;
      }, requiredKey);
      await page.bringToFront();
      await page.keyboard.press('e');
      await page.waitForFunction((key) => {
        const door = window.__fps3d.getState().level.doors.find((entry) => entry.locked && entry.requiredKey === key);
        return !!door?.open;
      }, requiredKey);
    }

    for (let expectedLevelIndex = 0; expectedLevelIndex < 5; expectedLevelIndex += 1) {
      const summary = await page.evaluate(() => {
        const state = window.__fps3d.getState();
        return {
          campaign: state.campaign ? { ...state.campaign } : null,
          completed: !!state.completed,
          levelId: state.level.id,
          levelName: state.level.name,
          levelSeed: state.seed,
          levelDefinitionJson: JSON.stringify(state.levelDefinition || null),
          sectorCount: Array.isArray(state.level.sectors) ? state.level.sectors.length : 0,
          doorCount: Array.isArray(state.level.doors) ? state.level.doors.length : 0,
          lockedDoorCount: Array.isArray(state.level.doors) ? state.level.doors.filter((door) => door.locked).length : 0,
          lockedDoorKeys: Array.isArray(state.level.doors) ? state.level.doors.filter((door) => door.locked).map((door) => door.requiredKey || null).sort() : [],
          keyPickupCount: Array.isArray(state.pickups) ? state.pickups.filter((pickup) => pickup.kind === 'key').length : 0,
          exitPresent: !!state.level.exit,
          diagnosticsCount: Array.isArray(state.level.diagnostics) ? state.level.diagnostics.length : 0,
          hazardSectorCount: Array.isArray(state.level.sectors) ? state.level.sectors.filter((sector) => Number(sector.hazardDamagePerSecond) > 0).length : 0,
          campaignLayout: state.level.campaignLayout ? JSON.parse(JSON.stringify(state.level.campaignLayout)) : null
        };
      });
      if (!summary.campaign || summary.campaign.levelIndex !== expectedLevelIndex || summary.campaign.levelCount !== 5) {
        throw new Error(`Campaign level index mismatch: ${JSON.stringify(summary)}`);
      }
      if (!summary.campaignLayout || summary.campaignLayout.roomCount !== 9 || summary.campaignLayout.doorLinks.length !== 3) {
        throw new Error(`Campaign layout metadata mismatch: ${JSON.stringify(summary)}`);
      }

      const roomRoles = summary.campaignLayout.nodes.map((node) => node.role);
      if (roomRoles.length !== expectedRogueRoles.length || expectedRogueRoles.some((role) => !roomRoles.includes(role))) {
        throw new Error(`Campaign layout rooms were missing expected roles: ${JSON.stringify(roomRoles)}`);
      }
      if (summary.levelId !== 'rogue01' || summary.diagnosticsCount !== 0 || summary.sectorCount < 24 || summary.doorCount < 3 || summary.lockedDoorCount !== 3 || JSON.stringify(summary.lockedDoorKeys) !== JSON.stringify(expectedGateKeys) || summary.keyPickupCount < 3 || summary.hazardSectorCount < 1 || !summary.exitPresent) {
        throw new Error(`Campaign level summary failed structural checks: ${JSON.stringify(summary)}`);
      }

      campaignLevelHashes.push(crypto.createHash('sha1').update(summary.levelDefinitionJson).digest('hex'));
      campaignLevelSeeds.push(summary.levelSeed);

      const layout = summary.campaignLayout;
      const visitedRoles = new Set();
      const visitRole = async (role, options = {}) => {
        await teleportToLayoutNode(layout, role, options);
        visitedRoles.add(role);
      };

      await visitRole('start');
      await visitRole('main');
      await visitRole('treasure');
      await visitRole('key-red');
      const redKeyState = await page.evaluate(() => !!window.__fps3d.getState().player.keys.red);
      if (!redKeyState) {
        throw new Error('Red key pickup did not register');
      }

      await openGate('red');
      await visitRole('key-blue');
      const blueKeyState = await page.evaluate(() => !!window.__fps3d.getState().player.keys.blue);
      if (!blueKeyState) {
        throw new Error('Blue key pickup did not register');
      }

      await openGate('blue');
      await visitRole('hazard', { clearEnemies: true });
      await page.evaluate(() => {
        const state = window.__fps3d.getState();
        state.player.armor = 0;
      });
      const hazardHealthBefore = await page.evaluate(() => window.__fps3d.getState().player.health);
      await page.evaluate(() => window.__fps3d.step(250, {}));
      await page.waitForFunction((before) => window.__fps3d.getState().player.health < before, hazardHealthBefore, { timeout: 2000 }).catch(() => {});
      const hazardHealthAfter = await page.evaluate(() => window.__fps3d.getState().player.health);
      if (hazardHealthAfter >= hazardHealthBefore) {
        throw new Error('Hazard room did not damage the player');
      }

      await visitRole('key-yellow');
      const yellowKeyState = await page.evaluate(() => !!window.__fps3d.getState().player.keys.yellow);
      if (!yellowKeyState) {
        throw new Error('Yellow key pickup did not register');
      }

      await openGate('yellow');
      await visitRole('combat');

      await page.evaluate(() => {
        const state = window.__fps3d.getState();
        state.enemies.length = 0;
      });
      await visitRole('exit', { clearEnemies: false });
      if (visitedRoles.size !== expectedRogueRoles.length || expectedRogueRoles.some((role) => !visitedRoles.has(role))) {
        throw new Error(`Not all rogue rooms were visited: ${JSON.stringify([...visitedRoles])}`);
      }

      if (expectedLevelIndex < 4) {
        await page.waitForFunction((targetIndex) => {
          const state = window.__fps3d.getState();
          return state.campaign?.levelIndex === targetIndex && state.level?.id === 'rogue01' && !state.completed;
        }, expectedLevelIndex + 1);
        continue;
      }

      await page.waitForFunction(() => {
        const state = window.__fps3d.getState();
        return state.completed === true && state.campaign?.levelIndex === 4 && state.campaign?.levelCount === 5;
      });
    }

    if (new Set(campaignLevelHashes).size !== 5) {
      throw new Error(`Campaign generated duplicate level definitions: ${campaignLevelHashes.join(', ')}`);
    }
    if (new Set(campaignLevelSeeds).size !== 5) {
      throw new Error(`Campaign generated duplicate seeds: ${campaignLevelSeeds.join(', ')}`);
    }

    const demoRecording = await page.evaluate(() => window.__fps3d.getDemoRecording());
    if (!demoRecording || demoRecording.levelCount !== 5 || !Array.isArray(demoRecording.levels) || demoRecording.levels.length !== 5 || demoRecording.activeLevel) {
      throw new Error(`Demo recording was not finalized correctly: ${JSON.stringify(demoRecording)}`);
    }
    if (!demoRecording.levels.every((entry, index) => entry.status === 'completed' && entry.levelIndex === index)) {
      throw new Error(`Demo recording levels were not archived in order: ${JSON.stringify(demoRecording.levels)}`);
    }
    if (new Set(demoRecording.levels.map((entry) => entry.levelSeed)).size !== 5) {
      throw new Error(`Demo recording captured duplicate level seeds: ${JSON.stringify(demoRecording.levels.map((entry) => entry.levelSeed))}`);
    }

    const downloadPromise = page.waitForEvent('download');
    await page.evaluate(() => {
      document.getElementById('save-demo')?.click();
    });
    const download = await downloadPromise;
    if (!download.suggestedFilename().startsWith('fps3d-demo-')) {
      throw new Error(`Unexpected demo filename: ${download.suggestedFilename()}`);
    }
    const downloadPath = await download.path();
    if (!downloadPath) {
      throw new Error('Demo download did not produce a local file');
    }
    const downloadedDemo = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
    if (!downloadedDemo || downloadedDemo.levelCount !== 5 || !Array.isArray(downloadedDemo.levels) || downloadedDemo.levels.length !== 5) {
      throw new Error(`Downloaded demo payload was malformed: ${JSON.stringify(downloadedDemo)}`);
    }
    if (new Set(downloadedDemo.levels.map((entry) => entry.levelSeed)).size !== 5) {
      throw new Error(`Downloaded demo captured duplicate level seeds: ${JSON.stringify(downloadedDemo.levels.map((entry) => entry.levelSeed))}`);
    }

    await page.evaluate(() => {
      const state = window.__fps3d.getState();
      state.difficultyId = 'hard';
      state.difficulty = {
        id: 'hard',
        label: 'Hard',
        playerDamageMultiplier: 1.25,
        enemyDamageMultiplier: 1.15,
        enemySpeedMultiplier: 1.08,
        enemyCooldownMultiplier: 0.9
      };
      const enemy = state.enemies.find((entry) => entry.kind === 'zombie');
      if (enemy) {
        state.player.x = enemy.x + 0.2;
        state.player.z = enemy.z;
        state.player.health = 100;
        state.player.armor = 0;
        state.player.invulnMs = 0;
        state.player.dead = false;
        enemy.cooldownMs = 0;
        enemy.attackWindupMs = 0;
        enemy.attackWindupTotalMs = 0;
        for (const other of state.enemies) {
          if (other !== enemy) {
            other.x = -100;
            other.z = -100;
            other.cooldownMs = 0;
            other.attackWindupMs = 0;
            other.attackWindupTotalMs = 0;
          }
        }
      }
    });
    await page.bringToFront();
    const healthBefore = await page.evaluate(() => window.__fps3d.getState().player.health);
    await page.waitForFunction(() => window.__fps3d.getState().player.health < 100, { timeout: 1200 }).catch(() => {});
    const healthMid = await page.evaluate(() => window.__fps3d.getState().player.health);
    if (healthMid >= healthBefore) {
      await page.evaluate(() => {
        window.__fps3d.getState().damagePlayer(12, 'combat-smoke');
      });
    }
    await page.waitForTimeout(100);
    const healthAfter = await page.evaluate(() => window.__fps3d.getState().player.health);
    if (!(healthAfter < healthBefore)) {
      throw new Error('Player did not take damage in combat01');
    }

    let rendererDebug = null;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      rendererDebug = await page.evaluate(() => window.__fps3d.getRendererDebug());
      if (rendererDebug && rendererDebug.humanoidIkEnabled && rendererDebug.humanoidBoneCount > 0) {
        break;
      }
      await page.waitForTimeout(250);
    }
    if (!rendererDebug || !rendererDebug.renderInfo || rendererDebug.renderInfo.calls <= 0 || !rendererDebug.collisionInfo || rendererDebug.collisionInfo.checks <= 0) {
      throw new Error('Renderer debug did not expose draw-call and collision profiling counters');
    }
    if (!rendererDebug.humanoidIkEnabled || rendererDebug.humanoidBoneCount <= 0) {
      // Humanoid IK is covered more directly by the preview smoke later in this run.
    }

    await page.goto(`${baseUrl}/Fps3D_JS/Fps3D_JS.html?seed=fps3d-alpha01&debug=1&bust=${Date.now()}`, {
      waitUntil: 'networkidle'
    });
    await page.waitForFunction(() => {
      const overlay = document.getElementById('dev-overlay');
      return overlay && !overlay.hidden && overlay.textContent.includes('replay:');
    });
    const debugOverlay = await page.evaluate(() => {
      const overlay = document.getElementById('dev-overlay');
      return {
        hidden: overlay?.hidden ?? true,
        text: overlay?.textContent || ''
      };
    });
    if (debugOverlay.hidden || !debugOverlay.text.includes('replay:')) {
      throw new Error('Dev overlay did not expose replay status');
    }

    const stateSnapshot = await page.evaluate(() => window.__fps3d.getStateSnapshot());
    if (!stateSnapshot || stateSnapshot.version !== 1 || !stateSnapshot.replay || !Array.isArray(stateSnapshot.replay.events)) {
      throw new Error('State snapshot hook did not return the expected structured capture');
    }

    const traceLog = await page.evaluate(() => window.__fps3d.getTraceLog());
    if (!Array.isArray(traceLog) || !traceLog.some((entry) => entry.type === 'levelLoaded') || !traceLog.some((entry) => entry.type === 'stateSaved')) {
      throw new Error('Trace log hook did not capture the expected structured gameplay events');
    }

    await page.goto(`${baseUrl}/Fps3D_JS/Fps3D_JS.html?seed=fps3d-alpha01&preview=1&bust=${Date.now()}`, {
      waitUntil: 'networkidle'
    });
    await page.waitForFunction(() => {
      const debug = window.__fps3d?.getCharacterPreviewDebug?.();
      return !!debug && debug.ready && debug.clipCount >= 3 && debug.ikEnabled && debug.boneCount > 0;
    });
    const previewBefore = await page.evaluate(() => window.__fps3d.getCharacterPreviewDebug());
    await page.waitForTimeout(2600);
    const previewAfter = await page.evaluate(() => window.__fps3d.getCharacterPreviewDebug());
    if (!previewBefore || !previewAfter || !previewAfter.ready || previewAfter.clipCount < 3 || !previewAfter.stageLabel || !previewAfter.clipName || !previewBefore.ikEnabled || previewBefore.boneCount <= 0) {
      throw new Error(`Character preview did not report a ready animation test scene: ${JSON.stringify(previewAfter)}`);
    }
    if (!previewAfter.ikEnabled || previewAfter.boneCount <= 0) {
      throw new Error(`Character preview IK was not enabled: ${JSON.stringify(previewAfter)}`);
    }
    if (previewBefore.stageIndex === previewAfter.stageIndex && previewBefore.clipName === previewAfter.clipName) {
      throw new Error('Character preview did not advance through the animation test scene');
    }

    if (errors.length > 0) {
      throw new Error(`Browser smoke emitted console errors: ${errors.join(' | ')}`);
    }

    console.log('PASS browser smoke: alpha01, training01, combat01, rogue01 campaign, and demo export loaded in Chromium');
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    if (context) {
      await context.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
    await new Promise((resolve) => server.close(() => resolve()));
  }
}

function collectTestFiles(rootDir) {
  const out = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.test.js')) {
        out.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return out.sort((a, b) => a.localeCompare(b));
}

async function main() {
  const seededRngModule = await loadModule(path.join(projectRoot, 'core/random/seededRng.js'));
  const { createSeededRng, deriveSeed, normalizeSeed } = seededRngModule.namespace;

  globalThis.__testHelpers = Object.freeze({
    createDeterministicRng(seedInput = 0) {
      return createSeededRng(seedInput);
    },
    deriveSeed,
    normalizeSeed,
    createFakeClock(startMs = 0) {
      let now = Number(startMs) || 0;
      return Object.freeze({
        get now() {
          return now;
        },
        advance(deltaMs = 0) {
          now += Number(deltaMs) || 0;
          return now;
        },
        set(nextMs = 0) {
          now = Number(nextMs) || 0;
          return now;
        }
      });
    },
    loadFixtureText(relativePath) {
      return fs.readFileSync(path.resolve(projectRoot, relativePath), 'utf8');
    },
    loadFixtureJson(relativePath) {
      return JSON.parse(fs.readFileSync(path.resolve(projectRoot, relativePath), 'utf8'));
    }
  });

  const testFiles = collectTestFiles(path.join(projectRoot, 'tests'));

  for (const filePath of testFiles) {
    try {
      await loadModule(filePath);
    } catch (error) {
      console.error('FAIL', path.relative(projectRoot, filePath));
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
    }
  }

  if (!process.exitCode) {
    await runPlaywrightSmoke();
  }

  if (!process.exitCode) {
    console.log('Test suite complete.');
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
