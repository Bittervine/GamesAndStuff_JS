export const DEFAULT_LEVEL_MUSIC = Object.freeze({
    version: 3,
    trackId: "music_001"
});

export const NO_MUSIC_TRACK = Object.freeze({
    id: "none",
    file: "",
    title: "No music",
    sourceFileName: "",
    sourceExtension: "",
    sourceSha256: "",
    metadataTitle: null,
    guessedTitle: "No music",
    durationSeconds: 0,
    importedAt: ""
});

const TRACK_ID_PATTERN = /^music_\d{3,}$/;
const OGG_FILE_PATTERN = /^music_\d{3,}\.ogg$/i;

function cleanString(value) {
    return String(value ?? "").trim();
}

function titleFromTrackId(trackId) {
    return cleanString(trackId)
        .replace(/^music_/i, "Music ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function fallbackFileForTrackId(trackId) {
    return TRACK_ID_PATTERN.test(trackId) ? `${trackId}.ogg` : "";
}

function normalizeDuration(value) {
    const duration = Number(value);
    return Number.isFinite(duration) && duration > 0 ? duration : null;
}

export function isValidMusicTrackId(trackId) {
    return trackId === "none" || TRACK_ID_PATTERN.test(cleanString(trackId));
}

export function normalizeMusicTrack(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }
    const id = cleanString(value.id || value.trackId);
    if (!TRACK_ID_PATTERN.test(id)) {
        return null;
    }
    const file = cleanString(value.file || fallbackFileForTrackId(id));
    if (!OGG_FILE_PATTERN.test(file) || file !== fallbackFileForTrackId(id)) {
        return null;
    }
    const metadataTitle = cleanString(value.metadataTitle) || null;
    const guessedTitle = cleanString(value.guessedTitle) || titleFromTrackId(id);
    const title = cleanString(value.title) || metadataTitle || guessedTitle || titleFromTrackId(id);
    return Object.freeze({
        id,
        file,
        title,
        sourceFileName: cleanString(value.sourceFileName),
        sourceExtension: cleanString(value.sourceExtension),
        sourceSha256: cleanString(value.sourceSha256),
        metadataTitle,
        guessedTitle,
        durationSeconds: normalizeDuration(value.durationSeconds),
        importedAt: cleanString(value.importedAt)
    });
}

export function normalizeMusicCatalog(value = {}) {
    const sourceTracks = Array.isArray(value?.tracks) ? value.tracks : [];
    const seen = new Set([NO_MUSIC_TRACK.id]);
    const tracks = [NO_MUSIC_TRACK];
    for (const source of sourceTracks) {
        const track = normalizeMusicTrack(source);
        if (!track || seen.has(track.id)) continue;
        seen.add(track.id);
        tracks.push(track);
    }
    return Object.freeze({
        schemaVersion: 1,
        tracks: Object.freeze(tracks),
        updatedAt: cleanString(value?.updatedAt)
    });
}

function catalogTracks(catalog) {
    const normalized = normalizeMusicCatalog(catalog);
    return normalized.tracks;
}

export function getMusicTrack(trackId, catalog = null) {
    const id = normalizeLevelMusic({ trackId }).trackId;
    if (catalog) {
        const track = catalogTracks(catalog).find((candidate) => candidate.id === id);
        if (track) return track;
    }
    if (id === NO_MUSIC_TRACK.id) return NO_MUSIC_TRACK;
    return Object.freeze({
        ...NO_MUSIC_TRACK,
        id,
        file: fallbackFileForTrackId(id),
        title: titleFromTrackId(id),
        guessedTitle: titleFromTrackId(id),
        durationSeconds: null
    });
}

export function normalizeLevelMusic(value = {}) {
    const source = typeof value === "string"
        ? { trackId: value }
        : value && typeof value === "object" && !Array.isArray(value)
            ? value
            : {};
    const requested = cleanString(source.trackId || source.tuneId || DEFAULT_LEVEL_MUSIC.trackId);
    const trackId = isValidMusicTrackId(requested) ? requested : DEFAULT_LEVEL_MUSIC.trackId;
    return Object.freeze({
        version: DEFAULT_LEVEL_MUSIC.version,
        trackId
    });
}

export function musicLoopDurationSeconds(trackOrId, catalog = null) {
    const track = typeof trackOrId === "string" ? getMusicTrack(trackOrId, catalog) : trackOrId;
    return Math.max(0, Number(track?.durationSeconds) || 0);
}
