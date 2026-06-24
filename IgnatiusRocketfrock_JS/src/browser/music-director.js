import {
    getMusicTune,
    musicLoopDurationSeconds,
    musicSecondsAtBeat,
    pitchToMidi
} from "../shared/music-data.js";

const SCHEDULE_AHEAD_SECONDS = 0.45;
const SCHEDULER_INTERVAL_MS = 80;

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

export function noteFrequency(pitch) {
    const midi = pitchToMidi(pitch);
    if (!Number.isFinite(midi)) {
        return 0;
    }
    return 440 * 2 ** ((midi - 69) / 12);
}

function defaultAudioContextFactory() {
    const Constructor = globalThis.AudioContext || globalThis.webkitAudioContext;
    return Constructor ? new Constructor() : null;
}

function instrumentProfile(name) {
    switch (name) {
        case "bassoon":
            return { type: "square", harmonic: "sine", harmonicRatio: 2, cutoff: 1300, attack: 0.025, release: 0.09, level: 0.095, harmonicLevel: 0.12 };
        case "doubleBass":
            return { type: "triangle", harmonic: "sine", harmonicRatio: 2, cutoff: 820, attack: 0.009, release: 0.13, level: 0.12, harmonicLevel: 0.08 };
        case "tuba":
            return { type: "sine", harmonic: "square", harmonicRatio: 2, cutoff: 680, attack: 0.035, release: 0.16, level: 0.125, harmonicLevel: 0.065 };
        case "pizzicato":
            return { type: "triangle", harmonic: "square", harmonicRatio: 2, cutoff: 2200, attack: 0.006, release: 0.11, level: 0.082, harmonicLevel: 0.12 };
        case "strings":
            return { type: "sawtooth", harmonic: "triangle", harmonicRatio: 1.002, cutoff: 1500, attack: 0.045, release: 0.15, level: 0.055, harmonicLevel: 0.18 };
        case "bell":
            return { type: "sine", harmonic: "sine", harmonicRatio: 2.01, cutoff: 5200, attack: 0.004, release: 0.24, level: 0.07, harmonicLevel: 0.12 };
        default:
            return { type: "triangle", harmonic: "sine", harmonicRatio: 2, cutoff: 2400, attack: 0.012, release: 0.1, level: 0.07, harmonicLevel: 0.12 };
    }
}

