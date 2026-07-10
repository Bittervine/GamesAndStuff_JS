const sources = new Map();

function closeBitmap(bitmap) {
    try {
        bitmap?.close?.();
    } catch {
        // Best-effort worker cleanup.
    }
}

function resetSources() {
    for (const bitmap of sources.values()) closeBitmap(bitmap);
    sources.clear();
}

function drawImageCommand(context, command, originX, originY) {
    const source = sources.get(command.sourceId);
    if (!source) throw new Error(`Missing tile-bake source ${command.sourceId}.`);
    context.save();
    context.globalAlpha = Number.isFinite(Number(command.alpha)) ? Number(command.alpha) : 1;
    context.translate(Number(command.centerX) - originX, Number(command.centerY) - originY);
    context.rotate(Number(command.rotation) || 0);
    context.scale(command.mirrorX ? -1 : 1, command.mirrorY ? -1 : 1);
    context.drawImage(
        source,
        -Number(command.width) * 0.5,
        -Number(command.height) * 0.5,
        Number(command.width),
        Number(command.height)
    );
    context.restore();
}

function drawFillCommand(context, command, originX, originY) {
    context.save();
    context.globalAlpha = Number.isFinite(Number(command.alpha)) ? Number(command.alpha) : 1;
    context.fillStyle = String(command.color || "rgba(0,0,0,0)");
    context.fillRect(
        Number(command.x) - originX,
        Number(command.y) - originY,
        Number(command.width),
        Number(command.height)
    );
    context.restore();
}

function transferBakedBitmap(canvas, width, height, preflipForWebGL) {
    if (!preflipForWebGL) return canvas.transferToImageBitmap();
    // Chromium ignores UNPACK_FLIP_Y_WEBGL for ImageBitmap uploads. Normalize
    // the bitmap here so every atlas slot is stored in the renderer's usual
    // top-left source-coordinate convention. Flipping the complete guttered
    // tile also keeps clipped top/bottom tile draws aligned correctly.
    const uploadCanvas = new OffscreenCanvas(width, height);
    const uploadContext = uploadCanvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!uploadContext) throw new Error("Could not create the WebGL tile-orientation canvas.");
    uploadContext.setTransform(1, 0, 0, -1, 0, height);
    uploadContext.drawImage(canvas, 0, 0);
    return uploadCanvas.transferToImageBitmap();
}

self.onmessage = (event) => {
    const message = event.data || {};
    if (message.type === "reset") {
        resetSources();
        return;
    }
    if (message.type !== "bake") return;

    const startedAt = performance.now();
    try {
        for (const entry of message.sources || []) {
            if (!entry?.id || !entry.bitmap) continue;
            const existing = sources.get(entry.id);
            if (existing) {
                closeBitmap(entry.bitmap);
            } else {
                sources.set(entry.id, entry.bitmap);
            }
        }
        if (typeof OffscreenCanvas !== "function") {
            throw new Error("OffscreenCanvas is unavailable in the tile-bake worker.");
        }
        const width = Math.max(1, Math.floor(Number(message.width) || 1));
        const height = Math.max(1, Math.floor(Number(message.height) || 1));
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
        if (!context) throw new Error("Could not create a worker 2D canvas for tile baking.");
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, width, height);
        context.imageSmoothingEnabled = true;
        const originX = Number(message.originX) || 0;
        const originY = Number(message.originY) || 0;
        for (const command of message.commands || []) {
            if (command?.kind === "image") drawImageCommand(context, command, originX, originY);
            else if (command?.kind === "fill") drawFillCommand(context, command, originX, originY);
        }
        const bitmap = transferBakedBitmap(
            canvas,
            width,
            height,
            Boolean(message.preflipForWebGL)
        );
        self.postMessage({
            type: "baked",
            generation: message.generation,
            taskId: message.taskId,
            key: message.key,
            buildMs: performance.now() - startedAt,
            bitmap
        }, [bitmap]);
    } catch (error) {
        self.postMessage({
            type: "error",
            generation: message.generation,
            taskId: message.taskId,
            key: message.key,
            detail: error?.message || String(error || "Tile bake failed.")
        });
    }
};
