import { getMusicTune, pitchToMidi } from "../shared/music-data.js";
import { createEmbeddedMusicEngineHost } from "./music-engine-host.js";

export function noteFrequency(pitch) {
    const midi = pitchToMidi(pitch);
    if (!Number.isFinite(midi)) return 0;
    return 440 * 2 ** ((midi - 69) / 12);
}

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

export function createMusicDirector({
    engineHostFactory = createEmbeddedMusicEngineHost,
    volume = 0.1,
    // Retained as an ignored compatibility option for older tests and callers.
    audioContextFactory = undefined
} = {}) {
    void audioContextFactory;
    const host = typeof engineHostFactory === "function" ? engineHostFactory() : null;
    let tuneId = "grieg_mountain_king";
    let currentVolume = clamp01(volume);
    let muted = false;
    let unlockRequested = false;
    let unlocked = false;
    let disposed = false;
    let configurationKey = "";
    let generation = 0;
    let startAttempt = null;

    host?.prepare?.();
    host?.setVolume?.(currentVolume);

    function activeTune() {
        return getMusicTune(tuneId);
    }

    function tuneConfigurationKey(tune) {
        if (!tune || tune.id === "none") return "none";
        return `${tune.engineVersion}:${tune.id}:${tune.octave}`;
    }

    async function configureActiveTune(expectedGeneration) {
        const tune = activeTune();
        const key = tuneConfigurationKey(tune);
        if (key === "none") {
            host?.stopAll?.();
            configurationKey = key;
            unlocked = false;
            return false;
        }
        if (configurationKey === key) return true;
        host?.stopAll?.();
        const configured = await host?.configure?.(tune.engineVersion, tune.id, tune.octave);
        if (disposed || expectedGeneration !== generation) return false;
        if (!configured) return false;
        configurationKey = key;
        host?.setVolume?.(muted ? 0 : currentVolume);
        return true;
    }

    function startActiveTune() {
        if (disposed) return Promise.resolve(false);
        unlockRequested = true;
        const tune = activeTune();
        const key = tuneConfigurationKey(tune);
        if (muted || currentVolume <= 0 || tune.id === "none") {
            return Promise.resolve(false);
        }
        if (unlocked && configurationKey === key) {
            return Promise.resolve(true);
        }

        const expectedGeneration = generation;
        if (startAttempt?.generation === expectedGeneration && startAttempt.key === key) {
            return startAttempt.promise;
        }

        const attempt = {
            generation: expectedGeneration,
            key,
            promise: null
        };
        attempt.promise = (async () => {
            if (!await configureActiveTune(expectedGeneration)) return false;
            if (disposed || expectedGeneration !== generation || muted || currentVolume <= 0) return false;
            host?.setVolume?.(currentVolume);
            const started = await host?.play?.(tune.engineVersion);
            if (disposed || expectedGeneration !== generation) return false;
            unlocked = Boolean(started);
            return unlocked;
        })().finally(() => {
            if (startAttempt === attempt) {
                startAttempt = null;
            }
        });
        startAttempt = attempt;
        return attempt.promise;
    }

    function unlock() {
        return startActiveTune();
    }

    function setTune(nextTuneId) {
        const tune = getMusicTune(nextTuneId);
        if (tune.id === tuneId) return tuneId;
        tuneId = tune.id;
        generation += 1;
        configurationKey = "";
        unlocked = false;
        host?.stopAll?.();
        if (unlockRequested && !muted && currentVolume > 0 && tune.id !== "none") {
            void startActiveTune();
        }
        return tuneId;
    }

    function setVolume(nextVolume) {
        const previous = currentVolume;
        currentVolume = clamp01(nextVolume);
        host?.setVolume?.(muted ? 0 : currentVolume);
        if (currentVolume <= 0) {
            unlocked = false;
            host?.pauseAll?.();
        } else if (previous <= 0 && unlockRequested && !muted && activeTune().id !== "none") {
            void startActiveTune();
        }
        return currentVolume;
    }

    function setMuted(nextMuted) {
        const normalized = Boolean(nextMuted);
        if (normalized === muted) return muted;
        muted = normalized;
        if (muted) {
            unlocked = false;
            host?.setVolume?.(0);
            host?.pauseAll?.();
        } else {
            host?.setVolume?.(currentVolume);
            if (unlockRequested && currentVolume > 0 && activeTune().id !== "none") {
                void startActiveTune();
            }
        }
        return muted;
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        generation += 1;
        host?.dispose?.();
        configurationKey = "";
        startAttempt = null;
        unlocked = false;
    }

    return Object.freeze({
        unlock,
        setTune,
        setVolume,
        setMuted,
        dispose,
        getTuneId: () => tuneId,
        getVolume: () => currentVolume,
        getEffectiveVolume: () => muted ? 0 : currentVolume,
        isMuted: () => muted,
        isUnlocked: () => unlocked
    });
}
