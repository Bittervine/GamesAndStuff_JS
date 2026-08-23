import { createInputFrame } from "../core/simulation.js";

export const GAMEPLAY_RECORDING_SCHEMA = "ignatius.gameplayRecording";
export const GAMEPLAY_RECORDING_VERSION = 1;

const INPUT_SNAPSHOT_FIELDS = Object.freeze([
    "moveLeft",
    "moveRight",
    "moveAxis",
    "jumpPressed",
    "jumpHeld",
    "jumpReleased",
    "boostPressed",
    "boostHeld",
    "boostReleased",
    "weaponPressed",
    "weaponHeld",
    "weaponReleased",
    "interactPressed",
    "interactHeld",
    "interactReleased",
    "dropPressed",
    "dropHeld",
    "dropReleased",
    "inputDevice",
    "gamepadActive",
    "gamepadIndex"
]);

const DEBUG_ENTITY_LIMIT = 256;

export function normalizeLaunchLevelQuery(value, fallback = "level_001") {
    const raw = String(value || "").trim();
    if (!raw) return fallback;
    if (raw.toLowerCase() === "level_temp") {
        return "level_temp";
    }
    if (/^\d+$/.test(raw)) {
        return `level_${raw.padStart(3, "0")}`;
    }
    const match = /^level_(\d+)$/i.exec(raw);
    if (match) {
        return `level_${match[1].padStart(3, "0")}`;
    }
    return fallback;
}

export function playbackUrlFromQueryValue(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const filename = raw.split(/[\\/]+/).pop().replace(/[^a-z0-9_.-]+/gi, "_");
    if (!filename || filename === "." || filename === "..") return "";
    return `recordings/${filename}`;
}

export function sanitizeRecordingFilename(value, fallback = "ignatius_recording.json") {
    const raw = String(value || fallback).trim() || fallback;
    const base = raw.split(/[\\/]+/).pop().replace(/[^a-z0-9_.-]+/gi, "_") || fallback;
    return base.toLowerCase().endsWith(".json") ? base : `${base}.json`;
}

export function snapshotGameplayInput(inputFrame = {}) {
    const snapshot = {};
    for (const key of INPUT_SNAPSHOT_FIELDS) {
        if (key in inputFrame) {
            const value = inputFrame[key];
            snapshot[key] = typeof value === "number" ? roundNumber(value, 6) : value;
        }
    }
    const aimVector = inputFrame.aimVector || null;
    snapshot.aimVector = aimVector
        ? { x: roundNumber(aimVector.x, 6), y: roundNumber(aimVector.y, 6) }
        : { x: 1, y: 0 };
    snapshot.aimTarget = inputFrame.aimTarget
        ? { x: roundNumber(inputFrame.aimTarget.x, 3), y: roundNumber(inputFrame.aimTarget.y, 3) }
        : null;
    return snapshot;
}

export function inputFrameFromSnapshot(snapshot = {}) {
    const input = createInputFrame(snapshot || {});
    input.aimVector = snapshot.aimVector
        ? { x: finiteNumber(snapshot.aimVector.x), y: finiteNumber(snapshot.aimVector.y) }
        : { x: 1, y: 0 };
    input.aimTarget = snapshot.aimTarget
        ? { x: finiteNumber(snapshot.aimTarget.x), y: finiteNumber(snapshot.aimTarget.y) }
        : null;
    input.pausePressed = false;
    input.stepPressed = false;
    input.resetPressed = false;
    input.toggleHitboxesPressed = false;
    input.toggleVelocityPressed = false;
    input.toggleCollisionPressed = false;
    input.exportStatePressed = false;
    input.toggleInputConsoleLogPressed = false;
    input.toggleDebugPanelPressed = false;
    return input;
}

export function createGameplayRecording({ revision = "", levelId = "", initialState = null, settings = null, source = "manual", retainFrames = true } = {}) {
    const nowIso = new Date().toISOString();
    return {
        schema: GAMEPLAY_RECORDING_SCHEMA,
        schemaVersion: GAMEPLAY_RECORDING_VERSION,
        generatedAtIso: nowIso,
        startedAtIso: nowIso,
        stoppedAtIso: null,
        source,
        revision: String(revision || ""),
        levelId: String(levelId || initialState?.world?.levelId || ""),
        initial: {
            gameTimeSec: roundNumber(initialState?.clock?.time, 6),
            tick: Math.max(0, Math.floor(Number(initialState?.clock?.tick) || 0)),
            randomSeed: Math.floor(Number(initialState?.random?.seed) || 0) >>> 0,
            randomLevelLoadCount: Math.max(0, Math.floor(Number(initialState?.random?.levelLoadCount) || 0)),
            settings: settings || initialState?.settings || null
        },
        initialState,
        frames: retainFrames ? [] : null,
        summary: {
            frames: 0,
            durationSec: 0,
            finalGameTimeSec: roundNumber(initialState?.clock?.time, 6),
            finalTick: Math.max(0, Math.floor(Number(initialState?.clock?.tick) || 0)),
            stopReason: ""
        }
    };
}

