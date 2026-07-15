import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadSkiaCanvas() {
    try {
        return require("skia-canvas");
    } catch (error) {
        const fallbackPath = "/opt/nvm/versions/node/v22.16.0/lib/node_modules/skia-canvas";
        try {
            return require(fallbackPath);
        } catch (fallbackError) {
            throw new Error(
                "The development capture utility requires skia-canvas. Install it for Node or run in the prepared development container. " +
                `Package error: ${error.message}; fallback error: ${fallbackError.message}`
            );
        }
    }
}

const skia = loadSkiaCanvas();
const {
    Canvas,
    Image,
    ImageData,
    Path2D,
    DOMMatrix,
    DOMPoint,
    DOMRect
} = skia;

export function makeNodeCanvas(width = 1280, height = 720) {
    const canvas = new Canvas(Math.max(1, Math.floor(Number(width) || 1280)), Math.max(1, Math.floor(Number(height) || 720)));
    Object.defineProperties(canvas, {
        clientWidth: {
            value: canvas.width,
            writable: true,
            configurable: true
        },
        clientHeight: {
            value: canvas.height,
            writable: true,
            configurable: true
        },
        ownerDocument: {
            value: globalThis.document,
            writable: true,
            configurable: true
        },
        style: {
            value: {},
            writable: true,
            configurable: true
        }
    });
    canvas.addEventListener ??= () => {};
    canvas.removeEventListener ??= () => {};
    canvas.getBoundingClientRect ??= () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: canvas.clientWidth,
        bottom: canvas.clientHeight,
        width: canvas.clientWidth,
        height: canvas.clientHeight
    });
    return canvas;
}

function makeElement(tagName = "div") {
    const classTokens = new Set();
    return {
        tagName: String(tagName || "div").toUpperCase(),
        style: {
            setProperty() {},
            removeProperty() {}
        },
        dataset: {},
        hidden: false,
        textContent: "",
        innerHTML: "",
        classList: {
            add: (...tokens) => tokens.forEach((token) => classTokens.add(String(token))),
            remove: (...tokens) => tokens.forEach((token) => classTokens.delete(String(token))),
            toggle(token, force) {
                const name = String(token);
                const enabled = force == null ? !classTokens.has(name) : Boolean(force);
                if (enabled) classTokens.add(name);
                else classTokens.delete(name);
                return enabled;
            },
            contains: (token) => classTokens.has(String(token))
        },
        append() {},
        appendChild(child) { return child; },
        remove() {},
        setAttribute() {},
        getAttribute() { return null; },
        addEventListener() {},
        removeEventListener() {},
        focus() {},
        blur() {},
        querySelectorAll() { return []; },
        closest() { return null; },
        getBoundingClientRect() {
            return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
        }
    };
}

export function installNodeCanvasAdapters({ root = process.cwd(), width = 1280, height = 720 } = {}) {
    const projectRoot = path.resolve(root);
    const viewportWidth = Math.max(1, Math.floor(Number(width) || 1280));
    const viewportHeight = Math.max(1, Math.floor(Number(height) || 720));
    process.chdir(projectRoot);

    const documentElement = makeElement("html");
    documentElement.clientWidth = viewportWidth;
    documentElement.clientHeight = viewportHeight;
    const body = makeElement("body");

    const documentAdapter = {
        hidden: false,
        fullscreenElement: null,
        activeElement: body,
        documentElement,
        body,
        createElement(tag) {
            if (String(tag).toLowerCase() === "canvas") {
                return makeNodeCanvas(1, 1);
            }
            return makeElement(tag);
        },
        getElementById() { return makeElement("div"); },
        querySelectorAll() { return []; },
        addEventListener() {},
        removeEventListener() {}
    };

    globalThis.document = documentAdapter;
    globalThis.window = {
        document: documentAdapter,
        devicePixelRatio: 1,
        innerWidth: viewportWidth,
        innerHeight: viewportHeight,
        visualViewport: {
            width: viewportWidth,
            height: viewportHeight,
            addEventListener() {},
            removeEventListener() {}
        },
        matchMedia: () => ({
            matches: false,
            addEventListener() {},
            removeEventListener() {}
        }),
        addEventListener() {},
        removeEventListener() {},
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        requestAnimationFrame: (callback) => globalThis.setTimeout(() => callback(globalThis.performance.now()), 0),
        cancelAnimationFrame: (id) => globalThis.clearTimeout(id)
    };

    globalThis.Image = Image;
    globalThis.ImageData = ImageData;
    globalThis.Path2D = Path2D;
    globalThis.DOMMatrix = DOMMatrix;
    globalThis.DOMPoint = DOMPoint;
    globalThis.DOMRect = DOMRect;
    globalThis.OffscreenCanvas = Canvas;
    globalThis.ResizeObserver ??= class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    globalThis.performance ??= { now: () => Date.now() };
    globalThis.requestAnimationFrame = globalThis.window.requestAnimationFrame;
    globalThis.cancelAnimationFrame = globalThis.window.cancelAnimationFrame;

    const storage = new Map();
    globalThis.localStorage ??= {
        getItem: (key) => storage.has(String(key)) ? storage.get(String(key)) : null,
        setItem: (key, value) => storage.set(String(key), String(value)),
        removeItem: (key) => storage.delete(String(key)),
        clear: () => storage.clear()
    };

    const nativeFetch = globalThis.fetch?.bind(globalThis);
    globalThis.fetch = async function fetchLocalAsset(input, init = {}) {
        const raw = typeof input === "string" ? input : input?.url;
        const value = String(raw || "");
        if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(value)) {
            return nativeFetch ? nativeFetch(input, init) : new Response(`Unsupported URL: ${value}`, { status: 400 });
        }
        const filePath = path.resolve(projectRoot, value.replace(/^\.\//, ""));
        try {
            const data = await fs.readFile(filePath);
            return new Response(data, {
                status: 200,
                headers: { "content-type": contentTypeForPath(filePath) }
            });
        } catch {
            return new Response(`Not found: ${filePath}`, { status: 404 });
        }
    };

    return { Canvas, Image, ImageData, Path2D, DOMMatrix, DOMPoint, DOMRect, makeCanvas: makeNodeCanvas, root: projectRoot };
}

function contentTypeForPath(filePath) {
    switch (path.extname(filePath).toLowerCase()) {
        case ".json": return "application/json";
        case ".png": return "image/png";
        case ".ogg": return "audio/ogg";
        case ".html": return "text/html";
        case ".js":
        case ".mjs": return "text/javascript";
        default: return "application/octet-stream";
    }
}
