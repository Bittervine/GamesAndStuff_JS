const { contextBridge, ipcRenderer } = require("electron");

const CHANNELS = Object.freeze({
    webviewMessage: "ignatius-devtool:webview-message",
    webviewSend: "ignatius-devtool:webview-send"
});

const messageListeners = new Set();
ipcRenderer.on(CHANNELS.webviewMessage, (_event, message) => {
    for (const listener of messageListeners) {
        try {
            listener({ data: message });
        } catch (_) {
            // A listener belongs to the page; one faulty listener must not
            // prevent the remaining project requests from being delivered.
        }
    }
});

const webviewBridge = Object.freeze({
    postMessage(message) {
        ipcRenderer.send(CHANNELS.webviewSend, String(message));
    },
    addEventListener(type, listener) {
        if (type === "message" && typeof listener === "function") messageListeners.add(listener);
    },
    removeEventListener(type, listener) {
        if (type === "message") messageListeners.delete(listener);
    }
});

contextBridge.exposeInMainWorld("electronDevTool", Object.freeze({
    isAvailable: true,
    resourceBaseUrl: "ignatius-resource://project/",
    webview: webviewBridge
}));
