import { MUSIC_ENGINE_SOURCE_BASE64 } from "./music-engine-sources.js";

function decodeBase64Utf8(source) {
    if (typeof globalThis.atob !== "function" || typeof globalThis.TextDecoder !== "function") {
        return "";
    }
    const bytes = Uint8Array.from(globalThis.atob(source), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function engineVersion(value) {
    const version = Number(value);
    return Object.hasOwn(MUSIC_ENGINE_SOURCE_BASE64, version) ? version : 0;
}

export function createEmbeddedMusicEngineHost({
    documentRef = globalThis.document,
    windowRef = globalThis.window
} = {}) {
    const frames = new Map();
    const ready = new Map();
    let prepared = false;
    let disposed = false;

    function createReadyState(version) {
        let resolve;
        const promise = new Promise((done) => {
            resolve = done;
        });
        const state = { promise, resolve, settled: false };
        ready.set(version, state);
        return state;
    }

    function resolveReady(version, available = true) {
        const state = ready.get(version);
        if (!state || state.settled) return;
        state.settled = true;
        state.resolve(Boolean(available));
    }

    function apiFor(version) {
        const frame = frames.get(engineVersion(version));
        try {
            return frame?.contentWindow?.__IGNATIUS_ENGINE_API__ || null;
        } catch (error) {
            return null;
        }
    }

    function handleMessage(event) {
        const message = event?.data;
        if (message?.type !== "ignatius-engine-ready") return;
        const version = engineVersion(message.version);
        if (version && event.source === frames.get(version)?.contentWindow) {
            resolveReady(version);
        }
    }

    function prepare() {
        if (prepared || disposed) return Boolean(prepared && !disposed);
        if (!documentRef?.createElement || !documentRef.body || !windowRef?.addEventListener) {
            return false;
        }
        prepared = true;
        windowRef.addEventListener("message", handleMessage);
        for (const [versionText, sourceBase64] of Object.entries(MUSIC_ENGINE_SOURCE_BASE64)) {
            const version = Number(versionText);
            const frame = documentRef.createElement("iframe");
            frame.title = `Hidden Ignatius music engine version ${version}`;
            frame.setAttribute("aria-hidden", "true");
            frame.tabIndex = -1;
            Object.assign(frame.style, {
                position: "fixed",
                left: "-32px",
                top: "-32px",
                width: "2px",
                height: "2px",
                opacity: "0.001",
                pointerEvents: "none",
                border: "0"
            });
            createReadyState(version);
            frames.set(version, frame);
            frame.addEventListener("load", () => {
                resolveReady(version, Boolean(apiFor(version)));
            }, { once: true });
            frame.srcdoc = decodeBase64Utf8(sourceBase64);
            documentRef.body.appendChild(frame);
        }
        return true;
    }

    async function waitForApi(version) {
        const normalized = engineVersion(version);
        if (!normalized || disposed || !prepare()) return null;
        const direct = apiFor(normalized);
        if (direct) return direct;
        const available = await ready.get(normalized)?.promise;
        return disposed || !available ? null : apiFor(normalized);
    }

    async function configure(version, tuneId, octave) {
        const api = await waitForApi(version);
        if (!api) return false;
        api.selectTune(String(tuneId || ""));
        api.setOctave(Number(octave) || 0);
        return true;
    }

    async function play(version) {
        const api = await waitForApi(version);
        if (!api) return false;
        await api.play();
        return true;
    }

    function forEachApi(callback) {
        for (const version of frames.keys()) {
            const api = apiFor(version);
            if (api) callback(api, version);
        }
    }

    function setVolume(value) {
        const volume = Math.max(0, Math.min(1, Number(value) || 0));
        forEachApi((api) => api.setVolume(volume));
        return volume;
    }

    function pauseAll() {
        forEachApi((api) => api.pause());
    }

    function stopAll() {
        forEachApi((api) => api.stop());
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        stopAll();
        windowRef?.removeEventListener?.("message", handleMessage);
        for (const frame of frames.values()) {
            frame.remove();
        }
        frames.clear();
        for (const state of ready.values()) {
            if (!state.settled) {
                state.settled = true;
                state.resolve(false);
            }
        }
        ready.clear();
    }

    return Object.freeze({
        prepare,
        configure,
        play,
        setVolume,
        pauseAll,
        stopAll,
        dispose,
        isPrepared: () => prepared && !disposed,
        isReady: (version) => Boolean(apiFor(version))
    });
}
