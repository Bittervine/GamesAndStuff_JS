#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { normalizeResourceIndex } from "../src/shared/resource-index-data.js";

const REFERENCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ROOT = path.resolve(REFERENCE_ROOT, "..");
const RESOURCE_ROOT = path.join(REFERENCE_ROOT, "resources");
const GENERATED_DEVTOOL_LEVEL_NAME = "level_temp.json";
const RESOURCE_INDEX_NAME = "resources.json";
const EXPECTED_RESOURCE_DIRECTORIES = new Set([
    "atlases", "characters", "editor", "fonts", "generator", "items", "levels", "music", "palette", "sfx", "ui"
]);
const ACTIVE_SOURCE_EXTENSIONS = new Set([
    ".bat", ".c", ".cc", ".cmake", ".cpp", ".cxx", ".h", ".hh", ".hpp", ".html", ".js", ".json", ".mjs", ".py", ".rc", ".sh"
]);
const IGNORED_DIRECTORIES = new Set([
    ".build", ".git", "build", "build-linux", "dist", "external", "node_modules", "test-results", "__pycache__"
]);

function fail(message) {
    throw new Error(message);
}

function readJson(filePath) {
    try {
        return JSON.parse(readFileSync(filePath, "utf8"));
    } catch (error) {
        fail(`Could not parse ${path.relative(PROJECT_ROOT, filePath)}: ${error.message}`);
    }
}

function exactCasePathExists(filePath) {
    const absolute = path.resolve(filePath);
    const parsed = path.parse(absolute);
    let current = parsed.root;
    for (const segment of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
        if (!existsSync(current) || !statSync(current).isDirectory()) return false;
        const match = readdirSync(current).find((entry) => entry === segment);
        if (!match) return false;
        current = path.join(current, match);
    }
    return existsSync(current);
}

