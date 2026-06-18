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

const DEFAULT_CHARACTER_URL = "assets/ct_char_wizard_1.json";

const ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES = Array.from({ length: 20 }, (_, index) => {
    const atlasId = `at_atlas_${String(index + 1).padStart(3, "0")}`;
    return {
        url: `assets/${atlasId}.json`,
        forceAtlasId: atlasId,
        forceImage: `${atlasId}.png`
    };
});

const REQUIRED_RIG_SECTIONS = ["global", "animation", "anchors", "legMotion", "pivots", "parts"];

export async function createRenderer(canvas) {
    const ctx = canvas.getContext("2d", { alpha: false });
    const character = await loadCharacterDefinition(DEFAULT_CHARACTER_URL);
    const rigConfig = await loadRigConfig(character);
    const assets = await loadCharacterAtlasParts(character, rigConfig);
    const environmentAtlases = await loadEnvironmentAtlases();

    return new RocketfrockRenderer(canvas, ctx, assets, normalizeRigConfig(rigConfig), environmentAtlases, character);
}

class RocketfrockRenderer {
    constructor(canvas, ctx, assets, rigConfig, environmentAtlases = new Map(), character = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.rigConfig = rigConfig;
        this.character = character;
        this.environmentAtlases = environmentAtlases;
        this.phase = 0;
        this.forcePhase = null;
        this.visualPose = null;
        this.lastVisualPoseMode = null;
        this.lastRenderDt = 1 / 60;
        this.viewport = { w: canvas.width, h: canvas.height, dpr: 1 };
        this.lastBounds = null;
    }

    getEnvironmentManifests() {
        return this.environmentAtlases;
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
        if (!state.player.onGround) {
            // Airborne poses are now state poses, not a slow copy of the run cycle.
            this.phase = 0;
            return;
        }
        if (speedRatio < 0.04) {
            this.phase = 0;
            return;
        }
        const base = 0.55 + speedRatio * 2.6;
        this.phase = (this.phase + dt * base * Math.PI * 2) % (Math.PI * 2);
    }

    render(state, inputFrame, dt) {
        this.lastRenderDt = Math.max(0, Math.min(0.08, Number(dt) || 1 / 60));
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
        // Flat cave backing. Theme art should define the scene, and ultra-faint
        // gradients can band on some displays.
        ctx.fillStyle = "rgb(6, 6, 12)";
        ctx.fillRect(0, 0, view.w, view.h);
    }

    drawBackdrop(view) {
        // Intentionally empty for the cave theme. Outdoor themes can replace this
        // later with a theme-specific sky renderer.
    }

