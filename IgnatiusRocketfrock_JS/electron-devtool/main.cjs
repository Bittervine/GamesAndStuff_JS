const fs = require("node:fs");
const fsp = fs.promises;
const path = require("node:path");
const { spawn } = require("node:child_process");
const { app, BrowserWindow, dialog, protocol } = require("electron");

const APP_SCHEME = "ignatius";
const RESOURCE_SCHEME = "ignatius-resource";
const APP_HOST = "app";
const RESOURCE_HOST = "project";
const PLAYTEST_LEVEL_ID = "level_temp";

protocol.registerSchemesAsPrivileged([
    {
        scheme: APP_SCHEME,
        privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
    },
    {
        scheme: RESOURCE_SCHEME,
        privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
    }
]);

const CHANNELS = Object.freeze({
    webviewMessage: "ignatius-devtool:webview-message",
    webviewSend: "ignatius-devtool:webview-send"
});

let mainWindow = null;
let resourceRoot = null;
let contentRoot = null;

function executableDirectory() {
    return path.dirname(process.execPath);
}

function developmentRoot() {
    return path.resolve(__dirname, "..");
}

function packaged() {
    return app.isPackaged;
}

function defaultContentRoot() {
    return packaged() ? path.join(executableDirectory(), "content") : developmentRoot();
}

function defaultResourceRoot() {
    return path.join(defaultContentRoot(), "resources");
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
    return defaultResourceRoot();
}

function normalizePathCandidate(value) {
    return path.resolve(String(value || "")).replace(/[\\/]$/, "");
}

function isInside(root, candidate) {
    const normalizedRoot = normalizePathCandidate(root);
    const normalizedCandidate = normalizePathCandidate(candidate);
    return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}${path.sep}`);
}

function safeRelativePath(relativePath) {
    const text = String(relativePath || "").trim().replace(/\\/g, "/");
    if (!text || text.startsWith("/") || text.includes("\\") || text.includes("//")) return null;
    const parts = text.split("/");
    if (parts.some((part) => !part || part === "." || part === ".." || /[<>:\"|?*\x00-\x1f\x7f]/.test(part))) return null;
    return parts.join("/");
}

function resourcePath(relativePath) {
    const safe = safeRelativePath(relativePath);
    if (!safe) return null;
    const candidate = path.resolve(resourceRoot, ...safe.split("/"));
    return isInside(resourceRoot, candidate) ? candidate : null;
}

function contentPath(relativePath) {
    const safe = safeRelativePath(relativePath);
    if (!safe) return null;
    const candidate = path.resolve(contentRoot, ...safe.split("/"));
    return isInside(contentRoot, candidate) ? candidate : null;
}

function contentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".ttf": "font/ttf",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".mp3": "audio/mpeg",
        ".txt": "text/plain; charset=utf-8"
    }[extension] || "application/octet-stream";
}

function responseForBytes(bytes, filePath, status = 200) {
    return new Response(bytes, {
        status,
        headers: {
            "Content-Type": contentType(filePath),
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Access-Control-Allow-Origin": "*"
        }
    });
}

async function responseForFile(filePath) {
    try {
        return responseForBytes(await fsp.readFile(filePath), filePath);
    } catch (error) {
        const status = error?.code === "ENOENT" ? 404 : 500;
        return responseForBytes(Buffer.from(status === 404 ? "Resource not found." : "Resource could not be read."), filePath, status);
    }
}

function resolveAppPath(requestUrl) {
    const url = new URL(requestUrl);
    if (url.hostname !== APP_HOST) return null;
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "IgnatiusDevTool.html";
    if (relative === "__ignatius_build_revision.txt") return path.join(contentRoot, "BUILD_REVISION.txt");
    if (relative === "resources" || relative.startsWith("resources/")) return resourcePath(relative.slice("resources/".length));
    return contentPath(relative);
}

async function handleAppRequest(request) {
    let filePath = null;
    try {
        filePath = resolveAppPath(request.url);
    } catch (_) {
        return new Response("Invalid application path.", { status: 400 });
    }
    if (!filePath) return new Response("Invalid application path.", { status: 400 });
    return responseForFile(filePath);
}

async function handleResourceRequest(request) {
    let url;
    try {
        url = new URL(request.url);
    } catch (_) {
        return new Response("Invalid resource URL.", { status: 400 });
    }
    if (url.hostname !== RESOURCE_HOST) return new Response("Invalid resource host.", { status: 400 });
    let relative;
    try {
        relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    } catch (_) {
        return new Response("Invalid resource path.", { status: 400 });
    }
    const filePath = resourcePath(relative);
    if (!filePath) return new Response("Invalid resource path.", { status: 400 });
    return responseForFile(filePath);
}

async function validateResourceRoot(candidate) {
    const root = path.resolve(candidate);
    const requiredDirectories = ["levels", "atlases", "items", "characters", "palette", "editor", "generator", "config", "music", "sfx", "ui", "fonts"];
    try {
        const index = JSON.parse(await fsp.readFile(path.join(root, "resources.json"), "utf8"));
        if (!Array.isArray(index.levelIds) || !Array.isArray(index.assetAtlasIds)) return false;
        for (const directory of requiredDirectories) {
            if (!(await fsp.stat(path.join(root, directory))).isDirectory()) return false;
        }
        return true;
    } catch (_) {
        return false;
    }
}

async function addResourceIndexEntry(kind, id) {
    const prefix = kind === "assetAtlas" ? "at_atlas_" : kind === "level" ? "level_" : "";
    if (!prefix || !id.startsWith(prefix) || !/^[A-Za-z0-9_]+$/.test(id.slice(prefix.length))) return;
    const jsonPath = path.join(resourceRoot, kind === "assetAtlas" ? "atlases" : "levels", `${id}.json`);
    if (!isInside(resourceRoot, jsonPath) || !fs.existsSync(jsonPath)) return;
    if (kind === "assetAtlas" && !fs.existsSync(path.join(resourceRoot, "atlases", `${id}.png`))) return;
    const indexPath = path.join(resourceRoot, "resources.json");
    const index = JSON.parse(await fsp.readFile(indexPath, "utf8"));
    const key = kind === "assetAtlas" ? "assetAtlasIds" : "levelIds";
    if (!Array.isArray(index[key])) throw new Error(`resources.json is missing ${key}.`);
    if (!index[key].includes(id)) {
        index[key].push(id);
        await fsp.writeFile(indexPath, `${JSON.stringify(index, null, 4)}\n`, "utf8");
    }
}

function sendWebviewMessage(message) {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(CHANNELS.webviewMessage, message);
}

function log(message) {
    try {
        const logPath = path.join(executableDirectory(), "logs", "ignatius-devtool-electron.log");
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`, "utf8");
    } catch (_) {}
}

