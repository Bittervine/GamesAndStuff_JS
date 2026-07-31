import { normalizeResourceIndex, RESOURCE_INDEX_PATH } from "../shared/resource-index-data.js";
import { resourceUrl } from "../shared/resource-paths.js";

export const RESOURCE_LOAD_RETRY_DELAYS_MS = Object.freeze([0, 160, 520]);

function sleep(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function appendRetryMarker(url, attempt) {
    if (attempt <= 0) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}ignatius_retry=${attempt}`;
}

export async function fetchResourceWithRetry(requestPath, options = {}) {
    const resolvedUrl = resourceUrl(requestPath);
    const delays = Array.isArray(options.retryDelaysMs) && options.retryDelaysMs.length
        ? options.retryDelaysMs
        : RESOURCE_LOAD_RETRY_DELAYS_MS;
    let lastError = null;
    for (let attempt = 0; attempt < delays.length; attempt += 1) {
        if (delays[attempt] > 0) await sleep(delays[attempt]);
        try {
            const response = await fetch(appendRetryMarker(resolvedUrl, attempt), {
                cache: "no-store",
                ...(options.fetchOptions || {})
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response;
        } catch (error) {
            lastError = error;
        }
    }
    throw new Error(`Could not load ${resolvedUrl} after ${delays.length} attempts: ${lastError?.message || lastError}`);
}

export async function loadJsonResourceWithRetry(requestPath, options = {}) {
    const response = await fetchResourceWithRetry(requestPath, options);
    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Could not parse ${resourceUrl(requestPath)} as JSON: ${error.message || error}`);
    }
}

export async function loadImageResourceWithRetry(requestPath, options = {}) {
    const response = await fetchResourceWithRetry(requestPath, options);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        return await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Could not decode ${resourceUrl(requestPath)} as an image.`));
            image.src = objectUrl;
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function loadResourceIndex(options = {}) {
    const raw = await loadJsonResourceWithRetry(RESOURCE_INDEX_PATH, options);
    return normalizeResourceIndex(raw);
}
