import { runTestGate } from "./test-gate-runner.mjs";

process.exitCode = await runTestGate("generator", {
    resume: process.argv.includes("--resume")
});
