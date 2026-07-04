export const DEFAULT_LEVEL_MUSIC = Object.freeze({
    version: 2,
    tuneId: "grieg_mountain_king"
});

const PITCH_CLASS = Object.freeze({
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    "E#": 5,
    Fb: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
});
const PITCH_NAMES = Object.freeze(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);

export function pitchToMidi(pitch) {
    const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(String(pitch || "").trim());
    if (!match || !(match[1] in PITCH_CLASS)) {
        return null;
    }
    return (Number(match[2]) + 1) * 12 + PITCH_CLASS[match[1]];
}

export function transposePitch(pitch, semitones) {
    const midi = pitchToMidi(pitch);
    if (!Number.isFinite(midi)) {
        return String(pitch || "");
    }
    const shifted = Math.round(midi + Number(semitones || 0));
    const octave = Math.floor(shifted / 12) - 1;
    return `${PITCH_NAMES[((shifted % 12) + 12) % 12]}${octave}`;
}

// Selection, style and octave come from the accepted export. Timing is measured
// from the exact embedded engine API because the export's timing fields contain
// repeated version templates rather than the live tune-specific loop values.
const ACCEPTED_MUSIC_TUNES = [
    {
        "id": "grieg_mountain_king",
        "title": "In the Hall of the Mountain King",
        "composer": "Edvard Grieg",
        "year": 1875,
        "publicDomain": true,
        "source": "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1888",
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": 0,
        "fullPassSeconds": 238.78378130697436,
        "loopStartSeconds": 20.521013328196183,
        "repeatSeconds": 218.26276797877816,
        "sections": 14
    },
    {
        "id": "grieg_march_dwarfs",
        "title": "March of the Dwarfs",
        "composer": "Edvard Grieg",
        "year": 1891,
        "publicDomain": true,
        "source": "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2014",
        "engineVersion": 3,
        "versionName": "Natural",
        "octave": 0,
        "fullPassSeconds": 252.6315789473684,
        "loopStartSeconds": 12.631578947368421,
        "repeatSeconds": 240,
        "sections": 20
    },
    {
        "id": "mussorgsky_bald_mountain",
        "title": "Night on Bald Mountain",
        "composer": "Modest Mussorgsky",
        "year": 1867,
        "publicDomain": true,
        "source": "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1892",
        "engineVersion": 3,
        "versionName": "Natural",
        "octave": 0,
        "fullPassSeconds": 268.5453212965543,
        "loopStartSeconds": 14.95087324524261,
        "repeatSeconds": 253.59444805131153,
        "sections": 19
    },
    {
        "id": "saint_saens_danse_macabre",
        "title": "Danse macabre",
        "composer": "Camille Saint-Saëns",
        "year": 1874,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": 0,
        "fullPassSeconds": 232.72727272727272,
        "loopStartSeconds": 7.2727272727272725,
        "repeatSeconds": 225.45454545454547,
        "sections": 32
    },
    {
        "id": "saint_saens_fossils",
        "title": "Fossils",
        "composer": "Camille Saint-Saëns",
        "year": 1886,
        "publicDomain": true,
        "source": null,
        "engineVersion": 4,
        "versionName": "Deep piano",
        "octave": 0,
        "fullPassSeconds": 221.53846153846155,
        "loopStartSeconds": 3.076923076923077,
        "repeatSeconds": 218.46153846153845,
        "sections": 72
    },
    {
        "id": "saint_saens_elephant",
        "title": "The Elephant",
        "composer": "Camille Saint-Saëns",
        "year": 1886,
        "publicDomain": true,
        "source": null,
        "engineVersion": 4,
        "versionName": "Deep piano",
        "octave": -1,
        "fullPassSeconds": 281.37931034482756,
        "loopStartSeconds": 8.275862068965518,
        "repeatSeconds": 273.1034482758621,
        "sections": 34
    },
    {
        "id": "saint_saens_lion",
        "title": "Royal March of the Lion",
        "composer": "Camille Saint-Saëns",
        "year": 1886,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": 0,
        "fullPassSeconds": 286.4516129032258,
        "loopStartSeconds": 7.741935483870968,
        "repeatSeconds": 278.7096774193548,
        "sections": 37
    },
    {
        "id": "tchaikovsky_sugar_plum",
        "title": "Dance of the Sugar Plum Fairy",
        "composer": "Pyotr Ilyich Tchaikovsky",
        "year": 1892,
        "publicDomain": true,
        "source": null,
        "engineVersion": 4,
        "versionName": "Deep piano",
        "octave": -1,
        "fullPassSeconds": 257.14285714285717,
        "loopStartSeconds": 8.571428571428571,
        "repeatSeconds": 248.57142857142858,
        "sections": 30
    },
    {
        "id": "bach_toccata_d_minor",
        "title": "Toccata and Fugue in D minor",
        "composer": "Johann Sebastian Bach",
        "year": 1704,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 227.79661016949152,
        "loopStartSeconds": 8.135593220338983,
        "repeatSeconds": 219.66101694915255,
        "sections": 28
    },
    {
        "id": "bach_bourree_e_minor",
        "title": "Bourrée in E minor",
        "composer": "Johann Sebastian Bach",
        "year": 1712,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 225.45454545454547,
        "loopStartSeconds": 7.2727272727272725,
        "repeatSeconds": 218.1818181818182,
        "sections": 31
    },
    {
        "id": "beethoven_turkish_march",
        "title": "Turkish March from The Ruins of Athens",
        "composer": "Ludwig van Beethoven",
        "year": 1811,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 247.27272727272728,
        "loopStartSeconds": 7.2727272727272725,
        "repeatSeconds": 240,
        "sections": 34
    },
    {
        "id": "mozart_rondo_alla_turca",
        "title": "Rondo alla turca",
        "composer": "Wolfgang Amadeus Mozart",
        "year": 1783,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 240,
        "loopStartSeconds": 3.3333333333333335,
        "repeatSeconds": 236.66666666666666,
        "sections": 72
    },
    {
        "id": "mozart_eine_kleine",
        "title": "Eine kleine Nachtmusik: Allegro",
        "composer": "Wolfgang Amadeus Mozart",
        "year": 1787,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 275.29411764705884,
        "loopStartSeconds": 7.0588235294117645,
        "repeatSeconds": 268.2352941176471,
        "sections": 39
    },
    {
        "id": "mozart_queen_night",
        "title": "Queen of the Night: Vengeance Aria",
        "composer": "Wolfgang Amadeus Mozart",
        "year": 1791,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": 0,
        "fullPassSeconds": 227.3684210526316,
        "loopStartSeconds": 3.1578947368421053,
        "repeatSeconds": 224.21052631578948,
        "sections": 72
    },
    {
        "id": "brahms_hungarian_5",
        "title": "Hungarian Dance No. 5",
        "composer": "Johannes Brahms",
        "year": 1869,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 227.3684210526316,
        "loopStartSeconds": 3.1578947368421053,
        "repeatSeconds": 224.21052631578948,
        "sections": 72
    },
    {
        "id": "delibes_pizzicato",
        "title": "Pizzicato from Sylvia",
        "composer": "Léo Delibes",
        "year": 1876,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -2,
        "fullPassSeconds": 214.15384615384616,
        "loopStartSeconds": 7.384615384615385,
        "repeatSeconds": 206.76923076923077,
        "sections": 29
    },
    {
        "id": "joplin_entertainer",
        "title": "The Entertainer",
        "composer": "Scott Joplin",
        "year": 1902,
        "publicDomain": true,
        "source": "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=263",
        "engineVersion": 3,
        "versionName": "Natural",
        "octave": -1,
        "fullPassSeconds": 252.6315789473684,
        "loopStartSeconds": 31.57894736842105,
        "repeatSeconds": 221.05263157894737,
        "sections": 8
    },
    {
        "id": "strauss_pizzicato_polka",
        "title": "Pizzicato Polka",
        "composer": "Johann Strauss II & Josef Strauss",
        "year": 1869,
        "publicDomain": true,
        "source": null,
        "engineVersion": 2,
        "versionName": "Orchestrated",
        "octave": -1,
        "fullPassSeconds": 276.3636363636364,
        "loopStartSeconds": 7.2727272727272725,
        "repeatSeconds": 269.09090909090907,
        "sections": 38
    }
];