function writeStartupFailure(error) {
    try {
        const logPath = path.join(executableDirectory(), "logs", "ignatius-devtool-electron-startup.log");
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.appendFileSync(logPath, `${new Date().toISOString()} ${error?.stack || error}\nargv=${JSON.stringify(process.argv)}\ncontentRoot=${contentRoot}\nresourceRoot=${resourceRoot}\n`, "utf8");
    } catch (_) {}
}

async function handleProjectMessage(event, rawMessage) {
    const message = String(rawMessage || "");
    if (message === "ignatius-playtest-request") {
        await launchPlaytest();
        return;
    }
    if (message.startsWith("ignatius-devtool-diagnostic|")) {
        log(message.slice("ignatius-devtool-diagnostic|".length));
        return;
    }
    if (message.startsWith("ignatius-resource-saved|")) {
        const [, kind, id] = message.split("|");
        try { await addResourceIndexEntry(kind, id); } catch (error) { log(`resource index update failed: ${error.message}`); }
        return;
    }

    let request;
    try { request = JSON.parse(message); } catch (_) { return; }
    if (request?.type !== "ignatius-project-request" || !request.requestId) return;
    const reply = (ok, result = {}, error = "") => sendWebviewMessage(JSON.stringify({
        type: "ignatius-project-response",
        requestId: request.requestId,
        ok,
        ...(ok ? { result } : { error })
    }));

    try {
        switch (request.operation) {
        case "projectInfo":
            reply(true, { connected: true, displayName: resourceRoot, resourceRoot });
            break;
        case "chooseResourcesDirectory": {
            const result = await dialog.showOpenDialog(mainWindow, {
                title: "Select Ignatius resources folder",
                defaultPath: resourceRoot,
                properties: ["openDirectory"]
            });
            if (result.canceled || !result.filePaths[0]) {
                reply(true, { cancelled: true, connected: true, displayName: resourceRoot, resourceRoot });
                break;
            }
            const selected = path.resolve(result.filePaths[0]);
            if (!await validateResourceRoot(selected)) {
                reply(false, {}, `The selected folder is not a valid Ignatius resources folder: ${selected}`);
                break;
            }
            const changed = selected !== resourceRoot;
            resourceRoot = selected;
            log(`selected resources root ${resourceRoot}`);
            reply(true, { cancelled: false, changed, connected: true, displayName: resourceRoot, resourceRoot });
            break;
        }
        case "readResourceTextPath": {
            const filePath = resourcePath(request.relativePath);
            if (!filePath) throw new Error("Invalid project resource path.");
            reply(true, { relativePath: request.relativePath, resourceRoot, text: await fsp.readFile(filePath, "utf8") });
            break;
        }
        case "writeResource": {
            const filePath = resourcePath(request.relativePath);
            if (!filePath || typeof request.base64 !== "string") throw new Error("Invalid project resource write request.");
            await fsp.mkdir(path.dirname(filePath), { recursive: true });
            await fsp.writeFile(filePath, Buffer.from(request.base64, "base64"));
            const filename = path.basename(filePath);
            if ((request.resourceKind === "level" || request.resourceKind === "assetAtlas") && filename.endsWith(".json")) {
                const id = filename.slice(0, -5);
                if (!(request.resourceKind === "level" && id === PLAYTEST_LEVEL_ID)) await addResourceIndexEntry(request.resourceKind, id);
            }
            reply(true, { resourceKind: request.resourceKind, relativePath: request.relativePath, directory: path.dirname(filePath) });
            break;
        }
        default:
            reply(false, {}, `Unsupported native project operation: ${request.operation}`);
        }
    } catch (error) {
        reply(false, {}, error?.message || String(error));
    }
    void event;
}

