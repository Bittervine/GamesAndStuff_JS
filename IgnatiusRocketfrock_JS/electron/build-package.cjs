const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const electronDir = __dirname;
const projectRoot = path.resolve(electronDir, "..");
const buildRoot = path.join(electronDir, ".build");
const appDir = path.join(buildRoot, "app");
const distDir = path.join(electronDir, "dist");
const buildDirOnly = process.argv.includes("--dir");

const runtimeEntries = [
    "game.html",
    "GameManual.html",
    "assets",
    "src"
];

function removePath(target) {
    fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
    fs.mkdirSync(target, { recursive: true });
}

function copyRecursive(source, destination) {
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
        ensureDir(destination);
        for (const entry of fs.readdirSync(source)) {
            copyRecursive(path.join(source, entry), path.join(destination, entry));
        }
        return;
    }
    if (stat.isFile()) {
        ensureDir(path.dirname(destination));
        fs.copyFileSync(source, destination);
    }
}

function copyRequiredEntry(relativePath) {
    const source = path.join(projectRoot, relativePath);
    if (!fs.existsSync(source)) {
        throw new Error(`Required runtime entry is missing: ${relativePath}`);
    }
    copyRecursive(source, path.join(appDir, relativePath));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function findElectronBuilder() {
    const command = process.platform === "win32" ? "electron-builder.cmd" : "electron-builder";
    const localPath = path.join(electronDir, "node_modules", ".bin", command);
    if (fs.existsSync(localPath)) {
        return localPath;
    }
    throw new Error("electron-builder was not found. Run npm install in the electron directory first.");
}

function readInstalledElectronVersion() {
    const packagePath = path.join(electronDir, "node_modules", "electron", "package.json");
    if (!fs.existsSync(packagePath)) {
        throw new Error("Electron was not found. Run npm install in the electron directory first.");
    }
    const electronPackage = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    if (!/^\d+\.\d+\.\d+/.test(electronPackage.version)) {
        throw new Error(`Electron version must be exact, got: ${electronPackage.version}`);
    }
    return electronPackage.version;
}

const builder = findElectronBuilder();
const electronVersion = readInstalledElectronVersion();

removePath(buildRoot);
removePath(distDir);
ensureDir(appDir);
for (const entry of runtimeEntries) {
    copyRequiredEntry(entry);
}
copyRecursive(path.join(electronDir, "main.cjs"), path.join(appDir, "main.cjs"));
copyRecursive(path.join(electronDir, "preload.cjs"), path.join(appDir, "preload.cjs"));

const stagedPackage = {
    name: "ignatius-rocketfrock",
    version: "1.0.0",
    private: true,
    description: "Ignatius Rocketfrock packaged as a standalone Electron desktop game.",
    main: "main.cjs",
    build: {
        appId: "com.bittervine.ignatiusrocketfrock",
        productName: "Ignatius Rocketfrock",
        electronVersion,
        directories: {
            output: "../../dist"
        },
        asar: true,
        files: [
            "main.cjs",
            "preload.cjs",
            "game.html",
            "GameManual.html",
            "assets/**/*",
            "src/**/*",
            "package.json"
        ],
        win: {
            target: [
                buildDirOnly ? "dir" : "portable"
            ],
            signAndEditExecutable: false,
            artifactName: "${productName}-${version}-${arch}.${ext}"
        },
        portable: {
            artifactName: "${productName}-${version}-${arch}-portable.${ext}"
        }
    }
};
writeJson(path.join(appDir, "package.json"), stagedPackage);
const result = spawnSync(builder, ["--win", buildDirOnly ? "dir" : "portable"], {
    cwd: appDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
        ...process.env,
        CSC_IDENTITY_AUTO_DISCOVERY: "false"
    }
});

if (result.error) {
    throw result.error;
}
if (result.status !== 0) {
    process.exit(result.status || 1);
}

console.log(`Build output written to ${distDir}`);
