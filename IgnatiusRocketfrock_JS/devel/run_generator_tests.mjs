import { spawn } from "node:child_process";

const suites = [
    { name: "generator core contracts", group: "generator-core" },
    { name: "generator macro contract", group: "generator-macro" }
];

function runSuite({ name, group }) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [
            "--expose-gc",
            "tests/testbench.mjs",
            "--progress",
            `--group=${group}`
        ], {
            cwd: process.cwd(),
            stdio: "inherit",
            env: process.env
        });
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            resolve({
                name,
                code: Number.isInteger(code) ? code : 1,
                signal: signal || null
            });
        });
    });
}

const results = await Promise.all(suites.map(runSuite));
const failure = results.find((result) => result.code !== 0);
if (failure) {
    console.error(`${failure.name} failed${failure.signal ? ` with signal ${failure.signal}` : ` with exit code ${failure.code}`}.`);
    process.exitCode = 1;
}
