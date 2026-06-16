const FIXED_DRAW_ORDER = [
    "leftArm",
    "leftFoot",
    "rocket",
    "rightFoot",
    "robe",
    "head",
    "hat",
    "rightArm"
];

const ASSET_CANDIDATES = {
    hat: ["assets/wizard_hat.png", "wizard_hat.png"],
    head: ["assets/wizard_head.png", "wizard_head.png"],
    robe: ["assets/wizard_robe.png", "wizard_robe.png"],
    leftArm: ["assets/wizard_left_arm.png", "wizard_left_arm.png"],
    rightArm: ["assets/wizard_right_arm.png", "wizard_right_arm.png"],
    leftFoot: ["assets/wizard_left_foot.png", "wizard_left_foot.png"],
    rightFoot: ["assets/wizard_right_foot.png", "wizard_right_foot.png"],
    rocket: ["assets/wizard_rocket.png", "wizard_rocket.png"]
};

const FALLBACK_RIG_CONFIG = {
    meta: { version: 2 },
    drawOrder: FIXED_DRAW_ORDER,
    global: {
        scale: 0.35,
        lean: 0.19,
        rootX: 550,
        rootYOffsetFromGround: -146,
        groundOffset: -15,
        debugPivots: false
    },
    animation: {
        speed: 3,
        torsoWobble: 0.035,
        headWobble: 0.025,
        headLeanMultiplier: 0.45,
        rootSway: 3.2,
        bobAmplitude: 5.5,
        bobCompression: 1.6,
        rocketBob: 2.2
    },
    anchors: {
        shoulderCenter: { x: 0, y: -102 },
        leftShoulder: { x: 20, y: 4 },
        rightShoulder: { x: -20, y: 4 },
        neck: { x: 4, y: -134 },
        rocketMount: { x: -45, y: -64 },
        hatFromHead: { x: -1, y: -55 }
    },
    legMotion: {
        stride: 37,
        lift: 26,
        groundRise: -4,
        leftBaseX: 13,
        rightBaseX: -13,
        angleStride: -0.15,
        angleLift: 0.1,
        anglePlanted: -0.03
    },
    pivots: {
        leftArm: { x: 0.27, y: 0.14 },
        leftFoot: { x: 0.38, y: 0.86 },
        rocket: { x: 0.72, y: 0.58 },
        rightFoot: { x: 0.42, y: 0.86 },
        robe: { x: 0.55, y: 0.55 },
        head: { x: 0.53, y: 0.82 },
        hat: { x: 0.46, y: 0.765 },
        rightArm: { x: 0.48, y: 0.13 }
    },
    parts: {
        leftArm: { targetHeight: 128, scale: 0.73, offset: { x: -12, y: 59 }, rotation: { base: -0.16, swing: 0.52, lift: -0.08, torso: 1 }, alpha: 1 },
        leftFoot: { targetHeight: 90, scale: 0.98, offset: { x: -34, y: 0 }, rotation: { base: 0 }, alpha: 1 },
        rocket: { targetHeight: 220, scale: 1, offset: { x: 3, y: 40 }, rotation: { base: 0.07, torso: 1 }, alpha: 0.98 },
        rightFoot: { targetHeight: 90, scale: 1.02, offset: { x: 0, y: 0 }, rotation: { base: 0 }, alpha: 1 },
        robe: { targetHeight: 258, scale: 0.73, offset: { x: 9, y: 21 }, rotation: { base: 0, torso: 1 }, alpha: 1 },
        head: { targetHeight: 78, scale: 1.28, offset: { x: -14, y: 71 }, rotation: { base: 0 }, alpha: 1 },
        hat: { targetHeight: 76, scale: 1.33, offset: { x: -13, y: 55 }, rotation: { base: -0.02 }, alpha: 1 },
        rightArm: { targetHeight: 128, scale: 1.03, offset: { x: -10, y: 63 }, rotation: { base: 0.03, swing: 0.52, lift: -0.08, torso: 1 }, alpha: 1 }
    }
};

export async function createRenderer(canvas) {
    const ctx = canvas.getContext("2d", { alpha: false });
    const assets = new Map();
    const rigConfig = await loadRigConfig();
    await loadAllAssets(assets);

    return new RocketfrockRenderer(canvas, ctx, assets, normalizeRigConfig(rigConfig));
}

