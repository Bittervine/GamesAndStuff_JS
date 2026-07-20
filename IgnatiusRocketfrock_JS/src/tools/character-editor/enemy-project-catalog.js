const DEFAULT_ASSET_PREFIX = "assets/";
const WIZARD_PROJECT = Object.freeze({
    id: "wizard",
    label: "Ignatius Rocketfrock",
    url: "assets/ct_char_wizard_1.json",
    enemy: false
});

function normalizedAssetPrefix(assetPrefix) {
    const prefix = String(assetPrefix || DEFAULT_ASSET_PREFIX).trim() || DEFAULT_ASSET_PREFIX;
    return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

export function enemyCharacterProjectUrl(definition, assetPrefix = DEFAULT_ASSET_PREFIX) {
    const configured = String(definition?.characterUrl || definition?.characterId || "").trim();
    if (!configured) return "";
    if (/^(?:[a-z]+:)?\/\//i.test(configured) || configured.startsWith("/") || configured.startsWith("data:") || configured.startsWith("blob:")) {
        return configured.endsWith(".json") ? configured : `${configured}.json`;
    }
    const withExtension = configured.endsWith(".json") ? configured : `${configured}.json`;
    if (withExtension.includes("/")) return withExtension;
    return `${normalizedAssetPrefix(assetPrefix)}${withExtension}`;
}

export function characterEditorKnownProjects(catalog, options = {}) {
    const includeWizard = options.includeWizard !== false;
    const projects = includeWizard ? [{ ...WIZARD_PROJECT }] : [];
    const enemies = catalog?.enemies && typeof catalog.enemies === "object" ? catalog.enemies : {};
    for (const [enemyId, definition] of Object.entries(enemies)) {
        const url = enemyCharacterProjectUrl(definition, options.assetPrefix);
        if (!url) continue;
        const suffix = /^enemy_(.+)$/i.exec(enemyId)?.[1] || enemyId;
        const label = String(definition?.label || enemyId).trim() || enemyId;
        projects.push({
            id: enemyId,
            label: `Enemy ${suffix}: ${label}`,
            url,
            enemy: true,
            characterId: String(definition?.characterId || "")
        });
    }
    return projects;
}