export function createMusicDirector({ audioContextFactory = defaultAudioContextFactory, volume = 0.6 } = {}) {
    let context = null;
    let masterGain = null;
    let tuneId = "grieg_mountain_king";
    let currentVolume = clamp01(volume);
    let schedulerTimer = null;
    let nextCycleIndex = 0;
    let cycleZeroTime = 0;
    const liveOscillators = new Set();

    function ensureContext() {
        if (context) return context;
        context = audioContextFactory?.() || null;
        if (!context) return null;
        masterGain = context.createGain();
        masterGain.gain.value = currentVolume;
        masterGain.connect(context.destination);
        return context;
    }

    function stopScheduledNotes() {
        for (const oscillator of liveOscillators) {
            try {
                oscillator.stop();
            } catch (error) {
                // The oscillator may already have ended naturally.
            }
        }
        liveOscillators.clear();
    }

    function clearScheduler() {
        if (schedulerTimer !== null) {
            globalThis.clearInterval(schedulerTimer);
            schedulerTimer = null;
        }
        stopScheduledNotes();
    }

    function oscillatorEnded(event) {
        liveOscillators.delete(event.currentTarget);
    }

    function scheduleNote(voice, musicalNote, cycleStart, tune) {
        if (!context || !masterGain) return;
        const frequency = noteFrequency(musicalNote.pitch);
        if (!(frequency > 0)) return;
        const startTime = cycleStart + musicSecondsAtBeat(tune, musicalNote.beat);
        const endBeat = musicalNote.beat + Math.max(0.04, Number(musicalNote.duration) || 0.25);
        const duration = Math.max(0.035, musicSecondsAtBeat(tune, endBeat) - musicSecondsAtBeat(tune, musicalNote.beat));
        const profile = instrumentProfile(voice.instrument);
        const velocity = clamp01(musicalNote.velocity ?? 1);
        const voiceGain = Math.max(0, Number(voice.gain) || 0.5);
        const amplitude = profile.level * voiceGain * velocity;
        const attack = Math.min(profile.attack, duration * 0.3);
        const release = Math.min(profile.release, duration * 0.45);
        const stopTime = startTime + duration + release + 0.02;

        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(profile.cutoff, startTime);
        const envelope = context.createGain();
        envelope.gain.setValueAtTime(0.0001, startTime);
        envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, amplitude), startTime + Math.max(0.003, attack));
        envelope.gain.setValueAtTime(Math.max(0.0002, amplitude * 0.86), Math.max(startTime + attack, startTime + duration - release));
        envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        filter.connect(envelope);
        envelope.connect(masterGain);

        const base = context.createOscillator();
        base.type = profile.type;
        base.frequency.setValueAtTime(frequency, startTime);
        base.connect(filter);
        base.addEventListener("ended", oscillatorEnded, { once: true });
        liveOscillators.add(base);
        base.start(startTime);
        base.stop(stopTime);

        if (profile.harmonic) {
            const harmonicGain = context.createGain();
            harmonicGain.gain.setValueAtTime(profile.harmonicLevel ?? 0.12, startTime);
            const harmonic = context.createOscillator();
            harmonic.type = profile.harmonic;
            harmonic.frequency.setValueAtTime(frequency * profile.harmonicRatio, startTime);
            harmonic.connect(harmonicGain);
            harmonicGain.connect(filter);
            harmonic.addEventListener("ended", oscillatorEnded, { once: true });
            liveOscillators.add(harmonic);
            harmonic.start(startTime);
            harmonic.stop(stopTime);
        }
    }

    function scheduleCycle(cycleStart, tune) {
        for (const voice of tune.voices || []) {
            for (const musicalNote of voice.notes || []) {
                scheduleNote(voice, musicalNote, cycleStart, tune);
            }
        }
    }

    function schedulerTick() {
        if (!context || context.state !== "running") return;
        const tune = getMusicTune(tuneId);
        if (!tune || tune.id === "none" || !tune.voices?.length || currentVolume <= 0) return;
        const loopDuration = musicLoopDurationSeconds(tune);
        while (cycleZeroTime + nextCycleIndex * loopDuration < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
            scheduleCycle(cycleZeroTime + nextCycleIndex * loopDuration, tune);
            nextCycleIndex += 1;
        }
    }

    function restartScheduler() {
        clearScheduler();
        if (!context || context.state !== "running") return;
        cycleZeroTime = context.currentTime + 0.07;
        nextCycleIndex = 0;
        schedulerTick();
        schedulerTimer = globalThis.setInterval(schedulerTick, SCHEDULER_INTERVAL_MS);
    }

    async function unlock() {
        const audioContext = ensureContext();
        if (!audioContext) return false;
        if (audioContext.state === "suspended") {
            try {
                await audioContext.resume();
            } catch (error) {
                return false;
            }
        }
        if (audioContext.state !== "running") return false;
        if (schedulerTimer === null) restartScheduler();
        return true;
    }

    function setTune(nextTuneId) {
        const tune = getMusicTune(nextTuneId);
        if (tune.id === tuneId) return tuneId;
        tuneId = tune.id;
        if (context?.state === "running") restartScheduler();
        return tuneId;
    }

    function setVolume(nextVolume) {
        const wasMuted = currentVolume <= 0;
        currentVolume = clamp01(nextVolume);
        if (masterGain && context) {
            masterGain.gain.cancelScheduledValues(context.currentTime);
            masterGain.gain.setTargetAtTime(currentVolume, context.currentTime, 0.03);
        }
        if (context?.state === "running" && currentVolume > 0 && (schedulerTimer === null || wasMuted)) {
            restartScheduler();
        }
        return currentVolume;
    }

    function dispose() {
        clearScheduler();
        if (context && typeof context.close === "function") {
            void context.close();
        }
        context = null;
        masterGain = null;
    }

    return Object.freeze({
        unlock,
        setTune,
        setVolume,
        dispose,
        getTuneId: () => tuneId,
        getVolume: () => currentVolume,
        isUnlocked: () => context?.state === "running"
    });
}
