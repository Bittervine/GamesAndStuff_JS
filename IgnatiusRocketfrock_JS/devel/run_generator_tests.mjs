import { spawn } from "node:child_process";

const suites = [
    "Atlas 004 long platforms and collision manifest",
    "automatic level generator route foundation",
    "automatic level generator variant compatibility",
    "automatic level generator playable empty cavern",
    "automatic level generator encounters",
    "automatic level generator rewards",
    "automatic level generator editor refinement",
    "automatic perimeter population and spatial culling",
    "macro rooms, grounded doors, and guaranteed perimeter"
];

function runSuite(name) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [
            "--expose-gc",
            "tests/testbench.mjs",
            "--progress",
            `--filter=${name}`
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

for (const name of suites) {
    const result = await runSuite(name);
    if (result.code !== 0) {
        console.error(`${result.name} failed${result.signal ? ` with signal ${result.signal}` : ` with exit code ${result.code}`}.`);
        process.exitCode = 1;
        break;
    }
}
