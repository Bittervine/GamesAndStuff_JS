#!/usr/bin/env node
import { auditResourceLayout } from "./audit_resource_layout.mjs";
import { availableTestGates, runTestGate, testGateShardNames } from "./test-gate-runner.mjs";

const argumentsList = process.argv.slice(2);
if (argumentsList.includes("--list")) {
    for (const gate of availableTestGates()) {
        console.log(`${gate}: ${testGateShardNames(gate).join(", ")}`);
    }
    process.exit(0);
}
const gate = argumentsList.find((argument) => !argument.startsWith("--")) || "release";
auditResourceLayout();
const resume = argumentsList.includes("--resume");
process.exitCode = await runTestGate(gate, { resume });