export function createGameplayRecordingFrame(recording, frame) {
    if (!recording || recording.schema !== GAMEPLAY_RECORDING_SCHEMA) {
        return null;
    }
    recording.summary = recording.summary || {};
    const frameCount = Math.max(0, Math.floor(Number(recording.summary.frames) || 0));
    const normalized = {
        index: Math.max(0, Math.floor(Number(frame?.index) || frameCount)),
        recordingTimeSec: roundNumber(frame?.recordingTimeSec, 6),
        gameTimeSec: roundNumber(frame?.gameTimeSec, 6),
        tick: Math.max(0, Math.floor(Number(frame?.tick) || 0)),
        requestedAtMs: roundNumber(frame?.requestedAtMs, 3),
        callbackArrivalMs: roundNumber(frame?.callbackArrivalMs, 3),
        callbackEntryGapMs: roundNumber(frame?.callbackEntryGapMs, 3),
        rafGapMs: roundNumber(frame?.rafGapMs, 3),
        realDtMs: roundNumber(frame?.realDtMs, 3),
        fixedSteps: Math.max(0, Math.floor(Number(frame?.fixedSteps) || 0)),
        accumulatorMs: roundNumber(frame?.accumulatorMs, 3),
        interpolationBlend: roundNumber(frame?.interpolationBlend, 6),
        input: snapshotGameplayInput(frame?.input || {}),
        debug: frame?.debug || null
    };
    return normalized;
}

export function commitGameplayRecordingFrame(recording, normalized) {
    if (!recording || !normalized) return false;
    recording.summary = recording.summary || {};
    recording.summary.frames = Math.max(0, Math.floor(Number(recording.summary.frames) || 0)) + 1;
    recording.summary.durationSec = normalized.recordingTimeSec;
    recording.summary.finalGameTimeSec = normalized.gameTimeSec;
    recording.summary.finalTick = normalized.tick;
    return true;
}

export function appendGameplayRecordingFrame(recording, frame) {
    if (!recording || recording.schema !== GAMEPLAY_RECORDING_SCHEMA || !Array.isArray(recording.frames)) {
        return false;
    }
    const normalized = createGameplayRecordingFrame(recording, frame);
    if (!normalized) return false;
    recording.frames.push(normalized);
    commitGameplayRecordingFrame(recording, normalized);
    recording.summary.frames = recording.frames.length;
    return true;
}

export function finalizeGameplayRecording(recording, { reason = "manual" } = {}) {
    if (!recording || recording.schema !== GAMEPLAY_RECORDING_SCHEMA) return recording;
    recording.stoppedAtIso = new Date().toISOString();
    recording.summary = recording.summary || {};
    const retainedFrames = Array.isArray(recording.frames) ? recording.frames : null;
    if (retainedFrames) recording.summary.frames = retainedFrames.length;
    else recording.summary.frames = Math.max(0, Math.floor(Number(recording.summary.frames) || 0));
    const last = retainedFrames?.[retainedFrames.length - 1] || null;
    recording.summary.durationSec = roundNumber(last?.recordingTimeSec ?? recording.summary.durationSec ?? 0, 6);
    recording.summary.finalGameTimeSec = roundNumber(last?.gameTimeSec ?? recording.summary.finalGameTimeSec ?? recording.initial?.gameTimeSec ?? 0, 6);
    recording.summary.finalTick = Math.max(0, Math.floor(Number(last?.tick ?? recording.summary.finalTick ?? recording.initial?.tick) || 0));
    recording.summary.stopReason = String(reason || "manual");
    return recording;
}

export function normalizeGameplayRecording(value) {
    const recording = typeof value === "string" ? JSON.parse(value) : value;
    if (!recording || typeof recording !== "object") {
        throw new Error("Playback JSON must be an object.");
    }
    if (recording.schema !== GAMEPLAY_RECORDING_SCHEMA) {
        throw new Error(`Playback JSON must use schema ${GAMEPLAY_RECORDING_SCHEMA}.`);
    }
    if (Number(recording.schemaVersion) !== GAMEPLAY_RECORDING_VERSION) {
        throw new Error(`Unsupported gameplay recording schemaVersion ${recording.schemaVersion}.`);
    }
    if (!recording.initialState || typeof recording.initialState !== "object") {
        throw new Error("Gameplay recording is missing initialState.");
    }
    if (!Array.isArray(recording.frames)) {
        throw new Error("Gameplay recording is missing frames.");
    }
    return {
        ...recording,
        levelId: String(recording.levelId || recording.initialState?.world?.levelId || "level_001"),
        frames: recording.frames.map((frame, index) => normalizePlaybackFrame(frame, index))
    };
}

