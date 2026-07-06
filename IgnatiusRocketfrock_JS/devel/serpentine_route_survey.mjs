#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
    generateAutomaticLevelRoute,
    normalizeGeneratorTheme
} from "../src/shared/level-generator-data.js";

const themePath = new URL("../assets/level-generator-themes/earth-cavern.json", import.meta.url);
const earthTheme = normalizeGeneratorTheme(JSON.parse(readFileSync(themePath, "utf8")));
const enemyIds = ["enemy_001", "enemy_010", "enemy_011", "enemy_012", "enemy_020"];
const sampleCount = Math.max(1, Math.floor(Number(process.argv[2]) || 80));
const lengths = ["compact", "standard", "extended", "grand"];
const summary = {
    samples: 0,
    valid: 0,
    totalDrops: 0,
    seedsWithDrops: 0,
    totalReversals: 0,
    seedsWithTwoOrMoreReversals: 0,
    totalLongRises: 0,
    maximumDrop: 0,
    failures: []
};

for (let index = 0; index < sampleCount; index += 1) {
    const length = lengths[index % lengths.length];
    const seed = `serpentine-survey-${String(index).padStart(3, "0")}`;
    summary.samples += 1;
    try {
        const run = generateAutomaticLevelRoute({
            theme: earthTheme,
            seed,
            settings: { ...earthTheme.defaults, length, winding: 0.72, safety: 1 },
            implementations: { ...earthTheme.implementations, route: "serpentine-cave-route-v1" },
            availableEnemyIds: enemyIds
        });
        if (run.validation.valid) summary.valid += 1;
        const drops = run.route.macro.shortDropCount || 0;
        const reversals = run.validation.metrics.horizontalDirectionChanges || 0;
        const longRises = (run.route.macro.riseLengths || []).filter((value) => value >= 3).length;
        summary.totalDrops += drops;
        summary.totalReversals += reversals;
        summary.totalLongRises += longRises;
        if (drops > 0) summary.seedsWithDrops += 1;
        if (reversals >= 2) summary.seedsWithTwoOrMoreReversals += 1;
        summary.maximumDrop = Math.max(summary.maximumDrop, run.route.macro.maximumShortDrop || 0);
        if (!run.validation.valid && summary.failures.length < 8) {
            summary.failures.push({ seed, length, errors: run.validation.errors.slice(0, 4) });
        }
    } catch (error) {
        if (summary.failures.length < 8) summary.failures.push({ seed, length, errors: [String(error?.message || error)] });
    }
}

const rate = (count) => `${Math.round((count / Math.max(1, summary.samples)) * 100)}%`;
console.log(`Serpentine Cave route survey (${summary.samples} seeds)`);
console.log(`valid routes: ${summary.valid}/${summary.samples} (${rate(summary.valid)})`);
console.log(`seeds with short drops: ${summary.seedsWithDrops}/${summary.samples} (${rate(summary.seedsWithDrops)})`);
console.log(`average drops per seed: ${(summary.totalDrops / Math.max(1, summary.samples)).toFixed(2)}`);
console.log(`average reversals per seed: ${(summary.totalReversals / Math.max(1, summary.samples)).toFixed(2)}`);
console.log(`seeds with 2+ reversals: ${summary.seedsWithTwoOrMoreReversals}/${summary.samples} (${rate(summary.seedsWithTwoOrMoreReversals)})`);
console.log(`average long rises per seed: ${(summary.totalLongRises / Math.max(1, summary.samples)).toFixed(2)}`);
console.log(`maximum required short drop: ${Math.round(summary.maximumDrop)} units`);
if (summary.failures.length) {
    console.log("failures:");
    for (const failure of summary.failures) console.log(`- ${failure.seed} (${failure.length}): ${failure.errors.join(" ")}`);
}