export const MUSIC_TUNES = Object.freeze([
    Object.freeze({
        id: "none",
        title: "No music",
        composer: "",
        publicDomain: true,
        engineVersion: 0,
        versionName: "Silence",
        octave: 0,
        fullPassSeconds: 0,
        loopStartSeconds: 0,
        repeatSeconds: 0,
        sections: 0
    }),
    ...ACCEPTED_MUSIC_TUNES.map((tune) => Object.freeze(tune))
]);

const TUNE_BY_ID = new Map(MUSIC_TUNES.map((tune) => [tune.id, tune]));

export function getMusicTune(tuneId) {
    const id = String(tuneId || "").trim();
    return TUNE_BY_ID.get(id) || TUNE_BY_ID.get(DEFAULT_LEVEL_MUSIC.tuneId);
}

export function normalizeLevelMusic(value = {}) {
    const source = typeof value === "string"
        ? { tuneId: value }
        : value && typeof value === "object" && !Array.isArray(value)
            ? value
            : {};
    const requested = String(source.tuneId || source.trackId || DEFAULT_LEVEL_MUSIC.tuneId).trim();
    return {
        version: DEFAULT_LEVEL_MUSIC.version,
        tuneId: TUNE_BY_ID.has(requested) ? requested : DEFAULT_LEVEL_MUSIC.tuneId
    };
}

export function musicLoopDurationSeconds(tuneOrId) {
    const tune = typeof tuneOrId === "string" ? getMusicTune(tuneOrId) : tuneOrId;
    return Math.max(0, Number(tune?.fullPassSeconds) || 0);
}
