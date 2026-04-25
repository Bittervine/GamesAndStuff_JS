const assert = require('assert');

function d2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function circleHitsPlayer(bullet, player) {
  return d2(bullet.x, bullet.y, player.x, player.y) < (bullet.r + player.r) * (bullet.r + player.r);
}

function updateEnemyBulletCurrent(bullet, player, dt) {
  let remove = false;
  bullet.age += dt;
  bullet.vx += (bullet.ax || 0) * dt;
  bullet.vy += (bullet.ay || 0) * dt;
  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
  bullet.life -= dt;

  if (bullet.life <= 0 || bullet.x < -80 || bullet.x > 2000 || bullet.y < -100 || bullet.y > 2000) {
    remove = true;
  }

  let hurt = false;
  if (player.invuln <= 0 && circleHitsPlayer(bullet, player)) {
    remove = true;
    hurt = true;
  }

  return { remove, hurt, life: bullet.life };
}

function updateEnemyBulletFixed(bullet, player, dt) {
  let remove = false;
  bullet.age += dt;
  bullet.vx += (bullet.ax || 0) * dt;
  bullet.vy += (bullet.ay || 0) * dt;
  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
  bullet.life -= dt;

  if (bullet.life <= 0 || bullet.x < -80 || bullet.x > 2000 || bullet.y < -100 || bullet.y > 2000) {
    remove = true;
  }

  let hurt = false;
  if (!remove && player.invuln <= 0 && circleHitsPlayer(bullet, player)) {
    remove = true;
    hurt = true;
  }

  return { remove, hurt, life: bullet.life };
}

function runCase(name, fn) {
  try {
    fn();
    console.log('PASS', name);
  } catch (err) {
    console.error('FAIL', name);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

runCase('current logic can hurt on the expiration frame', () => {
  const player = { x: 100, y: 100, r: 46, invuln: 0 };
  const bullet = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    r: 7,
    life: 0.01,
    age: 0
  };
  const result = updateEnemyBulletCurrent(bullet, player, 0.016);
  assert.strictEqual(result.remove, true);
  assert.strictEqual(result.hurt, true);
  assert.ok(result.life <= 0);
});

runCase('fixed logic prevents hits once life is exhausted', () => {
  const player = { x: 100, y: 100, r: 46, invuln: 0 };
  const bullet = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    r: 7,
    life: 0.01,
    age: 0
  };
  const result = updateEnemyBulletFixed(bullet, player, 0.016);
  assert.strictEqual(result.remove, true);
  assert.strictEqual(result.hurt, false);
  assert.ok(result.life <= 0);
});

runCase('current logic does not hurt when the bullet misses', () => {
  const player = { x: 500, y: 500, r: 46, invuln: 0 };
  const bullet = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    r: 7,
    life: 0.01,
    age: 0
  };
  const result = updateEnemyBulletCurrent(bullet, player, 0.016);
  assert.strictEqual(result.remove, true);
  assert.strictEqual(result.hurt, false);
});

console.log('Testbench complete.');
