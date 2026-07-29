import { DEFAULT_LEVEL_MUSIC, NO_MUSIC_TRACK, getMusicTrack, normalizeMusicCatalog, normalizeLevelMusic } from "../shared/music-data.js";

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

function defaultAudioElementFactory() {
    if (typeof globalThis.Audio !== "function") {
        return null;
    }
    return new globalThis.Audio();
}

function defaultNow() {
    if (typeof globalThis.performance?.now === "function") {
        return globalThis.performance.now();
    }
    return Date.now();
}

function defaultScheduleFrame(callback) {
    if (typeof globalThis.requestAnimationFrame === "function") {
        return { kind: "animation", id: globalThis.requestAnimationFrame(callback) };
    }
    return {
        kind: "timeout",
        id: globalThis.setTimeout?.(() => callback(defaultNow()), 16)
    };
}

function defaultCancelFrame(handle) {
    if (!handle) return;
    if (handle.kind === "animation" && typeof globalThis.cancelAnimationFrame === "function") {
        globalThis.cancelAnimationFrame(handle.id);
    } else if (handle.kind === "timeout" && typeof globalThis.clearTimeout === "function") {
        globalThis.clearTimeout(handle.id);
    }
}

function trackSourceUrl(track, baseUrl) {
    if (!track || track.id === NO_MUSIC_TRACK.id || !track.file) return "";
    if (/^(?:https?:|data:|blob:|\/)/i.test(track.file)) return track.file;
    const base = String(baseUrl || "resources/music/");
    return `${base}${track.file}`;
}

