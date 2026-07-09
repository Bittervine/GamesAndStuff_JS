const DEFAULT_THRESHOLD_MS = 10;
const DEFAULT_RAF_GAP_MS = 20;
const DEFAULT_MAX_SAMPLES = 900;
const DEFAULT_LONG_FRAME_MS = 50;
const SCHEMA_VERSION = 1;

function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now();
    }
    return Date.now();
}

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function roundedMs(value) {
    return Math.round(Math.max(0, finiteNumber(value, 0)) * 1000) / 1000;
}

function boundedInteger(value, fallback, min, max) {
    const number = Math.floor(finiteNumber(value, fallback));
    return Math.max(min, Math.min(max, number));
}

function normalizeString(value, fallback = "") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

function summarizeSamples(samples) {
    const summary = {
        sampledFrames: samples.length,
        maxWorkMs: 0,
        maxRafGapMs: 0,
        maxRenderMs: 0,
        maxSimulationMs: 0,
        maxHudMs: 0,
        maxDebugMs: 0,
        maxOtherMs: 0,
        maxFixedSteps: 0,
        longFrames: 0,
        worstFrame: null,
        phaseTotals: {
            inputMs: 0,
            simulationMs: 0,
            postSimulationMs: 0,
            renderMs: 0,
            hudMs: 0,
            debugMs: 0,
            otherMs: 0
        }
    };

    for (const sample of samples) {
        const workMs = finiteNumber(sample.workMs, 0);
        const rafGapMs = finiteNumber(sample.rafGapMs, 0);
        const renderMs = finiteNumber(sample.renderMs, 0);
        const simulationMs = finiteNumber(sample.simulationMs, 0);
        const hudMs = finiteNumber(sample.hudMs, 0);
        const debugMs = finiteNumber(sample.debugMs, 0);
        const otherMs = finiteNumber(sample.otherMs, 0);
        summary.maxWorkMs = Math.max(summary.maxWorkMs, workMs);
        summary.maxRafGapMs = Math.max(summary.maxRafGapMs, rafGapMs);
        summary.maxRenderMs = Math.max(summary.maxRenderMs, renderMs);
        summary.maxSimulationMs = Math.max(summary.maxSimulationMs, simulationMs);
        summary.maxHudMs = Math.max(summary.maxHudMs, hudMs);
        summary.maxDebugMs = Math.max(summary.maxDebugMs, debugMs);
        summary.maxOtherMs = Math.max(summary.maxOtherMs, otherMs);
        summary.maxFixedSteps = Math.max(summary.maxFixedSteps, Math.max(0, Math.floor(finiteNumber(sample.fixedSteps, 0))));
        if (workMs >= DEFAULT_LONG_FRAME_MS || rafGapMs >= DEFAULT_LONG_FRAME_MS) {
            summary.longFrames += 1;
        }
        if (!summary.worstFrame || workMs > finiteNumber(summary.worstFrame.workMs, 0)) {
            summary.worstFrame = sample;
        }
        for (const key of Object.keys(summary.phaseTotals)) {
            summary.phaseTotals[key] += finiteNumber(sample[key], 0);
        }
    }

    for (const key of Object.keys(summary.phaseTotals)) {
        summary.phaseTotals[key] = roundedMs(summary.phaseTotals[key]);
    }
    for (const key of ["maxWorkMs", "maxRafGapMs", "maxRenderMs", "maxSimulationMs", "maxHudMs", "maxDebugMs", "maxOtherMs"]) {
        summary[key] = roundedMs(summary[key]);
    }
    return summary;
}

export class MicroStutterProfiler {
    constructor(options = {}) {
        this.enabled = false;
        this.thresholdMs = Math.max(0, finiteNumber(options.thresholdMs, DEFAULT_THRESHOLD_MS));
        this.rafGapMs = Math.max(0, finiteNumber(options.rafGapMs, DEFAULT_RAF_GAP_MS));
        this.maxSamples = boundedInteger(options.maxSamples, DEFAULT_MAX_SAMPLES, 10, 5000);
        this.label = normalizeString(options.label, "manual");
        this.startedAtMs = 0;
        this.startedAtIso = "";
        this.stoppedAtIso = "";
        this.totalFrames = 0;
        this.capturedFrames = 0;
        this.samples = [];
        this.droppedSamples = 0;
        this.lastSummary = summarizeSamples(this.samples);
    }

