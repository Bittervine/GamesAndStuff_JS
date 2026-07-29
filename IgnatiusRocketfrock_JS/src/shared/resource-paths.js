export const RESOURCE_ROOT_URL = "resources/";

export function normalizeResourcePath(requestPath) {
    let text = String(requestPath || "").trim().replace(/\\/g, "/");
    while (text.startsWith("./")) {
        text = text.slice(2);
    }
    for (const prefix of ["reference/resources/", "content/resources/", "resources/"]) {
        if (text.startsWith(prefix)) {
            text = text.slice(prefix.length);
            break;
        }
    }
    return text.replace(/^\/+/, "");
}

export function resourceUrl(requestPath) {
    const text = String(requestPath || "");
    if (!text) return "";
    if (/^(?:[a-z]+:)?\/\//i.test(text) || text.startsWith("/") || text.startsWith("data:") || text.startsWith("blob:")) {
        return text;
    }
    return `${RESOURCE_ROOT_URL}${normalizeResourcePath(text)}`;
}