    drawWorld(state, view) {
        const ctx = this.ctx;
        const drewVisuals = this.drawOrderedWorldVisuals(state, view);

        const shouldDrawCollision = Boolean(state.debug.showCollision) || !drewVisuals;
        if (shouldDrawCollision) {
            for (const solid of state.world.solids) {
                const p = this.worldToScreen(view, solid.x, solid.y);
                const w = solid.w * view.zoom;
                const h = solid.h * view.zoom;
                ctx.save();
                if (state.debug.showCollision) {
                    ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.18)" : "rgba(92, 81, 124, 0.20)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                } else {
                    ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.45)" : "rgba(92, 81, 124, 0.52)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
                }
                ctx.lineWidth = 1.5 * view.dpr;
                ctx.beginPath();
                roundedRect(ctx, p.x, p.y, w, h, 8 * view.dpr);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        if (state.debug.showCollision) {
            this.drawCollisionSegments(state, view);
        }

        if (state.debug.showAssetGuides) {
            this.drawAssetGuides(state, view);
        }

        if (state.debug.showCollision) {
            ctx.save();
            ctx.font = `${12 * view.dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.64)";
            for (const label of state.world.labels) {
                const p = this.worldToScreen(view, label.x, label.y);
                ctx.fillText(label.text, p.x, p.y);
            }
            ctx.restore();
        }
    }

    drawCollisionSegments(state, view) {
        const ctx = this.ctx;
        const segments = state.world.segments || [];
        const polygons = state.world.collisionPolygons || [];
        if (!segments.length && !polygons.length) {
            return;
        }
        ctx.save();
        for (const polygon of polygons) {
            if (!Array.isArray(polygon.points) || polygon.points.length < 3) {
                continue;
            }
            ctx.fillStyle = assetAreaColor(polygon.kind);
            ctx.beginPath();
            for (let i = 0; i < polygon.points.length; i += 1) {
                const p = this.worldToScreen(view, polygon.points[i].x, polygon.points[i].y);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3 * view.dpr;
        for (const segment of segments) {
            const a = this.worldToScreen(view, segment.x1, segment.y1);
            const b = this.worldToScreen(view, segment.x2, segment.y2);
            ctx.strokeStyle = assetLineColor(segment.kind);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawOrderedWorldVisuals(state, view) {
        const visuals = (state.world.visuals || [])
            .map((visual, index) => ({ visual, index }))
            .sort((a, b) => this.visualSortKey(a.visual, a.index) - this.visualSortKey(b.visual, b.index));
        let drewAny = false;
        for (const { visual } of visuals) {
            if (visual.kind === "atlasSprite") {
                if (this.drawAtlasSpriteVisual(visual, view)) {
                    drewAny = true;
                }
            } else if (visual.kind === "cutoutMask") {
                this.drawCutoutMaskVisual(visual, view);
                drewAny = true;
            }
        }
        return drewAny;
    }

    visualSortKey(visual, index) {
        if (Number.isFinite(Number(visual.order))) {
            return Number(visual.order);
        }
        const layer = visual.layer || "terrain";
        const layerOrder = layer === "decorBack" ? 0 : layer === "terrain" ? 10000 : layer === "mask" ? 20000 : 30000;
        return layerOrder + index;
    }

    drawCutoutMaskVisual(mask, view) {
        const ctx = this.ctx;
        const p = this.worldToScreen(view, mask.x, mask.y);
        const w = mask.w * view.zoom;
        const h = mask.h * view.zoom;
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(p.x, p.y, w, h);
        ctx.restore();
    }

    drawAtlasVisuals(state, view, layer) {
        const visuals = state.world.visuals || [];
        let drewAny = false;
        for (const visual of visuals) {
            if ((visual.layer || "terrain") !== layer) {
                continue;
            }
            if (visual.kind !== "atlasSprite") {
                continue;
            }
            if (this.drawAtlasSpriteVisual(visual, view)) {
                drewAny = true;
            }
        }
        return drewAny;
    }

    drawAtlasSpriteVisual(visual, view) {
        const atlas = this.environmentAtlases.get(visual.atlasId);
        if (!atlas || atlas.missing || !atlas.image) {
            return false;
        }
        const frameName = visual.frame || visual.assetId;
        const frame = atlas.frames?.[frameName];
        if (!frame) {
            return false;
        }
        const ctx = this.ctx;
        const p = this.worldToScreen(view, visual.x, visual.y);
        const w = visual.w * view.zoom;
        const h = visual.h * view.zoom;
        ctx.save();
        ctx.globalAlpha *= visual.alpha ?? 1;
        if (visual.mirrorX) {
            ctx.translate(p.x + w, p.y);
            ctx.scale(-1, 1);
            ctx.drawImage(atlas.image, frame.x, frame.y, frame.w, frame.h, 0, 0, w, h);
        } else {
            ctx.drawImage(atlas.image, frame.x, frame.y, frame.w, frame.h, p.x, p.y, w, h);
        }
        ctx.restore();
        return true;
    }

    drawAssetGuides(state, view) {
        const visuals = state.world.visuals || [];
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `${11 * view.dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const visual of visuals) {
            if (visual.kind === "cutoutMask") {
                const p = this.worldToScreen(view, visual.x, visual.y);
                ctx.save();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
                ctx.lineWidth = 1.5 * view.dpr;
                ctx.setLineDash([8 * view.dpr, 5 * view.dpr]);
                ctx.strokeRect(p.x, p.y, visual.w * view.zoom, visual.h * view.zoom);
                ctx.setLineDash([]);
                ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                ctx.fillText(visual.id || "cutoutMask", p.x + 4 * view.dpr, p.y - 5 * view.dpr);
                ctx.restore();
                continue;
            }
            if (visual.kind !== "atlasSprite") {
                continue;
            }
            const atlas = this.environmentAtlases.get(visual.atlasId);
            if (!atlas || !atlas.manifest) {
                continue;
            }
            const frameName = visual.frame || visual.assetId;
            const frame = atlas.frames?.[frameName];
            const object = atlas.manifest.objects?.[visual.assetId || frameName];
            if (!frame) {
                continue;
            }

            const p = this.worldToScreen(view, visual.x, visual.y);
            ctx.save();
            ctx.strokeStyle = "rgba(86, 230, 255, 0.72)";
            ctx.lineWidth = 1.5 * view.dpr;
            ctx.setLineDash([5 * view.dpr, 4 * view.dpr]);
            ctx.strokeRect(p.x, p.y, visual.w * view.zoom, visual.h * view.zoom);
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(86, 230, 255, 0.78)";
            ctx.fillText(visual.assetId || frameName, p.x + 4 * view.dpr, p.y - 5 * view.dpr);
            ctx.restore();

            if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
                continue;
            }

            for (const loop of findClosedCollisionLoops(object)) {
                const points = loop.points.map((point) => this.assetLocalToScreen(visual, frame, point, view));
                if (points.length < 3) {
                    continue;
                }
                ctx.save();
                ctx.fillStyle = assetAreaColor(loop.kind);
                ctx.beginPath();
                for (let i = 0; i < points.length; i += 1) {
                    const p = points[i];
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            for (const line of object.lines) {
                const a = object.nodes.find((node) => node.id === line.from);
                const b = object.nodes.find((node) => node.id === line.to);
                if (!a || !b) {
                    continue;
                }
                const ap = this.assetLocalToScreen(visual, frame, a, view);
                const bp = this.assetLocalToScreen(visual, frame, b, view);
                const color = assetLineColor(line.kind);
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5 * view.dpr;
                ctx.beginPath();
                ctx.moveTo(ap.x, ap.y);
                ctx.lineTo(bp.x, bp.y);
                ctx.stroke();
                ctx.restore();
            }

            for (const node of object.nodes) {
                const np = this.assetLocalToScreen(visual, frame, node, view);
                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
                ctx.lineWidth = 1 * view.dpr;
                ctx.beginPath();
                ctx.arc(np.x, np.y, 3.4 * view.dpr, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();
    }

    assetLocalToScreen(visual, frame, node, view) {
        const localX = visual.mirrorX ? frame.w - node.x : node.x;
        const wx = visual.x + localX / Math.max(1, frame.w) * visual.w;
        const wy = visual.y + node.y / Math.max(1, frame.h) * visual.h;
        return this.worldToScreen(view, wx, wy);
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
                ctx.save();
                const sparkRadius = 32 * view.zoom;
                this.drawSparkBurst(p.x, p.y, view, projectile.age + projectile.x, 14, sparkRadius);
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
        const targetPose = this.computeRigPose(state, zoom);
        const pose = this.blendRigPose(targetPose, state, zoom);
        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

        ctx.save();
        ctx.translate(screenX, screenGroundY);
        ctx.scale(facing, 1);
        const lowHealthTint = getLowHealthTintAlpha(state);
        for (const name of FIXED_DRAW_ORDER) {
            const spriteTint = name === "rocket" ? 0 : lowHealthTint;
            const spriteBounds = this.drawSprite(name, pose.transforms[name], zoom, spriteTint);
            mergeBounds(bounds, spriteBounds, screenX, screenGroundY, facing);
            if (name === "rocket") {
                // Phase 1.011: attached boost exhaust is represented by world-managed smoke/spark puffs,
                // not by a local flame sprite. The flying projectile still keeps its short nozzle flame.
                this.drawMountedRocketFuelBulb(pose.transforms[name], state, zoom);
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
        const rocket = state.equipment.rocket;
        const airborne = !state.player.onGround;
        const kickWindow = Math.max(0.16, Math.min(0.34, (state.tuning.attachedBoostBurstDuration ?? 0.5) * 0.55));
        const boostKickPose = airborne && rocket.attachedBoosting && rocket.attachedBoostTime <= kickWindow;
        const hoverPose = airborne && rocket.attachedBoosting && !boostKickPose;
        const poseMode = hoverPose ? "hover" : (airborne ? "jump" : "ground");
        const motionAmount = poseMode === "ground" ? groundMotion : 0;
        const bob = poseMode === "ground"
            ? (Math.sin(phase * 2) * anim.bobAmplitude - Math.max(0, Math.cos(phase * 2)) * anim.bobCompression) * scale * motionAmount
            : 0;
        const standLean = 0.02;
        const runLean = lean + speedRatio * 0.1;
        let torsoAngle = standLean * (1 - motionAmount) + runLean * motionAmount + Math.sin(phase * 2) * anim.torsoWobble * motionAmount;
        if (poseMode === "jump") {
            const riseLean = state.player.vy < 0 ? 0.08 : 0.045;
            torsoAngle = boostKickPose ? 0.12 : riseLean;
        } else if (poseMode === "hover") {
            torsoAngle = 0.015 + Math.sin(state.clock.time * 5.5) * 0.012;
        }
        const headAngle = torsoAngle * anim.headLeanMultiplier + (poseMode === "ground" ? Math.sin(phase * 2 + 0.4) * anim.headWobble * motionAmount : 0);
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
        const rocketBob = rocket.attachedBoosting ? Math.sin(state.clock.time * 38) * 2.8 * scale : Math.sin(phase * 2 + 0.7) * anim.rocketBob * scale * motionAmount;
        const rocketBobPoint = { x: rocketMount.x, y: rocketMount.y + rocketBob };

        return {
            poseMode,
            transforms: {
                leftArm: this.makeArmTransform("left", leftShoulder, phase, scale, torsoAngle, motionAmount, poseMode),
                leftFoot: this.makeLegTransform("left", root, phase, scale, motionAmount, poseMode, state),
                rocket: this.makeRigidTransform("rocket", rocketBobPoint, torsoAngle, scale),
                rightFoot: this.makeLegTransform("right", root, phase, scale, motionAmount, poseMode, state),
                robe: this.makeRigidTransform("robe", root, torsoAngle, scale),
                head: this.makeRigidTransform("head", neck, headAngle, scale),
                hat: this.makeRigidTransform("hat", hatBase, headAngle, scale),
                rightArm: this.makeArmTransform("right", rightShoulder, phase, scale, torsoAngle, motionAmount, poseMode)
            }
        };
    }

    blendRigPose(targetPose, state, zoom) {
        const speed = Number(state.tuning.poseBlendSpeed ?? 14);
        if (!Number.isFinite(speed) || speed <= 0 || !this.visualPose) {
            this.visualPose = clonePose(targetPose);
            this.lastVisualPoseMode = targetPose.poseMode;
            return targetPose;
        }

        const alpha = 1 - Math.exp(-speed * this.lastRenderDt);
        const blended = {
            poseMode: targetPose.poseMode,
            transforms: {}
        };

        for (const name of FIXED_DRAW_ORDER) {
            const from = this.visualPose.transforms[name];
            const to = targetPose.transforms[name];
            blended.transforms[name] = from ? lerpTransform(from, to, alpha) : { ...to };
        }

        this.visualPose = clonePose(blended);
        this.lastVisualPoseMode = targetPose.poseMode;
        return blended;
    }

    makeLegTransform(side, root, phase, scale, motionAmount = 1, poseMode = "ground", state = null) {
        const name = side === "left" ? "leftFoot" : "rightFoot";
        const part = this.rigConfig.parts[name];
        const motion = this.rigConfig.legMotion;
        const baseX = side === "left" ? motion.leftBaseX : motion.rightBaseX;

        if (poseMode !== "ground") {
            const falling = state ? state.player.vy > 120 : false;
            const kick = state ? state.equipment.rocket.attachedBoosting && state.equipment.rocket.attachedBoostTime < 0.24 : false;
            let poseX = baseX;
            let poseY = motion.groundRise;
            let angle = part.rotation.base;

            if (poseMode === "hover") {
                // Hovering should read as a passive dangle rather than airborne running.
                poseX += side === "left" ? -4 : 4;
                poseY += 2;
                angle += side === "left" ? -0.025 : 0.025;
            } else {
                // Jump/kick pose: one leg trailing from takeoff and the other preparing to land.
                const apart = kick ? 1.18 : 1.0;
                if (side === "left") {
                    poseX -= 24 * apart;
                    poseY += falling ? -14 : -2;
                    angle += -0.18;
                } else {
                    poseX += 32 * apart;
                    poseY += falling ? -4 : -22;
                    angle += 0.21;
                }
            }

            const point = applyPartOffset({
                x: root.x + poseX * scale,
                y: poseY * scale
            }, part, scale);
            return {
                x: point.x,
                y: point.y,
                angle,
                targetHeight: part.targetHeight * scale * part.scale,
                alpha: part.alpha
            };
        }

        const p = phase + (side === "left" ? 0 : Math.PI);
        const stride = -Math.sin(p) * motionAmount;
        const lift = Math.max(0, -Math.cos(p)) * motionAmount;
        const planted = Math.max(0, Math.cos(p)) * motionAmount;
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

    makeArmTransform(side, shoulder, phase, scale, torsoAngle, motionAmount = 1, poseMode = "ground") {
        const name = side === "left" ? "leftArm" : "rightArm";
        const part = this.rigConfig.parts[name];
        const point = applyPartOffset(shoulder, part, scale);

        if (poseMode !== "ground") {
            const passive = poseMode === "hover";
            const spread = passive ? 0 : (side === "left" ? -0.08 : 0.08);
            return {
                x: point.x,
                y: point.y,
                angle: torsoAngle * (part.rotation.torso ?? 1) + part.rotation.base + spread,
                targetHeight: part.targetHeight * scale * part.scale,
                alpha: part.alpha
            };
        }

        const p = phase + (side === "left" ? 0 : Math.PI);
        const swing = -Math.sin(p) * motionAmount;
        const lift = Math.max(0, -Math.cos(p)) * motionAmount;
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

    drawMountedRocketFuelBulb(transform, state, zoom) {
        if (state.tuning.rocketFuelBulbEnabled === false) {
            return;
        }
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing || !transform) {
            return;
        }
        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRocketFuelBulbLocal(ctx, asset, pivot, state, state.clock.time);
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

    drawSprite(name, transform, zoom, tintAlpha = 0) {
        const asset = this.assets.get(name);
        if (!asset || asset.missing || !transform) {
            return null;
        }

        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots[name];
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        const drawX = -pivot.x * asset.width;
        const drawY = -pivot.y * asset.height;
        ctx.save();
        ctx.globalAlpha *= transform.alpha;
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        ctx.drawImage(asset.canvas, drawX, drawY);

        if (tintAlpha > 0 && asset.lowHealthCanvas) {
            const baseAlpha = ctx.globalAlpha;
            ctx.globalAlpha = baseAlpha * clamp(tintAlpha, 0, 1);
            ctx.drawImage(asset.lowHealthCanvas, drawX, drawY);
            ctx.globalAlpha = baseAlpha;
        }

        if (this.rigConfig.global.debugPivots) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "rgba(255, 237, 120, 0.72)";
            ctx.lineWidth = 1 / Math.max(0.001, Math.abs(spriteScale));
            ctx.strokeRect(drawX, drawY, asset.width, asset.height);
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
            for (const solid of state.world.solids || []) {
                const p = this.worldToScreen(view, solid.x, solid.y);
                ctx.strokeRect(p.x, p.y, solid.w * view.zoom, solid.h * view.zoom);
            }
            for (const segment of state.world.segments || []) {
                const a = this.worldToScreen(view, segment.x1, segment.y1);
                const b = this.worldToScreen(view, segment.x2, segment.y2);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
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
        // Disabled for the cave theme. A flat deep blue-black background avoids
        // radial-gradient banding and leaves room for future explicit cave silhouettes.
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
            renderer: "Atlas-backed character renderer using assets/ct_char_wizard_1.json and assets/ct_rig_wizard_1.json."
        };
    }
}

async function loadCharacterDefinition(url) {
    const character = await loadJsonStrict(url, "character definition");
    character.sourceUrl = url;
    if (!character.rig) {
        throw new Error(`Character definition ${url} does not specify a rig file.`);
    }
    return character;
}

async function loadRigConfig(character) {
    const rigUrl = resolveRelativeUrl(character.sourceUrl || DEFAULT_CHARACTER_URL, character.rig);
    const rig = await loadJsonStrict(rigUrl, "character rig");
    rig.sourceUrl = rigUrl;
    return rig;
}

function normalizeRigConfig(rawConfig) {
    const config = rawConfig || {};
    for (const section of REQUIRED_RIG_SECTIONS) {
        if (!config[section]) {
            throw new Error(`Character rig is missing required section "${section}".`);
        }
    }
    config.drawOrder = FIXED_DRAW_ORDER.slice();
    for (const name of FIXED_DRAW_ORDER) {
        if (!config.parts[name]) {
            throw new Error(`Character rig is missing required part "${name}".`);
        }
        if (!config.pivots[name]) {
            throw new Error(`Character rig is missing required pivot "${name}".`);
        }
        config.parts[name].frame = config.parts[name].frame || name;
        config.parts[name].offset = config.parts[name].offset || { x: 0, y: 0 };
        config.parts[name].rotation = config.parts[name].rotation || {};
        config.parts[name].scale = Number.isFinite(Number(config.parts[name].scale)) ? Number(config.parts[name].scale) : 1;
        config.parts[name].alpha = Number.isFinite(Number(config.parts[name].alpha)) ? Number(config.parts[name].alpha) : 1;
    }
    return config;
}

async function loadCharacterAtlasParts(character, rigConfig) {
    const rigUrl = rigConfig.sourceUrl || resolveRelativeUrl(character.sourceUrl || DEFAULT_CHARACTER_URL, character.rig);
    const atlasManifestUrl = resolveRelativeUrl(rigUrl, rigConfig.atlasManifest || `${rigConfig.atlasId || "ct_atlas_wizard_1"}.json`);
    const atlasManifest = await loadJsonStrict(atlasManifestUrl, "character asset manifest");
    const imageUrl = resolveRelativeUrl(atlasManifestUrl, atlasManifest.image);
    const image = await loadImage(imageUrl);
    const assets = new Map();

    for (const partName of FIXED_DRAW_ORDER) {
        const part = rigConfig.parts[partName] || {};
        const frameId = part.frame || partName;
        const frame = atlasManifest.frames && atlasManifest.frames[frameId];
        if (!frame) {
            throw new Error(`Character atlas ${atlasManifestUrl} is missing frame "${frameId}" for rig part "${partName}".`);
        }
        assets.set(partName, makeAtlasFrameAsset(image, frame, partName, frameId, imageUrl, atlasManifest.atlasId));
    }

    return assets;
}

function makeAtlasFrameAsset(image, frame, partName, frameId, imageUrl, atlasId) {
    const x = Number(frame.x) || 0;
    const y = Number(frame.y) || 0;
    const w = Math.max(1, Number(frame.w) || 1);
    const h = Math.max(1, Number(frame.h) || 1);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(image, x, y, w, h, 0, 0, w, h);
    const lowHealthCanvas = makeTintedSpriteCanvas(canvas, "#f04b45");
    return {
        canvas,
        lowHealthCanvas,
        width: w,
        height: h,
        naturalWidth: image.naturalWidth || image.width,
        naturalHeight: image.naturalHeight || image.height,
        bounds: { x, y, w, h },
        name: partName,
        frameId,
        atlasId,
        source: `${imageUrl}#${frameId}`,
        missing: false
    };
}

function makeTintedSpriteCanvas(sourceCanvas, color) {
    const canvas = document.createElement("canvas");
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

function getLowHealthTintAlpha(state) {
    if (!state || !state.health || !state.health.low) {
        return 0;
    }
    const pulse = clamp(Number(state.player?.lowHealthPulse) || 0, 0, 1);
    return 0.18 + pulse * 0.34;
}

async function loadEnvironmentAtlases() {
    const atlases = new Map();
    for (const candidate of ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES) {
        let manifest = null;
        try {
            const response = await fetch(candidate.url, { cache: "no-store" });
            if (!response.ok) {
                break;
            }
            manifest = await response.json();
        } catch (error) {
            break;
        }

        manifest = normalizeEnvironmentManifest(manifest, candidate.forceAtlasId, candidate.forceImage);
        if (!manifest || !manifest.atlasId || atlases.has(manifest.atlasId)) {
            break;
        }

        const imageUrl = resolveRelativeUrl(candidate.url, manifest.image);
        let image = null;
        try {
            image = await loadImage(imageUrl);
        } catch (error) {
            break;
        }

        atlases.set(manifest.atlasId, {
            id: manifest.atlasId,
            image,
            frames: manifest.frames || {},
            source: imageUrl,
            manifest,
            missing: false
        });
    }
    return atlases;
}

function normalizeEnvironmentManifest(manifest, forcedAtlasId, forcedImage) {
    const normalized = JSON.parse(JSON.stringify(manifest || {}));
    if (forcedAtlasId) {
        normalized.atlasId = forcedAtlasId;
    }
    if (forcedImage) {
        normalized.image = forcedImage;
    }
    return normalized;
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

async function loadJsonStrict(url, label) {
    let response;
    try {
        response = await fetch(url, { cache: "no-store" });
    } catch (error) {
        throw new Error(`Could not load ${label} from ${url}. Use a local web server and make sure the file exists. ${error.message}`);
    }
    if (!response.ok) {
        throw new Error(`Could not load ${label} from ${url}: HTTP ${response.status}.`);
    }
    return await response.json();
}

function pathDirectory(url) {
    const text = String(url || "");
    const slash = text.lastIndexOf("/");
    return slash >= 0 ? text.slice(0, slash + 1) : "";
}

function resolveRelativeUrl(baseUrl, relativeUrl) {
    const text = String(relativeUrl || "");
    if (/^(?:[a-z]+:)?\/\//i.test(text) || text.startsWith("/")) {
        return text;
    }
    return pathDirectory(baseUrl) + text;
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



function drawRocketFuelBulbLocal(ctx, asset, pivot, state, time) {
    const fuel = state.fuel || { amount: 0, max: 100, rechargeDelayTimer: 0, rechargeCap: 100 };
    const tuning = state.tuning || {};
    const rocket = state.equipment?.rocket || {};
    const ratio = clamp(fuel.amount / Math.max(1, fuel.max || 100), 0, 1);
    const percent = ratio * 100;
    const low = tuning.rocketFuelBulbLowThreshold ?? 25;
    const mid = tuning.rocketFuelBulbMediumThreshold ?? 60;
    const scale = tuning.rocketFuelBulbScale ?? 1;
    const bulbX = (0.46 - pivot.x) * asset.width;
    const bulbY = (0.47 - pivot.y) * asset.height;
    const radius = Math.max(5, Math.min(asset.width, asset.height) * 0.055 * scale);
    const canRechargeNow = tuning.fuelRechargeRequiresGround === false || state.player.onGround || fuel.rechargeLatched === true;
    const recharging = Boolean(
        tuning.rocketFuelBulbPulseWhenRecharging !== false &&
        !rocket.attachedBoosting &&
        canRechargeNow &&
        (fuel.rechargeDelayTimer ?? 0) <= 0 &&
        fuel.amount < Math.min(fuel.rechargeCap ?? fuel.max, fuel.max)
    );
    const unavailable = (tuning.fuelRechargeRequiresGround !== false && !state.player.onGround && fuel.rechargeLatched !== true) || (fuel.rechargeDelayTimer ?? 0) > 0;
    const flash = clamp((rocket.fuelBulbFlashTimer ?? 0) / 0.45, 0, 1);
    const pulse = recharging ? 0.5 + 0.5 * Math.sin(time * 13.5) : 0;

    let fill = "rgba(18, 16, 20, 0.88)";
    let glow = "rgba(0, 0, 0, 0)";
    if (percent > 0.5 && percent < low) {
        fill = "rgba(220, 59, 58, 0.95)";
        glow = "rgba(255, 67, 53, 0.45)";
    } else if (percent >= low && percent < mid) {
        fill = "rgba(239, 198, 71, 0.96)";
        glow = "rgba(255, 217, 75, 0.42)";
    } else if (percent >= mid) {
        fill = "rgba(103, 218, 117, 0.96)";
        glow = "rgba(100, 244, 126, 0.42)";
    }

    const dim = unavailable && !recharging ? 0.62 : 1;
    const glowRadius = radius * (2.2 + pulse * 0.75 + flash * 1.8);

    ctx.save();
    ctx.translate(bulbX, bulbY);
    ctx.globalCompositeOperation = "source-over";

    if (percent > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, glowRadius);
        g.addColorStop(0, glow);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = dim * (0.55 + pulse * 0.35 + flash * 0.42);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "rgba(5, 4, 7, 0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = dim;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (fuel.amount > 0 && fuel.amount < fuel.max) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
        ctx.beginPath();
        ctx.rect(-radius, -radius, radius * 2, radius * 2 * (1 - ratio));
        ctx.clip();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.globalAlpha = 0.88;
    ctx.strokeStyle = flash > 0.01 ? "rgba(255, 255, 210, 0.98)" : (unavailable ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 255, 255, 0.66)");
    ctx.lineWidth = Math.max(1.25, radius * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.06 + flash * 0.35), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.70;
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.beginPath();
    ctx.arc(-radius * 0.28, -radius * 0.32, radius * 0.23, 0, Math.PI * 2);
    ctx.fill();

    if (percent <= 0.5) {
        ctx.globalAlpha = 0.42 + 0.22 * Math.sin(time * 10);
        ctx.strokeStyle = "rgba(255, 80, 62, 0.76)";
        ctx.lineWidth = Math.max(1, radius * 0.12);
        ctx.beginPath();
        ctx.moveTo(-radius * 0.55, radius * 0.52);
        ctx.lineTo(radius * 0.55, -radius * 0.52);
        ctx.stroke();
    }

    ctx.restore();
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

function clonePose(pose) {
    return {
        poseMode: pose.poseMode,
        transforms: Object.fromEntries(
            Object.entries(pose.transforms).map(([name, transform]) => [name, { ...transform }])
        )
    };
}

function lerpTransform(from, to, alpha) {
    return {
        x: lerp(from.x, to.x, alpha),
        y: lerp(from.y, to.y, alpha),
        angle: lerpAngle(from.angle, to.angle, alpha),
        targetHeight: lerp(from.targetHeight, to.targetHeight, alpha),
        alpha: lerp(from.alpha, to.alpha, alpha)
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
    let delta = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
    if (delta < -Math.PI) {
        delta += Math.PI * 2;
    }
    return a + delta * t;
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

function findClosedCollisionLoops(object) {
    if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
        return [];
    }

    const nodeById = new Map(object.nodes.map((node) => [node.id, node]));
    const blockerLines = object.lines.filter((line) => isAreaBlockingLineKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    const blockerLoops = findClosedLoopsFromLines(blockerLines, nodeById);
    if (blockerLoops.length) {
        return blockerLoops;
    }

    const solidLines = object.lines.filter((line) => isSolidGuideLineKind(line.kind) && nodeById.has(line.from) && nodeById.has(line.to));
    return findClosedLoopsFromLines(solidLines, nodeById).filter((loop) => loop.lines.some((line) => isAreaBlockingLineKind(line.kind)));
}

function isSolidGuideLineKind(kind) {
    return kind === "walkable" || kind === "blockable" || kind === "damaging" || kind === "killable";
}

function isAreaBlockingLineKind(kind) {
    return kind === "blockable" || kind === "damaging" || kind === "killable";
}

function findClosedLoopsFromLines(lines, nodeById) {
    const components = collectLineComponents(lines);
    const loops = [];

    for (const component of components) {
        if (component.length < 3) {
            continue;
        }

        const degree = new Map();
        for (const line of component) {
            degree.set(line.from, (degree.get(line.from) || 0) + 1);
            degree.set(line.to, (degree.get(line.to) || 0) + 1);
        }
        if ([...degree.values()].some((count) => count !== 2)) {
            continue;
        }

        const ordered = orderClosedLineLoop(component, nodeById);
        if (!ordered || ordered.points.length < 3) {
            continue;
        }

        const area = polygonArea(ordered.points);
        if (Math.abs(area) < 4) {
            continue;
        }

        loops.push({
            kind: collisionLoopKind(component),
            points: area < 0 ? ordered.points.slice().reverse() : ordered.points,
            lineIds: component.map((line) => line.id || ""),
            lines: component
        });
    }

    return loops;
}

function collectLineComponents(lines) {
    const byNode = new Map();
    for (const line of lines) {
        if (!byNode.has(line.from)) byNode.set(line.from, []);
        if (!byNode.has(line.to)) byNode.set(line.to, []);
        byNode.get(line.from).push(line);
        byNode.get(line.to).push(line);
    }

    const components = [];
    const seen = new Set();
    for (const line of lines) {
        const lineKey = line.id || `${line.from}->${line.to}`;
        if (seen.has(lineKey)) {
            continue;
        }
        const stack = [line];
        const component = [];
        while (stack.length) {
            const current = stack.pop();
            const key = current.id || `${current.from}->${current.to}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            component.push(current);
            for (const nodeId of [current.from, current.to]) {
                for (const next of byNode.get(nodeId) || []) {
                    const nextKey = next.id || `${next.from}->${next.to}`;
                    if (!seen.has(nextKey)) {
                        stack.push(next);
                    }
                }
            }
        }
        components.push(component);
    }
    return components;
}

function orderClosedLineLoop(lines, nodeById) {
    const adjacency = new Map();
    for (const line of lines) {
        if (!adjacency.has(line.from)) adjacency.set(line.from, []);
        if (!adjacency.has(line.to)) adjacency.set(line.to, []);
        adjacency.get(line.from).push({ to: line.to, line });
        adjacency.get(line.to).push({ to: line.from, line });
    }

    const start = lines[0].from;
    let current = start;
    let previous = null;
    const used = new Set();
    const points = [];

    for (let guard = 0; guard < lines.length + 2; guard += 1) {
        const node = nodeById.get(current);
        if (!node) {
            return null;
        }
        points.push({ x: node.x, y: node.y });
        const candidates = adjacency.get(current) || [];
        const nextEdge = candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return candidate.to !== previous && !used.has(key);
        }) || candidates.find((candidate) => {
            const key = candidate.line.id || `${candidate.line.from}->${candidate.line.to}`;
            return !used.has(key);
        });
        if (!nextEdge) {
            return null;
        }
        const key = nextEdge.line.id || `${nextEdge.line.from}->${nextEdge.line.to}`;
        used.add(key);
        previous = current;
        current = nextEdge.to;
        if (current === start) {
            return used.size === lines.length ? { points } : null;
        }
    }

    return null;
}

function collisionLoopKind(lines) {
    if (lines.some((line) => line.kind === "killable")) return "killable";
    if (lines.some((line) => line.kind === "damaging")) return "damaging";
    return "blockable";
}

function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        area += a.x * b.y - b.x * a.y;
    }
    return area * 0.5;
}

function assetLineColor(kind) {
    if (kind === "walkable") return "rgba(88, 255, 158, 0.92)";
    if (kind === "blockable") return "rgba(255, 225, 94, 0.92)";
    if (kind === "damaging") return "rgba(255, 159, 67, 0.95)";
    if (kind === "killable") return "rgba(255, 79, 97, 0.95)";
    return "rgba(255, 255, 255, 0.85)";
}

function assetAreaColor(kind) {
    if (kind === "damaging") return "rgba(255, 159, 67, 0.20)";
    if (kind === "killable") return "rgba(255, 79, 97, 0.22)";
    return "rgba(255, 225, 94, 0.18)";
}
