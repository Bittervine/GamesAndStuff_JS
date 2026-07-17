const ASSET_BASE_CANDIDATES = ["Assets", "assets"];

let resolvedAssetBase = null;
let resolvingAssetBase = null;

function isAbsoluteAssetRequestPath(requestPath) {
    const text = String(requestPath || "");
    return /^(?:[a-z]+:)?\/\//i.test(text) || text.startsWith("/") || text.startsWith("data:") || text.startsWith("blob:");
}

function normalizeAssetRequestPath(requestPath) {
    const text = String(requestPath || "");
    if (!text) {
        return "";
    }
    return text.replace(/^(?:assets|Assets)\//, "");
}

async function probeAssetBasePath(relativePath) {
    for (const base of ASSET_BASE_CANDIDATES) {
        const url = `${base}/${relativePath}`;
        try {
            const response = await fetch(url, { cache: "no-store" });
            if (response.ok) {
                return base;
            }
        } catch (error) {
            // Try the alternate casing before giving up.
        }
    }
    throw new Error(`Could not locate asset ${relativePath} in Assets/ or assets/.`);
}

export async function getAssetFn(requestPath) {
    if (isAbsoluteAssetRequestPath(requestPath)) {
        return String(requestPath || "");
    }
    const normalized = normalizeAssetRequestPath(requestPath);
    if (!normalized) {
        return normalized;
    }
    if (resolvedAssetBase) {
        return `${resolvedAssetBase}/${normalized}`;
    }
    if (!resolvingAssetBase) {
        resolvingAssetBase = probeAssetBasePath(normalized).then((base) => {
            resolvedAssetBase = base;
            return base;
        }).finally(() => {
            resolvingAssetBase = null;
        });
    }
    const base = await resolvingAssetBase;
    return `${base}/${normalized}`;
}