class RocketfrockRenderer {
    constructor(canvas, ctx, assets, rigConfig) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.rigConfig = rigConfig;
        this.phase = 0;
        this.forcePhase = null;
        this.viewport = { w: canvas.width, h: canvas.height, dpr: 1 };
        this.lastBounds = null;
    }

    resize() {
        const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
        const width = Math.floor(this.canvas.clientWidth * dpr);
        const height = Math.floor(this.canvas.clientHeight * dpr);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.viewport = { w: width, h: height, dpr };
    }

    updatePhase(state, dt) {
        if (this.forcePhase !== null) {
            this.phase = this.forcePhase;
            return;
        }
        const speedRatio = Math.min(1.4, Math.abs(state.player.vx) / Math.max(1, state.tuning.maxRunSpeed));
        if (state.player.onGround && speedRatio < 0.04) {
            this.phase = 0;
            return;
        }
        const base = state.player.onGround ? 0.55 + speedRatio * 2.6 : 0.7;
        this.phase = (this.phase + dt * base * Math.PI * 2) % (Math.PI * 2);
    }

    render(state, inputFrame, dt) {
        this.resize();
        this.updatePhase(state, dt);
        const ctx = this.ctx;
        const view = this.computeView(state);
        this.clear(view);
        this.drawBackdrop(view);
        this.drawWorld(state, view);
        this.drawTargets(state, view);
        this.drawPickups(state, view);
        this.drawEnemies(state, view);
        this.drawWorldEffects(state, view);
        this.drawProjectiles(state, view);
        this.drawPlayer(state, view);
        this.drawDebug(state, view, inputFrame);
        this.drawVignette();
    }

    computeView(state) {
        const w = this.viewport.w;
        const h = this.viewport.h;
        const dpr = this.viewport.dpr;
        const zoom = dpr;
        return {
            w,
            h,
            dpr,
            zoom,
            x: state.camera.x - w / zoom * 0.5,
            y: state.camera.y - h / zoom * 0.56
        };
    }

    worldToScreen(view, x, y) {
        return {
            x: (x - view.x) * view.zoom,
            y: (y - view.y) * view.zoom
        };
    }

    clear(view) {
        const ctx = this.ctx;
        const g = ctx.createLinearGradient(0, 0, 0, view.h);
        g.addColorStop(0, "#2a2441");
        g.addColorStop(0.58, "#17172a");
        g.addColorStop(1, "#101019");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, view.w, view.h);
    }

    drawBackdrop(view) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.19;
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 70; i += 1) {
            const x = (i * 211 + 47 - view.x * 0.05) % view.w;
            const y = (i * 113 + 71 - view.y * 0.04) % Math.max(1, view.h * 0.72);
            ctx.fillRect(x, y, 1.4 * view.dpr, 1.4 * view.dpr);
        }
        ctx.restore();
    }

    drawWorld(state, view) {
        const ctx = this.ctx;
        for (const solid of state.world.solids) {
            const p = this.worldToScreen(view, solid.x, solid.y);
            const w = solid.w * view.zoom;
            const h = solid.h * view.zoom;
            ctx.save();
            ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.45)" : "rgba(92, 81, 124, 0.52)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
            ctx.lineWidth = 1.5 * view.dpr;
            ctx.beginPath();
            roundedRect(ctx, p.x, p.y, w, h, 8 * view.dpr);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.font = `${12 * view.dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.56)";
        for (const label of state.world.labels) {
            const p = this.worldToScreen(view, label.x, label.y);
            ctx.fillText(label.text, p.x, p.y);
        }
        ctx.restore();
    }

    drawTargets(state, view) {
        const ctx = this.ctx;
        for (const target of state.targets || []) {
            if (target.state !== "active") continue;
            const p = this.worldToScreen(view, target.x, target.y);
            const pulse = 0.5 + 0.5 * Math.sin(state.clock.time * 5.5);
            ctx.save();
            ctx.lineWidth = 2 * view.dpr;
            ctx.strokeStyle = `rgba(255, 234, 124, ${0.55 + pulse * 0.25})`;
            ctx.fillStyle = "rgba(255, 126, 98, 0.82)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, target.radius * view.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, (target.radius + 9 + pulse * 4) * view.zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawPickups(state, view) {
        const ctx = this.ctx;
        for (const pickup of state.pickups) {
            if (pickup.collected) continue;
            const p = this.worldToScreen(view, pickup.x, pickup.y);
            const r = pickup.radius * view.zoom;
            ctx.save();
            ctx.globalAlpha = 0.82 + 0.18 * Math.sin(state.clock.time * 5 + pickup.x);
            ctx.fillStyle = "rgba(113, 224, 126, 0.82)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    drawEnemies(state, view) {
        const ctx = this.ctx;
        for (const enemy of state.enemies) {
            const p = this.worldToScreen(view, enemy.x - enemy.width / 2, enemy.y - enemy.height);
            ctx.save();
            ctx.fillStyle = "rgba(202, 135, 255, 0.62)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.beginPath();
            roundedRect(ctx, p.x, p.y, enemy.width * view.zoom, enemy.height * view.zoom, 14 * view.dpr);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
            ctx.beginPath();
            ctx.arc(p.x + enemy.width * view.zoom * 0.38, p.y + enemy.height * view.zoom * 0.35, 3 * view.dpr, 0, Math.PI * 2);
            ctx.arc(p.x + enemy.width * view.zoom * 0.62, p.y + enemy.height * view.zoom * 0.35, 3 * view.dpr, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawWorldEffects(state, view) {
        const ctx = this.ctx;
        const puffs = state.effects?.smokePuffs || [];
        if (!puffs.length) {
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        for (const puff of puffs) {
            const ageRatio = clamp(puff.age / Math.max(0.001, puff.lifetime), 0, 1);
            const p = this.worldToScreen(view, puff.x, puff.y);
            const radius = (puff.radius * (0.75 + ageRatio * 1.65)) * view.zoom;
            const smokeAlpha = 0.30 * Math.pow(1 - ageRatio, 1.25);

            const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, Math.max(1, radius));
            g.addColorStop(0, `rgba(207, 198, 218, ${smokeAlpha})`);
            g.addColorStop(0.56, `rgba(155, 145, 170, ${smokeAlpha * 0.48})`);
            g.addColorStop(1, "rgba(92, 84, 112, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();

            const sparkFade = Math.pow(1 - ageRatio, 1.9);
            if (sparkFade > 0.025) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                const sparkCount = 2 + Math.floor(5 * (1 - ageRatio));
                for (let i = 0; i < sparkCount; i += 1) {
                    const seed = (puff.sparkleSeed || 0) + i * 17;
                    const angle = hashNoise(seed, i) * Math.PI * 2;
                    const r = radius * (0.12 + hashNoise(seed + 31, i) * 0.64);
                    const twinkle = 0.72 + 0.28 * Math.sin((state.clock.time + puff.age) * 18 + i * 1.4);
                    const size = (0.9 + hashNoise(seed + 79, i) * 2.6) * view.dpr;
                    ctx.globalAlpha = clamp(0.12 + sparkFade * twinkle * 0.72, 0, 0.82);
                    ctx.fillStyle = i % 3 === 0 ? "rgba(204, 157, 255, 0.92)" : "rgba(255, 238, 129, 0.94)";
                    ctx.beginPath();
                    ctx.arc(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
        ctx.restore();
    }

    drawProjectiles(state, view) {
        const ctx = this.ctx;
        for (const projectile of state.projectiles || []) {
            if (projectile.state === "exploding") {
                const p = this.worldToScreen(view, projectile.x, projectile.y);
                const life = Math.max(0, projectile.explosionTimer / Math.max(0.001, projectile.lifetime || 1));
                const ring = (34 + (1 - life) * 44) * view.zoom;
                ctx.save();
                ctx.globalAlpha = 0.55 + life * 0.35;
                ctx.strokeStyle = "rgba(255, 213, 104, 0.9)";
                ctx.lineWidth = 3 * view.dpr;
                ctx.beginPath();
                ctx.arc(p.x, p.y, ring, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 109, 87, 0.16)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, ring * 0.72, 0, Math.PI * 2);
                ctx.fill();
                this.drawSparkBurst(p.x, p.y, view, projectile.age + projectile.x, 18, ring * 0.6);
                ctx.restore();
                continue;
            }

            if (projectile.state !== "launched") {
                continue;
            }
            this.drawProjectileRocket(projectile, state, view);
        }
    }

    drawProjectileRocket(projectile, state, view) {
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing) {
            return;
        }
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const dir = { x: projectile.vx / speed, y: projectile.vy / speed };
        const angle = Math.atan2(dir.x, -dir.y);
        const pivot = this.rigConfig.pivots.rocket;
        const targetHeight = 72 * view.zoom;
        const spriteScale = targetHeight / Math.max(1, asset.height);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.scale(spriteScale, spriteScale);
        ctx.drawImage(asset.canvas, -pivot.x * asset.width, -pivot.y * asset.height);
        drawRocketFlameLocal(ctx, asset, pivot, state.clock.time + projectile.age * 11, 0.55, projectile.id.length * 13);
        ctx.restore();
    }

    drawRocketPathTrail(projectile, state, view) {
        const ctx = this.ctx;
        const rawTrail = Array.isArray(projectile.trail) ? projectile.trail : [];
        const trail = rawTrail.concat([{ x: projectile.x, y: projectile.y, time: state.clock.time }]);
        if (trail.length < 2) {
            return;
        }

        const screenTrail = trail.map((point) => ({
            ...this.worldToScreen(view, point.x, point.y),
            worldX: point.x,
            worldY: point.y,
            time: point.time ?? state.clock.time
        }));

        const maxScreenLength = this.canvas.width * 0.34;
        const visible = [screenTrail[screenTrail.length - 1]];
        let distanceSoFar = 0;
        for (let i = screenTrail.length - 2; i >= 0; i -= 1) {
            const newer = screenTrail[i + 1];
            const older = screenTrail[i];
            const segment = Math.hypot(newer.x - older.x, newer.y - older.y);
            if (distanceSoFar + segment > maxScreenLength) {
                const remaining = Math.max(0, maxScreenLength - distanceSoFar);
                const ratio = segment <= 0 ? 0 : remaining / segment;
                visible.push({
                    x: newer.x + (older.x - newer.x) * ratio,
                    y: newer.y + (older.y - newer.y) * ratio,
                    time: older.time
                });
                break;
            }
            visible.push(older);
            distanceSoFar += segment;
        }
        visible.reverse();

        if (visible.length < 2) {
            return;
        }

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // First pass: smoke that stays on the travelled path.
        for (let i = 0; i < visible.length - 1; i += 1) {
            const a = visible[i];
            const b = visible[i + 1];
            const u = i / Math.max(1, visible.length - 2);
            const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 2.15, 0, 1);
            const smokeAlpha = (0.06 + 0.24 * u) * (1 - age * 0.45);
            const smokeWidth = (28 - u * 16) * view.dpr;
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = smokeAlpha;
            ctx.strokeStyle = "rgba(184, 172, 198, 1)";
            ctx.lineWidth = Math.max(2, smokeWidth);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        // Second pass: hot magical sparkle crumbs pinned to the same bent path.
        ctx.globalCompositeOperation = "lighter";
        const sparkCount = Math.min(110, Math.max(18, visible.length * 5));
        const seed = projectile.id.length * 97 + Math.floor(projectile.x * 0.11) + Math.floor(projectile.y * 0.07);
        for (let i = 0; i < sparkCount; i += 1) {
            const segmentIndex = Math.min(visible.length - 2, Math.floor(hashNoise(seed + 13, i) * (visible.length - 1)));
            const a = visible[segmentIndex];
            const b = visible[segmentIndex + 1];
            const t = hashNoise(seed + 31, i);
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const length = Math.hypot(dx, dy) || 1;
            const nx = -dy / length;
            const ny = dx / length;
            const u = (segmentIndex + t) / Math.max(1, visible.length - 1);
            const spread = (8 + (1 - u) * 24) * view.dpr;
            const jitter = (hashNoise(seed + 71, i) - 0.5) * spread;
            const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 2.15, 0, 1);
            const twinkle = 0.72 + 0.28 * Math.sin(state.clock.time * 19 + i * 1.7);
            const fade = Math.pow(u, 0.38) * (1 - age * 0.55) * twinkle;
            const size = (1.0 + hashNoise(seed + 101, i) * 3.6) * view.dpr * (0.55 + fade);
            ctx.globalAlpha = clamp(0.05 + fade * 0.72, 0, 0.86);
            ctx.fillStyle = i % 7 === 0 ? "rgba(197, 151, 255, 0.95)" : (i % 2 === 0 ? "rgba(255, 239, 126, 0.94)" : "rgba(255, 133, 82, 0.9)");
            ctx.beginPath();
            ctx.arc(x + nx * jitter, y + ny * jitter, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Small hot core near the nozzle, still short and local to the current rocket.
        const newest = visible[visible.length - 1];
        const previous = visible[Math.max(0, visible.length - 2)];
        const vx = newest.x - previous.x;
        const vy = newest.y - previous.y;
        const length = Math.hypot(vx, vy) || 1;
        const tailX = -vx / length;
        const tailY = -vy / length;
        const core = ctx.createRadialGradient(newest.x + tailX * 18 * view.dpr, newest.y + tailY * 18 * view.dpr, 1, newest.x + tailX * 28 * view.dpr, newest.y + tailY * 28 * view.dpr, 34 * view.dpr);
        core.addColorStop(0, "rgba(255, 235, 126, 0.46)");
        core.addColorStop(1, "rgba(255, 116, 70, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(newest.x + tailX * 24 * view.dpr, newest.y + tailY * 24 * view.dpr, 34 * view.dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSparkBurst(x, y, view, seed, count, radius) {
        const ctx = this.ctx;
        ctx.save();
        for (let i = 0; i < count; i += 1) {
            const a = hashNoise(seed, i) * Math.PI * 2;
            const r = (0.25 + hashNoise(seed + 31, i) * 0.75) * radius;
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            const size = (1.2 + hashNoise(seed + 71, i) * 2.7) * view.dpr;
            ctx.globalAlpha = 0.35 + hashNoise(seed + 109, i) * 0.5;
            ctx.fillStyle = i % 3 === 0 ? "rgba(255, 246, 166, 0.9)" : "rgba(255, 137, 82, 0.86)";
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawPlayer(state, view) {
        const p = this.worldToScreen(view, state.player.x, state.player.y);
        this.drawShadow(p.x, p.y, view.zoom);
        const bounds = this.drawWizardRig(p.x, p.y, state.player.facing, state, view.zoom);
        this.lastBounds = bounds;

        if (state.health.low) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 0.14 + 0.16 * state.player.lowHealthPulse;
            ctx.fillStyle = "#e84e48";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y - state.player.height * view.zoom * 0.5, 62 * view.zoom, 78 * view.zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawShadow(x, groundY, zoom) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, groundY + 4 * zoom);
        ctx.globalAlpha = 0.26;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(0, 0, 46 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawWizardRig(screenX, screenGroundY, facing, state, zoom) {
        const ctx = this.ctx;
        const pose = this.computeRigPose(state, zoom);
        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

        ctx.save();
        ctx.translate(screenX, screenGroundY);
        ctx.scale(facing, 1);
        for (const name of FIXED_DRAW_ORDER) {
            const spriteBounds = this.drawSprite(name, pose.transforms[name], zoom);
            mergeBounds(bounds, spriteBounds, screenX, screenGroundY, facing);
            if (name === "rocket" && state.equipment.rocket.attachedBoosting) {
                this.drawMountedRocketFlame(pose.transforms[name], state, zoom);
            }
        }
        ctx.restore();

        return bounds;
    }

    computeRigPose(state, zoom = 1) {
        const phase = this.phase;
        const cfg = this.rigConfig;
        const scale = cfg.global.scale * zoom;
        const lean = cfg.global.lean;
        const anim = cfg.animation;
        const anchors = cfg.anchors;
        const speedRatio = Math.min(1.25, Math.abs(state.player.vx) / Math.max(1, state.tuning.maxRunSpeed));
        const groundMotion = smoothstep(0.05, 0.24, speedRatio);
        const motionAmount = state.player.onGround ? groundMotion : Math.max(0.35, groundMotion);
        const bob = (Math.sin(phase * 2) * anim.bobAmplitude - Math.max(0, Math.cos(phase * 2)) * anim.bobCompression) * scale * motionAmount;
        const standLean = 0.02;
        const runLean = lean + speedRatio * 0.1;
        const torsoAngle = standLean * (1 - motionAmount) + runLean * motionAmount + Math.sin(phase * 2) * anim.torsoWobble * motionAmount;
        const headAngle = torsoAngle * anim.headLeanMultiplier + Math.sin(phase * 2 + 0.4) * anim.headWobble * motionAmount;
        const root = {
            x: 0,
            y: cfg.global.rootYOffsetFromGround * scale + bob
        };
        const shoulderCenter = add(root, scaledRotatedAnchor(anchors.shoulderCenter, scale, torsoAngle));
        const leftShoulder = add(shoulderCenter, scaledRotatedAnchor(anchors.leftShoulder, scale, torsoAngle));
        const rightShoulder = add(shoulderCenter, scaledRotatedAnchor(anchors.rightShoulder, scale, torsoAngle));
        const neck = add(root, scaledRotatedAnchor(anchors.neck, scale, torsoAngle));
        const rocketMount = add(root, scaledRotatedAnchor(anchors.rocketMount, scale, torsoAngle));
        const hatBase = add(neck, scaledRotatedAnchor(anchors.hatFromHead, scale, headAngle));
        const rocketBob = state.equipment.rocket.attachedBoosting ? Math.sin(state.clock.time * 38) * 2.8 * scale : Math.sin(phase * 2 + 0.7) * anim.rocketBob * scale * motionAmount;
        const rocketBobPoint = { x: rocketMount.x, y: rocketMount.y + rocketBob };

        return {
            transforms: {
                leftArm: this.makeArmTransform("left", leftShoulder, phase, scale, torsoAngle, motionAmount),
                leftFoot: this.makeLegTransform("left", root, phase, scale, motionAmount),
                rocket: this.makeRigidTransform("rocket", rocketBobPoint, torsoAngle, scale),
                rightFoot: this.makeLegTransform("right", root, phase, scale, motionAmount),
                robe: this.makeRigidTransform("robe", root, torsoAngle, scale),
                head: this.makeRigidTransform("head", neck, headAngle, scale),
                hat: this.makeRigidTransform("hat", hatBase, headAngle, scale),
                rightArm: this.makeArmTransform("right", rightShoulder, phase, scale, torsoAngle, motionAmount)
            }
        };
    }

    makeLegTransform(side, root, phase, scale, motionAmount = 1) {
        const name = side === "left" ? "leftFoot" : "rightFoot";
        const part = this.rigConfig.parts[name];
        const motion = this.rigConfig.legMotion;
        const p = phase + (side === "left" ? 0 : Math.PI);
        const stride = -Math.sin(p) * motionAmount;
        const lift = Math.max(0, -Math.cos(p)) * motionAmount;
        const planted = Math.max(0, Math.cos(p)) * motionAmount;
        const baseX = side === "left" ? motion.leftBaseX : motion.rightBaseX;
        const basePoint = {
            x: root.x + (baseX + stride * motion.stride) * scale,
            y: (motion.groundRise - lift * motion.lift) * scale
        };
        const point = applyPartOffset(basePoint, part, scale);
        return {
            x: point.x,
            y: point.y,
            angle: part.rotation.base + motion.angleStride * stride + motion.angleLift * lift + motion.anglePlanted * planted,
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    makeArmTransform(side, shoulder, phase, scale, torsoAngle, motionAmount = 1) {
        const name = side === "left" ? "leftArm" : "rightArm";
        const part = this.rigConfig.parts[name];
        const p = phase + (side === "left" ? 0 : Math.PI);
        const swing = -Math.sin(p) * motionAmount;
        const lift = Math.max(0, -Math.cos(p)) * motionAmount;
        const point = applyPartOffset(shoulder, part, scale);
        return {
            x: point.x,
            y: point.y,
            angle: torsoAngle * part.rotation.torso + part.rotation.base + swing * part.rotation.swing + lift * part.rotation.lift,
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    drawMountedRocketFlame(transform, state, zoom) {
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing || !transform) {
            return;
        }
        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        const power = clamp(state.equipment.rocket.boostVisualPowerNow ?? 0.45, 0.2, 1.2);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRocketFlameLocal(ctx, asset, pivot, state.clock.time * 1.7, power, 41);
        ctx.restore();
    }

    makeRigidTransform(name, point, baseAngle, scale) {
        const part = this.rigConfig.parts[name];
        const rotation = part.rotation || {};
        const p = applyPartOffset(point, part, scale);
        return {
            x: p.x,
            y: p.y,
            angle: baseAngle * (rotation.torso ?? 1) + (rotation.base ?? 0),
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    drawSprite(name, transform, zoom) {
        const asset = this.assets.get(name);
        if (!asset || asset.missing || !transform) {
            return null;
        }

        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots[name];
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        ctx.save();
        ctx.globalAlpha *= transform.alpha;
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        ctx.drawImage(asset.canvas, -pivot.x * asset.width, -pivot.y * asset.height);

        if (this.rigConfig.global.debugPivots) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "rgba(255, 237, 120, 0.72)";
            ctx.lineWidth = 1 / Math.max(0.001, Math.abs(spriteScale));
            ctx.strokeRect(-pivot.x * asset.width, -pivot.y * asset.height, asset.width, asset.height);
        }
        ctx.restore();

        return transformedSpriteBounds(asset, pivot, transform, spriteScale);
    }

    drawDebug(state, view, inputFrame) {
        const ctx = this.ctx;
        if (state.debug.showCollision) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1 * view.dpr;
            for (const solid of state.world.solids) {
                const p = this.worldToScreen(view, solid.x, solid.y);
                ctx.strokeRect(p.x, p.y, solid.w * view.zoom, solid.h * view.zoom);
            }
            ctx.restore();
        }

        if (state.debug.showHitboxes) {
            const rect = {
                x: state.player.x - state.player.width / 2,
                y: state.player.y - state.player.height,
                w: state.player.width,
                h: state.player.height
            };
            const p = this.worldToScreen(view, rect.x, rect.y);
            ctx.save();
            ctx.strokeStyle = "rgba(127, 232, 255, 0.82)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.strokeRect(p.x, p.y, rect.w * view.zoom, rect.h * view.zoom);
            ctx.restore();
        }

        if (state.debug.showHitboxes) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 220, 110, 0.68)";
            ctx.lineWidth = 1.5 * view.dpr;
            for (const projectile of state.projectiles || []) {
                if (projectile.state !== "launched") continue;
                const p = this.worldToScreen(view, projectile.x, projectile.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, projectile.radius * view.zoom, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (const target of state.targets || []) {
                const p = this.worldToScreen(view, target.x, target.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, target.radius * view.zoom, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (state.debug.showVelocity) {
            const start = this.worldToScreen(view, state.player.x, state.player.y - state.player.height * 0.5);
            ctx.save();
            ctx.strokeStyle = "rgba(255, 223, 116, 0.92)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(start.x + state.player.vx * 0.16 * view.zoom, start.y + state.player.vy * 0.16 * view.zoom);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawVignette() {
        const ctx = this.ctx;
        const g = ctx.createRadialGradient(this.viewport.w * 0.5, this.viewport.h * 0.5, this.viewport.h * 0.25, this.viewport.w * 0.5, this.viewport.h * 0.5, this.viewport.h * 0.78);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.36)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, this.viewport.w, this.viewport.h);
    }

    getRigMetrics(state) {
        const partMetrics = {};
        const scale = this.rigConfig.global.scale;
        for (const name of FIXED_DRAW_ORDER) {
            const part = this.rigConfig.parts[name];
            partMetrics[name] = {
                targetHeight: part.targetHeight,
                partScale: part.scale,
                renderedHeightAtCanvasScale1: part.targetHeight * scale * part.scale,
                pivot: this.rigConfig.pivots[name]
            };
        }
        return {
            globalScale: scale,
            drawOrder: FIXED_DRAW_ORDER.slice(),
            parts: partMetrics,
            lastBounds: this.lastBounds,
            renderer: "Phase1 renderer uses the same rig config and part transform formula as wizard_rig_runner.html."
        };
    }
}

async function loadRigConfig() {
    try {
        const response = await fetch("./wizard_rig_config.json", { cache: "no-store" });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        // Fall back below. This keeps file:// testing alive, though a local server is recommended.
    }
    return FALLBACK_RIG_CONFIG;
}

function normalizeRigConfig(rawConfig) {
    const config = deepMerge(FALLBACK_RIG_CONFIG, rawConfig || {});
    config.drawOrder = FIXED_DRAW_ORDER.slice();
    return config;
}

async function loadAllAssets(assets) {
    await Promise.all(FIXED_DRAW_ORDER.map(async (name) => {
        assets.set(name, await loadPart(name));
    }));
}

async function loadPart(name) {
    const candidates = ASSET_CANDIDATES[name] || [];
    for (const url of candidates) {
        try {
            const img = await loadImage(url);
            const asset = trimImageByAlpha(img, name);
            asset.source = url;
            return asset;
        } catch (error) {
            // Try the next candidate.
        }
    }
    return makeMissingPart(name);
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load ${url}`));
        img.src = url;
    });
}

