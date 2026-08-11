(function () {
    "use strict";

    const DATABASE_NAME = "ignatius-dev-tool";
    const DATABASE_VERSION = 1;
    const HANDLE_STORE = "handles";
    const PROJECT_SCOPE_PATH = (() => {
        try {
            return new URL(".", window.location.href).pathname || "/";
        } catch (_) {
            return "/";
        }
    })();
    const NATIVE_REQUEST_TYPE = "ignatius-project-request";
    const NATIVE_RESPONSE_TYPE = "ignatius-project-response";
    const REQUIRED_DIRECTORIES = Object.freeze([
        "levels",
        "atlases",
        "items",
        "characters",
        "palette",
        "editor",
        "generator",
        "config",
        "music",
        "sfx",
        "ui",
        "fonts"
    ]);
    const RESOURCE_DIRECTORIES = Object.freeze({
        level: "levels",
        assetAtlas: "atlases",
        itemAtlas: "items",
        character: "characters",
        palette: "palette",
        editor: "editor",
        generator: "generator",
        config: "config",
        music: "music",
        sfx: "sfx",
        ui: "ui",
        font: "fonts"
    });

    function scopeHash(text) {
        let hash = 2166136261;
        for (const ch of String(text || "")) {
            hash ^= ch.charCodeAt(0);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
    }

    const RESOURCES_HANDLE_KEY = `resources-root:${scopeHash(PROJECT_SCOPE_PATH)}`;
    const DIRECTORY_PICKER_ID = `ignatius-res-${scopeHash(PROJECT_SCOPE_PATH)}`;

    function nativeBridge() {
        const bridge = window.chrome?.webview;
        return typeof bridge?.postMessage === "function" ? bridge : null;
    }

    function sameOriginParentHost() {
        try {
            if (window.parent && window.parent !== window && window.parent.location.origin === window.location.origin) {
                return window.parent.ignatiusProjectHost || null;
            }
        } catch (_) {
            return null;
        }
        return null;
    }

    function normalizeResourceRelativePath(requestPath) {
        let text = String(requestPath || "").trim().replace(/\\/g, "/");
        if (!text || /^(?:[a-z]+:)?\/\//i.test(text) || text.startsWith("data:") || text.startsWith("blob:")) {
            throw new Error(`Not a relative Ignatius resource path: ${requestPath}`);
        }
        while (text.startsWith("./")) text = text.slice(2);
        text = text.replace(/^\/+/, "");
        for (const prefix of ["reference/resources/", "content/resources/", "resources/"]) {
            if (text.startsWith(prefix)) {
                text = text.slice(prefix.length);
                break;
            }
        }
        const parts = text.split("/");
        if (!text || parts.some((part) => !part || part === "." || part === ".." || /[<>:"|?*\x00-\x1f\x7f]/.test(part))) {
            throw new Error(`Unsafe Ignatius resource path: ${requestPath}`);
        }
        return parts.join("/");
    }

    function resolveResourceRelativePath(resourceKind, filename) {
        const directory = RESOURCE_DIRECTORIES[resourceKind];
        if (!directory) throw new Error(`Unknown Ignatius resource kind: ${resourceKind}`);
        if (!/^[A-Za-z0-9_.-]+$/.test(String(filename || ""))) throw new Error(`Unsafe resource filename: ${filename}`);
        return `${directory}/${filename}`;
    }

    function resourceRequestUrl(relativePath, selectionVersion = 0) {
        const encodedPath = normalizeResourceRelativePath(relativePath)
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");
        const url = new URL(`resources/${encodedPath}`, window.location.href);
        url.searchParams.set("ignatius_project_root", String(selectionVersion));
        return url.href;
    }

    function openHandleDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
            request.onupgradeneeded = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains(HANDLE_STORE)) database.createObjectStore(HANDLE_STORE);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("Could not open the project-folder database."));
        });
    }

    async function loadStoredHandle() {
        if (!("indexedDB" in window)) return null;
        const database = await openHandleDatabase();
        try {
            return await new Promise((resolve, reject) => {
                const request = database.transaction(HANDLE_STORE, "readonly").objectStore(HANDLE_STORE).get(RESOURCES_HANDLE_KEY);
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error || new Error("Could not restore the project folder."));
            });
        } finally {
            database.close();
        }
    }

    async function storeHandle(handle) {
        if (!("indexedDB" in window)) return;
        const database = await openHandleDatabase();
        try {
            await new Promise((resolve, reject) => {
                const request = database.transaction(HANDLE_STORE, "readwrite").objectStore(HANDLE_STORE).put(handle, RESOURCES_HANDLE_KEY);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error || new Error("Could not remember the project folder."));
            });
        } finally {
            database.close();
        }
    }

    async function removeStoredHandle() {
        if (!("indexedDB" in window)) return;
        const database = await openHandleDatabase();
        try {
            await new Promise((resolve, reject) => {
                const request = database.transaction(HANDLE_STORE, "readwrite").objectStore(HANDLE_STORE).delete(RESOURCES_HANDLE_KEY);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error || new Error("Could not forget the project folder."));
            });
        } finally {
            database.close();
        }
    }

    async function verifyPermission(handle, request) {
        if (!handle) return false;
        const options = { mode: "readwrite" };
        if (typeof handle.queryPermission !== "function") return false;
        if (await handle.queryPermission(options) === "granted") return true;
        if (!request || typeof handle.requestPermission !== "function") return false;
        return await handle.requestPermission(options) === "granted";
    }

    async function validateResourcesDirectory(handle) {
        const resourceIndexHandle = await handle.getFileHandle("resources.json");
        const resourceIndexFile = await resourceIndexHandle.getFile();
        const resourceIndex = JSON.parse(await resourceIndexFile.text());
        if (!Array.isArray(resourceIndex.levelIds) || !Array.isArray(resourceIndex.assetAtlasIds)) {
            throw new Error("The selected folder contains resources.json, but it is not an Ignatius resources folder.");
        }
        for (const directoryName of REQUIRED_DIRECTORIES) await handle.getDirectoryHandle(directoryName);
        return resourceIndex;
    }

    async function sameDirectoryEntry(left, right) {
        if (!left || !right) return left === right;
        if (left === right) return true;
        if (typeof left.isSameEntry === "function") {
            try {
                return await left.isSameEntry(right);
            } catch (_) {
                return false;
            }
        }
        return false;
    }

    function bytesToBase64(bytes) {
        let binary = "";
        const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        const chunkSize = 0x8000;
        for (let index = 0; index < view.length; index += chunkSize) {
            binary += String.fromCharCode(...view.subarray(index, index + chunkSize));
        }
        return btoa(binary);
    }

    class IgnatiusProjectHost {
        constructor() {
            this.directoryHandle = null;
            this.projectInfo = null;
            this.listeners = new Set();
            this.pendingNativeRequests = new Map();
            this.nextNativeRequestId = 1;
            this.selectionVersion = 0;
            this.initialized = false;
            this.initializationPromise = null;
            this.bridge = nativeBridge();
            if (this.bridge) this.bridge.addEventListener("message", (event) => this.#onNativeMessage(event));
        }

        get mode() { return this.bridge ? "native" : "browser"; }
        get connected() { return Boolean(this.bridge ? this.projectInfo?.connected : this.directoryHandle); }
        get displayName() {
            if (this.bridge) return this.projectInfo?.displayName || "SDL project resources";
            return this.directoryHandle?.name || "No resources folder selected";
        }

        subscribe(listener) {
            if (typeof listener !== "function") return () => {};
            this.listeners.add(listener);
            listener(this.snapshot());
            return () => this.listeners.delete(listener);
        }

        snapshot() {
            return {
                mode: this.mode,
                connected: this.connected,
                displayName: this.displayName,
                resourceRoot: this.bridge ? String(this.projectInfo?.resourceRoot || "") : "",
                selectionVersion: this.selectionVersion,
                canChooseDirectory: this.bridge ? true : typeof window.showDirectoryPicker === "function"
            };
        }

        #emit() {
            const snapshot = this.snapshot();
            for (const listener of this.listeners) listener(snapshot);
            window.dispatchEvent(new CustomEvent("ignatius-project-host-change", { detail: snapshot }));
        }

        async initialize() {
            if (this.initialized) return this.snapshot();
            if (this.initializationPromise) return this.initializationPromise;
            this.initializationPromise = (async () => {
                if (this.bridge) {
                    this.projectInfo = await this.#nativeRequest("projectInfo", {});
                } else {
                    try {
                        const handle = await loadStoredHandle();
                        if (handle && await verifyPermission(handle, false)) {
                            await validateResourcesDirectory(handle);
                            this.directoryHandle = handle;
                        }
                    } catch (error) {
                        console.warn("Could not restore the remembered Ignatius resources folder.", error);
                    }
                }
                this.initialized = true;
                this.#emit();
                return this.snapshot();
            })();
            return this.initializationPromise;
        }

        async chooseResourcesDirectory() {
            await this.initialize();
            if (this.bridge) {
                const result = await this.#nativeRequest("chooseResourcesDirectory", {});
                if (!result.cancelled) {
                    this.projectInfo = result;
                    if (result.changed) this.selectionVersion += 1;
                    this.#emit();
                }
                return this.snapshot();
            }
            if (typeof window.showDirectoryPicker !== "function") {
                throw new Error("This Chromium build does not provide the File System Access API.");
            }
            const previousHandle = this.directoryHandle;
            const handle = await window.showDirectoryPicker({ mode: "readwrite", id: DIRECTORY_PICKER_ID });
            if (!await verifyPermission(handle, true)) throw new Error("Write permission was not granted for the resources folder.");
            await validateResourcesDirectory(handle);
            const changed = !await sameDirectoryEntry(previousHandle, handle);
            this.directoryHandle = handle;
            await storeHandle(handle);
            if (changed) this.selectionVersion += 1;
            this.#emit();
            return this.snapshot();
        }

        async forgetResourcesDirectory() {
            if (this.bridge) return;
            const changed = Boolean(this.directoryHandle);
            this.directoryHandle = null;
            await removeStoredHandle();
            if (changed) this.selectionVersion += 1;
            this.#emit();
        }

        async ensureConnected(options = {}) {
            await this.initialize();
            if (this.bridge) return this.connected;
            if (this.directoryHandle && await verifyPermission(this.directoryHandle, Boolean(options.prompt))) return true;
            if (!options.prompt) return false;
            try {
                await this.chooseResourcesDirectory();
                return true;
            } catch (error) {
                if (error?.name === "AbortError") return false;
                throw error;
            }
        }

        async #browserResourceFile(relativePath) {
            const normalized = normalizeResourceRelativePath(relativePath);
            const parts = normalized.split("/");
            let directory = this.directoryHandle;
            for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part);
            const fileHandle = await directory.getFileHandle(parts.at(-1));
            return await fileHandle.getFile();
        }

        async readResourceText(requestPath, options = {}) {
            const relativePath = normalizeResourceRelativePath(requestPath);
            if (!await this.ensureConnected({ prompt: Boolean(options.prompt) })) return null;

            if (this.bridge) {
                const result = await this.#nativeRequest("readResourceTextPath", { relativePath });
                return typeof result.text === "string" ? result.text : "";
            }

            return await (await this.#browserResourceFile(relativePath)).text();
        }

        async readResourceBlob(requestPath, options = {}) {
            const relativePath = normalizeResourceRelativePath(requestPath);
            if (!await this.ensureConnected({ prompt: Boolean(options.prompt) })) return null;

            if (!this.bridge) return await this.#browserResourceFile(relativePath);

            const response = await fetch(resourceRequestUrl(relativePath, this.selectionVersion), { cache: "no-store" });
            if (!response.ok) throw new Error(`Could not load resources/${relativePath}: HTTP ${response.status}`);
            return await response.blob();
        }

        async readText(resourceKind, filename, options = {}) {
            return this.readResourceText(resolveResourceRelativePath(resourceKind, filename), options);
        }

        async saveText(resourceKind, filename, text, options = {}) {
            return this.saveBlob(resourceKind, filename, new Blob([text], { type: options.mimeType || "application/json" }), options);
        }

        async saveJson(resourceKind, filename, value, options = {}) {
            return this.saveText(resourceKind, filename, JSON.stringify(value, null, 4), options);
        }

        async saveBlob(resourceKind, filename, blob, options = {}) {
            const relativePath = resolveResourceRelativePath(resourceKind, filename);
            const selectionVersionBeforeConnect = this.selectionVersion;
            if (!await this.ensureConnected({ prompt: options.prompt !== false })) return "cancelled";
            if (this.selectionVersion !== selectionVersionBeforeConnect) {
                // The editor's current in-memory document may have been loaded before this
                // resources root was selected. Never write that document into a newly chosen
                // tree; let the caller reload and read from the selected root first.
                return "root-changed";
            }

            if (this.bridge) {
                const bytes = new Uint8Array(await blob.arrayBuffer());
                await this.#nativeRequest("writeResource", {
                    resourceKind,
                    relativePath,
                    mimeType: blob.type || "application/octet-stream",
                    base64: bytesToBase64(bytes)
                });
            } else {
                const parts = relativePath.split("/");
                let directory = this.directoryHandle;
                for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part);
                const fileHandle = await directory.getFileHandle(parts.at(-1), { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                await this.#updateBrowserResourceIndex(resourceKind, filename);
            }
            return "project";
        }

        async #updateBrowserResourceIndex(resourceKind, filename) {
            if (resourceKind !== "level" && resourceKind !== "assetAtlas") return;
            const id = filename.replace(/\.json$/i, "");
            if ((resourceKind === "level" && !/^level_\d+$/.test(id)) || (resourceKind === "assetAtlas" && !/^at_atlas_\d+$/.test(id))) return;
            if (resourceKind === "assetAtlas") {
                const atlasDirectory = await this.directoryHandle.getDirectoryHandle("atlases");
                try { await atlasDirectory.getFileHandle(`${id}.png`); } catch (_) { return; }
            }
            const indexHandle = await this.directoryHandle.getFileHandle("resources.json");
            const indexFile = await indexHandle.getFile();
            const index = JSON.parse(await indexFile.text());
            const field = resourceKind === "level" ? "levelIds" : "assetAtlasIds";
            if (!Array.isArray(index[field])) index[field] = [];
            if (index[field].includes(id)) return;
            index[field].push(id);
            const writable = await indexHandle.createWritable();
            await writable.write(new Blob([JSON.stringify(index, null, 4) + "\n"], { type: "application/json" }));
            await writable.close();
        }

        async #nativeRequest(operation, payload) {
            if (!this.bridge) throw new Error("The native Ignatius project bridge is unavailable.");
            const requestId = `project-${Date.now()}-${this.nextNativeRequestId++}`;
            const promise = new Promise((resolve, reject) => {
                const timeout = window.setTimeout(() => {
                    this.pendingNativeRequests.delete(requestId);
                    reject(new Error(`The native project operation '${operation}' timed out.`));
                }, 30000);
                this.pendingNativeRequests.set(requestId, { resolve, reject, timeout });
            });
            this.bridge.postMessage(JSON.stringify({ type: NATIVE_REQUEST_TYPE, requestId, operation, ...payload }));
            return promise;
        }

        #onNativeMessage(event) {
            let message = event.data;
            if (typeof message === "string") {
                try { message = JSON.parse(message); } catch (_) { return; }
            }
            if (!message || message.type !== NATIVE_RESPONSE_TYPE || !message.requestId) return;
            const pending = this.pendingNativeRequests.get(message.requestId);
            if (!pending) return;
            window.clearTimeout(pending.timeout);
            this.pendingNativeRequests.delete(message.requestId);
            if (message.ok) pending.resolve(message.result || {});
            else pending.reject(new Error(message.error || "The native project operation failed."));
        }
    }

    function getProjectHost() {
        return sameOriginParentHost() || window.ignatiusProjectHost || (window.ignatiusProjectHost = new IgnatiusProjectHost());
    }

    window.IgnatiusProjectHost = Object.freeze({
        create: () => new IgnatiusProjectHost(),
        get: getProjectHost,
        resourceDirectories: RESOURCE_DIRECTORIES,
        requiredDirectories: REQUIRED_DIRECTORIES,
        normalizeResourceRelativePath,
        resolveResourceRelativePath
    });
})();
