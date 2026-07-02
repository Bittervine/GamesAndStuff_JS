const { app, BrowserWindow, ipcMain, protocol } = require("electron");
const path = require("node:path");

const APP_SCHEME = "ignatius";
const APP_HOST = "app";

protocol.registerSchemesAsPrivileged([{
    scheme: APP_SCHEME,
    privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
    }
}]);

const CHANNELS = Object.freeze({
    quit: "ignatius:quit",
    getFullscreen: "ignatius:get-fullscreen",
    setFullscreen: "ignatius:set-fullscreen",
    fullscreenChanged: "ignatius:fullscreen-changed"
});

let mainWindow = null;

function resolveWindowIconPath() {
    const appRoot = app.isPackaged ? app.getAppPath() : path.resolve(__dirname, "..");
    return path.join(appRoot, "favicon.ico");
}

function sendFullscreenState(window) {
    if (!window || window.isDestroyed()) {
        return;
    }
    window.webContents.send(CHANNELS.fullscreenChanged, window.isFullScreen());
}

function resolveAppRequest(requestUrl) {
    const url = new URL(requestUrl);
    if (url.hostname !== APP_HOST) {
        return null;
    }
    const appRoot = app.isPackaged ? app.getAppPath() : path.resolve(__dirname, "..");
    const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "game.html";
    const resolvedPath = path.resolve(appRoot, relativePath);
    const rootPrefix = `${appRoot}${path.sep}`;
    if (resolvedPath !== appRoot && !resolvedPath.startsWith(rootPrefix)) {
        return null;
    }
    return resolvedPath;
}

function registerAppProtocol() {
    protocol.registerFileProtocol(APP_SCHEME, (request, callback) => {
        const resolvedPath = resolveAppRequest(request.url);
        if (!resolvedPath) {
            callback({ error: -10 });
            return;
        }
        callback({ path: resolvedPath });
    });
}

function createMainWindow() {
    const window = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 960,
        minHeight: 540,
        show: false,
        fullscreen: true,
        backgroundColor: "#0d0b12",
        icon: resolveWindowIconPath(),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    window.removeMenu();
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    window.webContents.on("will-navigate", (event, url) => {
        if (!url.startsWith(`${APP_SCHEME}://${APP_HOST}/`)) {
            event.preventDefault();
        }
    });
    window.on("enter-full-screen", () => sendFullscreenState(window));
    window.on("leave-full-screen", () => sendFullscreenState(window));
    window.once("ready-to-show", () => window.show());
    window.on("closed", () => {
        if (mainWindow === window) {
            mainWindow = null;
        }
    });

    void window.loadURL(`${APP_SCHEME}://${APP_HOST}/game.html`);
    return window;
}

app.whenReady().then(() => {
    registerAppProtocol();
    ipcMain.handle(CHANNELS.quit, () => {
        app.quit();
        return true;
    });
    ipcMain.handle(CHANNELS.getFullscreen, (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return Boolean(window?.isFullScreen());
    });
    ipcMain.handle(CHANNELS.setFullscreen, (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            return false;
        }
        // The packaged game is fullscreen-only. Keep this compatibility endpoint
        // for older renderer builds, but never expose a desktop windowed mode.
        if (!window.isFullScreen()) {
            window.setFullScreen(true);
        }
        return true;
    });

    mainWindow = createMainWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createMainWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