async function launchPlaytest() {
    const levelPath = path.join(resourceRoot, "levels", `${PLAYTEST_LEVEL_ID}.json`);
    if (!fs.existsSync(levelPath)) {
        dialog.showErrorBox("Ignatius Dev Tool", `The Level Editor did not write ${levelPath}.`);
        return;
    }
    const gamePath = packaged()
        ? path.join(executableDirectory(), "IgnatiusSDL.exe")
        : path.join(path.resolve(__dirname, "..", ".."), "build", "Release", "IgnatiusSDL.exe");
    if (!fs.existsSync(gamePath)) {
        dialog.showErrorBox("Ignatius Dev Tool", `Could not find IgnatiusSDL.exe at ${gamePath}`);
        return;
    }
    const child = spawn(gamePath, ["--level", PLAYTEST_LEVEL_ID, "--start-in-game", "--resources-root", resourceRoot], {
        cwd: path.dirname(gamePath),
        detached: false,
        stdio: "ignore",
        windowsHide: false
    });
    child.on("error", (error) => dialog.showErrorBox("Ignatius Dev Tool", `Game launch failed: ${error.message}`));
    log(`launched ${gamePath} --level ${PLAYTEST_LEVEL_ID} --resources-root ${resourceRoot}`);
}

function createMainWindow() {
    const window = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 960,
        minHeight: 540,
        show: false,
        backgroundColor: "#0d0b15",
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
        if (!url.startsWith(`${APP_SCHEME}://${APP_HOST}/`)) event.preventDefault();
    });
    window.webContents.on("before-input-event", (event, input) => {
        const devToolsShortcut = input.key === "F12" || (input.key.toLowerCase() === "i" && input.control && input.shift);
        if (devToolsShortcut && input.type === "keyDown") {
            event.preventDefault();
            window.webContents.openDevTools({ mode: "detach" });
        }
    });
    window.once("ready-to-show", () => window.show());
    window.on("closed", () => { if (mainWindow === window) mainWindow = null; });
    void window.loadURL(`${APP_SCHEME}://${APP_HOST}/IgnatiusDevTool.html`);
    return window;
}

async function initialize() {
    contentRoot = defaultContentRoot();
    resourceRoot = parseResourceRootArgument();
    if (!fs.existsSync(path.join(contentRoot, "IgnatiusDevTool.html"))) throw new Error(`Could not find development content at ${contentRoot}`);
    if (!await validateResourceRoot(resourceRoot)) throw new Error(`The resources root is not valid: ${resourceRoot}`);
    protocol.handle(APP_SCHEME, handleAppRequest);
    protocol.handle(RESOURCE_SCHEME, handleResourceRequest);
    log(`content root=${contentRoot}`);
    log(`resources root=${resourceRoot}`);
}

app.whenReady().then(async () => {
    try {
        await initialize();
    } catch (error) {
        writeStartupFailure(error);
        dialog.showErrorBox("Ignatius Dev Tool", error?.message || String(error));
        app.quit();
        return;
    }
    const { ipcMain } = require("electron");
    ipcMain.on(CHANNELS.webviewSend, handleProjectMessage);
    mainWindow = createMainWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
