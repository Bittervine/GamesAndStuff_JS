import { spawn } from "node:child_process";

const suites = [
    { name: "generator foundation contracts", group: "generator-foundation" },
    { name: "generator macro contract", group: "generator-macro" },
    { name: "generator content contracts", group: "generator-content" },
    { name: "generator macro seed sweep", group: "generator-macro-sweep" }
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

for (const suite of suites) {
    const result = await runSuite(suite);
    if (result.code !== 0) {
        console.error(`${result.name} failed${result.signal ? ` with signal ${result.signal}` : ` with exit code ${result.code}`}.`);
        process.exitCode = 1;
        break;
    }
}