export function snapshotGameplayDebug(state) {
    const visibleRect = visibleRectFromState(state);
    return {
        player: snapshotActor(state?.player, "player"),
        camera: {
            currentX: roundNumber(state?.camera?.currentTransform?.x, 3),
            currentY: roundNumber(state?.camera?.currentTransform?.y, 3),
            shownX: roundNumber(state?.camera?.shownTransform?.x ?? state?.camera?.currentTransform?.x, 3),
            shownY: roundNumber(state?.camera?.shownTransform?.y ?? state?.camera?.currentTransform?.y, 3),
            visibleRect
        },
        enemies: visibleActors(state?.enemies || [], visibleRect).map((enemy) => ({
            id: String(enemy.id || ""),
            kind: String(enemy.kind || enemy.characterId || "enemy"),
            state: String(enemy.state || enemy.behavior || enemy.combatState || ""),
            health: roundNumber(enemy.health, 3),
            ...snapshotActor(enemy, "enemy")
        })),
        projectiles: visibleActors(state?.projectiles || [], visibleRect).map((projectile) => ({
            id: String(projectile.id || ""),
            kind: String(projectile.kind || projectile.projectileKind || "projectile"),
            owner: String(projectile.owner || ""),
            state: String(projectile.state || ""),
            ...snapshotActor(projectile, "projectile")
        }))
    };
}

export function recordingFrameDtSeconds(frame) {
    return Math.max(0, Math.min(0.1, finiteNumber(frame?.realDtMs) / 1000));
}

function normalizePlaybackFrame(frame, index) {
    if (!frame || typeof frame !== "object") {
        throw new Error(`Gameplay recording frame ${index} is not an object.`);
    }
    return {
        ...frame,
        index: Math.max(0, Math.floor(Number(frame.index) || index)),
        recordingTimeSec: finiteNumber(frame.recordingTimeSec),
        gameTimeSec: finiteNumber(frame.gameTimeSec),
        tick: Math.max(0, Math.floor(Number(frame.tick) || 0)),
        realDtMs: Math.max(0, Math.min(100, finiteNumber(frame.realDtMs))),
        input: snapshotGameplayInput(frame.input || {})
    };
}

function visibleRectFromState(state) {
    const camera = state?.camera || {};
    const transform = camera.shownTransform || camera.currentTransform || camera;
    const width = Math.max(1, finiteNumber(camera.viewportWidth) || 1280);
    const height = Math.max(1, finiteNumber(camera.viewportHeight) || 720);
    const centerX = finiteNumber(transform.x);
    const centerY = finiteNumber(transform.y);
    return {
        x: roundNumber(centerX - width * 0.5, 3),
        y: roundNumber(centerY - height * 0.5, 3),
        w: roundNumber(width, 3),
        h: roundNumber(height, 3),
        left: roundNumber(centerX - width * 0.5, 3),
        top: roundNumber(centerY - height * 0.5, 3),
        right: roundNumber(centerX + width * 0.5, 3),
        bottom: roundNumber(centerY + height * 0.5, 3)
    };
}

function snapshotActor(actor, fallbackKind = "actor") {
    const transform = actor?.currentTransform || actor || {};
    const shown = actor?.shownTransform || transform;
    const width = Math.max(0, finiteNumber(actor?.width ?? actor?.w ?? actor?.radius * 2));
    const height = Math.max(0, finiteNumber(actor?.height ?? actor?.h ?? actor?.radius * 2));
    return {
        kind: String(actor?.kind || fallbackKind),
        x: roundNumber(transform.x, 3),
        y: roundNumber(transform.y, 3),
        shownX: roundNumber(shown.x ?? transform.x, 3),
        shownY: roundNumber(shown.y ?? transform.y, 3),
        vx: roundNumber(actor?.vx, 3),
        vy: roundNumber(actor?.vy, 3),
        width: roundNumber(width, 3),
        height: roundNumber(height, 3),
        radius: roundNumber(actor?.radius, 3),
        facing: roundNumber(actor?.facing, 3)
    };
}

function visibleActors(actors, rect) {
    return actors
        .filter((actor) => actorRectIntersects(actor, rect))
        .slice(0, DEBUG_ENTITY_LIMIT);
}

function actorRectIntersects(actor, rect) {
    const transform = actor?.shownTransform || actor?.currentTransform || actor || {};
    const x = finiteNumber(transform.x);
    const y = finiteNumber(transform.y);
    const radius = Math.max(0, finiteNumber(actor?.radius));
    const width = Math.max(radius * 2, finiteNumber(actor?.width ?? actor?.w) || radius * 2 || 1);
    const height = Math.max(radius * 2, finiteNumber(actor?.height ?? actor?.h) || radius * 2 || 1);
    const left = x - width * 0.5;
    const right = x + width * 0.5;
    const top = y - height;
    const bottom = y + radius;
    return right >= rect.left && left <= rect.right && bottom >= rect.top && top <= rect.bottom;
}

function finiteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function roundNumber(value, digits = 3) {
    const n = finiteNumber(value);
    const factor = 10 ** digits;
    return Math.round(n * factor) / factor;
}