    isEnabled() {
        return this.enabled;
    }

    start(options = {}) {
        this.thresholdMs = Math.max(0, finiteNumber(options.thresholdMs, this.thresholdMs));
        this.rafGapMs = Math.max(0, finiteNumber(options.rafGapMs, this.rafGapMs));
        this.maxSamples = boundedInteger(options.maxSamples, this.maxSamples, 10, 5000);
        this.label = normalizeString(options.label, this.label || "manual");
        this.clear();
        this.enabled = true;
        this.startedAtMs = nowMs();
        this.startedAtIso = new Date().toISOString();
        this.stoppedAtIso = "";
        return this.status();
    }

    stop() {
        this.enabled = false;
        this.stoppedAtIso = new Date().toISOString();
        this.lastSummary = summarizeSamples(this.samples);
        return this.status();
    }

    clear() {
        this.totalFrames = 0;
        this.capturedFrames = 0;
        this.samples.length = 0;
        this.droppedSamples = 0;
        this.lastSummary = summarizeSamples(this.samples);
        return this.status();
    }

    status() {
        const summary = this.enabled ? summarizeSamples(this.samples) : this.lastSummary;
        return {
            enabled: this.enabled,
            label: this.label,
            thresholdMs: this.thresholdMs,
            rafGapMs: this.rafGapMs,
            maxSamples: this.maxSamples,
            totalFrames: this.totalFrames,
            capturedFrames: this.capturedFrames,
            droppedSamples: this.droppedSamples,
            startedAtIso: this.startedAtIso,
            stoppedAtIso: this.stoppedAtIso,
            summary
        };
    }

    recordFrame(frame) {
        if (!this.enabled || !frame) return false;
        this.totalFrames += 1;
        const workMs = roundedMs(frame.workMs);
        const rafGapMs = roundedMs(frame.rafGapMs);
        if (workMs < this.thresholdMs && rafGapMs < this.rafGapMs) {
            return false;
        }

        const sample = {
            frame: this.totalFrames,
            tick: Math.max(0, Math.floor(finiteNumber(frame.tick, 0))),
            time: Math.round(finiteNumber(frame.time, 0) * 1000) / 1000,
            workMs,
            rafGapMs,
            realDtMs: roundedMs(frame.realDtMs),
            fixedSteps: Math.max(0, Math.floor(finiteNumber(frame.fixedSteps, 0))),
            accumulatorMs: roundedMs(frame.accumulatorMs),
            inputMs: roundedMs(frame.inputMs),
            simulationMs: roundedMs(frame.simulationMs),
            postSimulationMs: roundedMs(frame.postSimulationMs),
            renderMs: roundedMs(frame.renderMs),
            hudMs: roundedMs(frame.hudMs),
            debugMs: roundedMs(frame.debugMs),
            otherMs: roundedMs(frame.otherMs),
            paused: Boolean(frame.paused),
            titleScreen: Boolean(frame.titleScreen),
            renderer: frame.renderer || null
        };
        this.samples.push(sample);
        this.capturedFrames += 1;
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
            this.droppedSamples += 1;
        }
        return true;
    }

    exportData(extra = {}) {
        const summary = summarizeSamples(this.samples);
        this.lastSummary = summary;
        return {
            schema: "ignatius.microStutterProfiler",
            schemaVersion: SCHEMA_VERSION,
            generatedAtIso: new Date().toISOString(),
            label: this.label,
            enabled: this.enabled,
            thresholdMs: this.thresholdMs,
            rafGapMs: this.rafGapMs,
            maxSamples: this.maxSamples,
            totalFrames: this.totalFrames,
            capturedFrames: this.capturedFrames,
            droppedSamples: this.droppedSamples,
            startedAtIso: this.startedAtIso,
            stoppedAtIso: this.stoppedAtIso,
            extra: extra && typeof extra === "object" ? extra : {},
            summary,
            samples: this.samples.slice()
        };
    }

    exportJson(extra = {}) {
        return JSON.stringify(this.exportData(extra), null, 2);
    }

    async copyToClipboard(extra = {}) {
        const text = this.exportJson(extra);
        if (!globalThis.navigator?.clipboard?.writeText) {
            throw new Error("Clipboard export is not available in this browser context.");
        }
        await globalThis.navigator.clipboard.writeText(text);
        return text.length;
    }
}
