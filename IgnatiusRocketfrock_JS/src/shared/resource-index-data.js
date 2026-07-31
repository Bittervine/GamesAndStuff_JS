export const RESOURCE_INDEX_FORMAT_VERSION = 1;
export const RESOURCE_INDEX_PATH = "resources.json";

const ASSET_ATLAS_ID_PATTERN = /^at_atlas_[0-9]+$/;
const LEVEL_ID_PATTERN = /^level_[a-z0-9]+$/i;

function normalizeIdList(value, label, pattern) {
    if (!Array.isArray(value)) {
        throw new Error(`${label} must be an array.`);
    }
    const seen = new Set();
    return value.map((entry, index) => {
        const id = String(entry || "").trim();
        if (!pattern.test(id)) {
            throw new Error(`${label}[${index}] is not a valid resource id: ${id || "(empty)"}`);
        }
        if (seen.has(id)) {
            throw new Error(`${label} contains duplicate id ${id}.`);
        }
        seen.add(id);
        return id;
    });
}

export function normalizeResourceIndex(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("resources.json must contain a JSON object.");
    }
    const formatVersion = Number(value.formatVersion);
    if (formatVersion !== RESOURCE_INDEX_FORMAT_VERSION) {
        throw new Error(`Unsupported resources.json formatVersion ${value.formatVersion}. Expected ${RESOURCE_INDEX_FORMAT_VERSION}.`);
    }
    return {
        formatVersion: RESOURCE_INDEX_FORMAT_VERSION,
        assetAtlasIds: normalizeIdList(value.assetAtlasIds, "assetAtlasIds", ASSET_ATLAS_ID_PATTERN),
        levelIds: normalizeIdList(value.levelIds, "levelIds", LEVEL_ID_PATTERN)
    };
}

export function resourceIndexContains(index, kind, id) {
    const normalized = normalizeResourceIndex(index);
    const list = kind === "assetAtlas" ? normalized.assetAtlasIds : kind === "level" ? normalized.levelIds : null;
    if (!list) throw new Error(`Unknown resource index kind ${kind}.`);
    return list.includes(String(id || ""));
}

export function addResourceIndexEntry(index, kind, id) {
    const normalized = normalizeResourceIndex(index);
    const cleanId = String(id || "").trim();
    const key = kind === "assetAtlas" ? "assetAtlasIds" : kind === "level" ? "levelIds" : "";
    const pattern = kind === "assetAtlas" ? ASSET_ATLAS_ID_PATTERN : kind === "level" ? LEVEL_ID_PATTERN : null;
    if (!key || !pattern) throw new Error(`Unknown resource index kind ${kind}.`);
    if (!pattern.test(cleanId)) throw new Error(`Invalid ${kind} id ${cleanId || "(empty)"}.`);
    if (!normalized[key].includes(cleanId)) normalized[key].push(cleanId);
    return normalized;
}
