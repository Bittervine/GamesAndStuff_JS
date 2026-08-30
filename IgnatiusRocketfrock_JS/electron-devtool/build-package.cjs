const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const electronDir = __dirname;
const projectRoot = path.resolve(electronDir, "..");
const nativeBuildDir = path.resolve(projectRoot, "..", "build", "Release");
const nativeContentSource = path.join(nativeBuildDir, "content");
const gameSource = path.join(nativeBuildDir, "IgnatiusSDL.exe");
const buildRoot = path.join(electronDir, ".build");
const appDir = path.join(buildRoot, "app");
const contentSource = path.join(buildRoot, "content");
const distDir = path.join(electronDir, "dist");
const buildDirOnly = process.argv.includes("--dir");

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
        for (const entry of fs.readdirSync(source)) copyRecursive(path.join(source, entry), path.join(destination, entry));
        return;
    }
    ensureDir(path.dirname(destination));
    fs.copyFileSync(source, destination);
}

function findBuilder() {
    const command = process.platform === "win32" ? "electron-builder.cmd" : "electron-builder";
    const localPath = path.join(electronDir, "node_modules", ".bin", command);
    if (!fs.existsSync(localPath)) throw new Error("electron-builder was not found. Run npm install in reference/electron-devtool first.");
    return localPath;
}

function installedElectronVersion() {
    const packagePath = path.join(electronDir, "node_modules", "electron", "package.json");
    if (!fs.existsSync(packagePath)) throw new Error("Electron was not found. Run npm install in reference/electron-devtool first.");
    return JSON.parse(fs.readFileSync(packagePath, "utf8")).version;
}

if (!fs.existsSync(nativeContentSource) || !fs.existsSync(gameSource)) {
    throw new Error(`Build the Release native targets first. Expected ${nativeContentSource} and ${gameSource}.`);
}

const builder = findBuilder();
const electronVersion = installedElectronVersion();
removePath(buildRoot);
removePath(distDir);
ensureDir(appDir);
copyRecursive(nativeContentSource, contentSource);
for (const entry of [
    "IgnatiusDevTool.html", "level-editor.html", "asset-editor.html",
    "character-editor.html", "palette-builder.html", "devel.html",
    "game.html", "GameManual.html", "favicon.ico", "src", "resources"
]) {
    copyRecursive(path.join(projectRoot, entry), path.join(contentSource, entry));
}
copyRecursive(path.resolve(projectRoot, "..", "BUILD_REVISION.txt"), path.join(contentSource, "BUILD_REVISION.txt"));
copyRecursive(path.join(electronDir, "main.cjs"), path.join(appDir, "main.cjs"));
copyRecursive(path.join(electronDir, "preload.cjs"), path.join(appDir, "preload.cjs"));

const stagedPackage = {
    name: "ignatius-devtool-electron",
    version: "1.0.0",
    private: true,
    description: "Experimental Electron Ignatius Development Tool.",
    author: "CJF",
    main: "main.cjs",
    build: {
        appId: "com.bittervine.ignatiusdevtool",
        productName: "IgnatiusDevTool",
        electronVersion,
        directories: { output: "../../dist" },
        asar: true,
        files: ["main.cjs", "preload.cjs", "package.json"],
        extraResources: [
            { from: contentSource, to: "../content" },
            { from: gameSource, to: "../IgnatiusSDL.exe" },
            { from: nativeBuildDir, to: "..", filter: ["*.dll"] }
        ],
        win: {
            target: [buildDirOnly ? "dir" : "portable"],
            icon: path.join(contentSource, "favicon.ico"),
            signExecutable: false,
            artifactName: "IgnatiusDevTool-${version}-${arch}.${ext}"
        },
        portable: {
            artifactName: "IgnatiusDevTool-${version}-${arch}-portable.${ext}"
        }
    }
};

fs.writeFileSync(path.join(appDir, "package.json"), `${JSON.stringify(stagedPackage, null, 2)}\n`, "utf8");
const result = spawnSync(builder, ["--win", buildDirOnly ? "dir" : "portable"], {
    cwd: appDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: "false" }
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log(`Build output written to ${distDir}`);
