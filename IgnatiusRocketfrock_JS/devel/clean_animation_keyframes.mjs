#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function readJson(filename) {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function writeJson(filename, value) {
    fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}

function linearValue(a, b, time) {
    const span = Number(b.time) - Number(a.time);
    if (Math.abs(span) <= Number.EPSILON) return Number(a.value);
    const ratio = (Number(time) - Number(a.time)) / span;
    return Number(a.value) + (Number(b.value) - Number(a.value)) * ratio;
}

function simplifyLinearTrack(keys, epsilon = 1e-9) {
    if (!Array.isArray(keys) || keys.length <= 2) return Array.isArray(keys) ? keys.slice() : [];
    const allLinear = keys.every((key) => String(key?.easing || "linear") === "linear");
    if (!allLinear) {
        const result = [keys[0]];
        for (let index = 1; index < keys.length - 1; index += 1) {
            const previous = result.at(-1);
            const current = keys[index];
            const next = keys[index + 1];
            const sameValue = Math.abs(Number(previous.value) - Number(current.value)) <= epsilon
                && Math.abs(Number(current.value) - Number(next.value)) <= epsilon;
            const sameEasing = String(previous.easing || "linear") === String(current.easing || "linear")
                && String(current.easing || "linear") === String(next.easing || "linear");
            if (!(sameValue && sameEasing)) result.push(current);
        }
        result.push(keys.at(-1));
        return result;
    }

    function recurse(startIndex, endIndex) {
        if (endIndex <= startIndex + 1) return [startIndex, endIndex];
        const start = keys[startIndex];
        const end = keys[endIndex];
        let maximumError = -1;
        let maximumIndex = -1;
        for (let index = startIndex + 1; index < endIndex; index += 1) {
            const predicted = linearValue(start, end, keys[index].time);
            const error = Math.abs(Number(keys[index].value) - predicted);
            if (error > maximumError) {
                maximumError = error;
                maximumIndex = index;
            }
        }
        if (maximumError <= epsilon) return [startIndex, endIndex];
        const left = recurse(startIndex, maximumIndex);
        const right = recurse(maximumIndex, endIndex);
        return left.slice(0, -1).concat(right);
    }

    const retainedIndices = recurse(0, keys.length - 1);
    return retainedIndices.map((index) => keys[index]);
}

export function cleanAnimationKeyframes(rawClip, options = {}) {
    const epsilon = Number.isFinite(Number(options.epsilon)) ? Math.max(0, Number(options.epsilon)) : 1e-9;
    const clip = JSON.parse(JSON.stringify(rawClip));
    let before = 0;
    let after = 0;
    const perTrack = [];
    for (const [partName, tracks] of Object.entries(clip.tracks || {})) {
        for (const [trackName, keys] of Object.entries(tracks || {})) {
            if (!Array.isArray(keys)) continue;
            before += keys.length;
            const simplified = simplifyLinearTrack(keys, epsilon);
            tracks[trackName] = simplified;
            after += simplified.length;
            if (simplified.length !== keys.length) {
                perTrack.push({ partName, trackName, before: keys.length, after: simplified.length });
            }
        }
    }
    clip.meta = {
        ...(clip.meta || {}),
        keyframeCleanup: {
            method: "zero-error linear simplification",
            epsilon,
            before,
            after,
            removed: before - after,
            affectedTracks: perTrack
        }
    };
    return { clip, summary: clip.meta.keyframeCleanup };
}

if (import.meta.url === new URL(`file://${path.resolve(process.argv[1] || "")}`).href) {
    const input = process.argv[2];
    const output = process.argv[3] || input;
    if (!input) {
        console.error("Usage: node devel/clean_animation_keyframes.mjs <input.json> [output.json]");
        process.exit(2);
    }
    const { clip, summary } = cleanAnimationKeyframes(readJson(input));
    writeJson(output, clip);
    console.log(JSON.stringify(summary, null, 2));
}
