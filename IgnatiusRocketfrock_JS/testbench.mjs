import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Portable/Playwright/node_modules/playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const gameUrl = pathToFileURL(path.join(here, 'game.html')).href;

function approx(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} +/- ${tolerance}, got ${actual}`
  );
}

async function runMirroredLaunchCase(page, direction) {
  const key = direction === 'right' ? 'ArrowRight' : 'ArrowLeft';
  const expectedFacing = direction === 'right' ? 1 : -1;
  const expectedXSign = direction === 'right' ? 1 : -1;

  await page.goto(gameUrl, { waitUntil: 'networkidle' });
  await page.mouse.click(240, 500);

  await page.keyboard.down(key);
  await page.waitForTimeout(1100);
  const runningState = await page.evaluate(() => getRocketfrockState());
  assert.ok(runningState.player.onGround, 'expected the wizard to still be grounded before the jump');
  assert.strictEqual(runningState.player.facing, expectedFacing, `expected the wizard to face ${direction} while running`);
  assert.ok(Math.abs(runningState.player.vx) >= 330, `expected a fast run-up, got vx=${runningState.player.vx}`);

  await page.keyboard.press('Space');
  await page.waitForTimeout(16);
  await page.keyboard.press('Space');
  await page.keyboard.up(key);

  const samples = [];
  let burnEndY = null;
  let burnStartAt = null;
  let burnEndAt = null;
  let minY = Number.POSITIVE_INFINITY;
  let landingVx = null;
  let settledVx = null;
  let firstActiveSample = null;

  for (let i = 0; i < 180; i += 1) {
    await page.waitForTimeout(50);
    const sample = await page.evaluate(() => {
      const state = getRocketfrockState();
      const pose = getRocketfrockPose();
      return {
        now: state.now,
        x: state.player.x,
        y: state.player.y,
        vx: state.player.vx,
        vy: state.player.vy,
        onGround: state.player.onGround,
        rocketActive: state.rocket.active,
        rocketAttached: state.rocket.attached,
        thrustDir: state.rocket.thrustDir,
        fireAt: state.rocket.fireAt,
        readyAt: state.rocket.readyAt,
        pose
      };
    });
    samples.push(sample);
    minY = Math.min(minY, sample.y);
    if (sample.fireAt && burnStartAt === null) {
      burnStartAt = sample.fireAt;
    }
    if (sample.rocketActive && !firstActiveSample) {
      firstActiveSample = sample;
    }
    if (burnStartAt !== null && !sample.rocketActive && burnEndAt === null) {
      burnEndAt = sample.now;
      burnEndY = sample.y;
    }
    if (sample.onGround && landingVx === null) {
      landingVx = sample.vx;
    }
    if (landingVx !== null && samples.length > 20) {
      settledVx = sample.vx;
      if (Math.abs(sample.vx) < 20) {
        break;
      }
    }
  }

  const finalState = await page.evaluate(() => getRocketfrockState());

  assert.ok(finalState.rocket.fireAt > 0, 'expected rocket to fire');
  assert.ok(finalState.rocket.readyAt > finalState.rocket.fireAt, 'expected rocket cooldown to be set');
  approx(finalState.rocket.readyAt - finalState.rocket.fireAt, 400, 1, 'rocket burn duration');

  const thrustDir = finalState.rocket.thrustDir;
  assert.ok(thrustDir.x * expectedXSign > 0.65, `expected launch thrust to point ${direction}, got x=${thrustDir.x}`);
  assert.ok(thrustDir.y < -0.65, `expected launch thrust to point upward, got y=${thrustDir.y}`);
  approx(Math.abs(thrustDir.x), Math.abs(thrustDir.y), 0.08, '45 degree launch balance');

  assert.ok(firstActiveSample, 'expected a live boosted frame to inspect the pose');
  const poseSample = samples.find((sample) => sample.rocketActive && sample.now - finalState.rocket.fireAt >= 300) || firstActiveSample;
  const launchPose = poseSample.pose.rocket;
  approx(launchPose.noseDir.x, thrustDir.x, 0.12, 'rocket nose direction x');
  approx(launchPose.noseDir.y, thrustDir.y, 0.12, 'rocket nose direction y');
  approx(launchPose.nozzleDir.x, -thrustDir.x, 0.12, 'rocket nozzle direction x');
  approx(launchPose.nozzleDir.y, -thrustDir.y, 0.12, 'rocket nozzle direction y');
  assert.ok(launchPose.nozzleLocal, 'expected the rocket nozzle anchor to be exposed');
  assert.ok(launchPose.nozzleLocal.x < 0, `expected the nozzle anchor to sit on the engine side, got x=${launchPose.nozzleLocal.x}`);
  assert.ok(launchPose.nozzleLocal.y > 0, `expected the nozzle anchor to sit below the rocket body, got y=${launchPose.nozzleLocal.y}`);

  assert.ok(burnEndAt !== null, 'expected rocket to burn out during the test');
  assert.ok(burnEndY !== null, 'expected a burn end altitude');
  assert.ok(
    burnEndY > minY + 40,
    `expected burn-out to happen before apogee: burnEndY=${burnEndY.toFixed(2)} minY=${minY.toFixed(2)}`
  );
  assert.ok(
    minY <= 80 && minY >= -120,
    `expected apogee to reach the top edge area: minY=${minY.toFixed(2)}`
  );

  assert.ok(landingVx !== null, 'expected the wizard to land');
  assert.ok(Math.abs(landingVx) > 120, `expected a meaningful landing speed, got ${landingVx}`);
  assert.ok(settledVx !== null, 'expected post-landing settling sample');
  assert.ok(
    Math.abs(settledVx) < 20,
    `expected horizontal speed to bleed off after landing, got ${settledVx}`
  );

    return {
      burnMs: Math.round(finalState.rocket.readyAt - finalState.rocket.fireAt),
      angleDeg: (Math.atan2(thrustDir.x, -thrustDir.y) * 180 / Math.PI).toFixed(1),
      minY: minY.toFixed(2),
      burnEndY: burnEndY.toFixed(2),
      landingVx: landingVx.toFixed(2),
      settledVx: settledVx.toFixed(2)
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    const rightResult = await runMirroredLaunchCase(page, 'right');
    const leftResult = await runMirroredLaunchCase(page, 'left');

    console.log(
      [
        'PASS IgnatiusRocketfrock testcase 1',
        `burn=${rightResult.burnMs}ms`,
        `angle=${rightResult.angleDeg}deg`,
        `minY=${rightResult.minY}`,
        `burnEndY=${rightResult.burnEndY}`,
        `landingVx=${rightResult.landingVx}`,
        `settledVx=${rightResult.settledVx}`
      ].join(' | ')
    );
    console.log(
      [
        'PASS IgnatiusRocketfrock testcase 2',
        `burn=${leftResult.burnMs}ms`,
        `angle=${leftResult.angleDeg}deg`,
        `minY=${leftResult.minY}`,
        `burnEndY=${leftResult.burnEndY}`,
        `landingVx=${leftResult.landingVx}`,
        `settledVx=${leftResult.settledVx}`
      ].join(' | ')
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('FAIL IgnatiusRocketfrock testbench');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
