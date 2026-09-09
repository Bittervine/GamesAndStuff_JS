import { AtmosphereGpuRenderer } from "../presentation/atmosphere-renderer.js";
import { createWebGL2RendererBackend } from "../presentation/webgl2-renderer.js";
import { normalizeAtmosphereEffects } from "../shared/level-layer-data.js";

export class AtmospherePreviewRenderer {
    constructor(canvas) {
        this.canvas = canvas || null;
        this.backend = null;
        this.atmosphereRenderer = new AtmosphereGpuRenderer();
        this.triggerRareRequested = false;
        this.lastError = "";
    }

    ensureBackend() {
        if (this.backend?.available) return true;
        if (!this.canvas) return false;
        this.backend = createWebGL2RendererBackend(this.canvas);
        if (!this.backend?.available) {
            this.lastError = "WebGL2 hardware rendering is unavailable.";
            return false;
        }
        this.lastError = "";
        return true;
    }

    resizeToDisplay() {
        if (!this.canvas) return { width: 1, height: 1 };
        const dpr = Math.max(1, Math.min(2, Number(globalThis.devicePixelRatio) || 1));
        const width = Math.max(1, Math.round(Math.max(320, this.canvas.clientWidth || 960) * dpr));
        const height = Math.max(1, Math.round(Math.max(180, this.canvas.clientHeight || 540) * dpr));
        if (this.canvas.width !== width) this.canvas.width = width;
        if (this.canvas.height !== height) this.canvas.height = height;
        return { width, height };
    }

    triggerRareEffects() {
        this.triggerRareRequested = true;
    }

    render({ effects, levelId = "level_editor_preview", timeSeconds = 0 } = {}) {
        if (!this.ensureBackend()) return false;
        const { width, height } = this.resizeToDisplay();
        const backend = this.backend;
        const atmosphere = this.atmosphereRenderer;
        const normalizedEffects = normalizeAtmosphereEffects(effects);
        const time = Math.max(0, Number(timeSeconds) || 0);
        const gameState = {
            settings: { renderingQuality: "high" },
            clock: { time },
            world: {
                levelId: String(levelId || "level_editor_preview"),
                layerVisuals: { background: { effects: normalizedEffects } }
            }
        };
        const view = { x: 0, y: 0, w: width, h: height, zoom: 1 };
        // A slow production-style parallax drift makes unstable sub-pixel effects
        // visible in the preview instead of accidentally testing a stationary sky.
        const backgroundOffset = { x: time * 28, y: Math.sin(time * 0.17) * 3 };

        if (!backend.beginFrame(width, height, "rgb(10, 15, 25)")) return false;
        const active = atmosphere.beginFrame(gameState, view, backgroundOffset);
        if (this.triggerRareRequested && active) {
            if (normalizedEffects.aurora > 0) atmosphere.spawnAurora();
            if (normalizedEffects.meteor > 0) atmosphere.spawnMeteor(true);
            if (normalizedEffects.lightning > 0) atmosphere.spawnLightning();
            if (normalizedEffects.bats > 0) atmosphere.spawnBatFlock();
            if (normalizedEffects.eyes > 0) atmosphere.spawnEyes();
            this.triggerRareRequested = false;
        }

        if (active) atmosphere.renderBehindBackground(backend);

        if (active) {
            atmosphere.applyHeatShimmerIfNeeded(backend);
            atmosphere.renderFrontOfBackground(backend);
            atmosphere.renderFrontOfTerrain(backend);
        }
        backend.endFrame();
        return true;
    }
}
