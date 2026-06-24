export function detectElectronWindowBridge(host = globalThis.window) {
    const bridge = host?.electronWindow;
    if (!bridge || bridge.isAvailable !== true) {
        return null;
    }
    return bridge;
}

export async function readFullscreenState(bridge, documentRef = globalThis.document) {
    if (bridge && typeof bridge.getFullscreen === "function") {
        try {
            return Boolean(await bridge.getFullscreen());
        } catch (error) {
            console.warn("Electron fullscreen state could not be read.", error);
        }
    }
    return Boolean(documentRef?.fullscreenElement);
}

export async function setFullscreenState(nextState, bridge, documentRef = globalThis.document) {
    const enabled = Boolean(nextState);
    if (bridge && typeof bridge.setFullscreen === "function") {
        return Boolean(await bridge.setFullscreen(enabled));
    }
    if (!documentRef) {
        return false;
    }
    if (enabled) {
        const root = documentRef.documentElement;
        if (typeof root?.requestFullscreen !== "function") {
            return false;
        }
        await root.requestFullscreen();
    } else if (documentRef.fullscreenElement && typeof documentRef.exitFullscreen === "function") {
        await documentRef.exitFullscreen();
    }
    return Boolean(documentRef.fullscreenElement);
}
