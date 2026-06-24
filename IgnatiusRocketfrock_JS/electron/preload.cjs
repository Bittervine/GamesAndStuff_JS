const { contextBridge, ipcRenderer } = require("electron");

const CHANNELS = Object.freeze({
    quit: "ignatius:quit",
    getFullscreen: "ignatius:get-fullscreen",
    setFullscreen: "ignatius:set-fullscreen",
    fullscreenChanged: "ignatius:fullscreen-changed"
});

contextBridge.exposeInMainWorld("electronWindow", Object.freeze({
    isAvailable: true,
    quit() {
        return ipcRenderer.invoke(CHANNELS.quit);
    },
    getFullscreen() {
        return ipcRenderer.invoke(CHANNELS.getFullscreen);
    },
    setFullscreen(enabled) {
        return ipcRenderer.invoke(CHANNELS.setFullscreen, Boolean(enabled));
    },
    onFullscreenChanged(listener) {
        if (typeof listener !== "function") {
            return () => {};
        }
        const wrapped = (_event, active) => listener(Boolean(active));
        ipcRenderer.on(CHANNELS.fullscreenChanged, wrapped);
        return () => ipcRenderer.removeListener(CHANNELS.fullscreenChanged, wrapped);
    }
}));
