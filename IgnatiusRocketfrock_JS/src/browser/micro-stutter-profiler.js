const DEFAULT_THRESHOLD_MS = 10;
const DEFAULT_RAF_GAP_MS = 20;
const DEFAULT_MAX_SAMPLES = 900;
const DEFAULT_LONG_FRAME_MS = 50;
const SCHEMA_VERSION = 2;

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

function roundedPosition(value) {
    return Math.round(finiteNumber(value, 0) * 1000) / 1000;
}

function boundedInteger(value, fallback, min, max) {
    const number = Math.floor(finiteNumber(value, fallback));
    return Math.max(min, Math.min(max, number));
}

function normalizeString(value, fallback = "") {
    const text = String(value ?? "").trim();
    return text || fallback;
}

function movementDistance(x, y) {
    return Math.hypot(finiteNumber(x, 0), finiteNumber(y, 0));
}

function normalizePresentation(raw, previous, snapState) {
    if (!raw || typeof raw !== "object") return null;
    const playerCurrentX = roundedPosition(raw.playerCurrentX);
    const playerCurrentY = roundedPosition(raw.playerCurrentY);
    const playerShownX = roundedPosition(raw.playerShownX);
    const playerShownY = roundedPosition(raw.playerShownY);
    const cameraCurrentX = roundedPosition(raw.cameraCurrentX);
    const cameraCurrentY = roundedPosition(raw.cameraCurrentY);
    const cameraShownX = roundedPosition(raw.cameraShownX);
    const cameraShownY = roundedPosition(raw.cameraShownY);
    const playerScreenX = roundedPosition(playerShownX - cameraShownX);
    const playerScreenY = roundedPosition(playerShownY - cameraShownY);
    const hasPrevious = Boolean(previous);
    const snapSequence = Math.max(0, Math.floor(finiteNumber(snapState?.sequence, 0)));
    const previousSnapSequence = Math.max(0, Math.floor(finiteNumber(snapState?.previousSequence, snapSequence)));

    return {
        player: {
            currentX: playerCurrentX,
            currentY: playerCurrentY,
            shownX: playerShownX,
            shownY: playerShownY,
            currentDeltaX: hasPrevious ? roundedPosition(playerCurrentX - previous.playerCurrentX) : 0,
            currentDeltaY: hasPrevious ? roundedPosition(playerCurrentY - previous.playerCurrentY) : 0,
            shownDeltaX: hasPrevious ? roundedPosition(playerShownX - previous.playerShownX) : 0,
            shownDeltaY: hasPrevious ? roundedPosition(playerShownY - previous.playerShownY) : 0
        },
        camera: {
            currentX: cameraCurrentX,
            currentY: cameraCurrentY,
            shownX: cameraShownX,
            shownY: cameraShownY,
            currentDeltaX: hasPrevious ? roundedPosition(cameraCurrentX - previous.cameraCurrentX) : 0,
            currentDeltaY: hasPrevious ? roundedPosition(cameraCurrentY - previous.cameraCurrentY) : 0,
            shownDeltaX: hasPrevious ? roundedPosition(cameraShownX - previous.cameraShownX) : 0,
            shownDeltaY: hasPrevious ? roundedPosition(cameraShownY - previous.cameraShownY) : 0
        },
        playerScreen: {
            x: playerScreenX,
            y: playerScreenY,
            deltaX: hasPrevious ? roundedPosition(playerScreenX - previous.playerScreenX) : 0,
            deltaY: hasPrevious ? roundedPosition(playerScreenY - previous.playerScreenY) : 0
        },
        snap: {
            sequence: snapSequence,
            events: Math.max(0, snapSequence - previousSnapSequence),
            reason: normalizeString(snapState?.lastReason),
            subject: normalizeString(snapState?.lastSubject),
            kind: normalizeString(snapState?.lastKind)
        }
    };
}

