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

function trackSourceUrl(track, baseUrl) {
    if (!track || track.id === NO_MUSIC_TRACK.id || !track.file) return "";
    if (/^(?:https?:|data:|blob:|\/)/i.test(track.file)) return track.file;
    const base = String(baseUrl || "assets/");
    return `${base}${track.file}`;
}

export function createMusicDirector({
    volume = 0.1,
    audioElementFactory = defaultAudioElementFactory,
    baseUrl = "assets/"
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

    if (audio) {
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = currentVolume;
    }

    function activeTrack() {
        return getMusicTrack(trackId, catalog);
    }

    function setAudioVolume() {
        if (audio) {
            audio.volume = muted ? 0 : currentVolume;
        }
    }

    function stopAudio({ clearSource = false } = {}) {
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

    function configureActiveTrack() {
        if (!audio || disposed) return false;
        const track = activeTrack();
        const nextSrc = trackSourceUrl(track, baseUrl);
        if (!nextSrc) {
            stopAudio({ clearSource: true });
            return false;
        }
        if (configuredSrc === nextSrc) return true;
        stopAudio();
        configuredSrc = nextSrc;
        audio.src = nextSrc;
        audio.loop = true;
        audio.preload = "auto";
        setAudioVolume();
        audio.load?.();
        return true;
    }

    function startActiveTrack() {
        if (disposed) return Promise.resolve(false);
        unlockRequested = true;
        const track = activeTrack();
        if (!audio || muted || currentVolume <= 0 || track.id === NO_MUSIC_TRACK.id) {
            return Promise.resolve(false);
        }
        if (unlocked && configuredSrc === trackSourceUrl(track, baseUrl) && audio.paused === false) {
            return Promise.resolve(true);
        }
        const expectedSrc = trackSourceUrl(track, baseUrl);
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
        stopAudio({ clearSource: track.id === NO_MUSIC_TRACK.id });
        if (unlockRequested && !muted && currentVolume > 0 && track.id !== NO_MUSIC_TRACK.id) {
            void startActiveTrack();
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