export function createMusicDirector({
    volume = 0.1,
    audioElementFactory = defaultAudioElementFactory,
    baseUrl = "resources/music/",
    fadeDurationMs = 1000,
    now = defaultNow,
    scheduleFrame = defaultScheduleFrame,
    cancelFrame = defaultCancelFrame
} = {}) {
    const audio = typeof audioElementFactory === "function" ? audioElementFactory() : null;
    let catalog = normalizeMusicCatalog(null);
    let trackId = DEFAULT_LEVEL_MUSIC.trackId;
    let currentVolume = clamp01(volume);
    let muted = false;
    let unlockRequested = false;
    let unlocked = false;
    let disposed = false;
    let configuredSrc = "";
    let startAttempt = null;
    let fadeGain = 1;
    let fadeGeneration = 0;
    let fadeFrameHandle = null;
    let fadeTransition = null;

    if (audio) {
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = currentVolume;
    }

    function activeTrack() {
        return getMusicTrack(trackId, catalog);
    }

    function activeSourceUrl() {
        return trackSourceUrl(activeTrack(), baseUrl);
    }

    function setAudioVolume() {
        if (audio) {
            audio.volume = muted ? 0 : clamp01(currentVolume * fadeGain);
        }
    }

    function cancelFadeTransition({ restoreVolume = true } = {}) {
        fadeGeneration += 1;
        if (fadeFrameHandle) {
            cancelFrame(fadeFrameHandle);
            fadeFrameHandle = null;
        }
        const transition = fadeTransition;
        fadeTransition = null;
        if (restoreVolume) {
            fadeGain = 1;
            setAudioVolume();
        }
        transition?.resolve?.(false);
    }

    function resetAudioPlayback({ clearSource = false } = {}) {
        audio?.pause?.();
        try {
            if (audio && Number.isFinite(Number(audio.currentTime))) {
                audio.currentTime = 0;
            }
        } catch (error) {
            // Some fake or browser audio elements can reject currentTime writes before metadata is loaded.
        }
        if (clearSource && audio) {
            configuredSrc = "";
            if (typeof audio.removeAttribute === "function") {
                audio.removeAttribute("src");
            } else {
                audio.src = "";
            }
            audio.load?.();
        }
        unlocked = false;
        startAttempt = null;
    }

    function stopAudio({ clearSource = false } = {}) {
        cancelFadeTransition();
        resetAudioPlayback({ clearSource });
    }

    function configureActiveTrack() {
        if (!audio || disposed) return false;
        const nextSrc = activeSourceUrl();
        if (!nextSrc) {
            resetAudioPlayback({ clearSource: true });
            return false;
        }
        if (configuredSrc === nextSrc) return true;
        resetAudioPlayback();
        configuredSrc = nextSrc;
        audio.src = nextSrc;
        audio.loop = true;
        audio.preload = "auto";
        fadeGain = 1;
        setAudioVolume();
        audio.load?.();
        return true;
    }

    function startActiveTrack() {
        if (disposed) return Promise.resolve(false);
        unlockRequested = true;
        if (fadeTransition) {
            return fadeTransition.promise;
        }
        const track = activeTrack();
        if (!audio || muted || currentVolume <= 0 || track.id === NO_MUSIC_TRACK.id) {
            return Promise.resolve(false);
        }
        const expectedSrc = activeSourceUrl();
        if (unlocked && configuredSrc === expectedSrc && audio.paused === false) {
            return Promise.resolve(true);
        }
        if (startAttempt?.src === expectedSrc) {
            return startAttempt.promise;
        }
        const attempt = {
            src: expectedSrc,
            promise: null
        };
        attempt.promise = (async () => {
            if (!configureActiveTrack()) return false;
            if (disposed || muted || currentVolume <= 0 || configuredSrc !== expectedSrc) return false;
            fadeGain = 1;
            setAudioVolume();
            try {
                await audio.play?.();
            } catch (error) {
                return false;
            }
            if (disposed || muted || configuredSrc !== expectedSrc) return false;
            unlocked = true;
            return true;
        })().finally(() => {
            if (startAttempt === attempt) {
                startAttempt = null;
            }
        });
        startAttempt = attempt;
        return attempt.promise;
    }

    function beginFadeToActiveTrack() {
        if (!audio || disposed) return Promise.resolve(false);
        if (fadeTransition) return fadeTransition.promise;

        const duration = Math.max(0, Number(fadeDurationMs) || 0);
        if (duration <= 0 || audio.paused !== false || muted || currentVolume <= 0) {
            resetAudioPlayback({ clearSource: !activeSourceUrl() });
            return startActiveTrack();
        }

        const generation = ++fadeGeneration;
        const startedAt = Number(now()) || 0;
        const startingGain = fadeGain;
        let resolveTransition;
        const promise = new Promise((resolve) => {
            resolveTransition = resolve;
        });
        fadeTransition = { generation, promise, resolve: resolveTransition };

        const finish = async () => {
            if (!fadeTransition || fadeTransition.generation !== generation || disposed) return;
            fadeFrameHandle = null;
            fadeTransition = null;
            fadeGain = 0;
            setAudioVolume();
            resetAudioPlayback({ clearSource: !activeSourceUrl() });
            fadeGain = 1;
            setAudioVolume();
            const started = activeSourceUrl() ? await startActiveTrack() : false;
            resolveTransition(started);
        };

        const step = (timestamp) => {
            if (!fadeTransition || fadeTransition.generation !== generation || disposed) return;
            const currentTime = Number.isFinite(Number(timestamp)) ? Number(timestamp) : Number(now()) || startedAt;
            const progress = clamp01((currentTime - startedAt) / duration);
            fadeGain = startingGain * (1 - progress);
            setAudioVolume();
            if (progress >= 1) {
                void finish();
                return;
            }
            fadeFrameHandle = scheduleFrame(step);
        };

        step(startedAt);
        return promise;
    }

    function setCatalog(nextCatalog) {
        catalog = normalizeMusicCatalog(nextCatalog);
        if (!catalog.tracks.some((track) => track.id === trackId)) {
            trackId = DEFAULT_LEVEL_MUSIC.trackId;
            stopAudio({ clearSource: true });
        }
        if (unlockRequested && !muted && currentVolume > 0 && activeTrack().id !== NO_MUSIC_TRACK.id) {
            void startActiveTrack();
        }
        return catalog;
    }

    function unlock() {
        return startActiveTrack();
    }

    function setTrack(nextTrackId) {
        const track = getMusicTrack(normalizeLevelMusic({ trackId: nextTrackId }).trackId, catalog);
        if (track.id === trackId) return trackId;

        trackId = track.id;
        const nextSrc = activeSourceUrl();

        // Different catalog ids can still point at the same song. Keep the
        // current playback position in that case instead of restarting it.
        if (audio && configuredSrc && configuredSrc === nextSrc && audio.paused === false) {
            cancelFadeTransition();
            unlocked = true;
            return trackId;
        }

        if (fadeTransition) {
            // The fade always resolves to the latest requested track. This
            // prevents rapid level changes from stacking timers or songs.
            return trackId;
        }

        if (audio && configuredSrc && audio.paused === false && !muted && currentVolume > 0) {
            void beginFadeToActiveTrack();
        } else {
            resetAudioPlayback({ clearSource: !nextSrc });
            if (unlockRequested && !muted && currentVolume > 0 && track.id !== NO_MUSIC_TRACK.id) {
                void startActiveTrack();
            }
        }
        return trackId;
    }

    function setVolume(nextVolume) {
        const previous = currentVolume;
        currentVolume = clamp01(nextVolume);
        setAudioVolume();
        if (currentVolume <= 0) {
            stopAudio();
        } else if (previous <= 0 && unlockRequested && !muted && activeTrack().id !== NO_MUSIC_TRACK.id) {
            void startActiveTrack();
        }
        return currentVolume;
    }

    function setMuted(nextMuted) {
        const normalized = Boolean(nextMuted);
        if (normalized === muted) return muted;
        muted = normalized;
        setAudioVolume();
        if (muted) {
            cancelFadeTransition();
            audio?.pause?.();
            unlocked = false;
        } else if (unlockRequested && currentVolume > 0 && activeTrack().id !== NO_MUSIC_TRACK.id) {
            void startActiveTrack();
        }
        return muted;
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        stopAudio({ clearSource: true });
        catalog = normalizeMusicCatalog(null);
    }

    return Object.freeze({
        unlock,
        setCatalog,
        setTrack,
        setVolume,
        setMuted,
        dispose,
        getTrackId: () => trackId,
        getVolume: () => currentVolume,
        getEffectiveVolume: () => muted ? 0 : currentVolume,
        isMuted: () => muted,
        isUnlocked: () => unlocked,
        getActiveTrack: activeTrack
    });
}
