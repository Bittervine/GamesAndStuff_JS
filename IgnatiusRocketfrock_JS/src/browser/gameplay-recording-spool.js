const DATABASE_NAME = "ignatius-gameplay-recording-spool";
const DATABASE_VERSION = 2;
const CHUNK_STORE_NAME = "chunks";
const MANIFEST_STORE_NAME = "recordings";
const DEFAULT_CHUNK_TARGET_BYTES = 256 * 1024;
const DEFAULT_MAX_QUEUED_CHUNKS = 8;
const RECOVERABLE_MANIFEST_STATES = new Set(["retained", "saving", "save-failed", "export-unavailable"]);
const ACTIVE_MANIFEST_HEARTBEAT_MS = 30 * 1000;
const ACTIVE_MANIFEST_STALE_MS = 5 * 60 * 1000;
const ACTIVE_RECORDING_LOCK_PREFIX = `${DATABASE_NAME}:active:`;

function requestPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
    });
}

function transactionPromise(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
        transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
    });
}

function openSpoolDatabase() {
    if (!globalThis.indexedDB) {
        return Promise.reject(new Error("IndexedDB is unavailable in this browser context."));
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onupgradeneeded = (event) => {
            const database = request.result;
            if (!database.objectStoreNames.contains(CHUNK_STORE_NAME)) {
                database.createObjectStore(CHUNK_STORE_NAME, { keyPath: ["recordingId", "index"] });
            }
            if (!database.objectStoreNames.contains(MANIFEST_STORE_NAME)) {
                database.createObjectStore(MANIFEST_STORE_NAME, { keyPath: "recordingId" });
            }
            // Revision 409 stored only frame chunks. After a reload those chunks
            // had no recording metadata and could never be exported, so clear
            // that unrecoverable v1 data during the one-time schema upgrade.
            if (Number(event.oldVersion) > 0 && Number(event.oldVersion) < 2) {
                request.transaction.objectStore(CHUNK_STORE_NAME).clear();
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open gameplay recording storage."));
        request.onblocked = () => reject(new Error("Gameplay recording storage upgrade is blocked by another tab."));
    });
}


function activeRecordingLockName(recordingId) {
    return `${ACTIVE_RECORDING_LOCK_PREFIX}${String(recordingId || "")}`;
}

async function reclaimStaleActiveRecording(database, recordingId) {
    const locks = globalThis.navigator?.locks;
    if (!locks?.request) {
        // Without an authoritative cross-tab ownership primitive, preserve the
        // data rather than deleting a recording that may still belong to a
        // throttled or suspended live tab.
        return false;
    }
    let reclaimed = false;
    await locks.request(activeRecordingLockName(recordingId), { mode: "exclusive", ifAvailable: true }, async (lock) => {
        if (!lock) return;

        // The state may have changed from active to retained while recovery was
        // waiting for the live owner to release its lock. Re-read under the
        // ownership lock and delete only if the manifest is still stale-active.
        const transaction = database.transaction(MANIFEST_STORE_NAME, "readonly");
        const completion = transactionPromise(transaction);
        const manifest = await requestPromise(transaction.objectStore(MANIFEST_STORE_NAME).get(recordingId));
        await completion;
        const updatedAtMs = Math.max(0, Number(manifest?.updatedAtMs) || 0);
        if (String(manifest?.state || "") !== "active"
            || updatedAtMs <= 0
            || Date.now() - updatedAtMs < ACTIVE_MANIFEST_STALE_MS) {
            return;
        }
        await deleteRecordingData(database, recordingId);
        reclaimed = true;
    });
    return reclaimed;
}

function recordingManifestCopy(recording) {
    if (!recording || typeof recording !== "object") return null;
    return { ...recording, frames: null };
}

async function deleteRecordingData(database, recordingId) {
    if (!database || !recordingId || typeof IDBKeyRange === "undefined") return;
    const transaction = database.transaction([CHUNK_STORE_NAME, MANIFEST_STORE_NAME], "readwrite");
    transaction.objectStore(CHUNK_STORE_NAME).delete(
        IDBKeyRange.bound([recordingId, 0], [recordingId, Number.MAX_SAFE_INTEGER])
    );
    transaction.objectStore(MANIFEST_STORE_NAME).delete(recordingId);
    await transactionPromise(transaction);
}

export class BrowserGameplayRecordingSpool {
    constructor({
        recordingId,
        recording = null,
        existing = false,
        chunkCount = 0,
        serializedCharacters = 0,
        createdAtMs = Date.now(),
        chunkTargetBytes = DEFAULT_CHUNK_TARGET_BYTES,
        maxQueuedChunks = DEFAULT_MAX_QUEUED_CHUNKS
    } = {}) {
        this.recordingId = String(recordingId || `recording-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        this.chunkTargetBytes = Math.max(16 * 1024, Math.floor(Number(chunkTargetBytes) || DEFAULT_CHUNK_TARGET_BYTES));
        this.maxQueuedChunks = Math.max(1, Math.floor(Number(maxQueuedChunks) || DEFAULT_MAX_QUEUED_CHUNKS));
        this.createdAtMs = Math.max(0, Math.floor(Number(createdAtMs) || Date.now()));
        this.accepting = !existing;
        this.failed = false;
        this.error = "";
        this.pendingChunks = [];
        this.currentChunk = "";
        this.nextChunkIndex = Math.max(0, Math.floor(Number(chunkCount) || 0));
        this.persistedChunks = existing ? this.nextChunkIndex : 0;
        this.serializedCharacters = Math.max(0, Math.floor(Number(serializedCharacters) || 0));
        this.pumpPromise = null;
        this.manifestRecording = recordingManifestCopy(recording);
        this.lastManifestHeartbeatMs = this.createdAtMs;
        this.ownerLockRelease = null;
        this.ownerLockHeld = false;
        this.ownerLockCompletionPromise = null;
        this.ownerLockReadyPromise = existing ? Promise.resolve(true) : this.acquireOwnerLock();
        this.databasePromise = openSpoolDatabase().catch((error) => {
            this.fail(error);
            return null;
        });
        this.manifestReadyPromise = this.manifestRecording && !existing
            ? this.ownerLockReadyPromise.then((ready) => {
                if (!ready) throw new Error("Gameplay recording storage ownership could not be acquired.");
                return this.persistManifest(this.manifestRecording, "active");
            }).catch((error) => {
                this.fail(error);
                return false;
            })
            : Promise.resolve(true);
    }

    acquireOwnerLock() {
        const locks = globalThis.navigator?.locks;
        if (!locks?.request) {
            return Promise.resolve(true);
        }
        return new Promise((resolve) => {
            let settled = false;
            const settle = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            this.ownerLockCompletionPromise = locks.request(
                activeRecordingLockName(this.recordingId),
                { mode: "exclusive", ifAvailable: true },
                async (lock) => {
                    if (!lock) {
                        settle(false);
                        return;
                    }
                    this.ownerLockHeld = true;
                    const holdPromise = new Promise((release) => {
                        this.ownerLockRelease = release;
                    });
                    if (this.failed) {
                        this.releaseOwnerLock();
                        settle(false);
                    } else {
                        settle(true);
                    }
                    await holdPromise;
                    this.ownerLockRelease = null;
                    this.ownerLockHeld = false;
                }
            ).catch((error) => {
                settle(false);
                if (!this.failed) this.fail(error);
            });
        });
    }

    releaseOwnerLock() {
        if (this.ownerLockRelease) {
            const release = this.ownerLockRelease;
            this.ownerLockRelease = null;
            release();
        }
    }

    fail(error) {
        if (!this.failed) {
            this.failed = true;
            this.accepting = false;
            this.error = String(error?.message || error || "gameplay recording storage failed");
            this.pendingChunks.length = 0;
            this.currentChunk = "";
        }
        this.releaseOwnerLock();
    }

    status() {
        return {
            active: this.accepting && !this.failed,
            failed: this.failed,
            error: this.error,
            queuedChunks: this.pendingChunks.length,
            persistedChunks: this.persistedChunks,
            chunkCount: this.nextChunkIndex,
            serializedCharacters: this.serializedCharacters
        };
    }

    enqueueFrame(frame) {
        if (!this.accepting || this.failed) return false;
        let serialized;
        try {
            serialized = JSON.stringify(frame);
        } catch (error) {
            this.fail(error);
            return false;
        }
        if (!serialized) {
            this.fail(new Error("Gameplay recording frame could not be serialized."));
            return false;
        }

        const separatorCharacters = this.serializedCharacters > 0 ? 2 : 0;
        const separatorBytes = this.currentChunk ? 2 : 0;
        if (this.currentChunk && this.currentChunk.length + separatorBytes + serialized.length > this.chunkTargetBytes) {
            if (!this.flushCurrentChunk()) return false;
        }
        this.currentChunk += this.currentChunk ? `,\n${serialized}` : serialized;
        this.serializedCharacters += separatorCharacters + serialized.length;
        if (this.currentChunk.length >= this.chunkTargetBytes) {
            return this.flushCurrentChunk();
        }
        return true;
    }

    flushCurrentChunk() {
        if (!this.currentChunk) return true;
        if (this.pendingChunks.length >= this.maxQueuedChunks) {
            this.fail(new Error("Gameplay recording storage writer could not keep up with capture."));
            return false;
        }
        this.pendingChunks.push({ index: this.nextChunkIndex++, text: this.currentChunk });
        this.currentChunk = "";
        this.ensurePump();
        return true;
    }

    ensurePump() {
        if (this.pumpPromise || this.failed) return;
        this.pumpPromise = this.pumpChunks()
            .catch((error) => this.fail(error))
            .finally(() => {
                this.pumpPromise = null;
                if (!this.failed && this.pendingChunks.length) this.ensurePump();
            });
    }

    async pumpChunks() {
        if (!(await this.manifestReadyPromise)) return;
        const database = await this.databasePromise;
        if (!database) return;
        while (!this.failed && this.pendingChunks.length) {
            const chunk = this.pendingChunks.shift();
            const transaction = database.transaction(CHUNK_STORE_NAME, "readwrite");
            transaction.objectStore(CHUNK_STORE_NAME).put({
                recordingId: this.recordingId,
                index: chunk.index,
                text: chunk.text
            });
            await transactionPromise(transaction);
            this.persistedChunks += 1;
            const heartbeatNow = Date.now();
            if (this.accepting && this.manifestRecording && heartbeatNow - this.lastManifestHeartbeatMs >= ACTIVE_MANIFEST_HEARTBEAT_MS) {
                await this.persistManifest(this.manifestRecording, "active");
                this.lastManifestHeartbeatMs = heartbeatNow;
            }
        }
    }

    async close() {
        if (this.accepting) this.accepting = false;
        await this.manifestReadyPromise;
        while (!this.failed && this.currentChunk && this.pendingChunks.length >= this.maxQueuedChunks) {
            if (!this.pumpPromise) this.ensurePump();
            if (this.pumpPromise) await this.pumpPromise;
        }
        if (!this.failed && this.currentChunk && !this.flushCurrentChunk()) return false;
        while (!this.failed && (this.pumpPromise || this.pendingChunks.length)) {
            if (!this.pumpPromise) this.ensurePump();
            if (this.pumpPromise) await this.pumpPromise;
        }
        return !this.failed && this.persistedChunks === this.nextChunkIndex;
    }

    async persistManifest(recording, state) {
        const database = await this.databasePromise;
        if (!database) throw new Error(this.error || "Gameplay recording storage is unavailable.");
        const manifestRecording = recordingManifestCopy(recording || this.manifestRecording);
        if (!manifestRecording) throw new Error("Gameplay recording metadata is unavailable.");
        this.manifestRecording = manifestRecording;
        const transaction = database.transaction(MANIFEST_STORE_NAME, "readwrite");
        transaction.objectStore(MANIFEST_STORE_NAME).put({
            recordingId: this.recordingId,
            state: String(state || "retained"),
            createdAtMs: this.createdAtMs,
            updatedAtMs: Date.now(),
            chunkCount: this.nextChunkIndex,
            serializedCharacters: this.serializedCharacters,
            recording: manifestRecording
        });
        await transactionPromise(transaction);
        if (String(state || "retained") !== "active") {
            this.releaseOwnerLock();
        }
        return true;
    }

    async retain(recording, state = "retained") {
        if (!(await this.close())) {
            throw new Error(this.error || "Gameplay recording storage could not be finalized.");
        }
        await this.persistManifest(recording, state);
        return true;
    }

    async markState(state, recording = null) {
        await this.persistManifest(recording || this.manifestRecording, state);
        return true;
    }

    async readChunk(index) {
        const database = await this.databasePromise;
        if (!database) throw new Error(this.error || "Gameplay recording storage is unavailable.");
        const transaction = database.transaction(CHUNK_STORE_NAME, "readonly");
        const completion = transactionPromise(transaction);
        const request = transaction.objectStore(CHUNK_STORE_NAME).get([this.recordingId, index]);
        const result = await requestPromise(request);
        await completion;
        return typeof result?.text === "string" ? result.text : null;
    }

    async forEachChunk(callback) {
        if (!(await this.close())) {
            throw new Error(this.error || "Gameplay recording storage could not be finalized.");
        }
        for (let index = 0; index < this.nextChunkIndex; index += 1) {
            const text = await this.readChunk(index);
            if (text === null) {
                throw new Error(`Gameplay recording storage is missing chunk ${index}.`);
            }
            await callback(text, index, this.nextChunkIndex);
        }
    }

    async discard() {
        this.accepting = false;
        this.pendingChunks.length = 0;
        this.currentChunk = "";
        try {
            await this.manifestReadyPromise;
            if (this.pumpPromise) await this.pumpPromise;
            const database = await this.databasePromise;
            await deleteRecordingData(database, this.recordingId);
        } catch {
            // Cleanup is best effort. Recording failure must never take the game down.
        } finally {
            this.releaseOwnerLock();
        }
    }

    static async recoverRetainedRecordings() {
        const database = await openSpoolDatabase();
        const transaction = database.transaction(MANIFEST_STORE_NAME, "readonly");
        const completion = transactionPromise(transaction);
        const manifests = await requestPromise(transaction.objectStore(MANIFEST_STORE_NAME).getAll());
        await completion;

        const interruptedIds = [];
        const recoverable = [];
        for (const manifest of Array.isArray(manifests) ? manifests : []) {
            const state = String(manifest?.state || "");
            if (state === "active") {
                const updatedAtMs = Math.max(0, Number(manifest.updatedAtMs) || 0);
                if (updatedAtMs > 0 && Date.now() - updatedAtMs >= ACTIVE_MANIFEST_STALE_MS) {
                    interruptedIds.push(String(manifest.recordingId || ""));
                }
                continue;
            }
            if (!RECOVERABLE_MANIFEST_STATES.has(state) || !manifest?.recording || !manifest.recordingId) continue;
            recoverable.push(manifest);
        }
        for (const recordingId of interruptedIds) {
            if (recordingId) await reclaimStaleActiveRecording(database, recordingId);
        }

        recoverable.sort((left, right) => (Number(left.updatedAtMs) || 0) - (Number(right.updatedAtMs) || 0));
        return recoverable.map((manifest) => ({
            recording: manifest.recording,
            state: String(manifest.state || "retained"),
            spool: new BrowserGameplayRecordingSpool({
                recordingId: manifest.recordingId,
                recording: manifest.recording,
                existing: true,
                chunkCount: manifest.chunkCount,
                serializedCharacters: manifest.serializedCharacters,
                createdAtMs: manifest.createdAtMs
            })
        }));
    }
}
