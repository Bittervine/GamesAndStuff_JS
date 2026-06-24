export const DEFAULT_LEVEL_MUSIC = Object.freeze({
    version: 1,
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

function note(beat, duration, pitch, velocity = 1) {
    return Object.freeze({ beat, duration, pitch, velocity });
}

function phrase(startBeat, pitches, duration = 0.5, velocity = 1) {
    return pitches.map((pitch, index) => note(startBeat + index * duration, duration, pitch, velocity));
}

function sequencedPhrase(startBeat, events, velocity = 1, semitones = 0) {
    let beat = startBeat;
    return events.map(([pitch, step, soundingDuration = step]) => {
        const soundingPitch = Number(semitones) === 0 ? pitch : transposePitch(pitch, semitones);
        const musicalNote = note(beat, soundingDuration, soundingPitch, velocity);
        beat += step;
        return musicalNote;
    });
}

function bassPulse(startBeat, beats, root, fifth, velocity = 0.72) {
    const notes = [];
    for (let beat = 0; beat < beats; beat += 1) {
        notes.push(note(startBeat + beat, 0.78, beat % 2 === 0 ? root : fifth, velocity));
    }
    return notes;
}

const mountainKingTheme = Object.freeze([
    // Measures 1-2: B C# D E F# D F# | E# C# E# E C E
    ["B2", 0.5, 0.34], ["C#3", 0.5, 0.34], ["D3", 0.5, 0.34], ["E3", 0.5, 0.34],
    ["F#3", 0.5, 0.34], ["D3", 0.5, 0.34], ["F#3", 1, 0.64],
    ["E#3", 0.5, 0.34], ["C#3", 0.5, 0.34], ["E#3", 1, 0.64],
    ["E3", 0.5, 0.34], ["C3", 0.5, 0.34], ["E3", 1, 0.64],

    // Measures 3-4: B C# D E F# D F# B | A F# D F# A
    ["B2", 0.5, 0.34], ["C#3", 0.5, 0.34], ["D3", 0.5, 0.34], ["E3", 0.5, 0.34],
    ["F#3", 0.5, 0.34], ["D3", 0.5, 0.34], ["F#3", 0.5, 0.34], ["B3", 0.5, 0.34],
    ["A3", 0.5, 0.34], ["F#3", 0.5, 0.34], ["D3", 0.5, 0.34], ["F#3", 0.5, 0.34],
    ["A3", 2, 1.55]
]);

const mountainKingMelody = [
    // Preserve Grieg's intervals while placing the lead one octave lower. The
    // second statement remains a perfect fifth above the first, but now stays
    // in a contrabass/tuba register instead of climbing into a bright tenor.
    ...sequencedPhrase(0, mountainKingTheme, 0.88, -12),
    ...sequencedPhrase(16, mountainKingTheme, 0.96, -5)
];

const dwarfMarchMotifA = [
    "D4", "A3", "D4", "F4", "E4", "D4", "C#4", "D4",
    "A3", "D4", "F4", "A4", "G4", "F4", "E4", "D4"
];
const dwarfMarchMotifB = [
    "D4", "F4", "A4", "Bb4", "A4", "G4", "F4", "E4",
    "D4", "C#4", "D4", "A3", "D4", "E4", "F4", "D4"
];

const anitraPhraseA = [
    "E5", "D#5", "E5", "C5", "B4", "A4",
    "C5", "B4", "A4", "G#4", "A4", "B4"
];
const anitraPhraseB = [
    "C5", "E5", "A5", "G#5", "E5", "C5",
    "B4", "D5", "G#5", "A5", "E5", "A4"
];

const baldMountainMotif = [
    "D4", "Eb4", "F4", "Gb4", "A4", "Gb4", "F4", "Eb4",
    "D4", "C#4", "D4", "F4", "Eb4", "D4", "C#4", "A3"
];

export const MUSIC_TUNES = Object.freeze([
    Object.freeze({
        id: "none",
        title: "No music",
        composer: "",
        publicDomain: true,
        bpmStart: 120,
        bpmEnd: 120,
        loopBeats: 8,
        voices: Object.freeze([])
    }),
    Object.freeze({
        id: "grieg_mountain_king",
        title: "In the Hall of the Mountain King",
        composer: "Edvard Grieg",
        publicDomain: true,
        sourceNote: "Opening theme rechecked against Mutopia's public-domain engraving and the independent Edition Peters scan hosted by IMSLP.",
        bpmStart: 92,
        bpmEnd: 136,
        loopBeats: 32,
        voices: Object.freeze([
            Object.freeze({
                instrument: "doubleBass",
                gain: 0.82,
                notes: Object.freeze(mountainKingMelody)
            }),
            Object.freeze({
                instrument: "tuba",
                gain: 0.42,
                notes: Object.freeze([
                    ...bassPulse(0, 16, "B1", "F#2", 0.72),
                    ...bassPulse(16, 16, "F#1", "C#2", 0.8)
                ])
            })
        ])
    }),
    Object.freeze({
        id: "grieg_march_dwarfs",
        title: "March of the Dwarfs",
        composer: "Edvard Grieg",
        publicDomain: true,
        sourceNote: "Original clockwork arrangement encoded as note data from public-domain score references.",
        bpmStart: 152,
        bpmEnd: 152,
        loopBeats: 32,
        voices: Object.freeze([
            Object.freeze({
                instrument: "pizzicato",
                gain: 0.66,
                notes: Object.freeze([
                    ...phrase(0, dwarfMarchMotifA, 0.5, 0.84),
                    ...phrase(8, dwarfMarchMotifA, 0.5, 0.88),
                    ...phrase(16, dwarfMarchMotifB, 0.5, 0.9),
                    ...phrase(24, dwarfMarchMotifA.map((pitch) => transposePitch(pitch, 12)), 0.5, 0.92)
                ])
            }),
            Object.freeze({
                instrument: "bassoon",
                gain: 0.42,
                notes: Object.freeze([
                    ...bassPulse(0, 16, "D2", "A2", 0.7),
                    ...bassPulse(16, 8, "Bb2", "F3", 0.68),
                    ...bassPulse(24, 8, "D2", "A2", 0.78)
                ])
            })
        ])
    }),
    Object.freeze({
        id: "grieg_anitra_dance",
        title: "Anitra's Dance",
        composer: "Edvard Grieg",
        publicDomain: true,
        sourceNote: "Original clockwork arrangement encoded as note data from public-domain score references.",
        bpmStart: 104,
        bpmEnd: 104,
        loopBeats: 24,
        voices: Object.freeze([
            Object.freeze({
                instrument: "pizzicato",
                gain: 0.62,
                notes: Object.freeze([
                    ...phrase(0, anitraPhraseA, 0.5, 0.82),
                    ...phrase(6, anitraPhraseA, 0.5, 0.86),
                    ...phrase(12, anitraPhraseB, 0.5, 0.88),
                    ...phrase(18, anitraPhraseA, 0.5, 0.9)
                ])
            }),
            Object.freeze({
                instrument: "bell",
                gain: 0.18,
                notes: Object.freeze([
                    note(0, 0.7, "A4", 0.5), note(3, 0.7, "E5", 0.48),
                    note(6, 0.7, "A4", 0.52), note(9, 0.7, "E5", 0.5),
                    note(12, 0.7, "C5", 0.55), note(15, 0.7, "E5", 0.52),
                    note(18, 0.7, "A4", 0.58), note(21, 0.7, "E5", 0.55)
                ])
            }),
            Object.freeze({
                instrument: "bassoon",
                gain: 0.28,
                notes: Object.freeze([
                    note(0, 2.5, "A2", 0.55), note(3, 2.5, "E3", 0.48),
                    note(6, 2.5, "A2", 0.55), note(9, 2.5, "E3", 0.48),
                    note(12, 2.5, "C3", 0.55), note(15, 2.5, "E3", 0.48),
                    note(18, 2.5, "A2", 0.58), note(21, 2.5, "E3", 0.5)
                ])
            })
        ])
    }),
    Object.freeze({
        id: "mussorgsky_bald_mountain",
        title: "Night on Bald Mountain",
        composer: "Modest Mussorgsky",
        publicDomain: true,
        sourceNote: "Original clockwork arrangement encoded as note data from public-domain score references.",
        bpmStart: 128,
        bpmEnd: 144,
        loopBeats: 32,
        voices: Object.freeze([
            Object.freeze({
                instrument: "strings",
                gain: 0.58,
                notes: Object.freeze([
                    ...phrase(0, baldMountainMotif, 0.5, 0.82),
                    ...phrase(8, baldMountainMotif.map((pitch) => transposePitch(pitch, 5)), 0.5, 0.86),
                    ...phrase(16, baldMountainMotif, 0.5, 0.9),
                    ...phrase(24, baldMountainMotif.map((pitch) => transposePitch(pitch, 12)), 0.5, 0.94)
                ])
            }),
            Object.freeze({
                instrument: "bassoon",
                gain: 0.48,
                notes: Object.freeze([
                    ...bassPulse(0, 8, "D2", "A2", 0.74),
                    ...bassPulse(8, 8, "G2", "D3", 0.74),
                    ...bassPulse(16, 8, "D2", "A2", 0.82),
                    ...bassPulse(24, 8, "D2", "A2", 0.9)
                ])
            })
        ])
    })
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

export function musicSecondsAtBeat(tuneOrId, beat) {
    const tune = typeof tuneOrId === "string" ? getMusicTune(tuneOrId) : tuneOrId;
    const clampedBeat = Math.max(0, Number(beat) || 0);
    const start = Math.max(1, Number(tune?.bpmStart) || 120);
    const end = Math.max(1, Number(tune?.bpmEnd) || start);
    const totalBeats = Math.max(1, Number(tune?.loopBeats) || 1);
    const slope = (end - start) / totalBeats;
    if (Math.abs(slope) < 0.000001) {
        return clampedBeat * 60 / start;
    }
    return 60 / slope * Math.log((start + slope * clampedBeat) / start);
}

export function musicLoopDurationSeconds(tuneOrId) {
    const tune = typeof tuneOrId === "string" ? getMusicTune(tuneOrId) : tuneOrId;
    return musicSecondsAtBeat(tune, tune?.loopBeats || 1);
}
