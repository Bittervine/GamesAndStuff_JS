#!/usr/bin/env node
import { availableTestGates, runTestGate, testGateShardNames } from "./test-gate-runner.mjs";

const argumentsList = process.argv.slice(2);
if (argumentsList.includes("--list")) {
    for (const gate of availableTestGates()) {
        console.log(`${gate}: ${testGateShardNames(gate).join(", ")}`);
    }
    process.exit(0);
}
const gate = argumentsList.find((argument) => !argument.startsWith("--")) || "release";
const resume = argumentsList.includes("--resume");
process.exitCode = await runTestGate(gate, { resume });
