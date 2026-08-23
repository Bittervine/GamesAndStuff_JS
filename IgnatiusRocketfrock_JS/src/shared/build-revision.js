let buildRevisionPromise = null;

function normalizedRevision(text) {
    const revision = String(text || "").trim();
    return /^\d+$/.test(revision) ? revision : "";
}

async function fetchRevisionText(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return "";
    return normalizedRevision(await response.text());
}

export function getBuildRevision() {
    if (!buildRevisionPromise) {
        buildRevisionPromise = (async () => {
            const candidates = [
                new URL("BUILD_REVISION.txt", document.baseURI),
                new URL("../BUILD_REVISION.txt", document.baseURI),
                new URL("/__ignatius_build_revision.txt", document.baseURI)
            ];
            const seen = new Set();
            for (const url of candidates) {
                if (seen.has(url.href)) continue;
                seen.add(url.href);
                try {
                    const revision = await fetchRevisionText(url);
                    if (revision) return revision;
                } catch {
                    // Try the next supported hosting layout.
                }
            }
            throw new Error("Could not load the Ignatius revision from root BUILD_REVISION.txt. Use the project development server or packaged runtime content.");
        })();
    }
    return buildRevisionPromise;
}

export async function applyBuildRevisionToDocument() {
    const revision = await getBuildRevision();
    if (/\bBUILD\s*$/.test(document.title)) document.title = `${document.title} ${revision}`;
    for (const node of document.querySelectorAll("[data-build-revision]")) {
        const prefix = node.dataset.buildRevisionPrefix ?? "rev ";
        node.textContent = `${prefix}${revision}`;
    }
    document.documentElement.dataset.buildRevision = revision;
    return revision;
}
