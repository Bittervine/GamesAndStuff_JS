const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");

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
let contentRoot = null;
let resourceRoot = null;

function resolveWindowIconPath() {
    return path.join(contentRoot, "favicon.ico");
}

function executableDirectory() {
    return path.dirname(process.execPath);
}

function defaultContentRoot() {
    return app.isPackaged ? path.join(executableDirectory(), "content") : path.resolve(__dirname, "..");
}

function parseResourceRootArgument() {
    const args = process.argv.slice(1);
    for (let index = 0; index < args.length; index += 1) {
        const argument = String(args[index] || "");
        const equals = argument.indexOf("=");
        const name = equals >= 0 ? argument.slice(0, equals) : argument;
        if (!["--resources-root", "-resources-root", "--resource-root", "-resource-root"].includes(name)) continue;
        let value = equals >= 0 ? argument.slice(equals + 1) : "";
        if (!value && index + 1 < args.length && !String(args[index + 1]).startsWith("-")) value = args[++index];
        if (!value) throw new Error("--resources-root requires a folder path.");
        return path.resolve(value);
    }
    return path.join(defaultContentRoot(), "resources");
}

function validResourceRoot(root) {
    return fs.existsSync(path.join(root, "resources.json"))
        && fs.existsSync(path.join(root, "levels"))
        && fs.existsSync(path.join(root, "atlases"));
}

function writeStartupFailure(error) {
    try {
        const logPath = path.join(executableDirectory(), "logs", "electron-game-startup.log");
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.appendFileSync(logPath, `${new Date().toISOString()} ${error?.stack || error}\nargv=${JSON.stringify(process.argv)}\ncontentRoot=${contentRoot}\nresourceRoot=${resourceRoot}\n`, "utf8");
    } catch (_) {}
}

function resourcePath(relativePath) {
    const text = String(relativePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
    if (!text || text.split("/").some((part) => !part || part === "." || part === "..")) return null;
    const candidate = path.resolve(resourceRoot, ...text.split("/"));
    const root = path.resolve(resourceRoot);
    return candidate === root || candidate.startsWith(`${root}${path.sep}`) ? candidate : null;
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
    if (url.pathname === "/__ignatius_build_revision.txt") {
        return path.join(contentRoot, "BUILD_REVISION.txt");
    }
    const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "game.html";
    const resolvedPath = relativePath === "resources" || relativePath.startsWith("resources/")
        ? resourcePath(relativePath.slice("resources/".length))
        : path.resolve(contentRoot, relativePath);
    const rootPrefix = relativePath === "resources" || relativePath.startsWith("resources/")
        ? `${path.resolve(resourceRoot)}${path.sep}`
        : `${path.resolve(contentRoot)}${path.sep}`;
    if (!resolvedPath) return null;
    if (!resolvedPath.startsWith(rootPrefix)) {
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
    try {
        contentRoot = defaultContentRoot();
        resourceRoot = parseResourceRootArgument();
        if (!fs.existsSync(path.join(contentRoot, "game.html"))) throw new Error(`Could not find game content at ${contentRoot}`);
        if (!validResourceRoot(resourceRoot)) throw new Error(`The resources root is not valid: ${resourceRoot}`);
    } catch (error) {
        writeStartupFailure(error);
        dialog.showErrorBox("Ignatius Rocketfrock", error?.message || String(error));
        app.quit();
        return;
    }
    registerAppProtocol();
    ipcMain.handle(CHANNELS.quit, () => {
        app.quit();
        return true;
    });
    ipcMain.handle(CHANNELS.getFullscreen, (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        return Boolean(window?.isFullScreen());
    });
    ipcMain.handle(CHANNELS.setFullscreen, (event, enabled) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) return false;
        window.setFullScreen(Boolean(enabled));
        return window.isFullScreen();
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