function summarizeSamples(samples) {
    const summary = {
        sampledFrames: samples.length,
        maxWorkMs: 0,
        maxRafGapMs: 0,
        maxCallbackEntryGapMs: 0,
        maxCallbackLatenessMs: 0,
        callbackEntryGapsOver20Ms: 0,
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
        },
        presentation: {
            frames: 0,
            snapFrames: 0,
            snapEvents: 0,
            maxPlayerShownStep: 0,
            maxCameraShownStep: 0,
            maxPlayerScreenStep: 0
        },
        staticTile: {
            diagnosticFrames: 0,
            workerMessages: 0,
            workerResultsDiscarded: 0,
            tilesCompleted: 0,
            tilesAdopted: 0,
            tilesUploaded: 0,
            uploadFrames: 0,
            uploadBursts: 0,
            uploadBytes: 0,
            tilesEvicted: 0,
            distantEvictions: 0,
            budgetEvictions: 0,
            jobsQueued: 0,
            jobsStarted: 0,
            maxWorkerCollectMs: 0,
            maxCacheEnsureMs: 0,
            maxCompletedAdoptionMs: 0,
            maxPlanningMs: 0,
            maxEvictionMs: 0,
            maxJobSchedulingMs: 0,
            maxAtlasAllocationMs: 0,
            maxTextureUploadMs: 0,
            maxDrawMs: 0
        }
    };
    let lastStaticTileUploadBurstId = 0;

    for (const sample of samples) {
        const workMs = finiteNumber(sample.workMs, 0);
        const rafGapMs = finiteNumber(sample.rafGapMs, 0);
        const callbackEntryGapMs = finiteNumber(sample.callbackEntryGapMs, 0);
        const callbackLatenessMs = finiteNumber(sample.callbackLatenessMs, 0);
        const renderMs = finiteNumber(sample.renderMs, 0);
        const simulationMs = finiteNumber(sample.simulationMs, 0);
        const hudMs = finiteNumber(sample.hudMs, 0);
        const debugMs = finiteNumber(sample.debugMs, 0);
        const otherMs = finiteNumber(sample.otherMs, 0);
        summary.maxWorkMs = Math.max(summary.maxWorkMs, workMs);
        summary.maxRafGapMs = Math.max(summary.maxRafGapMs, rafGapMs);
        summary.maxCallbackEntryGapMs = Math.max(summary.maxCallbackEntryGapMs, callbackEntryGapMs);
        summary.maxCallbackLatenessMs = Math.max(summary.maxCallbackLatenessMs, callbackLatenessMs);
        if (callbackEntryGapMs >= 20) summary.callbackEntryGapsOver20Ms += 1;
        summary.maxRenderMs = Math.max(summary.maxRenderMs, renderMs);
        summary.maxSimulationMs = Math.max(summary.maxSimulationMs, simulationMs);
        summary.maxHudMs = Math.max(summary.maxHudMs, hudMs);
        summary.maxDebugMs = Math.max(summary.maxDebugMs, debugMs);
        summary.maxOtherMs = Math.max(summary.maxOtherMs, otherMs);
        summary.maxFixedSteps = Math.max(summary.maxFixedSteps, Math.max(0, Math.floor(finiteNumber(sample.fixedSteps, 0))));
        if (workMs >= DEFAULT_LONG_FRAME_MS || rafGapMs >= DEFAULT_LONG_FRAME_MS || callbackEntryGapMs >= DEFAULT_LONG_FRAME_MS) {
            summary.longFrames += 1;
        }
        if (!summary.worstFrame || workMs > finiteNumber(summary.worstFrame.workMs, 0)) {
            summary.worstFrame = sample;
        }
        for (const key of Object.keys(summary.phaseTotals)) {
            summary.phaseTotals[key] += finiteNumber(sample[key], 0);
        }
        const presentation = sample.presentation;
        if (presentation) {
            const presentationSummary = summary.presentation;
            presentationSummary.frames += 1;
            const snapEvents = Math.max(0, Math.floor(finiteNumber(presentation.snap?.events, 0)));
            presentationSummary.snapEvents += snapEvents;
            if (snapEvents > 0) presentationSummary.snapFrames += 1;
            presentationSummary.maxPlayerShownStep = Math.max(
                presentationSummary.maxPlayerShownStep,
                movementDistance(presentation.player?.shownDeltaX, presentation.player?.shownDeltaY)
            );
            presentationSummary.maxCameraShownStep = Math.max(
                presentationSummary.maxCameraShownStep,
                movementDistance(presentation.camera?.shownDeltaX, presentation.camera?.shownDeltaY)
            );
            presentationSummary.maxPlayerScreenStep = Math.max(
                presentationSummary.maxPlayerScreenStep,
                movementDistance(presentation.playerScreen?.deltaX, presentation.playerScreen?.deltaY)
            );
        }
        const renderer = sample.renderer;
        if (renderer?.staticTileDiagnosticsActive) {
            const tile = summary.staticTile;
            tile.diagnosticFrames += 1;
            tile.workerMessages += Math.max(0, Math.floor(finiteNumber(renderer.staticTileWorkerMessages, 0)));
            tile.workerResultsDiscarded += Math.max(0, Math.floor(finiteNumber(renderer.staticTileWorkerResultsDiscarded, 0)));
            tile.tilesCompleted += Math.max(0, Math.floor(finiteNumber(renderer.staticTileTilesCompleted, 0)));
            tile.tilesAdopted += Math.max(0, Math.floor(finiteNumber(renderer.staticTileTilesAdopted, 0)));
            const uploaded = Math.max(0, Math.floor(finiteNumber(renderer.staticTileTilesUploaded, 0)));
            tile.tilesUploaded += uploaded;
            if (uploaded > 0) tile.uploadFrames += 1;
            tile.uploadBytes += Math.max(0, Math.floor(finiteNumber(renderer.staticTileUploadBytes, 0)));
            tile.tilesEvicted += Math.max(0, Math.floor(finiteNumber(renderer.staticTileTilesEvicted, 0)));
            tile.distantEvictions += Math.max(0, Math.floor(finiteNumber(renderer.staticTileDistantEvictions, 0)));
            tile.budgetEvictions += Math.max(0, Math.floor(finiteNumber(renderer.staticTileBudgetEvictions, 0)));
            tile.jobsQueued += Math.max(0, Math.floor(finiteNumber(renderer.staticTileJobsQueued, 0)));
            tile.jobsStarted += Math.max(0, Math.floor(finiteNumber(renderer.staticTileJobsStarted, 0)));
            const burstId = Math.max(0, Math.floor(finiteNumber(renderer.staticTileUploadBurstId, 0)));
            if (uploaded > 0 && burstId > 0 && burstId !== lastStaticTileUploadBurstId) {
                tile.uploadBursts += 1;
                lastStaticTileUploadBurstId = burstId;
            }
            tile.maxWorkerCollectMs = Math.max(tile.maxWorkerCollectMs, finiteNumber(renderer.staticTileWorkerCollectMs, 0));
            tile.maxCacheEnsureMs = Math.max(tile.maxCacheEnsureMs, finiteNumber(renderer.staticTileCacheEnsureMs, 0));
            tile.maxCompletedAdoptionMs = Math.max(tile.maxCompletedAdoptionMs, finiteNumber(renderer.staticTileCompletedAdoptionMs, 0));
            tile.maxPlanningMs = Math.max(tile.maxPlanningMs, finiteNumber(renderer.staticTilePlanningMs, 0));
            tile.maxEvictionMs = Math.max(tile.maxEvictionMs, finiteNumber(renderer.staticTileEvictionMs, 0));
            tile.maxJobSchedulingMs = Math.max(tile.maxJobSchedulingMs, finiteNumber(renderer.staticTileJobSchedulingMs, 0));
            tile.maxAtlasAllocationMs = Math.max(tile.maxAtlasAllocationMs, finiteNumber(renderer.staticTileAtlasAllocationMs, 0));
            tile.maxTextureUploadMs = Math.max(tile.maxTextureUploadMs, finiteNumber(renderer.staticTileTextureUploadMs, 0));
            tile.maxDrawMs = Math.max(tile.maxDrawMs, finiteNumber(renderer.staticTileDrawMs, 0));
        }
    }

    for (const key of Object.keys(summary.phaseTotals)) {
        summary.phaseTotals[key] = roundedMs(summary.phaseTotals[key]);
    }
    for (const key of [
        "maxWorkMs",
        "maxRafGapMs",
        "maxCallbackEntryGapMs",
        "maxCallbackLatenessMs",
        "maxRenderMs",
        "maxSimulationMs",
        "maxHudMs",
        "maxDebugMs",
        "maxOtherMs"
    ]) {
        summary[key] = roundedMs(summary[key]);
    }
    for (const key of ["maxPlayerShownStep", "maxCameraShownStep", "maxPlayerScreenStep"]) {
        summary.presentation[key] = roundedPosition(summary.presentation[key]);
    }
    for (const key of [
        "maxWorkerCollectMs",
        "maxCacheEnsureMs",
        "maxCompletedAdoptionMs",
        "maxPlanningMs",
        "maxEvictionMs",
        "maxJobSchedulingMs",
        "maxAtlasAllocationMs",
        "maxTextureUploadMs",
        "maxDrawMs"
    ]) {
        summary.staticTile[key] = roundedMs(summary.staticTile[key]);
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
        this.lastPresentationState = null;
        this.lastSnapSequence = null;
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
        this.lastPresentationState = null;
        this.lastSnapSequence = null;
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
        const callbackEntryGapMs = roundedMs(frame.callbackEntryGapMs);
        const callbackLatenessMs = roundedMs(frame.callbackLatenessMs);
        const snapSequence = Math.max(0, Math.floor(finiteNumber(frame.presentationSnap?.sequence, 0)));
        const presentation = normalizePresentation(frame.presentation, this.lastPresentationState, {
            ...frame.presentationSnap,
            sequence: snapSequence,
            previousSequence: this.lastSnapSequence ?? snapSequence
        });
        if (presentation) {
            this.lastPresentationState = {
                playerCurrentX: presentation.player.currentX,
                playerCurrentY: presentation.player.currentY,
                playerShownX: presentation.player.shownX,
                playerShownY: presentation.player.shownY,
                cameraCurrentX: presentation.camera.currentX,
                cameraCurrentY: presentation.camera.currentY,
                cameraShownX: presentation.camera.shownX,
                cameraShownY: presentation.camera.shownY,
                playerScreenX: presentation.playerScreen.x,
                playerScreenY: presentation.playerScreen.y
            };
        }
        this.lastSnapSequence = snapSequence;

        const shouldCapture = workMs >= this.thresholdMs
            || rafGapMs >= this.rafGapMs
            || callbackEntryGapMs >= this.rafGapMs;
        let captured = false;
        if (shouldCapture) {
            const sample = {
                frame: this.totalFrames,
                tick: Math.max(0, Math.floor(finiteNumber(frame.tick, 0))),
                time: Math.round(finiteNumber(frame.time, 0) * 1000) / 1000,
                workMs,
                rafGapMs,
                callbackEntryGapMs,
                callbackLatenessMs,
                realDtMs: roundedMs(frame.realDtMs),
                fixedSteps: Math.max(0, Math.floor(finiteNumber(frame.fixedSteps, 0))),
                accumulatorMs: roundedMs(frame.accumulatorMs),
                interpolationBlend: Math.round(Math.max(0, Math.min(1, finiteNumber(frame.interpolationBlend, 1))) * 1000000) / 1000000,
                inputMs: roundedMs(frame.inputMs),
                simulationMs: roundedMs(frame.simulationMs),
                postSimulationMs: roundedMs(frame.postSimulationMs),
                renderMs: roundedMs(frame.renderMs),
                hudMs: roundedMs(frame.hudMs),
                debugMs: roundedMs(frame.debugMs),
                otherMs: roundedMs(frame.otherMs),
                paused: Boolean(frame.paused),
                titleScreen: Boolean(frame.titleScreen),
                renderMode: frame.renderMode && typeof frame.renderMode === "object"
                    ? {
                        backend: normalizeString(frame.renderMode.backend, "unknown"),
                        bakingMode: normalizeString(frame.renderMode.bakingMode, "off"),
                        hardwareRequested: Boolean(frame.renderMode.hardwareRequested)
                    }
                    : null,
                presentation,
                renderer: frame.renderer || null
            };
            this.samples.push(sample);
            this.capturedFrames += 1;
            if (this.samples.length > this.maxSamples) {
                this.samples.shift();
                this.droppedSamples += 1;
            }
            captured = true;
        }

        return captured;
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
            marks: [],
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
