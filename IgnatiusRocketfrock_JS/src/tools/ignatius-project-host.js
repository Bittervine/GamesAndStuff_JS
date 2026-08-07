(function () {
    "use strict";

    const DATABASE_NAME = "ignatius-dev-tool";
    const DATABASE_VERSION = 1;
    const HANDLE_STORE = "handles";
    const RESOURCES_HANDLE_KEY = "resources-root";
    const NATIVE_REQUEST_TYPE = "ignatius-project-request";
    const NATIVE_RESPONSE_TYPE = "ignatius-project-response";
    const REQUIRED_DIRECTORIES = ["levels", "atlases", "characters", "palette"];
    const RESOURCE_DIRECTORIES = Object.freeze({
        level: "levels",
        assetAtlas: "atlases",
        character: "characters",
        palette: "palette"
    });

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
                    this.#emit();
                }
                return this.snapshot();
            }
            if (typeof window.showDirectoryPicker !== "function") {
                throw new Error("This Chromium build does not provide the File System Access API.");
            }
            const handle = await window.showDirectoryPicker({ mode: "readwrite", id: "ignatius-resources" });
            if (!await verifyPermission(handle, true)) throw new Error("Write permission was not granted for the resources folder.");
            await validateResourcesDirectory(handle);
            this.directoryHandle = handle;
            await storeHandle(handle);
            this.#emit();
            return this.snapshot();
        }

        async forgetResourcesDirectory() {
            if (this.bridge) return;
            this.directoryHandle = null;
            await removeStoredHandle();
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

        async saveText(resourceKind, filename, text, options = {}) {
            return this.saveBlob(resourceKind, filename, new Blob([text], { type: options.mimeType || "application/json" }), options);
        }

        async saveJson(resourceKind, filename, value, options = {}) {
            return this.saveText(resourceKind, filename, JSON.stringify(value, null, 4), options);
        }

        async saveBlob(resourceKind, filename, blob, options = {}) {
            if (!RESOURCE_DIRECTORIES[resourceKind]) throw new Error(`Unknown Ignatius resource kind: ${resourceKind}`);
            if (!/^[A-Za-z0-9_.-]+$/.test(filename)) throw new Error(`Unsafe resource filename: ${filename}`);
            if (!await this.ensureConnected({ prompt: options.prompt !== false })) return "cancelled";

            if (this.bridge) {
                const bytes = new Uint8Array(await blob.arrayBuffer());
                await this.#nativeRequest("writeResource", {
                    resourceKind,
                    filename,
                    mimeType: blob.type || "application/octet-stream",
                    base64: bytesToBase64(bytes)
                });
            } else {
                const directory = await this.directoryHandle.getDirectoryHandle(RESOURCE_DIRECTORIES[resourceKind]);
                const fileHandle = await directory.getFileHandle(filename, { create: true });
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
        resourceDirectories: RESOURCE_DIRECTORIES
    });
})();