function requireResource(relativePath, origin) {
    const normalized = String(relativePath || "").replace(/\\/g, "/").replace(/^\.\//, "");
    if (!normalized || normalized.startsWith("/") || normalized.includes("..")) {
        fail(`${origin} contains an invalid resource path: ${relativePath}`);
    }
    const target = path.join(RESOURCE_ROOT, ...normalized.split("/"));
    if (!exactCasePathExists(target) || !statSync(target).isFile()) {
        fail(`${origin} references missing or case-mismatched resource: ${normalized}`);
    }
}

function auditRootShape() {
    if (!existsSync(RESOURCE_ROOT)) fail("reference/resources is missing.");
    for (const entry of readdirSync(RESOURCE_ROOT, { withFileTypes: true })) {
        if (entry.isFile() && entry.name === RESOURCE_INDEX_NAME) continue;
        if (!entry.isDirectory()) fail(`Stray file in reference/resources: ${entry.name}`);
        if (!EXPECTED_RESOURCE_DIRECTORIES.has(entry.name)) {
            fail(`Unexpected directory in reference/resources: ${entry.name}`);
        }
    }
    for (const required of EXPECTED_RESOURCE_DIRECTORIES) {
        if (!existsSync(path.join(RESOURCE_ROOT, required))) fail(`Missing resource category: ${required}`);
    }
    if (!existsSync(path.join(RESOURCE_ROOT, RESOURCE_INDEX_NAME))) fail(`Missing ${RESOURCE_INDEX_NAME}.`);
}

function fileStemSet(directory, pattern) {
    return new Set(readdirSync(directory).filter((name) => pattern.test(name)).map((name) => path.basename(name, path.extname(name))));
}

function requireExactInventory(label, declaredIds, actualIds) {
    for (const id of declaredIds) {
        if (!actualIds.has(id)) fail(`${RESOURCE_INDEX_NAME} declares missing ${label} ${id}.`);
    }
    for (const id of actualIds) {
        if (!declaredIds.includes(id)) fail(`${label} ${id} exists but is missing from ${RESOURCE_INDEX_NAME}.`);
    }
}

function auditResourceIndex() {
    let index;
    try {
        index = normalizeResourceIndex(readJson(path.join(RESOURCE_ROOT, RESOURCE_INDEX_NAME)));
    } catch (error) {
        fail(`${RESOURCE_INDEX_NAME} is invalid: ${error.message}`);
    }

    const atlasDirectory = path.join(RESOURCE_ROOT, "atlases");
    const atlasJsonIds = fileStemSet(atlasDirectory, /^at_atlas_[0-9]+\.json$/);
    const atlasPngIds = fileStemSet(atlasDirectory, /^at_atlas_[0-9]+\.png$/);
    requireExactInventory("asset atlas", index.assetAtlasIds, atlasJsonIds);
    requireExactInventory("asset atlas PNG", index.assetAtlasIds, atlasPngIds);

    const levelDirectory = path.join(RESOURCE_ROOT, "levels");
    const levelIds = fileStemSet(levelDirectory, /^level_[a-z0-9]+\.json$/i);
    levelIds.delete(path.basename(GENERATED_DEVTOOL_LEVEL_NAME, ".json"));
    requireExactInventory("level", index.levelIds, levelIds);
}


function auditPaletteThumbnailCache() {
    const directory = path.join(RESOURCE_ROOT, "palette");
    const catalogPath = path.join(directory, "thumbnails.json");
    const imagePath = path.join(directory, "thumbnails.png");
    if (!existsSync(catalogPath) || !existsSync(imagePath)) {
        fail("palette must contain thumbnails.json and thumbnails.png.");
    }
    const catalog = readJson(catalogPath);
    if (catalog.formatVersion !== 1) fail("palette/thumbnails.json must use formatVersion 1.");
    if (catalog.image !== "thumbnails.png") fail("palette/thumbnails.json must reference thumbnails.png.");
    if (!Number.isInteger(catalog.cellSize) || catalog.cellSize <= 0) fail("palette thumbnail cellSize must be a positive integer.");
    if (!Number.isInteger(catalog.width) || !Number.isInteger(catalog.height) || catalog.width <= 0 || catalog.height <= 0) {
        fail("palette thumbnail dimensions must be positive integers.");
    }
    if (catalog.width > 8192 || catalog.height > 8192) fail("palette thumbnail image exceeds 8192×8192.");
    if (!Array.isArray(catalog.entries) || catalog.entries.length !== catalog.entryCount) {
        fail("palette thumbnail entryCount does not match entries.");
    }
    const keys = new Set();
    for (const entry of catalog.entries) {
        if (!entry || typeof entry !== "object" || typeof entry.key !== "string" || !entry.key) fail("palette thumbnail entry has no key.");
        if (keys.has(entry.key)) fail(`duplicate palette thumbnail key: ${entry.key}`);
        keys.add(entry.key);
        const thumbnail = entry.thumbnail;
        if (!thumbnail || ![thumbnail.x, thumbnail.y, thumbnail.w, thumbnail.h].every(Number.isInteger)) {
            fail(`palette thumbnail ${entry.key} has an invalid rectangle.`);
        }
        if (thumbnail.x < 0 || thumbnail.y < 0 || thumbnail.w <= 0 || thumbnail.h <= 0
            || thumbnail.x + thumbnail.w > catalog.width || thumbnail.y + thumbnail.h > catalog.height) {
            fail(`palette thumbnail ${entry.key} lies outside the image.`);
        }
    }
}

function auditAtlases(directoryName) {
    const directory = path.join(RESOURCE_ROOT, directoryName);
    for (const name of readdirSync(directory).filter((entry) => entry.endsWith(".json"))) {
        const filePath = path.join(directory, name);
        const json = readJson(filePath);
        if (typeof json.image === "string" && json.image) {
            requireResource(`${directoryName}/${json.image}`, `${directoryName}/${name}`);
        }
    }
}

function categorizedResourcePath(fileName, fallbackDirectory = "") {
    const normalized = String(fileName || "").replace(/\\/g, "/").replace(/^\.\//, "");
    if (normalized.includes("/")) return normalized;
    if (/^it_/.test(normalized)) return `items/${normalized}`;
    if (/^at_atlas_/.test(normalized)) return `atlases/${normalized}`;
    if (/^ct_/.test(normalized)) return `characters/${normalized}`;
    return fallbackDirectory ? `${fallbackDirectory}/${normalized}` : normalized;
}

function auditCharacters() {
    const directory = path.join(RESOURCE_ROOT, "characters");
    const names = readdirSync(directory);
    for (const name of names.filter((entry) => /^ct_char_.*\.json$/.test(entry))) {
        const character = readJson(path.join(directory, name));
        if (character.rig) requireResource(`characters/${character.rig}`, `characters/${name}`);
        for (const animation of Object.values(character.animationMap || {})) {
            if (animation) requireResource(`characters/${animation}`, `characters/${name}`);
        }
    }
    for (const name of names.filter((entry) => /^ct_rig_.*\.json$/.test(entry))) {
        const rig = readJson(path.join(directory, name));
        if (rig.atlasManifest) requireResource(categorizedResourcePath(rig.atlasManifest, "characters"), `characters/${name}`);
    }
    const catalogName = "ct_enemies_001.json";
    const catalog = readJson(path.join(directory, catalogName));
    for (const [enemyId, enemy] of Object.entries(catalog.enemies || {})) {
        if (!enemy.characterId) fail(`characters/${catalogName} enemy ${enemyId} has no characterId.`);
        requireResource(`characters/${enemy.characterId}.json`, `characters/${catalogName} enemy ${enemyId}`);
    }
}

function auditLevels() {
    const directory = path.join(RESOURCE_ROOT, "levels");
    if (existsSync(path.join(directory, GENERATED_DEVTOOL_LEVEL_NAME))) {
        fail(`${GENERATED_DEVTOOL_LEVEL_NAME} is generated in packaged content by IgnatiusDevTool and must not be committed as authored source content.`);
    }
    for (const name of readdirSync(directory).filter((entry) => entry.endsWith(".json"))) {
        const level = readJson(path.join(directory, name));
        for (const atlasRef of level.atlasRefs || []) {
            if (atlasRef.manifest) requireResource(atlasRef.manifest, `levels/${name}`);
            if (atlasRef.image) requireResource(atlasRef.image, `levels/${name}`);
        }
    }
}

function auditAudio() {
    const musicCatalog = readJson(path.join(RESOURCE_ROOT, "music", "music.json"));
    for (const track of musicCatalog.tracks || []) {
        if (track.file) requireResource(`music/${track.file}`, `music/music.json track ${track.id || "?"}`);
    }
    const soundCatalog = readJson(path.join(RESOURCE_ROOT, "sfx", "sound-effects.json"));
    for (const [soundId, definition] of Object.entries(soundCatalog.sounds || {})) {
        if (definition.file) requireResource(definition.file, `sfx/sound-effects.json sound ${soundId}`);
    }
}

function walkFiles(root, visit) {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
        const filePath = path.join(root, entry.name);
        if (entry.isDirectory()) walkFiles(filePath, visit);
        else if (entry.isFile()) visit(filePath);
    }
}

function auditNoRetiredPaths() {
    const stalePattern = /(?:reference[\\/]assets|content[\\/]assets|(?:^|["'`(=:\s])assets[\\/])/;
    const roots = [REFERENCE_ROOT, path.join(PROJECT_ROOT, "src"), path.join(PROJECT_ROOT, "devel")];
    for (const root of roots) {
        walkFiles(root, (filePath) => {
            if (!ACTIVE_SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return;
            if (filePath.includes(`${path.sep}resources${path.sep}`)) return;
            const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
            for (let index = 0; index < lines.length; index += 1) {
                if (stalePattern.test(lines[index])) {
                    fail(`Retired assets path in ${path.relative(PROJECT_ROOT, filePath)}:${index + 1}: ${lines[index].trim()}`);
                }
            }
        });
    }
}

export function auditResourceLayout() {
    auditRootShape();
    auditResourceIndex();
    auditPaletteThumbnailCache();
    auditAtlases("atlases");
    auditAtlases("items");
    auditAtlases("characters");
    auditCharacters();
    auditLevels();
    auditAudio();
    auditNoRetiredPaths();
    return true;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
    try {
        auditResourceLayout();
        console.log("PASS resource layout audit");
    } catch (error) {
        console.error(`FAIL resource layout audit: ${error.message}`);
        process.exitCode = 1;
    }
}