function trimImageByAlpha(img, name) {
    const temp = document.createElement("canvas");
    temp.width = img.naturalWidth || img.width;
    temp.height = img.naturalHeight || img.height;
    const tctx = temp.getContext("2d", { willReadFrequently: true });
    tctx.drawImage(img, 0, 0);
    const data = tctx.getImageData(0, 0, temp.width, temp.height).data;

    let minX = temp.width;
    let minY = temp.height;
    let maxX = -1;
    let maxY = -1;
    const threshold = 8;
    for (let y = 0; y < temp.height; y += 1) {
        for (let x = 0; x < temp.width; x += 1) {
            const alpha = data[(y * temp.width + x) * 4 + 3];
            if (alpha > threshold) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        return makeMissingPart(name);
    }

    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(temp.width - 1, maxX + pad);
    maxY = Math.min(temp.height - 1, maxY + pad);

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const trimmed = document.createElement("canvas");
    trimmed.width = w;
    trimmed.height = h;
    trimmed.getContext("2d").drawImage(temp, minX, minY, w, h, 0, 0, w, h);

    return {
        canvas: trimmed,
        width: w,
        height: h,
        naturalWidth: temp.width,
        naturalHeight: temp.height,
        bounds: { x: minX, y: minY, w, h },
        name,
        missing: false
    };
}

function makeMissingPart(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return { canvas, width: 1, height: 1, name, missing: true, bounds: { x: 0, y: 0, w: 1, h: 1 } };
}

function applyPartOffset(point, part, scale) {
    return {
        x: point.x + (part.offset?.x ?? 0) * scale,
        y: point.y + (part.offset?.y ?? 0) * scale
    };
}

function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

function scaledRotatedAnchor(anchor, scale, angle) {
    return rotatePoint(anchor.x * scale, anchor.y * scale, angle);
}

function rotatePoint(localX, localY, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: localX * c - localY * s,
        y: localX * s + localY * c
    };
}


function drawRocketFlameLocal(ctx, asset, pivot, time, power = 1, seed = 0) {
    const nozzleX = (0.5 - pivot.x) * asset.width;
    const nozzleY = (0.965 - pivot.y) * asset.height;
    const stablePower = clamp(power, 0.15, 1.2);
    const flutter = 0.96 + 0.04 * Math.sin(time * 33 + seed);
    const length = asset.height * 0.75 * stablePower * flutter;
    const width = asset.width * (0.16 + 0.08 * stablePower);

    ctx.save();
    ctx.translate(nozzleX, nozzleY);
    ctx.globalCompositeOperation = "lighter";

    // The rocket artwork points upward in local space, so the nozzle flame is a straight +Y plume.
    // No orbiting particles here: the long path trail is a separate world effect.
    const outer = ctx.createLinearGradient(0, 0, 0, length);
    outer.addColorStop(0, "rgba(255, 244, 149, 0.94)");
    outer.addColorStop(0.24, "rgba(255, 129, 62, 0.78)");
    outer.addColorStop(0.72, "rgba(189, 111, 255, 0.32)");
    outer.addColorStop(1, "rgba(255, 100, 45, 0)");
    ctx.fillStyle = outer;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-width * 0.52, 0);
    ctx.lineTo(width * 0.52, 0);
    ctx.quadraticCurveTo(width * 0.12, length * 0.42, 0, length);
    ctx.quadraticCurveTo(-width * 0.16, length * 0.42, -width * 0.52, 0);
    ctx.closePath();
    ctx.fill();

    const inner = ctx.createLinearGradient(0, 0, 0, length * 0.64);
    inner.addColorStop(0, "rgba(255, 255, 214, 0.96)");
    inner.addColorStop(0.5, "rgba(255, 227, 91, 0.78)");
    inner.addColorStop(1, "rgba(255, 137, 54, 0)");
    ctx.fillStyle = inner;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(-width * 0.22, 0);
    ctx.lineTo(width * 0.22, 0);
    ctx.quadraticCurveTo(width * 0.06, length * 0.28, 0, length * 0.64);
    ctx.quadraticCurveTo(-width * 0.07, length * 0.28, -width * 0.22, 0);
    ctx.closePath();
    ctx.fill();

    const emberCount = Math.floor(4 + stablePower * 7);
    for (let i = 0; i < emberCount; i += 1) {
        const tick = Math.floor(time * 18);
        const down = (0.18 + hashNoise(seed + tick + 17, i) * 0.74) * length;
        const maxLateral = width * 0.18 * (1 - down / Math.max(1, length));
        const lateral = (hashNoise(seed + tick, i) - 0.5) * maxLateral;
        const size = 0.9 + hashNoise(seed + tick + 53, i) * 1.9;
        ctx.globalAlpha = 0.22 + hashNoise(seed + tick + 91, i) * 0.38;
        ctx.fillStyle = i % 3 === 0 ? "rgba(200, 151, 255, 0.82)" : "rgba(255, 240, 132, 0.86)";
        ctx.beginPath();
        ctx.arc(lateral, down, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function hashNoise(seed, i) {
    const x = Math.sin((seed + 1) * 127.1 + (i + 3) * 311.7) * 43758.5453123;
    return x - Math.floor(x);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function transformedSpriteBounds(asset, pivot, transform, spriteScale) {
    const corners = [
        { x: -pivot.x * asset.width, y: -pivot.y * asset.height },
        { x: (1 - pivot.x) * asset.width, y: -pivot.y * asset.height },
        { x: (1 - pivot.x) * asset.width, y: (1 - pivot.y) * asset.height },
        { x: -pivot.x * asset.width, y: (1 - pivot.y) * asset.height }
    ].map((corner) => {
        const scaled = { x: corner.x * spriteScale, y: corner.y * spriteScale };
        const rotated = rotatePoint(scaled.x, scaled.y, transform.angle);
        return { x: rotated.x + transform.x, y: rotated.y + transform.y };
    });

    return {
        minX: Math.min(...corners.map((p) => p.x)),
        minY: Math.min(...corners.map((p) => p.y)),
        maxX: Math.max(...corners.map((p) => p.x)),
        maxY: Math.max(...corners.map((p) => p.y))
    };
}

function mergeBounds(out, local, screenX, screenY, facing) {
    if (!local) {
        return;
    }
    const x1 = screenX + local.minX * facing;
    const x2 = screenX + local.maxX * facing;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    out.minX = Math.min(out.minX, minX);
    out.minY = Math.min(out.minY, screenY + local.minY);
    out.maxX = Math.max(out.maxX, maxX);
    out.maxY = Math.max(out.maxY, screenY + local.maxY);
}

function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

function deepMerge(base, incoming) {
    if (Array.isArray(base)) {
        return Array.isArray(incoming) ? JSON.parse(JSON.stringify(incoming)) : JSON.parse(JSON.stringify(base));
    }
    if (!base || typeof base !== "object") {
        return incoming === undefined ? base : incoming;
    }
    const result = JSON.parse(JSON.stringify(base));
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
        return result;
    }
    for (const key of Object.keys(incoming)) {
        if (key in base) {
            result[key] = deepMerge(base[key], incoming[key]);
        } else {
            result[key] = JSON.parse(JSON.stringify(incoming[key]));
        }
    }
    return result;
}
